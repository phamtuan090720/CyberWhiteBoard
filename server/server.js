const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const cors = require('cors')
const port =  process.env.YOUR_PORT || process.env.PORT || 5000;
 
app.use(cors());

io.on("connection", (socket) => {
    socket.on("canvas-data", (data) => {
        socket.broadcast.emit("canvas-data", data);
    });
});

http.listen(port, () => {
    console.log(`Listen localhost:${port}`);
});