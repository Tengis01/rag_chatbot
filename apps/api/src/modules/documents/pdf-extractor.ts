import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { PDFParse } = require("pdf-parse");

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
    // pdf-parse v2 uses class-based API: new PDFParse({ data: buffer }).getText()
    // v1 used a plain function call: pdfParse(buffer) — that no longer works in v2
    const parser = new PDFParse({ data: buffer });
    try {
    const result = await parser.getText();
    const text = result.text?.trim() ?? "";

    if (!text) {
        throw new Error(
            "Pdf дотор чинь текст байхгүй байна. " +
            "Та pdf файлаа нээгээд текст байгаа эсэхийг шалгаарай. " +
            "Хэрэв pdf файл чинь зураг хэлбэртэй бол OCR ашиглах хэрэгтэй байж магадгүй юм."
        );
    }

    return text;
    } finally {
        await parser.destroy();
    }
}