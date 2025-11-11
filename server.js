const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');
const fs = require('fs');

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// API endpoint for chat
app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;
        console.log('📨 Message received:', message);
        
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': 'proj_8CXQcEIFSwSfvDlNmlElzt8a',
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 200,
                messages: [{
                    role: 'user',
                    content: `Answer this question in a fun, short way for kids (2-3 sentences max): ${message}`
                }]
            })
        });

        console.log('✅ API Response status:', response.status);

        if (!response.ok) {
            const errorData = await response.json();
            console.error('❌ API Error:', response.status, errorData);
            return res.status(response.status).json({ error: errorData });
        }

        const data = await response.json();
        console.log('📝 Got answer:', data.content[0].text);
        res.json(data);
    } catch (error) {
        console.error('❌ Server Error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Serve static files (CSS, JS, images)
app.use(express.static(path.join(__dirname)));

// Serve index.html for root and any unknown routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Visit: http://localhost:${PORT}`);
});
