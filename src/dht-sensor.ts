import dht from 'node-dht-sensor';
import { EventEmitter } from 'events';

type numOrNull = number | null;

class DHTSensor {

    private pin: number;
    private type: 11 | 22;
    private pollingRate: number;


    //public event emitter destined to notify about data changing and errors
    public emitter = new EventEmitter();

    // data contained by the object
    private temp: numOrNull;
    private hum: numOrNull;

    constructor(type: 11 | 22, pin: number, pollingRate: number = 2000) {
        //null the data out before the sensor were not even initialized
        this.nullData();
        // object argument assignments
        this.pin = pin;
        this.type = type;
        this.pollingRate = pollingRate;

        this.readSensor();

    }

    private readSensor = () => {
            dht.read(this.type, this.pin, (err, temperature, humidity) => {
                if(err) {
                    // emit dataError when callback reports an error and null the data
                    this.emitter.emit('dataError');
                    this.nullData();
                    return;
                }
                // only reassign values when they are different
                if (temperature != this.temp || humidity != this.hum) {
                    this.emitter.emit('dataChanged');
                    this.temp = temperature;
                    this.hum = humidity;
                }
                //todo emit value read (i think it will be needed for logging in db)
            });
        
        setTimeout(this.readSensor, this.pollingRate);
    }



    private nullData = () => {
        this.temp = null;
        this.hum = null;
    };
    // method for getting data as an object
    public getData = (): { temp: string | null, hum: string | null } => {
        return {
            // if any of the values is null, then return it otherwise, fix it to **.* notation
            temp: this.temp === null ? null : this.temp.toFixed(1),
            hum: this.hum === null ? null : this.hum.toFixed(1)
        };
    }

}
export default DHTSensor;