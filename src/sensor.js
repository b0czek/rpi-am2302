const dht = require("node-dht-sensor");
const eventEmitter = require('events');
class DHTSensor {

    

    constructor(type, pin, pollingRate = 2000) {
        // null the data out when the sensors were not initialized yet
        this.nullData()

        this.pin = pin;
        this.type = type;
        this.pollingRate = pollingRate;
        
        // add event emitter for signalizing the data changing
        this.emitter = new eventEmitter();
        
        setInterval(() => {
            try {
                const response = dht.read(this.type, this.pin)
                let temp = response.temperature.toFixed(1);
                let hum = response.humidity.toFixed(1);
    
                // if data is different than the stored one, emit a notification            
                if(temp != this.temp || hum != this.hum) {
                    this.emitter.emit('dataChanged');
                }
                this.temp = temp;
                this.hum = hum;
            }
            catch {
                //if there is a problem just null the data out and notify about it
                this.emitter.emit('dataChanged');
                this.nullData();
            }
        }, this.pollingRate);
    }

    nullData(){
        this.temp = null;
        this.hum = null;
    }

    get data() {
        return {
            temp: this.temp,
            hum: this.hum
        }
    }
}

module.exports = Sensor;