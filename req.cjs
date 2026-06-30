const http = require('http');

const data = JSON.stringify({
  planId: "pro",
  planName: "Pro Plan",
  price: 25,
  cycle: "quarterly",
  userId: "123"
});

const options = {
  hostname: '127.0.0.1',
  port: 3000,
  path: '/api/create-checkout-session',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, res => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => console.log('STATUS:', res.statusCode, 'BODY:', body));
});

req.on('error', error => {
  console.error('ERROR:', error);
});

req.write(data);
req.end();
