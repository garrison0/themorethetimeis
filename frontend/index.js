const playbackTypeEnum = {
  FROM_DATABASE: 0,
  LIVE: 1
}

// lovely singleton that should've been part of Vue
class Game { 
  constructor(sceneType, storeFromServer, isPastScene) { 
    this.paths = [];
    this.balls = [];
    this.tethers = [];
    this.illo = null;
    this.storeFromServer = storeFromServer;
    this.stateBuffer = [];
    this.count = 0;
    this.time = 0;
    this.internalRuntime = 0; // used to process old scenes
    this.scene = sceneType;
    this.playbackType = isPastScene ? playbackTypeEnum.FROM_DATABASE : playbackTypeEnum.LIVE; // live scene on the server or from database
    app.$forceUpdate(); // re-render 'now' button
  }

  requestScene(time) { 
    if (time.toLowerCase() === 'now') { 
      let msg = {type: "init", date: "now"}; // request live scene 
      connection.send(JSON.stringify(msg)); 
    } else { 
      let msg = {type: "init", date: time}; // or, a previous datetime 
      connection.send(JSON.stringify(msg)); 
    }
  }
}
var GAME = new Game();

function changePoem(storeFromServer) { 
  if (storeFromServer.length)
    document.querySelector('#poem').innerHTML = "<div class='mx-md-5 mx-3'>" + storeFromServer[storeFromServer.length - 1].poem + "</div>";
}

var init = (sceneType, storeFromServer, isPastScene) => { 
  let doInitializeDatePicker = !(GAME && GAME.picker); 
  let picker = GAME.picker;
  GAME = new Game(sceneType, storeFromServer, isPastScene);

  app.isRetrievingScene = false;

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

  changePoem(storeFromServer);

  // init calendar now that we have all the available times
  if (doInitializeDatePicker)  {
    GAME.picker = datepicker('#calendar', {
      alwaysShow: true,
      onSelect: (instance, date) => {
        app.setNewDate(date);
      },
      disabler: date => {
        return !datesAvailableFromServer().includes(date.toDateString());
      }
    });
  } else { 
    GAME.picker = picker
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
  if (message.type === 'init') { 
    let storeFromServer = message.data;
    if (message.startTimes)
      app.timeOptions = message.startTimes;
    init(message.sceneType, storeFromServer);
  } else if(message.type === 'scene') {
    let storeFromServer = message.data;
    init(message.sceneType, storeFromServer, true)
  } else { 
    if (GAME.playbackType === playbackTypeEnum.LIVE) { 
      let currentState = message.data;
      changePoem([currentState]);
      // console.log(currentState);
      GAME.stateBuffer.push(currentState);
    } 
  }
}