// hbms432: roku remote v2
var global = {};

// search for rokus
var init = function () {
   let peer = new RTCPeerConnection();
   let dummy = function () {};
   peer.createDataChannel('');
   peer.createOffer(peer.setLocalDescription.bind(peer), dummy);
   peer.onicecandidate = function (event) {
      let gateway = event.candidate.candidate.split(' ')[4];
      peer.onicecandidate = dummy;
      global.device = 1;
      global.devices = [];
      global.network = gateway.split('.').slice(0, 3).join('.');
      global.interval = setInterval(function () {
         if (global.device < 255) {
            let IP = global.network + '.' + global.device;
            let target = 'http://' + IP + ':8060';
            let request = new XMLHttpRequest;
            request.timeout = 1000;
            request.open('get', target);
            request.send();
            request.onerror = function () {
               global.devices.push(target);
            };

            // update status
            title.innerText = 'Roku Remote: Scanning... ' + IP;
         } else {
            clearInterval(global.interval);
            setTimeout(callback, 1000);

            // update status
            title.innerText = 'Roku Remote: Processing...';
         }
         ++global.device;
      }, 20);

      // update status
      title.innerText = 'Roku Remote: Scanning...';
   };
};

// send input to roku
var remote = function (code) {
   let device = global.devices[Number(device_value.innerText) - 1];
   if (device) {
      let request = new XMLHttpRequest;
      request.open('post', device + '/keypress/' + code);
      request.send();
   }
};

// event listeners (init callback)
var callback = function () {
   global.keyboard = false;
   device_back.onclick = function () {
      let dv = device_value;
      let num = Number(dv.innerText);
      if (num > 1) {
         let str = String(num - 1);
         if (str.length === 1) str = '0' + str;
         dv.innerText = str;
      }
   };
   device_forward.onclick = function () {
      let dv = device_value;
      let num = Number(dv.innerText);
      if (num < global.devices.length) {
         let str = String(num + 1);
         if (str.length === 1) str = '0' + str;
         dv.innerText = str;
      }
   };
   keyboard.onfocus = function () {
      global.keyboard = true;
   };
   keyboard.onblur = function () {
      global.keyboard = false;
   };
   window.onkeyup = function (event) {
      if (global.keyboard) {
         if (event.key === 'Backspace') remote('Backspace');
         else remote('Lit_' + encodeURIComponent(keyboard.value));
         keyboard.value = '';
      } else {
         let code = codes[event.code];
         if (code) remote(code);
      }
   }

   // update status
   let text, count = global.devices.length;
   if (count === 0) text = 'No Devices Found';
   else if (count === 1) text = count + ' Device Found';
   else text = count + ' Devices Found';
   title.innerText = 'Roku Remote: ' + text;
};

// remote codes
var codes = {

   // numpad keys
   Numpad1: 'InstantReplay',
   Numpad2: 'Down',
   Numpad3: 'Info',
   Numpad4: 'Left',
   Numpad5: 'Select',
   Numpad6: 'Right',
   Numpad7: 'Back',
   Numpad8: 'Up',
   Numpad9: 'Home',

   // arrow keys
   ArrowDown: 'Down',
   ArrowLeft: 'Left',
   ArrowRight: 'Right',
   ArrowUp: 'Up',

   // youtube-style controls
   KeyI: 'Info',
   KeyJ: 'Rev',
   KeyK: 'Play',
   KeyL: 'Fwd',

   // common-sense controls
   Backspace: 'Back',
   Enter: 'Select',
   Escape: 'Home',
   Backquote: 'Info',
   Digit0: 'Play',
   Minus: 'Rev',

   // bottom-row controls
   Comma: 'Rev',
   Period: 'Fwd',
   Slash: 'Play',

   // instant replay
   ShiftLeft: 'InstantReplay',
   ShiftRight: 'InstantReplay'
};

// just do it
init(callback);