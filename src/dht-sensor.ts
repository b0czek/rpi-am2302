import dht from 'node-dht-sensor';
import { EventEmitter } from 'events';

interface SensorData {
    temp: string,
    hum: string
}

class DHTSensor {

    private pin: number;
    private type: 11 | 22;
    private pollingRate: number;

    private dct: number;

    //public event emitter destined to notify about data changing and errors
    public emitter = new EventEmitter();

    // data contained by the object
    private temp = 0.0;
    private hum = 0.0;
    /**
     * 
     * @param type type of the DHT sensor (for am2302 it is 22)
     * @param pin pin that is physically wired to the data pin of sensor
     * @param dataChangeThreshold threshold that within which the data should not be considered as changing value, its job is to keep the database optimized by not storing as many logs
     * @param pollingRate Milliseconds between read operations. Reading from sensor itself takes about 2000ms so it should be considered as pollingRate+2000  
     */
    constructor(type: 11 | 22, pin: number, dataChangeThreshold: number = 0.2, pollingRate: number = 2000) {
        // object argument assignments
        this.pin = pin;
        this.type = type;
        this.pollingRate = pollingRate;
        this.dct = dataChangeThreshold;

        this.readSensor();

    }

    private readSensor = () => {
        dht.read(this.type, this.pin, (err, temperature, humidity) => {
            if (err) {
                // emit dataError when callback reports an error and null the data
                this.emitter.emit('dataError');
                return;
            }
            // if any of the values fall out of threshold in any direction, then consider the value changed
            if((temperature <= this.temp - this.dct || temperature >= this.temp + this.dct) ||
                (humidity <= this.hum - this.dct || humidity >= this.hum + this.dct)) {
                    
                    // round values to 1 decimal place - fix it to **.* notation
                    this.temp = Math.round(temperature * 100) / 100;
                    this.hum = Math.round(humidity * 100) / 100;

                    // notify about data falling out of threshold
                    this.emitter.emit('dataChanged', this.temp, this.hum);
                }

        });

        setTimeout(this.readSensor, this.pollingRate);
    }


    // method for getting data as an object
    public getData = (): SensorData => {
        return {
            // if any of the values is null, then return it otherwise, return them as strings(saves from formatting at frontend)
            temp: this.temp.toFixed(1),
            hum: this.hum.toFixed(1)
        };
    }
    public static createDataObject = (temperature: number, humidity: number): SensorData => {
        return {
            temp: temperature.toFixed(1),
            hum: humidity.toFixed(1)
        }
    };
}

export default DHTSensor;