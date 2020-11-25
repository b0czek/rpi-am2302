import Sensor from './dht-sensor';
import express from 'express';
import { Server, Socket } from 'socket.io';
import { MikroORM } from '@mikro-orm/core';
import mikroConfig from './mikro-orm.config';
import { Log } from './entities/Log';

const PIN = 14;
const TYPE = 22;
const EXPRESS_PORT = 4000;

// import fs from 'fs';


const main = async () => {

    const orm = await MikroORM.init(mikroConfig);
    await orm.getMigrator().up();

    //init sensors
    let sensor = new Sensor(TYPE, PIN, { humDCT: 0.3 });

    // const logs = await orm.em.find(Log, {});
    // let temperatures: number[] = logs.map(t => t.temperature);
    // let dates: Date[] = logs.map(d => d.date);
    // let humidities: number[] = logs.map(h => h.humidity)

    //fs.writeFileSync('data.json', JSON.stringify({temperatures: temperatures, dates: dates, humidities: humidities}));

    const app = express();
    app.use('/', express.static('public'));
    const server = app.listen(EXPRESS_PORT, () => {
        console.log(`app started on port ${EXPRESS_PORT}`);

    });

    //socketio initialization
    const io = new Server(server);

    io.on('connect', (socket: Socket) => {
        //send data to connecting client so they wont have to wait for the next datachange
        socket.emit('data', sensor.getData());
        // socket endpoint for requesting data used in charts, parameter dataFrom is required, dataTo is concluded to be current date by default
        socket.on('chartDataRequest', async (dataFrom: any, dataTo = (new Date()).toISOString()) => {
            console.log('got data request');
            // check if datafrom is actually provided 
            if(dataFrom == undefined) {
                socket.emit('chartDataResponse', {
                    error: true
                });
                return;
            }

            // create new date objects from parameters
            dataFrom = new Date(dataFrom).toISOString();
            dataTo = new Date(dataTo).toISOString();

            // if any of them is invalid, then return
            if(dataFrom == "Invalid Date" || dataTo == "Invalid Date") {
                socket.emit('chartDataResponse', {
                    error: true
                });
                return;
            }

            // fetch data from db
            let logs: Log[] = await orm.em.find(Log, { date: {
                $gte: dataFrom,
                $lt: dataTo
            } });
            
            console.log(`datafrom: ${dataFrom}, datato ${dataTo}`);
            console.log(logs);
            socket.emit("chartDataResponse", {
                error: false, 
                data: logs
            });
        });
    });


    sensor.emitter.on('dataChanged', async (temperature, humidity) => {
        io.emit('data', Sensor.createDataObject(temperature, humidity));

        const log = orm.em.create(Log, { humidity: humidity, temperature: temperature });
        await orm.em.persistAndFlush(log);
    });

    sensor.emitter.on('dataError', () => {
        io.emit('error');
    });

};


main().catch(err => {
    console.error(err);

});