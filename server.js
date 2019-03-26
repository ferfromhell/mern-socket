const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const axios = require('axios');

const port = process.env.PORT || 3456;

const app = express()
//CORS
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
// our server instance
const server = http.createServer(app)

// This creates our socket using the instance of the server
const io = socketIO(server,{
  path: '/io'
});

let signedUsers ={};
let activities = [];


const addActivity= async (name,avatar,action) =>{
  let date= new Date()
  let atTime = date.toLocaleString();
  await activities.unshift({
    user: name,
    avatar: avatar,
    action: action,
    at: atTime
  });
}
// This is what the socket.io syntax is like, we will work this later
io.on('connection', socket => {
  // console.log('User connected:', socket.handshake.headers.cookie);
  
  socket.on('disconnect', async () => {
    // console.log('user disconnected', socket.handshake.headers.cookie);
    const url="/api/users/current";
    await axios({
          url: '/api/users/current',
          method: 'get',
          headers: {
            Cookie: socket.handshake.headers.cookie
          }
      }).then(async (res) => {
        let { id,name, avatar} = res.data;
        console.log(name, avatar);
        await addActivity(name,avatar,"disconnected");
        delete signedUsers[id];
      }).catch(err => {
        console.log(err);
      });
    
    io.sockets.emit('new-activity',activities);
    io.sockets.emit('online-users', Object.keys(signedUsers).length);
  })
  socket.on('online-users',async (data) => {
    let { user} = data;
    let date= new Date()
    let atTime = date.toLocaleString();
    signedUsers[user.id]=user;
    await addActivity(user.name,user.avatar,"logged in");
    console.log('data in array: ', Object.keys(signedUsers));
    io.sockets.emit('online-users', Object.keys(signedUsers).length);
    io.sockets.emit('new-activity',activities);

  });
  
  // socket.on('', (data) => {
  // })
})

server.listen(port, () => console.log(`Socket server Listening on port ${port}`));