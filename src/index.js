const net = require('net');
const HTTPParser = process.binding("http_parser").HTTPParser;
const Stream = require('stream').Stream;
const urlParse = require('url').parse;
const queryParse = require('querystring').parse

// constants
const FORM_URLENCODED = 'application/x-www-form-urlencoded';
const METHODS = ["DELETE", "GET", "HEAD", "POST", "PUT", "CONNECT", "OPTIONS", "TRACE"];
const STATUS_CODES = {
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

function createServer(callback) {
  return net.createServer(conn => {
      /*
      { [Function: HTTPParser]
        REQUEST: 0,
        RESPONSE: 1,
        kOnHeaders: 0,
        kOnHeadersComplete: 1,
        kOnBody: 2,
        kOnMessageComplete: 3,
        kOnExecute: 4
      }
      */
      var parser = new HTTPParser(HTTPParser.REQUEST);
      var request = new Object();

      // require parser & conn
      const response = (statusCode, headers, body) => {
        /* configure headers */
        headers["Content-Length"] = Buffer.byteLength(body);
        if (request.shouldKeepAlive) {
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
        

        if (request.shouldKeepAlive) {
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
        console.log("conn end")
        parser.finish();
      });
      
      // See https://blog.websecurify.com/2017/03/http-pcap-in-node.html
      parser[HTTPParser.kOnBody] = (buf, start, len) => {
        console.log("kOnBody");
        console.log("buffer: " + buf.slice(start, start+len).toString());
        request.body = buf.slice(start, start+len);
      };

      parser[HTTPParser.kOnExecute] = () => {
        console.log("kOnExecute");
      }

      parser[HTTPParser.kOnMessageComplete] = function () {
          callback(request, response);
          console.log("kOnMessageComplete");
      };

      parser[HTTPParser.kOnHeadersComplete] = function(_versionMajor, _versionMinor, headers, method,
          url, _statusCode, _statusMessage, _upgrade, shouldKeepAlive) {
          request.method = METHODS[method];
          // support query to be hash
          request.url = urlParse(url, true);
          request.shouldKeepAlive = shouldKeepAlive;
          request.headers = {}
          for (var i = 0, l = headers.length; i < l; i += 2) {
            request.headers[headers[i].toLowerCase()] = headers[i + 1];
          }
      };
      console.log('client connected');

  });
}

const server = createServer((req, res) => {
  console.log("\n\nstart response");
  if (req.url.pathname === "/") {
    switch(req.method) {
      // try `curl http://localhost:5000?msg=hello`
      case "GET":
        res(200, { "Content-Type": "text/plain" }, "Hello World: " + req.url.query["msg"] + "\n");
        break;
      // try curl -sS -XPOST --data "name=sample"  http://localhost:5000
      case "POST":
        if(req.headers["content-type"] === FORM_URLENCODED) {
          const h = queryParse(req.body.toString());
          res(200, { "Content-Type": "text/plain"}, "got it: " + h["name"] + "\n");
        }
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
