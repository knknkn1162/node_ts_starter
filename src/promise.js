var app = require('http').createServer(handler)
var io = require('socket.io')(app);
var fs = require('fs');
app.listen(5000);

// http handler
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

const promiseOrTimeout = function(ms, promise){
    // Create a promise that rejects in <ms> milliseconds
    const timeout = new Promise((_resolve, reject) => {
      setTimeout(() => reject('Timed out in '+ ms + 'ms.'), ms);
    });
  
    // Returns a race between our timeout and the passed in promise
    return Promise.race([
      promise,
      timeout
    ]);
};

const promiseExec = filePath => new Promise((resolve, reject) => {
    // async function
    fs.readFile(filePath, (err, data) => {
        if (err) return reject(err.message);
        resolve(data.byteLength);
    });
});

/*
function execOrTimeout(ms, input, callback) {
    // The statement then(fulfill, reject) is also permitted
    return promiseOrTimeout(ms, promiseExec(input)).then(
        res => {
            console.log("res: " + res);
            return {"suggest": res + " bytes"};
        }
    ).catch(
        err => {
            console.log("err: " + err);
            return {"suggest": err}
        }
    ).then(callback);
}
*/

/*
function execOrTimeout(filePath, reject, resolve) {
    setTimeout(() => {
        fs.readFile(filePath, (err, data) => {
            if (err) return reject(err.message);
            resolve(data.byteLength);
        });
    }, 100);
}
*/

async function execOrTimeout(ms, input, callback) {
    let msg;
    try {
        // if reject, jump catch statement.
        const res = await promiseOrTimeout(ms, promiseExec(input));
        msg = {"data": res};
    }
    catch (err) {
        msg = {"error": err};
    } finally {
        console.log(msg);
        callback(msg);
    }
}

io.on('connection', (socket) => {
    console.log("connection start");
    socket.on("request", request => {
        // 10ms or timeout
        execOrTimeout(10, request["data"], msg => socket.emit("response", msg));
    });
});