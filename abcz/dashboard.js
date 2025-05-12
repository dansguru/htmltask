// main.js or any JS file
let APP_ID;
let tokensArray;
fetch('./config.json')
  .then(response => {
    if (!response.ok) throw new Error('Failed to fetch config.json');
    return response.json();
  })
  .then(config => {
    APP_ID = config.app_id;
    if(APP_ID) {
        tokens = localStorage.getItem('tokens');
        if (tokens) {
            const tokensObj = JSON.parse(tokens);
            tokensArray = Object.values(tokensObj);
            
            document.getElementById('signup-btn').style.display = 'none';
            document.getElementById('login-btn').textContent = 'Logout';
            document.getElementById('wallet-balance').style.display = 'flex';
            
            webSocket(tokensArray);
        } 
        else {
            document.getElementById('wallet-balance').style.display = 'none';
        }
    }
    else {
        console.log('app id not found')
    }
    
  })
  .catch(err => console.error(err));

let tokens = localStorage.getItem('tokens');
let loginids = [];
let active_loginid;
let CURRENCY = 'USD';

    function showContent(section, el) {
      document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
      el.classList.add('active');
      
    //   if(socket) {socket = null; socket.close();}
    //   if(ws1) {socket = null; ws1.close();}

      let path;
      let js_path;
      switch (section) {
        case 'SmartAnalysis':
          path = 'layout/analysis.html';
          js_path = 'layout/js/analysis.js';
          break;
        case 'AnalysisTool':
          path = 'layout/tool.html';
          js_path = 'layout/js/analysis.js';
          break;
        case 'FreeBots':
          path = 'layout/bots.html';
          js_path = 'layout/js/bots.js';
          break;
        case 'Charts':
          path = 'layout/chart.html';
          js_path = 'layout/js/chart.js';
          break;
        case 'CopyTrading':
          path = 'layout/copytrading.html';
          js_path = 'layout/js/copytrading.js';
          break;
        case 'AIBots':
          path = 'layout/thebot.html';
          js_path = 'layout/js/thebot.js';
          break;
        case 'Dashboard':
          path = 'layout/dbot.html';
          js_path = 'layout/js/dbot.js';
          break;
        case 'Botbuilder':
          path = 'layout/builder.html';
          js_path = 'layout/js/builder.js';
          break;
         case 'Signals':
          path = 'layout/signal.html';
          js_path = 'layout/js/signal.js';
          break;
        default:
          path = `layout/${section}.html`;
      }

      fetch(path)
        .then(res => res.text())
        .then(html => {
          document.getElementById('content').innerHTML = html;
          
          // Dynamically load analysis.js after HTML is injected
            const script = document.createElement('script');
            script.src = js_path;
            script.defer = true;
            document.body.appendChild(script);
        })
        .catch(err => {
          document.getElementById('content').innerHTML = `<h2>${section}</h2><p>Could not load content.</p>`;
          console.error('Failed to load:', err);
        });
    }

    function toggleTheme() {
      document.body.classList.toggle('dark-mode');
    }

    function showLanguageModal() {
      document.getElementById('languageModal').style.display = 'flex';
    }

    function hideLanguageModal(event) {
      const modal = document.getElementById('languageModal');
      if (event.target === modal) {
        modal.style.display = 'none';
      }
    }

    function updateClock() {
      const now = new Date();
      const gmt = now.toUTCString().replace('GMT', 'GMT');
      document.getElementById('clock').textContent = gmt;
    }

    setInterval(updateClock, 1000);
    updateClock();
    
    function toggleDropdown() {
      document.getElementById('wallet-dropdown').classList.toggle('active');
    }

    document.addEventListener('click', function (e) {
      const dropdown = document.getElementById('wallet-dropdown');
      const trigger = document.getElementById('wallet-balance');
      if (!trigger.contains(e.target)) {
        dropdown.classList.remove('active');
      }
    });

    function handleAuthClick() {
      if (localStorage.getItem('tokens')) {
        localStorage.removeItem('tokens');
        location.reload();
      } else {
        window.location.href = 'https://oauth.deriv.com/oauth2/authorize?app_id=' + APP_ID;
      }
    }
    
    function handleRegistrationClick() {
      window.location.href = 'https://oauth.deriv.com/oauth2/authorize?app_id=' + APP_ID;
    }
    
    //switch accounts
    document.getElementById('wallet-balance').addEventListener('click', async () => {
    let existingDropdown = document.getElementById('wallet-dropdown');

  });

  // Optional: Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('wallet-dropdown');
    const trigger = document.getElementById('wallet-balance');
    if (dropdown && !dropdown.contains(e.target) && !trigger.contains(e.target)) {
      dropdown.classList.add('hidden');
    }
  });

    window.onload = function () {
      const path = 'layout/dbot.html';
      const js_path = 'layout/js/dbot.js';
      fetch(path)
        .then(res => res.text())
        .then(html => {
          document.getElementById('content').innerHTML = html;
          // Dynamically load analysis.js after HTML is injected
            const script = document.createElement('script');
            script.src = js_path;
            script.defer = true;
            document.body.appendChild(script);
        })
        .catch(err => {
          document.getElementById('content').innerHTML = `<h2>Dashboard</h2><p>Could not load content.</p>`;
          console.error('Failed to load:', err);
        });
      
    };

