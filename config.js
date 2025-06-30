function addPattern(value) {

  var patterns = document.getElementById("patterns");
  var div = document.createElement("div");
  var input = document.createElement("input");
  input.setAttribute("class", "urlmatch");
  var button = document.createElement("button");
  button.setAttribute("class", "removebutton");

  button.innerText = "-";
  div.appendChild(input);
  div.appendChild(button);

  input.value = value;

  patterns.insertBefore(div, patterns.firstChild);

  button.addEventListener('click', removePatternHandler, button);
  
}

function addPatternHandler(e) {
  chrome.tabs.query({
    active: true,
    currentWindow: true
  }, function (tabs) {
    if (tabs.length > 0)
      addPattern(tabs[0].url);
    else
      addPattern('.*')
    saveOptions();
  });
}

function removePattern(obj) {
  obj.parentNode.parentNode.removeChild(obj.parentNode);
}

function removePatternHandler(e) {
  removePattern(e.srcElement);
  saveOptions();
}

function next(node, tag) {

  while(node && node.nodeName != tag)
    node = node.nextSibling;

  return node;
  
}

function clear() {

  var patterns = document.getElementById("patterns");

  while (patterns.firstChild)
    patterns.removeChild(patterns.firstChild);

}

function tellTabToInsertScript() {
  chrome.extension.sendMessage({ message: "vivocha-insert"});
}


function saveOptions() {
  var pattern = next(document.getElementById("patterns").firstChild, 'DIV');
  var account = document.getElementById("account").value;
  var world = document.getElementById("world").value;

  var patterns = [];

  while (pattern) {

    var regex = next(pattern.firstChild, "INPUT").value;

    patterns.push(regex);

    pattern = next(pattern.nextSibling, "DIV");
    
  }
  var data = {'world' : world, 'patterns': patterns};
  mapping = {};
  //mapping[account] = patterns;
  mapping[account] = data;
  //chrome.extension.getBackgroundPage().console.log(data);
 }

function persisteOptionsHandler() {

  saveOptions();

  
  localStorage['vivocha-on-the-fly'] = JSON.stringify(mapping);


  tellTabToInsertScript();

  window.close();

}

var mapping = {};
function loadOptions() {
  clear();
  for (var i in mapping) {
    document.getElementById("account").value = i;
    var data = mapping[i];
    document.getElementById("world").value = data.world || 'www.vivocha.com';
    var patterns = data.patterns;
    //var patterns = mapping[i];
    for (var j in patterns) {
      addPattern(patterns[j]);
    }
  }
}

function undo() {
  mapping = JSON.parse(localStorage['vivocha-on-the-fly'] || {});
  loadOptions();
}


document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('addbutton').addEventListener('click', addPatternHandler);
  document.getElementById('savebutton').addEventListener('click', persisteOptionsHandler);
  document.getElementById('undobutton').addEventListener('click', undo);
    document.getElementById('advanced').addEventListener("click", advanced, false);
  undo();
});


function advanced(){
     var el = document.getElementById('world_container');
    var ad =  document.getElementById('advanced');
     if(ad) {
    ad.className =  ad.className ? ' ' : ' selected';
     }
    if(el) {
        el.className = el.className ? ' ' : 'hidden';
      }
}

