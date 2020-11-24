import mikroConfig from '../../../src/mikro-orm.config';
import { MikroORM } from '@mikro-orm/core';
import * as yargs from 'yargs';
import { Log } from '../../../src/entities/Log';

const dateCoerce = (date: string) => {
    let startDate = new Date(date);
    if (isNaN(startDate.getTime())) {
        throw new Error("Provided startDate is invalid");
    }
    else {
        return startDate.toISOString();
    }
}

interface Arguments {
    [x: string]: unknown,
    startDate: string,
    endDate: string,
    clearTable: boolean,
    dataFrequency: number,
    frequencySpread: number,
    humidityDataSpread: number,
    humidityStartValue: number,
    humidityMinValue: number,
    humidityMaxValue: number
    temperatureDataSpread: number,
    temperatureStartValue: number,
    temperatureMinValue: number,
    temperatureMaxValue: number
    _: string[],
    $0: string
}


const yargOptions = {
    startDate: {
        alias: 's',
        type: "string",
        demandOption: true,
        descrption: 'date where the filling is started from, constructed to standard js date object',
        coerce: dateCoerce
    },
    endDate: {
        alias: 'e',
        type: "string",
        default: new Date().toISOString(),
        defaultDescription: 'current date',
        description: 'date where the the filling is ended at',
        coerce: dateCoerce
    },

    clearTable: {
        alias: 'c',
        type: "boolean",
        default: false,
        description: "whether to clear all logs from db before creating new or not "
    },

    dataFrequency: {
        alias: 'f',
        type: 'number',
        default: 30,
        description: 'frequency of data logs at which they will be generated in seconds'
    },
    frequencySpread: {
        alias: 'x',
        type: 'number',
        default: 0,
        description: 'spreadage of the time in which the logs will be generated, must be smaller than dataFrequency'
    },
    humidityDataSpread: {
        alias: 'Hd',
        type: 'number',
        default: 0.2,
        description: 'spreadage of the data values that will be generated in both directions'
    },
    humidityStartValue: {
        alias: 'Hv',
        type: 'number',
        default: 50.0,
        description: 'value that the generation is started from'
    },
    humidityMinValue: {
        alias: 'Hm',
        type: 'number',
        default: 40.0,
        description: 'minimal value that might be generated'
    },
    humidityMaxValue: {
        alias: 'HM',
        type: 'number',
        default: 99.9,
        description: 'maximal value that might be generated'
    },
    temperatureDataSpread: {
        alias: 'Td',
        type: 'number',
        default: 0.1,
        description: 'spreadage of the data values that will be generated in both directions'
    },
    temperatureStartValue: {
        alias: 'Tv',
        type: 'number',
        default: 20.0,
        description: 'value that the generation is started from'
    },
    temperatureMinValue: {
        alias: 'Tm',
        type: 'number',
        default: 0.0,
        description: 'minimal value that might be generated'
    },
    temperatureMaxValue: {
        alias: 'TM',
        type: 'number',
        default: 30.0,
        description: 'maximal value that might be generated'
    }
} as Parameters<typeof yargs.options>[0];
const argv = yargs.options(yargOptions).argv as Arguments;


//precalculate max and min spread to save on calculation time
const minSpreadValue = argv.dataFrequency - argv.frequencySpread;
const maxSpreadValue = argv.dataFrequency + argv.frequencySpread;

const calculateNewDate = (currentDate: Date): Date => {
    let newDateOffset = Math.floor(Math.random() * (maxSpreadValue - minSpreadValue + 1) + minSpreadValue) * 1000;

    return new Date(currentDate.getTime() + newDateOffset);
};


const calculateNewValue = (lastValue: number, minValue: number, maxValue: number, dataSpread: number): number => {
    // if any of the extreme values is bigger/less than lastvalue with offset adjusted, make the extreme as transitory max/min
    let max = lastValue + dataSpread > maxValue ? maxValue : lastValue + dataSpread;
    let min = lastValue - dataSpread < minValue ? minValue : lastValue - dataSpread;

    return Math.floor(Math.random() * (max - min + 1) + min * 10) / 10; // multiply and divide by ten to get **.* precision in random numbers
    
};


const main = async () => {
    if (argv.frequencySpread > argv.dataFrequency) {
        throw new Error('frequencySpread must not be bigger than dateFrequency!');
    }

    // initialize orm
    const orm = await MikroORM.init(mikroConfig);
    await orm.getMigrator().up();
    
    if(argv.clearTable) {
        orm.em.nativeDelete(Log, {});
    }

    
    // construct string arguments into date objects
    let operatingDate: Date = new Date(argv.startDate);
    const endDate: Date = new Date(argv.endDate);
    //initialize log array
    let logs: Log[] = [];

    // initialize values variables
    let lastHum = argv.humidityStartValue;
    let lastTemp = argv.temperatureStartValue;
    


    while (endDate >= operatingDate) {
        // flush to db if generated 1000 logs
        if(logs.length == 1000) {
            await orm.em.persistAndFlush(logs);
            logs = [];
        }
        // push log to array
        logs.push(orm.em.create(Log, { date: operatingDate, humidity: lastHum, temperature: lastTemp }));

        // create new values 
        lastHum = calculateNewValue(lastHum, argv.humidityMinValue, argv.humidityMaxValue, argv.humidityDataSpread);
        lastTemp = calculateNewValue(lastTemp, argv.temperatureMinValue, argv.temperatureMaxValue, argv.temperatureDataSpread);
        // calc date for next log
        operatingDate = calculateNewDate(operatingDate);
    }
    // final flush to db
    await orm.em.persistAndFlush(logs);


};


main().catch(err => {
    console.error(err.toString());

});