import { Storyteller } from './storyteller.js';

export class Undertale extends Storyteller {
   character = 'default';
   characters = {};
   images = new Map();
   sounds = new Map();
   values = {
      emotion: 'default',
      font: 'default'
   };
   voice = 'default';
   get emotion () {
      return this.images.get(`${this.character}/${this.values.emotion}`);
   }
   set emotion (value) {
      this.values.emotion = value;
   }
   get font () {
      return this.characters[this.character].fonts[this.values.font];
   }
   set font (value) {
      this.values.font = value;
   }
   constructor (characters) {
      super();
      this.characters = characters;
      for (const character in characters) {
         const { emotions, voices } = characters[character];
         for (const emotion in emotions) this.images.set(`${character}/${emotion}`, this.image(emotions[emotion]));
         for (const voice in voices) this.sounds.set(`${character}/${voice}`, this.sound(voices[voice]));
      }
   }
   add (...text) {
      super.add(
         ...text.map((line) => {
            return line
               .replace(/, /g, ', ^')
               .replace(/! /g, '! ^^')
               .replace(/\. /g, '. ^^')
               .replace(/\? /g, '? ^^')
               .replace(/\.\.\. /g, '... ^^^^^^^^');
         })
      );
   }
   image (source) {
      const element = document.createElement('img');
      element.src = source;
      return element;
   }
   input ({ key }) {
      switch (key) {
         case 'z':
         case 'Z':
         case 'Enter':
            this.advance();
            break;
         case 'x':
         case 'X':
         case 'Shift':
            this.skip();
            break;
         case 'ArrowUp':
            break;
         case 'ArrowDown':
            break;
         case 'ArrowLeft':
            break;
         case 'ArrowRight':
            break;
      }
   }
   sound (source) {
      const element = document.createElement('audio');
      element.src = source;
      return element;
   }
   update (...message) {
      super.update(...message);
      switch (message[0]) {
         case 'read':
            '^ '.includes(message[1]) || this.sounds.get(`${this.character}/${this.voice}`).cloneNode().play();
            break;
         case 'style':
            switch (message[1][0]) {
               case 'character':
                  this.character = message[1][1];
                  this.emotion = 'default';
                  this.font = 'default';
                  this.voice = 'default';
                  break;
               case 'emotion':
                  this.emotion = message[1][1];
                  for (const hook of this.hooks) hook('image', this.emotion);
                  break;
               case 'font':
                  this.font = message[1][1];
                  for (const hook of this.hooks) hook('font', this.font);
                  break;
               case 'voice':
                  this.voice = message[1][1];
                  break;
            }
            break;
      }
   }
}
