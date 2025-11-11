const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10kb' }));
app.use(express.static(path.join(__dirname)));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

// Chat API endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: 'Message required' });
        }

        console.log('📨 Message:', message);

        const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
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
                    content: message
                }]
            })
        });

        console.log('API Status:', anthropicResponse.status);

        if (!anthropicResponse.ok) {
            const error = await anthropicResponse.text();
            console.error('API Error:', error);
            return res.status(anthropicResponse.status).json({ error });
        }

        const data = await anthropicResponse.json();
        res.json(data);
    } catch (error) {
        console.error('Server Error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Serve index.html for all other routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