let ws;
let subscription_id;
let pingInterval;
function webSocket(tokenZ) {
    ws = new WebSocket('wss://ws.binaryws.com/websockets/v3?app_id=' + APP_ID)
    
    ws.addEventListener("open", () => {
        authorize();
        // Send ping every 30 seconds
        pingInterval = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ ping: 1 }));
          }
        }, 30000); // 30,000 ms = 30 seconds
    });

    ws.addEventListener("close", (eve) => {
        clearInterval(pingInterval); // Stop pings when disconnected
        setTimeout(() => {
          webSocket(tokensArray); // 🔁 Try to reconnect
        }, 3000);
    });

    ws.addEventListener("error", (err) => {
        ws.close(); // Ensure it closes and triggers onclose
    });

    ws.addEventListener('message', function(data) { 
        let ms = JSON.parse(data.data);

        let req = ms.echo_req;
        var req_id = req.req_id;
        const error = ms.error;

        if (error) {
          console.log(ms.error);
          console.log(ms.echo_req);
        }
        else {
          if (req_id === 1111) {
              console.log('authorized');
              const authorize = ms.authorize;
              const account_list = authorize.account_list;
              for (var i = 0; i < account_list.length; i++) {
                loginids.push(account_list[i].loginid)
              }
              active_loginid = loginids[0];
              getBalance();
          }

          if (req_id === 1112) {
            console.log('forgot')
          }

          if (req_id === 1113) {
            var b = ms.balance;
            var bal_current = b.balance;
            var cur_current = b.currency;
            CURRENCY = cur_current;
            var lid = b.loginid;
            document.getElementById("idbalance").textContent = bal_current + ' ' + cur_current;
            
            let div_id = cur_current.toLowerCase();
            var src_url = 'https://raw.githubusercontent.com/deriv-com/quill-icons/026d8198472de5616a23c89a893e506b8a976c46/svg/Currencies/CurrencyDemo.svg';
            if (lid.startsWith("VRTC")) {
              src_url = 'https://raw.githubusercontent.com/deriv-com/quill-icons/026d8198472de5616a23c89a893e506b8a976c46/svg/Currencies/CurrencyDemo.svg';
            } else {
                if(div_id === 'usd') {
                    src_url = 'https://static.vecteezy.com/system/resources/previews/013/743/592/non_2x/united-states-flag-round-icon-american-flag-png.png';
                }
                if(div_id === 'eth') {
                    src_url = 'https://i.pinimg.com/564x/49/d1/0c/49d10cb0a3c978475a49f239e4e2f060.jpg';
                }
                if(div_id === 'ltc') {
                    src_url = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSid0Q-t6tthz58N-JyaIXup9vyONRaMxQnzA&s';
                }
                if(div_id === 'btc') {
                    src_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Bitcoin.svg/768px-Bitcoin.svg.png';
                }
                if(div_id === 'usdc') {
                    src_url = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTbBMfDxr1PrxlKVnOBktTGlNgXSVYUT0LB7Q&s';
                }
            }
            document.getElementById('wallet-icon').src = src_url;
          }

          if (req_id === 1000) {
              console.log('balance')
              updateBalancies(ms);
          }
        }
    });

    function authorize() {
        const msg = JSON.stringify({
            authorize: 'MULTI' ,
            tokens: tokenZ,
            req_id: 1111
        });
        if (ws.readyState !== WebSocket.CLOSED) {
            ws.send(msg);
        }
    }

    function getBalance() {
        if (!active_loginid) {active_loginid = loginids[0];}
        localStorage.setItem('active_loginid', active_loginid);
        console.log(active_loginid)
        const msg = JSON.stringify({
            balance: 1,
            account: 'all',
            subscribe: 1,
            loginid: active_loginid,
            req_id: 1000,
        });
        ws.send(msg);
    }
}

