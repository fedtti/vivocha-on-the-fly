const removePreviousScript = () => {
  const scripts = document.getElementsByTagName('script');
  let found,
      parentNode;
  for (const script of scripts) {
    const url = script.src;
    const check = url.match(/\/a\/(\w*)\/(api|apps|widgetwrap)\/(console\/)?(vivocha|dataframe)?/);
    if (!!check && check.length > 1) {
      parentNode = script.parentNode;
      parentNode.removeChild(script);
      found = true;
    }
  }
  return parentNode;
};

const removeDataFrame = () => {
  const frame = document.getElementById('vivocha_data')
  if (!!frame) {
    const parentNode = frame.parentNode;
    parentNode.removeChild(frame);
  }
};

const uuid ='2bee4260-edf9-11e1-bbcd-0002a5d5c51b';

const insertScript = (account, world) => {
  const script = document.getElementById(uuid);
  if (!script) {
    delete window.vivocha;
    removeDataFrame();
    const parentNode = removePreviousScript() || document.body;
    script = document.createElement('script');
    script.setAttribute('type', 'text/javascript'); 
    script.setAttribute('id', uuid);
    const domain = !!world ? world : 'www.vivocha.com';
    script.setAttribute('src', `//${domain}/a/${account}/api/vivocha.js`);
    parentNode.appendChild(script);
  }
};

const checkInsert = () => {
  const script = document.getElementById(uuid);
  if (!!script) {
    chrome.extension.sendMessage({ message: 'vivocha-enabled' });
  } else {
    chrome.extension.sendMessage({ message: 'vivocha-disabled' });
  }
};

const requestAccount = () => {
  chrome.extension.sendMessage({ message: 'waiting-account' }, (response) => {
    if (!!response.account) {
      insertScript(response.account, response.world);
    }
    checkInsert();
  });
};

chrome.extension.onMessage.addListener((request) => {
  if (request.message === 'update-vivocha-state') {
    checkInsert();
  }
});

requestAccount();

try {
  document.addEventListener('DOMContentLoaded', () => {
    requestAccount();
  });
} catch(error) {}
