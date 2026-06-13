import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";
import { createWorker } from "tesseract.js";
import path from "path";

export async function extractTextFromPDF(buffer: Buffer): Promise<{ text: string; isScanned: boolean }> {
  try {
    const parser = new PDFParse(buffer);
    const result = await parser.getText();
    const text = result.text?.trim() || "";
    
    // If extracted text is very short, it's likely a scanned PDF
    const isScanned = text.length < 100;
    
    return { text, isScanned };
  } catch (error) {
    console.error("PDF parse error:", error);
    return { text: "", isScanned: true };
  }
}

export async function extractTextFromDOCX(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value?.trim() || "";
  } catch (error) {
    console.error("DOCX parse error:", error);
    return "";
  }
}

export async function extractTextFromImage(buffer: Buffer): Promise<string> {
  try {
    const tessdataPath = path.join(process.cwd(), "tessdata");
    const worker = await createWorker("eng", 1, {
      corePath: tessdataPath,
      langPath: tessdataPath,
    });
    
    const { data: { text } } = await worker.recognize(buffer);
    await worker.terminate();
    
    return text?.trim() || "";
  } catch (error) {
    console.error("OCR error:", error);
    return "";
  }
}

export async function extractText(buffer: Buffer, fileType: string): Promise<{ text: string; parsingStatus: string; parsingErrors?: string }> {
  try {
    let text = "";
    
    if (fileType === "pdf") {
      const { text: pdfText, isScanned } = await extractTextFromPDF(buffer);
      text = pdfText;
      
      // If scanned PDF, try OCR
      if (isScanned) {
        const ocrText = await extractTextFromImage(buffer);
        text = ocrText || text;
      }
    } else if (fileType === "docx") {
      text = await extractTextFromDOCX(buffer);
    } else if (fileType === "jpg" || fileType === "png") {
      // Skip OCR during upload for speed — OCR is available on-demand via /api/contracts/[id]/ocr
      text = "";
    } else if (fileType === "txt") {
      text = buffer.toString("utf-8");
    }
    
    const parsingStatus = text.length > 0 ? "COMPLETED" : "FAILED";
    const parsingErrors = text.length === 0 && (fileType === "jpg" || fileType === "png")
      ? "Image files require OCR. Use the Extract Text button on the contract page."
      : text.length === 0 ? "No text could be extracted" : undefined;
    
    return { text, parsingStatus, parsingErrors };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Text extraction error:", message);
    return { 
      text: "", 
      parsingStatus: "FAILED", 
      parsingErrors: message 
    };
  }
}
