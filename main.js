const next = (node, tag) => {
  while (!!node && node.nodeName !== tag) {
    node = node.nextSibling;
  }
  return node;
};


let mapping = {};

const saveOptions = () => {
  const pattern = next(document.getElementById('patterns').firstChild, 'DIV');
  const account = document.getElementById('account').value;
  const world = document.getElementById('world').value;
  let patterns = [];
  while (pattern) {
    const regex = next(pattern.firstChild, 'INPUT').value;
    patterns.push(regex);
    pattern = next(pattern.nextSibling, 'DIV');
  }
  const data = {
    'world': world,
    'patterns': patterns
  };
  mapping = {};
  mapping.account = data;
};

const removePattern = (object) => {
  object.parentNode.parentNode.removeChild(object.parentNode);
};

const removePatternHandler = (element) => {
  removePattern(element.srcElement);
  saveOptions();
};

const addPattern = (value) => {
  const patterns = document.getElementById('patterns');
  const div = document.createElement('div');
  const input = document.createElement('input');
  input.setAttribute('class', 'url-match');
  const button = document.createElement('button');
  button.setAttribute('class', 'remove-button');

  button.innerText = "-";
  div.appendChild(input);
  div.appendChild(button);

  input.value = value;
  patterns.insertBefore(div, patterns.firstChild);
  button.addEventListener('click', removePatternHandler, button);
};

const addPatternHandler = () => {
  chrome.tabs.query({
    active: true,
    currentWindow: true
  }, (tabs) => {
    if (tabs.length > 0) {
      addPattern(tabs[0].url);
    } else {
      addPattern('.*');
    }
    saveOptions();
  });
};

const tellTabToInsertScript = () => {
  chrome.extension.sendMessage({ message: 'vivocha-insert' });
};


function persistOptionsHandler() {

  saveOptions();

  
  localStorage['vivocha-on-the-fly'] = JSON.stringify(mapping);


  tellTabToInsertScript();

  window.close();

}

const clear = () => {
  const patterns = document.getElementById('patterns');
  while (patterns.firstChild) {
    patterns.removeChild(patterns.firstChild);
  }
};

const loadOptions = () => {
  clear();
  for (let map in mapping) {
    document.getElementById('account').value = map;
    const data = mapping[map];
    document.getElementById('world').value = data.world || 'www.vivocha.com';
    const patterns = data.patterns;
    for (const pattern in patterns) {
      addPattern(patterns[pattern]);
    }
  }
}

function undo() {
  mapping = JSON.parse(localStorage['vivocha-on-the-fly'] || {});
  loadOptions();
}

const advanced = () => {
  const element = document.getElementById('world-container');
  const advanced = document.getElementById('advanced');
  if (!!advanced) {
    advanced.className = !!advanced.className ? '' : 'selected';
  }
  if (!!element) {
    element.className = !!element.className ? '' : 'hidden';
  }
};

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('add-button').addEventListener('click', addPatternHandler);
  document.getElementById('save-button').addEventListener('click', persistOptionsHandler);
  document.getElementById('undo-button').addEventListener('click', undo);
  document.getElementById('advanced').addEventListener('click', advanced, false);
  undo();
});
