const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

const AUDIO_DIRECT_URL = "https://drive.usercontent.google.com/download?id=1fVyiMjYwi_0ig2ImxzjNjRcslU9YMVFR&export=download&authuser=0";

function logTraffic(username, action, req) {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const time = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
    console.log(`[${time}] User: ${username} | Action: ${action} | IP: ${ip}`);
}

// 1. Web Player Page
app.get('/', (req, res) => {
    const username = req.query.user || 'Unknown User';
    logTraffic(username, 'Opened Player Page', req);

    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Audio Preview - Majboor.wav</title>
            <style>
                body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #121212; color: #ffffff; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
                .player-container { background: #1e1e1e; padding: 40px; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.6); text-align: center; width: 360px; }
                h3 { margin-top: 0; margin-bottom: 25px; font-weight: 400; color: #f0f0f0; letter-spacing: 0.5px; }
                audio { width: 100%; margin-bottom: 30px; }
                .btn-download { display: inline-block; background-color: #34a853; color: white; padding: 12px 28px; text-decoration: none; border-radius: 30px; font-weight: bold; transition: background 0.2s, transform 0.1s; }
                .btn-download:hover { background-color: #2b8c44; transform: translateY(-1px); }
            </style>
        </head>
        <body>
            <div class="player-container">
                <h3>Majboor.wav</h3>
                <audio controls preload="auto">
                    <source src="/stream-audio" type="audio/wav">
                    Your browser does not support the audio element.
                </audio>
                <br>
                <a href="/track-download?user=${encodeURIComponent(username)}" class="btn-download">Download File</a>
            </div>
        </body>
        </html>
    `);
});

// 2. Mobile-Optimized Streaming Route (Supports Range Requests)
app.get('/stream-audio', async (req, res) => {
    const range = req.headers.range;
    const requestHeaders = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    };

    // If a mobile device asks for a specific byte range, pass that header to Google Drive
    if (range) {
        requestHeaders['Range'] = range;
    }

    try {
        const response = await axios({
            method: 'get',
            url: AUDIO_DIRECT_URL,
            responseType: 'stream',
            headers: requestHeaders
        });

        // Pass along the correct stream headers back to the phone
        if (response.headers['content-range']) {
            res.setHeader('Content-Range', response.headers['content-range']);
            res.status(206); // HTTP 206 Partial Content: Vital for mobile audio buffering
        }
        
        res.setHeader('Content-Type', 'audio/wav');
        res.setHeader('Accept-Ranges', 'bytes');
        
        response.data.pipe(res);
    } catch (error) {
        console.error('Mobile stream error:', error.message);
        res.status(500).send('Error streaming file');
    }
});

// 3. Download Route
app.get('/track-download', (req, res) => {
    const username = req.query.user || 'Unknown User';
    logTraffic(username, 'Clicked Download Button', req);
    res.redirect(AUDIO_DIRECT_URL);
});

// 👇 4. NEW: Lightweight Endpoint for Cron-job.org
app.get('/ping', (req, res) => {
    res.status(200).send('OK');
});

app.listen(PORT, () => {
    console.log(`Cloud Tracking Server running on port ${PORT}`);
});
