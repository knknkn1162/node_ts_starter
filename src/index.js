const net = require('net');
const HTTPParser = process.binding("http_parser").HTTPParser;
const Stream = require('stream').Stream;
const urlParse = require('url').parse;
var METHODS = {
  0: "DELETE", 
  1: "GET", 
  2: "HEAD", 
  3: "POST", 
  4: "PUT", 
  5: "CONNECT",
  6: "OPTIONS", 
  7: "TRACE",
  28: "PATCH",
};
var STATUS_CODES = {
  '100': 'Continue',
  '101': 'Switching Protocols',
  '102': 'Processing',                 // RFC 2518, obsoleted by RFC 4918
  '200': 'OK',
  '201': 'Created',
  '202': 'Accepted',
  '203': 'Non-Authoritative Information',
  '204': 'No Content',
  '205': 'Reset Content',
  '206': 'Partial Content',
  '207': 'Multi-Status',               // RFC 4918
  '300': 'Multiple Choices',
  '301': 'Moved Permanently',
  '302': 'Moved Temporarily',
  '303': 'See Other',
  '304': 'Not Modified',
  '305': 'Use Proxy',
  '307': 'Temporary Redirect',
  '400': 'Bad Request',
  '401': 'Unauthorized',
  '402': 'Payment Required',
  '403': 'Forbidden',
  '404': 'Not Found',
  '405': 'Method Not Allowed',
  '406': 'Not Acceptable',
  '407': 'Proxy Authentication Required',
  '408': 'Request Time-out',
  '409': 'Conflict',
  '410': 'Gone',
  '411': 'Length Required',
  '412': 'Precondition Failed',
  '413': 'Request Entity Too Large',
  '414': 'Request-URI Too Large',
  '415': 'Unsupported Media Type',
  '416': 'Requested Range Not Satisfiable',
  '417': 'Expectation Failed',
  '418': 'I\'m a teapot',              // RFC 2324
  '422': 'Unprocessable Entity',       // RFC 4918
  '423': 'Locked',                     // RFC 4918
  '424': 'Failed Dependency',          // RFC 4918
  '425': 'Unordered Collection',       // RFC 4918
  '426': 'Upgrade Required',           // RFC 2817
  '500': 'Internal Server Error',
  '501': 'Not Implemented',
  '502': 'Bad Gateway',
  '503': 'Service Unavailable',
  '504': 'Gateway Time-out',
  '505': 'HTTP Version not supported',
  '506': 'Variant Also Negotiates',    // RFC 2295
  '507': 'Insufficient Storage',       // RFC 4918
  '509': 'Bandwidth Limit Exceeded',
  '510': 'Not Extended'                // RFC 2774
};

function createServer(app) {
  return net.createServer((conn) => {
      var parser = new HTTPParser(HTTPParser.REQUEST);
      var req = new Object();

      // require parser & conn
      const res = (statusCode, headers, body) => {
        /* configure headers */
        headers["Content-Length"] = Buffer.byteLength(body);
        if (req.shouldKeepAlive) {
          headers["Connection"] = "keep-alive"
        }

        var content = "HTTP/1.1 " + statusCode + " " + STATUS_CODES[statusCode] + "\r\n";
        for (var key in headers) {
          content += key + ": " + headers[key] + "\r\n";
        }
        content += "\r\n";
        content += body;
        console.log("------");
        console.log(content);
        console.log("------");
        conn.write(content);
        

        if (req.shouldKeepAlive) {
          parser.reinitialize(HTTPParser.REQUEST);
        }
        else {
          conn.end();
        }
      };

      conn.on("data", function (chunk) {
        console.log("conn data start");
        console.log("------");
        console.log(chunk.toString('utf-8', 0, chunk.length)); // typeof chunk = Buffer
        console.log("------");
        parser.execute(chunk, 0, chunk.length);
        console.log("conn data end");
        console.log("===========")
      });

      conn.on("end", function () {
        parser.finish();
      });
      
      parser[HTTPParser.kOnBody] = function (buf, start, len) {
          req.body.emit("data", buf.slice(start, len));
          console.log("kOnBody end")
      };

      parser[HTTPParser.kOnMessageComplete] = function () {
          req.body.emit("end");
          console.log("kOnMessageComplete end")
      };

      parser[HTTPParser.kOnHeadersComplete] = function(_versionMajor, _versionMinor, headers, method,
          url, _statusCode, _statusMessage, _upgrade, shouldKeepAlive) {
          /* input request */
          req.method = METHODS[method];
          req.body = new Stream();
          req.body.readable = true;
          // support query to be hash
          req.url = urlParse(url, true);
          req.shouldKeepAlive = shouldKeepAlive;
          req.headers = {}
          for (var i = 0, l = headers.length; i < l; i += 2) {
            req.headers[headers[i].toLowerCase()] = headers[i + 1];
          }
          console.log(req);
          app(req, res);
      };
      console.log('client connected');

  });
}

const server = createServer((req, res) => {
  console.log("\n\nstart response");
  if (req.url.pathname === "/") {
    switch(req.method) {
      case "GET":
        res(200, { "Content-Type": "text/plain" }, "Hello World: " + req.url.query["msg"] + "\n");
        break;
      case "POST":
        res(200, { "Content-Type": "text/plain"}, "got it");
        break;
      default:
        res(404, {}, "not found");
    }
  }
  else {
    res(404, {}, "");
  }
});
server.listen("5000");