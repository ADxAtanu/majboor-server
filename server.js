const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

// Serve the 'public' folder so the browser can stream Majboor.wav
app.use('/audio', express.static(path.join(__dirname, 'public')));

// Helper function to log clicks and traffic
function logTraffic(username, action, req) {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const time = new Date().toLocaleString();
    const logEntry = `[${time}] User: ${username} | Action: ${action} | IP: ${ip}\n`;
    
    fs.appendFileSync('traffic_logs.txt', logEntry);
    console.log(logEntry);
}

// 1. The Main Link: Serves the web-player page (With LocalTunnel Warning Bypass)
app.get('/listen', (req, res) => {
    const username = req.query.user || 'Unknown User';
    
    // Log that they opened the page
    logTraffic(username, 'Opened Player Page', req);

    // FIX: This tells localtunnel to skip the friendly reminder warning screen entirely
    res.setHeader('bypass-tunnel-reminder', 'true');

    // Send the Drive-like web interface
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Audio Preview</title>
            <style>
                body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #121212; color: #ffffff; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
                .player-container { background: #1e1e1e; padding: 40px; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.6); text-align: center; width: 360px; }
                h3 { margin-bottom: 25px; font-weight: 400; color: #f0f0f0; letter-spacing: 0.5px; }
                audio { width: 100%; margin-bottom: 30px; }
                .btn-download { display: inline-block; background-color: #34a853; color: white; padding: 12px 28px; text-decoration: none; border-radius: 30px; font-weight: bold; transition: background 0.2s, transform 0.1s; }
                .btn-download:hover { background-color: #2b8c44; }
                .btn-download:active { transform: scale(0.98); }
            </style>
        </head>
        <body>
            <div class="player-container">
                <h3>Majboor.wav</h3>
                <audio controls controlsList="nodownload">
                    <source src="https://drive.google.com/file/d/1fVyiMjYwi_0ig2ImxzjNjRcslU9YMVFR/view?usp=sharing" type="audio/wav">
                    Your browser does not support the audio element.
                </audio>
                <br>
                <a href="/track-download?user=${encodeURIComponent(username)}" class="btn-download">Download</a>
            </div>
        </body>
        </html>
    `);
});

// 2. The Download Route: Triggers when the green button is clicked
app.get('/track-download', (req, res) => {
    const username = req.query.user || 'Unknown User';
    
    // Log that they downloaded the file
    logTraffic(username, 'Downloaded File', req);

    const file = path.join(__dirname, 'public', 'Majboor.wav');
    res.download(file);
});

app.listen(PORT, () => {
    console.log(`Tracking server successfully running locally on port ${PORT}`);
});