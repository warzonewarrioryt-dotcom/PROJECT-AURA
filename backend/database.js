const fs = require("fs");
const path = require("path");

const DB_FILE = path.join(__dirname, "aura-database.json");

const DEFAULT_DATABASE = {
    conversations: [],
    messages: [],
    activities: [],
    memories: [],
    interests: [],
    files: []
};

/* ==========================================
   DATABASE CORE
========================================== */

function loadDatabase() {
    try {
        if (!fs.existsSync(DB_FILE)) {
            saveDatabase(DEFAULT_DATABASE);
            return clone(DEFAULT_DATABASE);
        }

        const raw = fs.readFileSync(DB_FILE, "utf8");

        if (!raw.trim()) {
            saveDatabase(DEFAULT_DATABASE);
            return clone(DEFAULT_DATABASE);
        }

        const database = JSON.parse(raw);

        return {
            ...clone(DEFAULT_DATABASE),
            ...database
        };

    } catch (error) {
        console.error("AURA DATABASE READ ERROR:", error);
        return clone(DEFAULT_DATABASE);
    }
}


function saveDatabase(database) {
    try {
        fs.writeFileSync(
            DB_FILE,
            JSON.stringify(database, null, 2),
            "utf8"
        );

        return true;

    } catch (error) {
        console.error("AURA DATABASE WRITE ERROR:", error);
        return false;
    }
}


function clone(object) {
    return JSON.parse(JSON.stringify(object));
}


function createId(prefix) {
    return (
        prefix +
        "_" +
        Date.now() +
        "_" +
        Math.random()
            .toString(36)
            .substring(2, 8)
    );
}


/* ==========================================
   CONVERSATIONS
========================================== */

function createConversation(title = "New Conversation") {

    const database = loadDatabase();

    const conversation = {
        id: createId("conv"),
        title,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    database.conversations.unshift(conversation);

    saveDatabase(database);

    return conversation;
}


function getConversations() {

    const database = loadDatabase();

    return database.conversations.sort(
        (a, b) =>
            new Date(b.updatedAt) -
            new Date(a.updatedAt)
    );
}


function getConversation(id) {

    const database = loadDatabase();

    return database.conversations.find(
        conversation =>
            conversation.id === id
    );
}


function updateConversation(id, data = {}) {

    const database = loadDatabase();

    const conversation =
        database.conversations.find(
            item => item.id === id
        );

    if (!conversation) {
        return null;
    }

    if (data.title) {
        conversation.title = data.title;
    }

    conversation.updatedAt =
        new Date().toISOString();

    saveDatabase(database);

    return conversation;
}


/* ==========================================
   MESSAGES
========================================== */

function addMessage(
    conversationId,
    role,
    content,
    metadata = {}
) {

    const database = loadDatabase();

    const message = {
        id: createId("msg"),
        conversationId,
        role,
        content,
        metadata,
        createdAt: new Date().toISOString()
    };

    database.messages.push(message);

    const conversation =
        database.conversations.find(
            item =>
                item.id === conversationId
        );

    if (conversation) {

        conversation.updatedAt =
            new Date().toISOString();

        const conversationMessages =
            database.messages.filter(
                item =>
                    item.conversationId ===
                    conversationId
            );

        /*
        Automatically create a conversation
        title from the first user message.
        */

        if (
            conversationMessages.length === 1 &&
            role === "user"
        ) {

            conversation.title =
                content.length > 50
                    ? content.substring(0, 50) + "..."
                    : content;
        }
    }

    saveDatabase(database);

    return message;
}


function getMessages(conversationId) {

    const database = loadDatabase();

    return database.messages
        .filter(
            message =>
                message.conversationId ===
                conversationId
        )
        .sort(
            (a, b) =>
                new Date(a.createdAt) -
                new Date(b.createdAt)
        );
}


/* ==========================================
   ACTIVITY ENGINE
========================================== */

function addActivity(
    type,
    message,
    metadata = {}
) {

    const database = loadDatabase();

    const activity = {
        id: createId("activity"),
        type,
        message,
        metadata,
        createdAt: new Date().toISOString()
    };

    database.activities.unshift(activity);

    /*
    Keep database lightweight.
    */

    database.activities =
        database.activities.slice(0, 200);

    saveDatabase(database);

    return activity;
}


function getActivities(limit = 50) {

    const database = loadDatabase();

    return database.activities
        .slice(0, limit);
}


/* ==========================================
   MEMORY CORE
========================================== */

function addMemory(
    type,
    content,
    confidence = 0.5,
    source = "conversation"
) {

    const database = loadDatabase();

    const normalizedContent =
        content.trim().toLowerCase();

    const existing =
        database.memories.find(
            memory =>
                memory.content
                    .trim()
                    .toLowerCase() ===
                normalizedContent
        );

    if (existing) {

        existing.confidence =
            Math.min(
                1,
                existing.confidence + 0.05
            );

        existing.updatedAt =
            new Date().toISOString();

        saveDatabase(database);

        return existing;
    }

    const memory = {
        id: createId("memory"),
        type,
        content,
        confidence,
        source,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    database.memories.unshift(memory);

    saveDatabase(database);

    return memory;
}


function getMemories() {

    const database = loadDatabase();

    return database.memories;
}


/* ==========================================
   INTEREST ENGINE
========================================== */

function updateInterest(
    topic,
    confidence = 0.5
) {

    const database = loadDatabase();

    const normalizedTopic =
        topic.trim().toLowerCase();

    const existing =
        database.interests.find(
            interest =>
                interest.topic
                    .trim()
                    .toLowerCase() ===
                normalizedTopic
        );

    if (existing) {

        existing.mentions += 1;

        existing.confidence =
            Math.min(
                1,
                Math.max(
                    existing.confidence,
                    confidence
                )
            );

        existing.lastSeen =
            new Date().toISOString();

    } else {

        database.interests.push({

            id: createId("interest"),

            topic,

            mentions: 1,

            confidence,

            firstSeen:
                new Date().toISOString(),

            lastSeen:
                new Date().toISOString()
        });
    }

    saveDatabase(database);
}


function getInterests() {

    const database = loadDatabase();

    return database.interests.sort(
        (a, b) =>
            b.mentions - a.mentions
    );
}


/* ==========================================
   FILE FOUNDATION
========================================== */

function addFile(fileData) {

    const database = loadDatabase();

    const file = {

        id: createId("file"),

        ...fileData,

        createdAt:
            new Date().toISOString()
    };

    database.files.unshift(file);

    saveDatabase(database);

    return file;
}


function getFiles() {

    const database = loadDatabase();

    return database.files;
}


function deleteFile(id) {
    const database = loadDatabase();
    const initialCount = database.files.length;
    const file = database.files.find(f => f.id === id || f.filename === id || f.name === id || f.originalName === id);
    database.files = database.files.filter(f => f.id !== id && f.filename !== id && f.name !== id && f.originalName !== id);
    saveDatabase(database);
    return {
        deleted: database.files.length < initialCount,
        file
    };
}


/* ==========================================
   EXPORT
========================================== */

module.exports = {
    loadDatabase,
    saveDatabase,

    createConversation,
    getConversations,
    getConversation,
    updateConversation,

    addMessage,
    getMessages,

    addActivity,
    getActivities,

    addMemory,
    getMemories,

    updateInterest,
    getInterests,

    addFile,
    getFiles,
    deleteFile
};