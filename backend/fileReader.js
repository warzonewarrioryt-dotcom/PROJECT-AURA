const fs = require("fs");
const path = require("path");

// ===============================
// PDF READER
// ===============================

async function readPDF(filePath) {
    try {
        const pdfModule = require("pdf-parse");
        const buffer = fs.readFileSync(filePath);

        if (typeof pdfModule === "function") {
            const data = await pdfModule(buffer);
            return {
                success: true,
                type: "PDF",
                text: data.text || "",
                pages: data.numpages || 0
            };
        }

        const PDFParse = pdfModule.PDFParse || pdfModule.default?.PDFParse;
        if (typeof PDFParse === "function") {
            const parser = new PDFParse({ data: buffer });
            const result = await parser.getText();
            if (typeof parser.destroy === "function") {
                await parser.destroy();
            }
            return {
                success: true,
                type: "PDF",
                text: result.text || "",
                pages: result.total || 0
            };
        }

        throw new Error("Compatible PDF parser interface not found");
    } catch (error) {
        console.error("PDF READ ERROR:", error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

// ===============================
// DOCX READER
// ===============================

async function readDOCX(filePath) {
    try {
        const mammoth = require("mammoth");

        const result = await mammoth.extractRawText({
            path: filePath
        });

        return {
            success: true,
            type: "DOCX",
            text: result.value || "",
            pages: 0
        };

    } catch (error) {
        return {
            success: false,
            error: `DOCX reading failed: ${error.message}`
        };
    }
}

// ===============================
// TXT / SOURCE CODE READER
// ===============================

async function readTXT(filePath) {
    try {
        const text = fs.readFileSync(filePath, "utf8");

        return {
            success: true,
            type: "TXT",
            text,
            pages: 0
        };

    } catch (error) {
        return {
            success: false,
            error: `TXT reading failed: ${error.message}`
        };
    }
}

// ===============================
// MAIN READER
// ===============================

async function readFile(filePath) {

    if (!filePath) {
        return {
            success: false,
            error: "File path is required"
        };
    }

    if (!fs.existsSync(filePath)) {
        return {
            success: false,
            error: "File does not exist"
        };
    }

    const extension = path.extname(filePath).toLowerCase();

    if (extension === ".pdf") {
        return await readPDF(filePath);
    }

    if (extension === ".docx") {
        return await readDOCX(filePath);
    }

    const textExtensions = new Set([
        ".txt", ".csv", ".json", ".md", ".py", ".js", ".ts",
        ".html", ".css", ".java", ".c", ".cpp", ".xml", ".yaml", ".yml"
    ]);

    if (textExtensions.has(extension)) {
        return await readTXT(filePath);
    }

    return {
        success: false,
        error: "Unsupported file type"
    };
}

// ===============================
// CLEAN TEXT
// ===============================

function cleanText(text) {
    return String(text || "")
        .replace(/\r/g, "")
        .replace(/[ \t]+/g, " ")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
}

// ===============================
// CHUNK TEXT
// ===============================

function chunkText(text, chunkSize = 1200, overlap = 200) {

    const cleaned = cleanText(text);

    if (!cleaned) {
        return [];
    }

    const chunks = [];

    let start = 0;
    let index = 0;

    while (start < cleaned.length && index < 10000) {

        const end = Math.min(
            start + chunkSize,
            cleaned.length
        );

        const chunk = cleaned
            .slice(start, end)
            .trim();

        if (chunk) {
            chunks.push({
                index,
                text: chunk,
                start,
                end
            });
        }

        if (end >= cleaned.length) {
            break;
        }

        start = Math.max(
            end - overlap,
            start + 1
        );

        index++;
    }

    return chunks;
}

// ===============================
// EXPORT
// ===============================

module.exports = {
    readFile,
    readPDF,
    readDOCX,
    readTXT,
    cleanText,
    chunkText
};