function singleBalance(active_loginid) {
  const msg = JSON.stringify({
      balance: 1,
      subscribe: 1,
      loginid: active_loginid,
      req_id: 1113,
  });
  document.getElementById("idbalance").textContent = 'authorizing...';
  ws.send(msg);
}

function updateBalancies(ms) {
  var bal = ms.balance;
  var subscription_id = ms.subscription.id;
  var bal_current = bal.balance;
  var cur_current = bal.currency;
  CURRENCY = cur_current;
  var idd_current = bal.loginid;
  active_loginid = idd_current;
  
  var accounts = bal.accounts;
  for (const accountId in accounts) {
    const account = accounts[accountId];
    const acc_id = accountId;
    const currency = account.currency;
    const type = account.type;
    const balance = account.balance;
    const demo_account = account.demo_account;
    
    let div_id = currency.toLowerCase();
    if(active_loginid) {
        if(acc_id === active_loginid) {
            document.getElementById("idbalance").textContent = balance + ' ' + currency;
            var src_url = 'https://raw.githubusercontent.com/deriv-com/quill-icons/026d8198472de5616a23c89a893e506b8a976c46/svg/Currencies/CurrencyDemo.svg';
            if(div_id === 'usd') {
                src_url = 'https://static.vecteezy.com/system/resources/previews/013/743/592/non_2x/united-states-flag-round-icon-american-flag-png.png';
            }
            if(div_id === 'eth') {
                src_url = 'https://i.pinimg.com/564x/49/d1/0c/49d10cb0a3c978475a49f239e4e2f060.jpg';
            }
            if(div_id === 'ltc') {
                src_url = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSid0Q-t6tthz58N-JyaIXup9vyONRaMxQnzA&s';
            }
            if(div_id === 'btc') {
                src_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Bitcoin.svg/768px-Bitcoin.svg.png';
            }
            if(div_id === 'usdc') {
                src_url = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTbBMfDxr1PrxlKVnOBktTGlNgXSVYUT0LB7Q&s';
            }
            document.getElementById('wallet-icon').src = src_url;
        }
    }

    if (demo_account === 1) {
      div_id = "demo";
    }
    let strong_id = "aa-" + div_id;
    let div = document.getElementById(div_id);
    if (div) {
      div.style.display = 'block';
      let strong = document.getElementById(strong_id);
      strong.textContent = balance + ' ' + currency;
      document.getElementById("zz-" + div_id).textContent = acc_id;
      //handle clicks
      div.addEventListener('click', function () {
        active_loginid = acc_id;
        singleBalance(active_loginid);
      });
    }
  }
}

//
function disableInspect(e) {
  if (e.keyCode == 123 || (e.ctrlKey && e.shiftKey && e.keyCode == 'I'.charCodeAt(0))) {
    return false;
  }
}

//future errors
window.onerror = function(message, source, lineno, colno, error) {
    console.error("Error caught globally:");
    console.error(`Message: ${message}`);
    console.error(`Source: ${source}`);
    console.error(`Line: ${lineno}`);
    console.error(`Column: ${colno}`);
    console.error(`Error object:`, error);
    
    isrunning = false;
    return true;
};