var http = require('http');
const url = require('url');

// set proxy on the proxysettings on the MAC OSX or chrome browser.
/* WARNING: There's a lot of problems; e.g) Error: getaddrinfo ENOTFOUND notfoundhost notfoundhost:80 */
var server = http.createServer(function (cliReq, cliRes) {
  const x = url.parse(cliReq.url, true);
  console.log("url: " + cliReq.url, "protocol: " + x.protocol);
  const opt = {host: x.hostname, port: x.port || 80, path: x.path, method: cliReq.method, headers: cliReq.headers};
  cliReq.pipe(http.request(opt, svrRes => {
    console.log("statusCode: ", svrRes.statusCode, ", headers: ", svrRes.headers);
    cliRes.writeHead(svrRes.statusCode, svrRes.headers);
    svrRes.pipe(cliRes); 
  }));
}).listen(10000);