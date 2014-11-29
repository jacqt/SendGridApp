var port        = 3000;
var Hapi        = require('hapi');
server          = new Hapi.Server(+port, '0.0.0.0', { cors: true });

var events       = require('events');
eventEmitter = new events.EventEmitter();

var io = require("socket.io")(server.listener);

var ioHandler = function (socket) {
	  console.log("Got a websocket!");
    socket.emit("welcome", {
        message: "Hello from server!",
        version: Hapi.version
    });

    eventEmitter.on('data', function(data) {
      socket.emit('data', data);
    });
}

io.on("connection", ioHandler);

server.route({
    path: "/{static*}",
    method: "GET",
    handler: {
        directory: {
            path: "./static"
        }
    }
});

require('./routes');

server.start(function() {
  console.log('Server started at: ' + server.info.uri);
});