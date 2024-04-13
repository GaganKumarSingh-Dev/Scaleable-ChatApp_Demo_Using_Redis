import { Server } from "socket.io";
import Redis from "ioredis";

const pub = new Redis({
    host: process.env.REDIS_HOST,
    port: 27364,
    username: 'default',
    password: process.env.REDIS_PASSWORD
});

const sub = new Redis({
    host: process.env.REDIS_HOST,
    port: 27364,
    username: 'default',
    password: process.env.REDIS_PASSWORD 
});



class SocketService {

    private _io: Server;

    constructor() {
        console.log("Init Socker Service..");
        this._io = new Server({
            cors: {
                allowedHeaders: ['*'],
                origin: '*',
            }
        });
        sub.subscribe('MESSAGES');
    }

    public initListeners() {
        const io = this.io;
        console.log("Init Listeners..");
        io.on('connect', (socket) => {
            console.log(`New Socket Connected: ${socket.id}`);
            socket.on('event:message', async ({message}:{message: string}) => {
                console.log(`New Message: ${message}`);

                await pub.publish('MESSAGES', JSON.stringify({message}));
            });
        });
        sub.on('message', async(channel, message) => {
            if(channel==='MESSAGES') {
                io.emit('message', message);
            }
        });
    }

    get io() {
        return this._io;
    }
}

export default SocketService;