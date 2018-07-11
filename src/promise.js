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
  

const promiseTimeout = function(ms, promise){
    // Create a promise that rejects in <ms> milliseconds
    let timeout = new Promise((resolve, reject) => {
      //let id = 
      let id = setTimeout(() => {
        clearTimeout(id);
        reject('Timed out in '+ ms + 'ms.')
      }, ms);
    })
  
    // Returns a race between our timeout and the passed in promise
    return Promise.race([
      promise,
      timeout
    ]);
};

const promiseExec = filePath => new Promise((resolve, reject) => {
fs.readFile(filePath, (err, data) => {
    if (err) return reject(err.message);
    resolve(data.byteLength);
});
});
  
  io.on('connection', (socket) => {
    console.log("connection start");
  
    socket.on("request", data => {
      promiseTimeout(10, promiseExec(data["req"])).then(
        res => {
          console.log("res: " + res);
          socket.emit("response", {"suggest": res + " bytes"})
        },
        err => {
          console.log("err: " + err);
          socket.emit("response", {"suggest": err})
        }
      );
    });
  });