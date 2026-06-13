import { NextRequest, NextResponse } from "next/server";
import { Contract, Upload } from "@/lib/db/prisma";
import { auth } from "@/lib/auth/config";
import { connectDB } from "@/lib/db/mongodb";
import { extractText } from "@/lib/uploads/extract-text";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

function detectFileType(filename: string): string {
  if (filename.endsWith(".pdf")) return "pdf";
  if (filename.endsWith(".docx")) return "docx";
  if (filename.endsWith(".jpg") || filename.endsWith(".jpeg")) return "jpg";
  if (filename.endsWith(".png")) return "png";
  return "txt";
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const fileType = detectFileType(file.name);
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Extract text using proper parsers (pdf-parse, mammoth, tesseract)
    const { text, parsingStatus, parsingErrors } = await extractText(buffer, fileType);

    await connectDB();
    const contract = await Contract.create({
      title: file.name.replace(/\.[^/.]+$/, ""),
      originalFilename: file.name,
      fileType,
      extractedText: text,
      status: "UPLOADING",
      createdById: session.user.id,
    });

    // Save image files to disk for on-demand OCR
    let fileUrl: string | undefined;
    if (fileType === "jpg" || fileType === "png") {
      const uploadsDir = path.join(process.cwd(), "uploads");
      await mkdir(uploadsDir, { recursive: true });
      const filename = `${contract._id}.${fileType}`;
      const filepath = path.join(uploadsDir, filename);
      await writeFile(filepath, buffer);
      fileUrl = `/uploads/${filename}`;
    }

    await Upload.create({
      contractId: contract._id.toString(),
      originalName: file.name,
      fileType,
      fileSize: buffer.length,
      parsedText: text,
      parsingStatus,
      parsingErrors,
      fileUrl,
    });

    return NextResponse.json({ contractId: contract._id.toString(), title: contract.title });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
