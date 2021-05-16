const select = document.querySelector('#x-lang');
for (const lang of monaco.languages.getLanguages()) select.innerHTML += `<option>${lang.id}</option>`;

const stuff = {
   get language () {
      return select.children[select.selectedIndex].innerText;
   },
   updateLanguage: () => {
      monaco.editor.setModelLanguage(monaco.editor.getModels()[0], stuff.language);
   }
};

select.addEventListener('change', stuff.updateLanguage);

for (let grid of [ ...document.querySelectorAll('grid') ]) {
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
