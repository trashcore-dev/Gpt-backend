const { ConversationManager } = require('../utils/conversationManager');

const conversationManager = new ConversationManager();

const getChatResponse = async (req, res) => {
    try {
        const { message, conversationId = 'default', model = 'google/gemini-2.0-flash' } = req.body;
        
        let history = conversationManager.getHistory(conversationId);
        history.push({ role: 'user', content: message });
        
        console.log('Model being used:', model); // Debug log
        
        // Call OpenRouter API with selected model
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: model, // Use the model selected in frontend
                messages: [
                    { 
                        role: "system", 
                        content: "You are a helpful AI assistant with knowledge up to November 27, 2025." 
                    },
                    ...history.slice(-20)
                ]
            })
        });
        
        console.log('Response status:', response.status); // Debug log
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('API Error response:', errorData); // Debug log
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
