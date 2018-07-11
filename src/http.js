const http = require('http');
http.createServer((req, res) => {
  console.log("createServer");
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello World\n');
}).listen(5000);
console.log('Server running at http://localhost:5000/');
