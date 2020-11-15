//initialize sensor
import Sensor from './dht-sensor';
const PIN = 14;
const TYPE = 22;
let sensor = new Sensor(TYPE, PIN);


//start express
import express from 'express';
const app = express();
const EXPRESS_PORT = 4000;

app.use('/', express.static('public'));
const server = app.listen(EXPRESS_PORT, () => {
    console.log(`app started on port ${EXPRESS_PORT}`);
    
});

import { Server, Socket } from 'socket.io';
const io = new Server(server);

io.on('connect', (socket: Socket) => {
        //send data to connecting client so it wont have to wait for the next datachange
        socket.emit('data', sensor.getData());
});
sensor.emitter.on('dataChanged', () => {
    io.emit('data', sensor.getData());
});
sensor.emitter.on('dataError', () => {
    io.emit('error')
});