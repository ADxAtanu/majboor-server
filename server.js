const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

// The direct download link generated from your new video file ID
const VIDEO_DIRECT_URL = "https://drive.usercontent.google.com/download?id=14qLErX_wwkRhRVu26_WJzvwvVxSkYDWB&export=download&authuser=0";

function logTraffic(username, action, req) {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const time = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }); // Formatted to IST
    console.log(`[${time}] User: ${username} | Action: ${action} | IP: ${ip}`);
}

// 1. The Main Page: Serves the Drive-like Video Player Interface
app.get('/', (req, res) => {
    const username = req.query.user || 'Unknown User';
    logTraffic(username, 'Opened Video Player Page', req);

    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Video Preview - Saason Ki Maala</title>
            <style>
                body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #121212; color: #ffffff; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
                .player-container { background: #1e1e1e; padding: 30px; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.6); text-align: center; width: 90%; max-width: 640px; }
                h3 { margin-top: 0; margin-bottom: 20px; font-weight: 400; color: #f0f0f0; letter-spacing: 0.5px; }
                video { width: 100%; border-radius: 8px; background: #000; margin-bottom: 25px; box-shadow: 0 4px 12px rgba(0,0,0,0.4); }
                .btn-download { display: inline-block; background-color: #34a853; color: white; padding: 12px 28px; text-decoration: none; border-radius: 30px; font-weight: bold; transition: background 0.2s, transform 0.1s; }
                .btn-download:hover { background-color: #2b8c44; transform: translateY(-1px); }
                .btn-download:active { transform: translateY(1px); }
            </style>
        </head>
        <body>
            <div class="player-container">
                <h3>Saason Ki Maala.mp4</h3>
                <video controls preload="auto" playsinline>
                    <source src="/stream-video" type="video/mp4">
                    Your browser does not support the video tag.
                </video>
                <br>
                <a href="/track-download?user=${encodeURIComponent(username)}" class="btn-download">Download Video</a>
            </div>
        </body>
        </html>
    `);
});

// 2. High-Performance Video Streaming Route (Supports Partials/Ranges for mobile timeline buffering)
app.get('/stream-video', async (req, res) => {
    const range = req.headers.range;
    const requestHeaders = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    };

    if (range) {
        requestHeaders['Range'] = range;
    }

    try {
        const response = await axios({
            method: 'get',
            url: VIDEO_DIRECT_URL,
            responseType: 'stream',
            headers: requestHeaders
        });

        if (response.headers['content-range']) {
            res.setHeader('Content-Range', response.headers['content-range']);
            res.status(206); // Partial Content status vital for video seeking
        }
        
        res.setHeader('Content-Type', 'video/mp4');
        res.setHeader('Accept-Ranges', 'bytes');
        
        response.data.pipe(res);
    } catch (error) {
        console.error('Video streaming error:', error.message);
        res.status(500).send('Error streaming media file');
    }
});

// 3. The Tracked Download Route
app.get('/track-download', (req, res) => {
    const username = req.query.user || 'Unknown User';
    logTraffic(username, 'Clicked Download Button', req);
    res.redirect(VIDEO_DIRECT_URL);
});

// 4. Keeping your Lightweight Endpoint for Cron-job.org untouched
app.get('/ping', (req, res) => {
    res.status(200).send('OK');
});

app.listen(PORT, () => {
    console.log(`Video Tracking server safely initialized on port ${PORT}`);
});
