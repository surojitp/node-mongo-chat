var express = require("express");
var app = express();
var path = require('path');
var server = require('http').createServer(app);
var io = require("socket.io").listen(server);
var mongoose = require('mongoose');
var bodyparser = require('body-parser');
var UserSchema = require('./schema/user/users');

app.use(bodyparser.urlencoded(
    { 
        extended: true 
    }));
app.use(bodyparser.json());
app.set('views', path.join(__dirname, ''));
app.set('view engine', 'ejs');
//users = [];
var users;
connections = [];


server.listen(process.env.PORT || 3000);
console.log('server running...');

/// mongo connection ///
var localString = 'mongodb://localhost:27017/testChat'
var options = {};
var db = mongoose.connect(localString, options, function (err) {
    if (err) {
        console.log(err + "connection failed");
    } else {
        console.log('Connected to database ');
    }
});
//mongo on connection emit
mongoose.connection.on('connected', function (err) {
    console.log("mongo Db conection successfull");
});
//mongo on error emit
mongoose.connection.on('error', function (err) {
    console.log("MongoDB Error: ", err);
});
//mongo on dissconnection emit
mongoose.connection.on('disconnected', function () {
    console.log("mongodb disconnected and trying for reconnect");
    mongoose.connectToDatabase();
});




app.get('/', (req, res) =>{
    UserSchema.find()
            .then(r =>{
                res.render(__dirname + '/index' ,{data: r});
            })
    
});
app.post('/add', (req, res) =>{
    console.log(req.body.name);
    
    let userSchema = {
        name: req.body.name
    };

    new UserSchema(userSchema).save(function (err, result) {

        if (err) {
            res.send({
                "response_code": 5005,
                "response_message": "INTERNAL DB ERROR",
                "response_data": err
            });
        } else {
            res.send({
                "response_code": 2000,
                "response_message": "You have registered successfully.",
                "response_data": result
            });
        }
    });
});


//io.sockets.on('connection', (socket) => {
io.on('connection', async (socket) => {
    await UserSchema.find()
            .then(r =>{
                users = r;
                //console.log("aa",users);
                updateUserName();
            })
    console.log(socket.id);
    // once a client has connected, we expect to get a ping from them saying what room they want to join
    socket.on('room', function(room, callback) {
        console.log(room);
        
        callback(true);
        socket.join(room);
    });
    
    connections.push(socket);
    console.log('Connected: %s sockets connected', connections.length);

    //Disconnect
    socket.on('disconnect', (data) =>{
        users.splice(users.indexOf(socket.user), 1);
        updateUserName();
        connections.splice(connections.indexOf(socket), 1);
        console.log('Disconnected: %s sockets connected', connections.length);
    })
    //Send Message
    socket.on('send message', (data, to) =>{
        //console.log(data);
        
        /////////// for one to one //////////
        //io.to(to).emit('new message', {msg: data, user: socket.user});
        
        //////////////// for room //////////////
        room = to;
        io.sockets.to(room).emit('new message', {msg: data, user: socket.user});
    });
    //New user
    socket.on('new user', (data, callback) =>{
        console.log(data);
        var index = users.findIndex(function(u) {
            return u._id == data.toString()
          })
        console.log(index)
        callback(true);
        // var userData = {name: data, id: socket.id}
        // socket.user = userData;
        // users.push(userData);
        users[index].online = 1
        updateUserName();
    })

    

    function updateUserName(){
        io.sockets.emit('get users', users);
    }
})
