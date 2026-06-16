import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
    const result = await pdfParse(buffer);
    const text = result.text?.trim() ?? "";

    if (!text){
        throw new Error(
            "Pdf дотор чинь текст байхгүй байна." +
            "Та pdf файлаа нээгээд текст байгаа эсэхийг шалгаарай." + 
            "Хэрэв pdf файл чинь зураг хэлбэртэй бол OCR ашиглах хэрэгтэй байж магадгүй юм."
        );
    }

    return text;
}