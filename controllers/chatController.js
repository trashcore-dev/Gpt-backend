const { ConversationManager } = require('../utils/conversationManager');

const conversationManager = new ConversationManager();

const getChatResponse = async (req, res) => {
    try {
        const { message, conversationId = 'default', model = 'qwen/qwen-3-4b' } = req.body;
        
        let history = conversationManager.getHistory(conversationId);
        history.push({ role: 'user', content: message });
        
        // Call OpenRouter API with selected model
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: model, // Use the model selected in frontend (without :free)
                messages: [
                    { 
                        role: "system", 
                        content: "You are a helpful AI assistant with knowledge up to November 27, 2025." 
                    },
                    ...history.slice(-20)
                ]
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error?.message || `API Error: ${response.status}`);
        }
        
        const data = await response.json();
        const aiResponse = data.choices[0].message.content;
        
        history.push({ role: 'assistant', content: aiResponse });
        conversationManager.updateHistory(conversationId, history);
        
        res.json({ 
            response: aiResponse,
            conversationId: conversationId
        });
        
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ 
            error: 'Error connecting to OpenRouter API',
            details: error.message
        });
    }
};

module.exports = { getChatResponse };
