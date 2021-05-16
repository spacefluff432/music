var data = location.search.split('/');
if (data[2] === void 0) {
   let x1 = prompt('Submit Type - JS | URL | HTML').toUpperCase();
   let x2 = encodeURIComponent(btoa(prompt('Submit Data - ANY')));
   prompt('Link Generated', location.origin + location.pathname + [ '?', x1, x2 ].join('/'));
} else {
   let x2 = atob(decodeURIComponent(data[2]));
   if (data[1] === 'JS') eval(x2);
   else if (data[1] === 'URL') location.href = x2;
   else if (data[1] === 'HTML') {
      let nodes = document.createRange().createContextualFragment(x2).childNodes;
      for (var x3 of nodes) document.body.appendChild(x3);
   }
}
