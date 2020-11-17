import Sensor from './dht-sensor';
import express from 'express';
import { Server, Socket } from 'socket.io';
import { MikroORM } from '@mikro-orm/core';
import mikroConfig from './mikro-orm.config';
import { Log } from './entities/Log';

const PIN = 14;
const TYPE = 22;
const EXPRESS_PORT = 4000;


const main = async () => {
    //init sensors
    let sensor = new Sensor(TYPE, PIN);

    const orm = await MikroORM.init(mikroConfig);
    await orm.getMigrator().up();

    const app = express();
    app.use('/', express.static('public'));
    const server = app.listen(EXPRESS_PORT, () => {
        console.log(`app started on port ${EXPRESS_PORT}`);
    
    });

    //socketio initialization
    const io = new Server(server);
    
    io.on('connect', (socket: Socket) => {
        //send data to connecting client so it wont have to wait for the next datachange
        socket.emit('data', sensor.getData());
    });
    
    sensor.emitter.on('dataChanged', async () => {
        io.emit('data', sensor.getData());
        const log = orm.em.create(Log, { humidity: sensor.Humidity, temperature: sensor.Temperature });
        await orm.em.persistAndFlush(log);
    });
    
    sensor.emitter.on('dataError', () => {
        io.emit('error');
    });
    
};


main().catch(err => {
    console.error(err);
    
});