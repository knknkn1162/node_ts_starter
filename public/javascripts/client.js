
var socket = io("http://localhost:" + 5000);
socket.on('news', function (data) {
  console.log(data);
  socket.emit('my other event', { my: 'data' });
});
