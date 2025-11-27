const OpenAI = require('openai');
const { ConversationManager } = require('../utils/conversationManager');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const conversationManager = new ConversationManager();

const getChatResponse = async (req, res) => {
    try {
        const { message, conversationId = 'default' } = req.body;
        
        let history = conversationManager.getHistory(conversationId);
        history.push({ role: 'user', content: message });
        
        const completion = await openai.chat.completions.create({
            model: "gpt-4-turbo",
            messages: [
                { 
                    role: "system", 
                    content: "You are a helpful AI assistant with knowledge up to November 27, 2025." 
                },
                ...history.slice(-20)
            ],
            temperature: 0.7
        });

        const aiResponse = completion.choices[0].message.content;
        
        history.push({ role: 'assistant', content: aiResponse });
        conversationManager.updateHistory(conversationId, history);
        
        res.json({ 
            response: aiResponse,
            conversationId: conversationId
        });
        
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ error: 'Error connecting to OpenAI API' });
    }
};

module.exports = { getChatResponse };
