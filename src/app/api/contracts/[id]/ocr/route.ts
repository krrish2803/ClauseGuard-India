import { NextRequest, NextResponse } from "next/server";
import { Contract, Upload } from "@/lib/db/prisma";
import { auth } from "@/lib/auth/config";
import { connectDB } from "@/lib/db/mongodb";
import { extractTextFromImage } from "@/lib/uploads/extract-text";
import { readFile } from "fs/promises";
import path from "path";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    await connectDB();
    
    const upload = await Upload.findOne({ contractId: id });
    if (!upload?.fileUrl) {
      return NextResponse.json({ error: "No image file found for this contract" }, { status: 404 });
    }

    // Read the saved image file from disk
    const filepath = path.join(process.cwd(), upload.fileUrl);
    const buffer = await readFile(filepath);

    // Run OCR
    const text = await extractTextFromImage(buffer);

    // Update contract and upload records
    await Contract.findByIdAndUpdate(id, { 
      extractedText: text,
      status: text ? "UPLOADING" : "FAILED",
    });
    
    await Upload.findOneAndUpdate(
      { contractId: id },
      { 
        parsedText: text, 
        parsingStatus: text ? "COMPLETED" : "FAILED",
        parsingErrors: text ? undefined : "OCR failed to extract text",
      }
    );

    return NextResponse.json({ 
      success: true, 
      textLength: text.length,
      message: text ? "Text extracted successfully" : "No text could be extracted"
    });
  } catch (error) {
    console.error("OCR error:", error);
    const message = error instanceof Error ? error.message : "OCR failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
