// const { ipcRenderer } = require('electron');

import { Client } from './socketry.js';

const _$ = (context, selector) => {
   if (typeof context === 'string') {
      return [ ...document.createRange().createContextualFragment(context).querySelectorAll(selector) ];
   } else if (context instanceof Element || context instanceof Document) {
      return [ ...context.querySelectorAll(selector) ];
   } else {
      return [];
   }
};

const back = document.querySelector('#back');
const forward = document.querySelector('#forward');

const address = document.querySelector('#address');
/** @type {HTMLIFrameElement} */
const browser = document.querySelector('#browser');

const nav = {
   index: -1,
   data: [],
   canGoBack () {
      return nav.index > 0;
   },
   goBack () {
      nav.canGoBack() && --nav.index;
   },
   canGoForward () {
      return nav.index < nav.data.length - 1;
   },
   goForward () {
      nav.canGoForward() && ++nav.index;
   },
   add (entry) {
      nav.data = [ ...nav.data.slice(0, nav.index + 1), entry ];
      nav.goForward();
   },
   get current () {
      return nav.data[nav.index] || '';
   }
};

back.addEventListener('click', () => {
   nav.canGoBack() && nav.goBack();
});

forward.addEventListener('click', () => {
   nav.canGoForward() && nav.goForward();
});

address.addEventListener('keydown', (event) => {
   if (event.key === 'Enter') {
      browser.focus();
      if (address.value.includes('://') && !address.value.split('://')[0].includes(' ')) {
         nav.add(address.value);
      } else {
         nav.add(`https://duckduckgo.com/?q=${encodeURIComponent(address.value)}`);
      }
      transmitter.socket.send(JSON.stringify([ 'grab', nav.current ]));
   }
});

browser.addEventListener('load', () => {
   address.value = nav.current;
   address.placeholder = nav.current;
});

/*
document.querySelector('#minimize').addEventListener('click', () => {
   ipcRenderer.send('minimize');
});

document.querySelector('#close').addEventListener('click', () => {
   ipcRenderer.send('close');
});
*/

for (let grid of _$(document, 'grid')) {
   grid.style.gridTemplateRows = null;
   grid.style.gridTemplateColumns = null;
   const size = [ ...grid.children ].map((child) => child.getAttribute('size') || '1fr').join(' ');
   if (size) {
      const type = grid.getAttribute('type');
      if (type) {
         switch (type.toLowerCase()) {
            case 'rows':
               grid.style.gridTemplateRows = size;
               break;
            case 'columns':
               grid.style.gridTemplateColumns = size;
               break;
         }
      }
   }
}

// ipcRenderer.send('show');

setInterval(() => {
   nav.canGoBack() ? back.classList.add('enabled') : back.classList.remove('enabled');
   nav.canGoForward() ? forward.classList.add('enabled') : forward.classList.remove('enabled');
   address === document.activeElement || (address.value = nav.current);
});

// create client
const client = new Client((transmitter) => {
   window.transmitter = transmitter;
   transmitter.on('grab', (status, content) => {
      if (status === 'success') {
         browser.src = `data:text/html;base64,${btoa(content)}`;
      } else {
         browser.src = `data:text/html;base64,NDA0IE5vdCBGb3VuZA==`;
      }
   });
});

// connect to server
client.init(29292);
