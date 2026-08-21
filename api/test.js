const assert = require('assert');
const http = require('http');

// ודא שהשרת רץ או הרץ בדיקה מול פורט ה-API
const PORT = process.env.PORT || 3000;

console.log('Running automated tests...');

// פונקציית עזר לשליחת בקשת HTTP לצורך בדיקה
function checkEndpoint(path, expectedStatus, callback) {
    http.get(`http://localhost:${PORT}${path}`, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            try {
                // בדיקת סטטוס קוד בעזרת assert
                assert.strictEqual(res.statusCode, expectedStatus, `Failed on ${path}: Expected status ${expectedStatus}, got ${res.statusCode}`);
                console.log(`[PASS] Endpoint ${path} returned status ${res.statusCode}`);
                callback(null, JSON.parse(data));
            } catch (err) {
                callback(err);
            }
        });
    }).on('error', (err) => {
        callback(err);
    });
}

// הרצת הבדיקות בפועל
// הערה: ודא שהשרת רץ ברקע (או דרך ה-Docker / Node) לפני הפעלת הטסט
setTimeout(() => {
    checkEndpoint('/health', 200, (err, data) => {
        if (err) {
            console.error('[FAIL] Health check failed:', err.message);
            process.exit(1);
        }
        
        assert.strictEqual(data.status, 'ok', 'Health status should be ok');
        console.log('[PASS] Health check JSON response is correct');
        
        console.log('All tests passed successfully!');
        process.exit(0);
    });
}, 1000); // המתנה קצרה לוודא שהשרת זמין