var inbound = {
  handler: function (request) {
    var envelope;
    var to;
    var payload = request.payload;

    console.log(payload);

    if (payload.envelope) { envelope = JSON.parse(payload.envelope) };
    if (envelope)         { to = envelope.from; }

    request.reply({ success: true });
    
    console.log(payload.subject + to);
    eventEmitter.emit("data", [payload.subject, to]);
  }
};

server.addRoute({
  method  : 'POST',
  path    : '/inbound',
  config  : inbound
});