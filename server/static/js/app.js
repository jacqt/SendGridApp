socket = io.connect("/")

socket.on("connect", function () {
    console.log("connected")
})

socket.on("welcome", function (data) {
    console.log(data.message)
})

socket.on("data", function (data) {
	console.log(data)
})