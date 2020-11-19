import dht from 'node-dht-sensor';
import { EventEmitter } from 'events';

interface SensorData {
    temp: string,
    hum: string
}
/**
 * @typedef Properties
 * @property {number} humDCT               - Threshold for humidity data to be considered changed
 * @property {number} tempDCT              - Threshold for temperature data to be considered changed
 * @property {number} pollingRate          - Milliseconds between read operations. Reading from sensor itself takes about 2000ms so it should be considered as pollingRate+2000  
 */
interface Properties {
    humDCT?: number,
    tempDCT?: number,
    pollingRate?: number
}

class DHTSensor {

    private pin: number;
    private type: 11 | 22;

    private pollingRate = 2000;
    private humDCT = 0.2;
    private tempDCT = 0.2;

    //public event emitter destined to notify about data changing and errors
    public emitter = new EventEmitter();

    // data contained by the object
    private temp = 0.0;
    private hum = 0.0;

    /**
     * @param type type of the DHT sensor (for am2302 it is 22)
     * @param pin pin that is physically wired to the data pin of sensor
     * @param {Properties} props Additional properties for sensor
     */
    constructor(type: 11 | 22, pin: number, props?: Properties) {
        // object argument assignments
        this.pin = pin;
        this.type = type;
        // if values not provided, leave their values as initialized by default
        if(props !== undefined) {
            this.pollingRate = props.pollingRate != undefined ? props.pollingRate : this.pollingRate;
            this.humDCT = props.humDCT != undefined ? props.humDCT : this.humDCT;
            this.tempDCT = props.tempDCT != undefined ? props.tempDCT : this.tempDCT;
        }

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
            if((temperature <= this.temp - this.tempDCT || temperature >= this.temp + this.tempDCT) ||
                (humidity <= this.hum - this.humDCT || humidity >= this.hum + this.humDCT)) {
                    
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