import { Undertale } from './undertale.js';

const story = {
   face: document.querySelector('#story-face'),
   text: document.querySelector('#story-text'),
   get blob () {
      return story.text.lastElementChild;
   }
};

(async () => {
   const undertale = await (await fetch(`./assets/indexes/undertale.json?x=${Math.random()}`)).json();
   const storyteller = new Undertale(undertale.characters);
   addEventListener('keydown', (event) => {
      storyteller.input(event);
   });
   storyteller.hooks.add((...message) => {
      switch (message[0]) {
         case 'font':
            story.text.style.fontFamily = message[1];
            break;
         case 'image':
            for (const element of story.face.children) element.remove();
            story.face.appendChild(message[1]);
            break;
         case 'read':
         case 'skip':
            message[1] === '^' || (story.blob.textContent += message[1]);
            break;
         case 'void':
            story.text.innerHTML = '<text></text>';
            break;
         case 'code':
            switch (message[1]) {
               case 'break':
                  story.text.innerHTML += '<br><text></text>';
                  break;
            }
            break;
      }
   });
   storyteller.add(await (await fetch(`./test.stml?x=${Math.random()}`)).text());
   window.storyteller = storyteller;
})();
