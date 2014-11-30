var inbound = {
  handler: function (request) {
    var payload = request.query;

    request.reply({ success: true });
    
    eventEmitter.emit("data", [getRnd(0,360), payload.username]);
    eventEmitter.emit("data", [getRnd(0,360), payload.username]);
  }
};

function getRnd(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

server.addRoute({
  method  : 'GET',
  path    : '/yo',
  config  : inbound
});