const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
// create a health ststus as ok 
app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

// API Route: Returns only JSON data for Israel and Florida
app.get('/api/time', (req, res) => {
    const now = new Date();

    // Helper function to format time using native Node.js Intl
    const getTimeData = (timeZone, locale) => {
        const formatter = new Intl.DateTimeFormat(locale, {
            timeZone: timeZone,
            dateStyle: 'full',
            timeStyle: 'medium',
            hour12: false
        });
        
        return {
            timeZone: timeZone,
            formatted: formatter.format(now),
            isoString: now.toISOString()
        };
    };

    const data = {
        israel: getTimeData('Asia/Jerusalem', 'en-US'),
        florida: getTimeData('America/New_York', 'en-US'),
        timestamp: now.getTime()
    };

    res.json(data);
});

// Serve the frontend HTML page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});