const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Your direct Google Drive WAV link
const AUDIO_DIRECT_URL = "https://drive.usercontent.google.com/download?id=1fVyiMjYwi_0ig2ImxzjNjRcslU9YMVFR&export=download&authuser=0";

// Helper function to log traffic directly to your Render dashboard logs
function logTraffic(username, action, req) {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const time = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }); // Formatted to Indian Standard Time (IST)
    console.log(`[${time}] User: ${username} | Action: ${action} | IP: ${ip}`);
}

// 1. The Main Page: Serves the Drive-like web player interface
app.get('/', (req, res) => {
    const username = req.query.user || 'Unknown User';
    
    // Log the page view to your Render Dashboard
    logTraffic(username, 'Opened Player Page', req);

    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Audio Preview - Majboor.wav</title>
            <style>
                body { 
                    font-family: 'Segoe UI', Arial, sans-serif; 
                    background-color: #121212; 
                    color: #ffffff; 
                    display: flex; 
                    justify-content: center; 
                    align-items: center; 
                    height: 100vh; 
                    margin: 0; 
                }
                .player-container { 
                    background: #1e1e1e; 
                    padding: 40px; 
                    border-radius: 16px; 
                    box-shadow: 0 10px 30px rgba(0,0,0,0.6); 
                    text-align: center; 
                    width: 360px; 
                }
                h3 { 
                    margin-top: 0;
                    margin-bottom: 25px; 
                    font-weight: 400; 
                    color: #f0f0f0; 
                    letter-spacing: 0.5px; 
                }
                audio { 
                    width: 100%; 
                    margin-bottom: 30px; 
                }
                .btn-download { 
                    display: inline-block; 
                    background-color: #34a853; 
                    color: white; 
                    padding: 12px 28px; 
                    text-decoration: none; 
                    border-radius: 30px; 
                    font-weight: bold; 
                    transition: background 0.2s, transform 0.1s; 
                }
                .btn-download:hover { 
                    background-color: #2b8c44; 
                    transform: translateY(-1px);
                }
                .btn-download:active {
                    transform: translateY(1px);
                }
            </style>
        </head>
        <body>
            <div class="player-container">
                <h3>Majboor.wav</h3>
                <audio controls>
                    <source src="${AUDIO_DIRECT_URL}" type="audio/wav">
                    Your browser does not support the audio element.
                </audio>
                <br>
                <a href="/track-download?user=${encodeURIComponent(username)}" class="btn-download">Download File</a>
            </div>
        </body>
        </html>
    `);
});

// 2. The Download Route: Logs the download intent and redirects to the file
app.get('/track-download', (req, res) => {
    const username = req.query.user || 'Unknown User';
    
    // Log the download event to your Render Dashboard
    logTraffic(username, 'Clicked Download Button', req);
    
    // Safely forward the browser straight to your direct Google Drive download link
    res.redirect(AUDIO_DIRECT_URL);
});

app.listen(PORT, () => {
    console.log(`Cloud Tracking Server successfully initialized on port ${PORT}`);
});
