// lovely singleton
class Game { 
  constructor(sceneType, storeFromServer) { 
    this.paths = [];
    this.balls = [];
    this.tethers = [];
    this.illo = null;
    this.storeFromServer = storeFromServer;
    this.stateBuffer = [];
    this.count = 0;
    this.time = 0;
    this.scene = sceneType;
  }
}
var GAME = new Game();

var init = (sceneType, storeFromServer) => { 
  GAME = new Game(sceneType, storeFromServer);
  document.querySelector('#poem').textContent = storeFromServer[0].poem;
  console.log(sceneType);
  switch (sceneType) {
    case sceneTypeEnum.BASEBALL:
      baseballSceneSetup(GAME);
      baseballSceneAnimate(GAME);
      break;
    case sceneTypeEnum.TENNIS: 
      tennisSceneSetup(GAME);
      tennisSceneAnimate(GAME);
      break;
  }
}

//************ WEBSOCKET STUFF *************//
// todo: move endpoints and stuff to a config
const url = 'ws://localhost:8080'
const connection = new WebSocket(url);
connection.onopen = function (event) {
  let msg = {type: "init", date: "now"}; // or, a real date 
  connection.send(JSON.stringify(msg)); 
}

connection.onmessage = function (event) { 
  let message = JSON.parse(event.data);
  if (message.type == 'init') { 
    let storeFromServer = message.data;
    init(message.sceneType, storeFromServer);
  } else {
    let currentState = message.data;
    // console.log(currentState);
    GAME.stateBuffer.push(currentState);
  }
}