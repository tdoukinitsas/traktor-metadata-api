/*

Traktor Metadata API
Developed by: Thomas Doukinitsas

*/

//Setting up some basic path functions

const path = require('path')

function getDir() {
  if (process.pkg) {
    return path.resolve(__dirname);
  } else {
    return path.join(require.main ? require.main.path : process.cwd());
  }
}

function getAccessDir() {
  if (process.pkg) {
    return path.resolve(process.cwd());
  } else {
    return path.join(require.main ? require.main.path : process.cwd());
  }
}

const express = require('express');
const app = express();
const http = require('http');
const https = require("https");
const server = http.createServer(app);
const request = require('request')
const bodyParser = require('body-parser')

const port = process.env.PORT || 8080;

// Try to launch the app in an electron window. If we fail, it means this is running on a server and should be treated like a standard node.js app

var isDesktop = false;

try {

  //Define a browser window
  const { app, globalShortcut, BrowserWindow, ipcMain } = require('electron')
  const appName = app.getPath("exe");

  //Create a new browser window called win
  const createWindow = () => {
    const win = new BrowserWindow({
      width: 1280,
      height: 1000,
      center: true,
      'minWidth': 479,
      'minHeight': 300,
      autoHideMenuBar: true,
      titleBarStyle: 'hidden',
      titleBarOverlay: {
        color: "#253a8f",
        symbolColor: "#ffffff",
        height: 52
      },
      icon: __dirname + 'assets/favicon.png',
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        enableRemoteModule: true
      },
    })

    win.loadURL(`http://localhost:` + port);

    //uncomment this to enable chrome dev tools
    //win.on("ready-to-show", () => {
    //  win.webContents.openDevTools();
    //});

  }

  //When the app is ready, then run the createWindow function above
  app.whenReady().then(() => {
    createWindow()
    isDesktop = true;
  })

  //If the user closes all the application windows, quit the app process
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
  })

  //Emitted when the application is activated. Various actions can trigger this event,
  //such as launching the application for the first time, attempting to re-launch the application when it's already running,
  //or clicking on the application's dock or taskbar icon.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
    win.once('ready-to-show', () => {
      win.show()
    })
    if (require('electron-squirrel-startup')) return;
  })

}
catch (e) {

  console.log("The app didn't launch in it's own window... attempting to launch as a standard express server...")

}

//Start the server
server.listen(port, () => console.log("Server started at http://localhost:"+ port + ". Please make sure the modified D2 controller is selected in Traktor."));

var metadataObj = {
    decks:{
        "A":{},
        "B":{},
        "C":{},
        "D":{},
    },
    channelOnAir:{
        "1":true,
        "2":true,
        "3":false,
        "4":false,
    },
    nowPlaying:"AB",
    masterClock:{}
}


app.use(bodyParser.json())

app.all('/deckLoaded/:deck', function (req, res) {
    console.log("Deck loaded on " + req.params.deck)
    console.log(req.body)
    
    metadataObj.decks[req.params.deck] = req.body
    res.sendStatus(200);
  });

  app.all('/updateDeck/:deck', function (req, res) {
    console.log("Deck updated on " + req.params.deck)
    console.log(req.body)

    Object.values(req.body).forEach((currentValue,currentIndex,array) => {
        metadataObj.decks[req.params.deck][Object.keys(req.body)[currentIndex]] = currentValue
    })
    res.sendStatus(200);

  });

  app.all('/updateMasterClock', function (req, res) {
    console.log("Master Clock Updated")
    console.log(req.body)
    metadataObj.masterClock = req.body
    res.sendStatus(200);
  });

  app.all('/updateChannel/:channel', function (req, res) {
    console.log("Channel " + req.params.channel + " updated")
    console.log(req.body)
    if (req.body.isOnAir != undefined) {
        metadataObj.channelOnAir[req.params.channel.toString()] = req.body.isOnAir

        if (metadataObj.channelOnAir["1"] == true && metadataObj.channelOnAir["2"] == false) {
            metadataObj.nowPlaying = "A"
        } else if (metadataObj.channelOnAir["1"] == false && metadataObj.channelOnAir["2"] == true) {
            metadataObj.nowPlaying = "B"
        } else if (metadataObj.channelOnAir["1"] == true && metadataObj.channelOnAir["2"] == true) {
            metadataObj.nowPlaying = "AB"
        }

    }  
    res.sendStatus(200);

  });


app.get('/api/', function (req,res) {

      // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', false);

    res.send(metadataObj)

})

// Configuiring simple express routes
// getDir() function is used here along with package.json.pkg.assets
app.use('/', express.static(getDir() + '/'));
app.get('/', function (req, res) {
    res.sendFile(getDir() + '/index.html');
  });