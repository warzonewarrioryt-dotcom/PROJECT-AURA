// ============================================================
// PROJECT AURA
// KNOWLEDGE ENGINE
// File Content → Search → Relevant Context
// ============================================================

const auraDB = require("./database");
const fileReader = require("./fileReader");

// ============================================================
// TEXT NORMALIZATION
// ============================================================

function normalizeText(text) {
    return String(text || "")
        .toLowerCase()
        .replace(/[^\w\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}


// ============================================================
// KEYWORD EXTRACTION
// ============================================================

function extractKeywords(query) {

    const stopWords = new Set([
        "the",
        "is",
        "a",
        "an",
        "and",
        "or",
        "of",
        "to",
        "in",
        "on",
        "for",
        "what",
        "why",
        "how",
        "when",
        "where",
        "who",
        "this",
        "that",
        "from",
        "with",
        "about",
        "can",
        "you",
        "please",
        "explain",
        "tell",
        "me"
    ]);

    return normalizeText(query)
        .split(" ")
        .filter(word =>
            word.length > 2 &&
            !stopWords.has(word)
        );
}


// ============================================================
// SCORE CHUNK
// ============================================================

function scoreChunk(
    chunkText,
    keywords
) {

    const text =
        normalizeText(chunkText);

    if (!text || !keywords.length) {
        return 0;
    }

    let score = 0;

    for (const keyword of keywords) {

        if (text.includes(keyword)) {
            score += 1;
        }
    }

    return score;
}


// ============================================================
// SEARCH FILE CONTENT
// ============================================================

function searchChunks(
    chunks,
    query,
    maxResults = 5
) {

    const keywords =
        extractKeywords(query);

    if (!keywords.length) {
        return [];
    }

    const results =
        chunks
            .map(chunk => ({
                ...chunk,
                score:
                    scoreChunk(
                        chunk.text,
                        keywords
                    )
            }))
            .filter(
                chunk =>
                    chunk.score > 0
            )
            .sort(
                (a, b) =>
                    b.score - a.score
            )
            .slice(
                0,
                maxResults
            );

    return results;
}


// ============================================================
// SEARCH STORED KNOWLEDGE
// ============================================================

function searchKnowledge(
    query,
    maxResults = 5
) {

    const files =
        auraDB.getFiles();

    const results = [];

    for (const file of files) {

        if (!file.chunks) {
            continue;
        }

        const matches =
            searchChunks(
                file.chunks,
                query,
                maxResults
            );

        for (const match of matches) {

            results.push({

                fileId: file.id,

                fileName:
                    file.name ||
                    file.filename ||
                    "Unknown file",

                type:
                    file.type ||
                    "Unknown",

                chunkIndex:
                    match.index,

                score:
                    match.score,

                text:
                    match.text
            });
        }
    }

    return results
        .sort(
            (a, b) =>
                b.score - a.score
        )
        .slice(
            0,
            maxResults
        );
}


// ============================================================
// BUILD AI CONTEXT
// ============================================================

function buildKnowledgeContext(
    query,
    maxResults = 5
) {

    const results =
        searchKnowledge(
            query,
            maxResults
        );

    if (!results.length) {

        return {
            found: false,
            results: [],
            context: ""
        };
    }

    const context =
        results
            .map(
                (result, index) => {

                    return `
[FILE ${index + 1}]
Name: ${result.fileName}
Type: ${result.type}
Relevance Score: ${result.score}

Content:
${result.text}
`;
                }
            )
            .join("\n");

    return {
        found: true,
        results,
        context
    };
}


// ============================================================
// READ + PREPARE FILE
// ============================================================

async function processFile(
    filePath,
    fileInfo = {}
) {

    const result =
        await fileReader.readFile(
            filePath
        );

    if (!result.success) {

        return {
            success: false,
            error: result.error
        };
    }

    const chunks =
        fileReader.chunkText(
            result.text
        );

    const file =
        auraDB.addFile({

            name:
                fileInfo.name ||
                filePath.split(/[\\/]/).pop(),

            originalName:
                fileInfo.originalName ||
                fileInfo.name ||
                filePath.split(/[\\/]/).pop(),

            type:
                result.type,

            size:
                fileInfo.size ||
                0,

            pages:
                result.pages ||
                0,

            textLength:
                result.text.length,

            chunks,

            status:
                "READY"
        });

    auraDB.addActivity(
        "knowledge",
        `Knowledge Vault processed ${file.name}`,
        {
            fileId: file.id,
            type: file.type,
            chunks: chunks.length
        }
    );

    return {
        success: true,
        file,
        chunks
    };
}


// ============================================================
// FILE KNOWLEDGE SUMMARY
// ============================================================

function getKnowledgeStats() {

    const files =
        auraDB.getFiles();

    let totalChunks = 0;

    for (const file of files) {

        totalChunks +=
            file.chunks?.length || 0;
    }

    return {

        totalFiles:
            files.length,

        totalChunks,

        readyFiles:
            files.filter(
                file =>
                    file.status === "READY"
            ).length
    };
}


// ============================================================
// EXPORT
// ============================================================

module.exports = {

    searchKnowledge,
    buildKnowledgeContext,
    processFile,
    getKnowledgeStats,

    extractKeywords,
    scoreChunk,
    searchChunks
};