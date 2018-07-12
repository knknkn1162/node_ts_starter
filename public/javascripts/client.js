const socket = io("http://localhost:" + 5000);

const initialize = () => {
  $("#send-message").focus();
  $("#send-message").val("");
}

const processUserInput = socket => {
  const msg = $("#send-message").val();
  socket.emit("request", { "data": msg });
  $("#notification").text("wait...");
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

  socket.on("response", response => {
    console.log(response);
    const msg = response["error"] ? "error: " + response["error"] : "message: " + response["data"];
    $("#notification").text(msg);
  });
});