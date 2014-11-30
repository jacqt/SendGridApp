var inbound = {
  handler: function (request) {
    var payload = request.query;
    var dir = request.params.q;
    request.reply({ success: true });
    
    if (dir === 'all') {
      eventEmitter.emit("all", payload.username);
      return;
    }

    if (dir === 'random') {
      eventEmitter.emit("data", [getRnd(0,360), payload.username]);
      eventEmitter.emit("data", [getRnd(0,360), payload.username]);
      eventEmitter.emit("data", [getRnd(0,360), payload.username]);
    } else {
      var angle = 0;
      if (dir == 'up')
        angle = getRnd(-45,45);
      else if (dir == 'right')
        angle = getRnd(45,135);
      else if (dir == 'down')
        angle = getRnd(135,225);
      else if (dir == 'left')
        angle = getRnd(225,315);
      eventEmitter.emit("data", [angle, payload.username]);
    }
  }
};

function getRnd(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

server.addRoute({
  method  : 'GET',
  path    : '/yo/{q}',
  config  : inbound
});