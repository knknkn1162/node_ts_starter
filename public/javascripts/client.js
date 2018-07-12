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


$(document).ready(() => {
  initialize();

  $("#send-form").submit(() => {
    processUserInput(socket);
    initialize();
    return false;
  });

  socket.on("response", response => {
    console.log(response);
    var msg;
    if (response.error) {
      msg = "error: " + response.error;
    } else {
      msg = "file: " + response.file + ", " + "message: " + response.data;
    }
    $("#notification").text(msg);
  });
});