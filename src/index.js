
//initialize sensor
const Sensor = require('./sensor');
const PIN = 14;
const TYPE = 22;
let sensor = new Sensor(TYPE, PIN);


//start express
const express = require('express');
const app = express();

app.use('/', express.static('public'));
const server = app.listen(4000, () => {
    console.log(sensor.data);
    console.log('app started on port 4000');
});

//get socketio running
const io = require('socket.io')(server);
sensor.emitter.on('dataChanged', () => {
    io.emit('data', sensor.data);
});

io.on('connect', socket => {
    //send data to connecting client so it wont have to wait for the next datachange
    socket.emit('data', sensor.data);

});

