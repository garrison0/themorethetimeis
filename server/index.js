const WebSocket = require('ws');
const gameloop = require('node-gameloop');
const sceneTypeEnum = require('./models/sceneTypeEnum');
const wss = new WebSocket.Server({ port: 8080 });

const SceneManager = require('./models/SceneManager.js');

// init 
var sceneManager = new SceneManager(sceneTypeEnum.TENNIS);
(async () => await sceneManager.initScene())();

wss.on('connection', function connection(ws) {
  ws.on('message', async function incoming(message) {
    message = JSON.parse(message);
    console.log('received: %s', message);
    if (message.type === 'init') { 
      if (message.date === 'now') { 
        // send current store up till now including all possible start times
        // (so calendar can be correctly displayed on frontend)
        let scene = sceneManager.getScene();
        let startTimes = await sceneManager.getSceneStartTimes();
        console.log(sceneManager.scene.poem);
        console.log(sceneManager.scene.store[sceneManager.scene.store.length - 1])
        let message = 
        {
          type: 'init',
          sceneType: sceneManager.scene.sceneType,
          data: sceneManager.scene.store,
          startTimes: startTimes
        }
        ws.send(JSON.stringify(message)); 
      } else { 
        // parse the datetime, query DB for matching scene, return that scene's store
      }
    }
  });
});

var timeSoFar2 = 0;
var timeSoFar = 0;
const id = gameloop.setGameLoop(async function(delta) {
  // update scenes
  await sceneManager.update(delta);
  let message = 
    {
      type: 'update',
      data: sceneManager.scene.store[sceneManager.scene.store.length - 1]
    }
  wss.clients.forEach(function each(client) {
    client.send(JSON.stringify(message));
  });
}, 1000 / 10); //24fps