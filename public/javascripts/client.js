const socket = io("http://localhost:" + 5000);

const initialize = () => {
  $("#send-message").focus();
  $("#send-message").val("");
}

const processUserInput = socket => {
  const msg = $("#send-message").val();
  socket.emit("request", { req: msg });
  $("#notification").text("wait...");
  socket.on("response", data => {
    console.log(data["suggest"]);
    $("#notification").text("message: " + data["suggest"]);
  });
};

/*
socket.on('hello', data => {
  console.log(data);
  socket.emit('result', { me: 'nice! ' + data["hello"] });
});
*/

$(document).ready(() => {
  initialize();

  $("#send-form").submit(() => {
    processUserInput(socket);
    initialize();
    return false;
  });
});