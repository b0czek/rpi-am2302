// dummy sensor module for development running on desktop
export default class Log {
    public static read(type: 22 | 11, pin: number, callback: (err: NodeJS.ErrnoException | null, temperature: number, humidity: number) => void) {
        if(type && pin) {
            callback(null, 22.0, 45.0);
        }
    } 
}