export class Storyteller {
   hooks = new Set();
   index = 0;
   lines = [];
   state = 'empty';
   style = new Map();
   text;
   timer;
   constructor () {}
   add (...text) {
      const lines = text.join('\n').split('\n').map((line) => line.trim()).filter((line) => line.length > 0);
      if (lines.length > 0) {
         this.lines.push(...lines);
         if (this.state === 'empty') {
            this.state = 'idle';
            this.read();
         }
      }
   }
   advance () {
      this.lines.splice(0, 1);
      this.read();
   }
   parse (text) {
      if (text.startsWith('[') && text.endsWith(']')) {
         const style = new Map();
         for (const property of text.slice(1, -1).split('|')) {
            if (property.includes(':')) {
               style.set(...property.split(':').slice(0, 2));
            } else {
               style.set(property, 'true');
            }
         }
         return { type: 'style', style };
      } else {
         return { type: 'text', text };
      }
   }
   read () {
      if (this.state === 'idle') {
         if (this.lines.length > 0) {
            const line = this.parse(this.lines[0]);
            switch (line.type) {
               case 'style':
                  for (const [ key, value ] of line.style) {
                     this.style.set(key, value);
                     this.update('style', [ key, value ]);
                  }
                  this.advance();
                  break;
               case 'text':
                  this.update('void');
                  const speed = +this.style.get('speed');
                  this.text = line.text;
                  this.index = 0;
                  this.timer = setInterval(() => {
                     if (this.index < this.text.length) {
                        const char = this.text[this.index++];
                        if (char === '{') {
                           const code = this.text.slice(this.index, this.text.indexOf('}', this.index));
                           this.index = this.index + code.length + 1;
                           this.update('code', code);
                        } else {
                           this.update('read', char);
                        }
                     } else {
                        clearInterval(this.timer);
                        this.state = 'idle';
                     }
                  }, Math.round(1000 / (isFinite(speed) ? speed : 15)));
                  this.state = 'read';
                  break;
            }
         } else {
            this.state = 'empty';
         }
      }
   }
   skip () {
      if (this.state === 'read') {
         clearInterval(this.timer);
         while (this.index < this.text.length) {
            const char = this.text[this.index++];
            if (char === '{') {
               const code = this.text.slice(this.index, this.text.indexOf('}', this.index));
               this.index = this.index + code.length + 1;
               this.update('code', code);
            } else {
               this.update('skip', char);
            }
         }
         this.state = 'idle';
      }
   }
   update (...message) {
      for (const hook of this.hooks) hook(...message);
   }
}
