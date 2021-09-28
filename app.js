const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const port = process.env.PORT || 4001;
const index = require("./routes/index");
let rooms = {};

const app = express();
app.use(function(req, res, next) {
    req.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Origin", "*");
    // res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
const cors = require('cors');
var corsOptions = {
  origin: '*',
  "Access-Control-Allow-Origin": '*',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204 
}
app.use(cors(corsOptions));
app.use(index);

const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  }); 

io.on("connection", (socket) => {
    // console.log('New connection!');
    console.log(socket.handshake.query);
    let roomID = socket.handshake.query.roomID;
    socket.join(roomID);
    if(rooms[roomID]){
        rooms[roomID]++;
    } else {
        rooms[roomID] = 1;
    }
    io.to(roomID).emit('joined', rooms[roomID]);

    socket.on("message", (message) => {
        console.log(message);
        message.type = 'message';
        socket.broadcast.emit(message.id, message);
    });

    socket.on("check", (message) => {
        message.type = 'check';
        socket.broadcast.emit(message.id, message);
    });

    socket.on("track update", (data) => {
        console.log(data);
        socket.broadcast.emit('track update received', data);
    });

    socket.on("player update", (data) => {
        console.log(data);
        socket.broadcast.emit('player update received', data);
    });

    socket.on("disconnect", () => {
        console.log('Client disconnect');
        rooms[roomID]--;
        io.to(roomID).emit('joined', rooms[roomID]);
    })
});

app.post('/checkRoom', function(req, res) {
    let id = req.body.id;
    if(rooms[id]) return res.send(true);
    else res.send(false);
});

// server.listen(port, () => console.log(`Socket IO server listening on port ${port}`));
io.listen(port);
console.log(`Socket IO server listening on port ${port}`);