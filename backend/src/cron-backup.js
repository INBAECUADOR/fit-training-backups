const http = require('http');

const SECRET = process.env.CRON_SECRET;
const PORT = process.env.PORT || process.env.RAILWAY_PORT || 3001;

if (!SECRET) {
  console.error('CRON_SECRET not set');
  process.exit(1);
}

const data = JSON.stringify({});

const options = {
  hostname: 'localhost',
  port: PORT,
  path: `/api/admin/backup/cron?secret=${encodeURIComponent(SECRET)}`,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length,
  },
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', c => body += c);
  res.on('end', () => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Response: ${body}`);
    process.exit(res.statusCode >= 200 && res.statusCode < 300 ? 0 : 1);
  });
});

req.on('error', (err) => {
  console.error('Cron error:', err);
  process.exit(1);
});

req.write(data);
req.end();
