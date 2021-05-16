export class Client {
   constructor (callback = () => {}) {
      this.callback = callback;
   }
   init (port) {
      const socket = new WebSocket(`wss://${location.hostname}:${port}`);
      socket.addEventListener('open', () => {
         const transmitter = new Transmitter(socket);
         socket.addEventListener('message', (event) => transmitter.receive(event.data));
         this.callback(transmitter);
      });
      socket.addEventListener('close', () => {
         this.init(port);
      });
   }
}

export class Transmitter {
   static async parse (content, callback) {
      try {
         const [ event, ...args ] = JSON.parse(content);
         if (typeof event === 'string') {
            await callback([ event, ...args ]);
         }
      } catch (error) {}
   }
   static async serialize (content, callback) {
      try {
         const [ event, ...args ] = content;
         if (typeof event === 'string') {
            await callback(JSON.stringify([ event, ...args ]));
         }
      } catch (error) {}
   }
   events = new Map();
   constructor (socket) {
      this.socket = socket;
   }
   emit (event, ...args) {
      return this.events.has(event) ? [ ...this.events.get(event) ].map((listener) => listener(...args)) : [];
   }
   on (event, listener) {
      this.events.has(event) || this.events.set(event, new Set());
      return this.events.get(event).add(listener);
   }
   receive (content) {
      Transmitter.parse(content, ([ event, ...args ]) => {
         this.emit(event, ...args).map((output) => this.send(event, output));
      });
   }
   async send (event, input) {
      if (typeof input === 'object') {
         let args = [];
         if (input instanceof Promise) {
            try {
               args = [ ...(await input) ];
            } catch (error) {
               try {
                  args = [ ...error ];
               } catch (error) {}
            }
         } else {
            try {
               args = [ ...input ];
            } catch (error) {}
         }
         Transmitter.serialize([ event, ...args ], (content) => {
            this.socket.send(content);
         });
      }
   }
}
