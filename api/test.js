const assert = require('assert');
const http = require('http');
const fs = require('fs'); // ספרייה לכתיבת קבצים
const PORT = process.env.PORT || 3000;

console.log('Running automated tests...');

setTimeout(() => {
    http.get(`http://localhost:${PORT}/health`, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            try {
                assert.strictEqual(res.statusCode, 200, 'Expected status 200');
                const json = JSON.parse(data);
                assert.strictEqual(json.status, 'ok', 'Health status should be ok');
                console.log('[PASS] Endpoint /health returned status 200');
                console.log('[PASS] Health check JSON response is correct');
                console.log('All tests passed successfully!');
                
                writeJUnitReport(true); // כתיבת דווח הצלחה לג'נקינס
                process.exit(0);
            } catch (err) {
                console.error('[FAIL]', err.message);
                writeJUnitReport(false, err.message); // כתיבת דיווח כישלון לג'נקינס
                process.exit(1);
            }
        });
    }).on('error', (err) => {
        console.error('[FAIL] Server not reachable:', err.message);
        writeJUnitReport(false, err.message); // כתיבת דיווח כישלון לג'נקינס
        process.exit(1);
    });
}, 1000);

// פונקציה לייצור קובץ ה-XML התואם לפורמט JUnit של ג'נקינס
function writeJUnitReport(success, message = '') {
    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<testsuites name="API_Tests" tests="1" failures="${success ? 0 : 1}">
  <testsuite name="HealthCheckSuite" tests="1" failures="${success ? 0 : 1}">
    <testcase name="testApiHealthEndpoint" classname="ApiHealth">
      ${success ? '' : `<failure message="${message}"><![CDATA[${message}]]></failure>`}
    </testcase>
  </testsuite>
</testsuites>`;

    fs.writeFileSync('test-results.xml', xmlContent);
}