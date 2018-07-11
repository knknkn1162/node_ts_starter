var app = require('http').createServer(handler)
var io = require('socket.io')(app);
var fs = require('fs');
app.listen(5000);

function handler (req, res) {
  console.log(req.url);
  url = req.url[req.url.length-1] === "/" ? req.url + "index.html" : req.url;
  absPath = "public" + url;
  fs.exists(absPath, exists => {
    if(!exists) {
      send404(res);
      return;
    }
    mimetype = req.url.endsWith(".js") ? "text/javascript" : "text/html";
    fs.readFile(absPath, (err, data) => err ? send404(res) : render(res, mimetype, data));
  });
}

function render(res, mimetype, fileContents) {
  res.writeHead(200, {"content-type": mimetype});
  res.end(fileContents);
}

function send404(res) {
  res.writeHead(404, {'Content-Type': 'text/plain'});
  res.end();
}

io.on('connection', function (socket) {
  console.log("connect");
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });
});