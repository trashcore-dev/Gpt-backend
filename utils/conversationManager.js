class ConversationManager {
    constructor() {
        this.conversations = new Map();
    }

    getHistory(conversationId) {
        return this.conversations.get(conversationId) || [];
    }

    updateHistory(conversationId, history) {
        this.conversations.set(conversationId, history);
    }

    clearHistory(conversationId) {
        this.conversations.delete(conversationId);
    }
}

module.exports = { ConversationManager };
