var baseballSceneSetup = (GAME) => {
  GAME.illo = new Zdog.Illustration({
    element: '.zdog-canvas',
    rotate: { z: Zdog.TAU / 14.5, x: Zdog.TAU/6.25 },
    translate: {x: -120 * RELATIVE_SCREEN_SIZE_CONSTANT, z: -10, y: 20},
    dragRotate: true,
    zoom: 0.68
  });

  var fieldGroup = new Zdog.Group({
    addTo: GAME.illo,
  });

  let field_top = new Zdog.Shape({
    addTo: fieldGroup,
    path: [
      { x: -65, y: -20 },   // start
      { arc: [
        { x:  0, y: -130 }, // corner
        { x:  65, y:  -20 }, // end point
      ]},
      { x: 0, y: 45 },
    ],
    closed: true,
    stroke: 10,
    fill: true,
    color: '#057332',
    scale: 2
  });

  let diamond = new Zdog.Rect({
    addTo: fieldGroup,
    width: 100,
    height: 100,
    stroke: 5,
    fill: true,
    rotate: { z: Zdog.TAU/8 },
    color: '#69c593',
  });

  let diamondArc = new Zdog.Shape({
    addTo: diamond,
    path: [
      { x: -80, y: 50 },   // start
      { arc: [
        { x:  -130, y: -130 }, // corner
        { x:  50, y:  -80 }, // end point
      ]},
      { x: 50, y: 50}
    ],
    stroke: 5,
    fill: true,
    color: '#69c593',
  });

  let field_middle = new Zdog.Rect({
    addTo: diamond,
    width: 90,
    height: 90,
    stroke: 5,
    fill: true,
    color: '#057332',
  });

  let thirdBase = new Zdog.Rect({
    addTo: diamond,
    width: 10,
    height: 10,
    stroke: 2,
    fill: true,
    translate: {x: -46, y: 46},
    color: '#efefef',
  });

  let secondBase = new Zdog.Rect({
    addTo: diamond,
    width: 10,
    height: 10,
    stroke: 2,
    fill: true,
    translate: {x: -46, y: -46},
    color: '#efefef',
  });
  let firstBase = new Zdog.Rect({
    addTo: diamond,
    width: 10,
    height: 10,
    stroke: 2,
    fill: true,
    translate: {x: 46, y: -46},
    color: '#efefef',
  });

  let pitcherMound = new Zdog.Ellipse({
    addTo: diamond,
    diameter: 10,
    stroke: 5,
    fill: true,
    color: '#69c593',
  });

  let batterMound = new Zdog.Ellipse({
    addTo: diamond,
    diameter: 22,
    stroke: 5,
    translate: {x: 52, y: 52},
    fill: true,
    color: '#69c593',
  });

  let homeBase = new Zdog.Rect({
    addTo: diamond,
    width: 10,
    height: 10,
    stroke: 2,
    fill: true,
    translate: {x: 52, y: 52},
    rotate: {z : Zdog.TAU/8},
    color: '#efefef',
  });

  new Zdog.Shape({
    addTo: homeBase,
    path: [
      { x: 0 }, // start at 1st point
      { x: -130, y: 130 }, // line to 2nd point
    ],
    stroke: 1,
    color: '#efefef',
  });

  new Zdog.Shape({
    addTo: homeBase,
    path: [
      { x: 0 }, // start at 1st point
      { x:  -130, y: -130 }, // line to 2nd point
    ],
    stroke: 1,
    color: '#efefef',
  });

  let pole = new Zdog.Cylinder({
    addTo: homeBase,
    diameter: 2,
    length: 20,
    translate: { z: 10 },
    stroke: false,
    color: '#555',
    backface: '#111',
  });

  GAME.tethers[0] = new Zdog.Shape({
    addTo: fieldGroup,
    path: [
      { x: 0 , y: 2, z: 15}, // start at 1st point
      { x: 0, y: 72, z: 20}, // line to 2nd point
    ],
    stroke: 1,
    color: '#FFF',
  });

  GAME.paths[0] = new Zdog.Shape({
    addTo: fieldGroup,
    path: [
        // start at ball pos
    ],
    stroke: 1,
    color: '#EF0000',
    closed: false
  });

  let firstBall = new Zdog.Group({
    addTo: fieldGroup,
  });

  firstHalfBall = new Zdog.Hemisphere({
    addTo: firstBall,
    diameter: 3,
    color: '#dedede',
    backface: false,
    stroke: false
  });

  secondHalfBall = firstHalfBall.copy({
    rotate: { y: Zdog.TAU/2 },
    color: '#444',
    backface: false,
  });

  GAME.balls[0] = firstBall;
};

function baseballSceneAnimate(GAME) {
  let timestamp = Date.now();
  let isInitialFrame;
  if (GAME.internalTimestamp === undefined) { 
    GAME.internalTimestamp = timestamp;
    isInitialFrame = true;
  } else { 
    const delta = (timestamp - GAME.internalTimestamp) / 1000; //convert ms to s
    GAME.internalRuntime += delta;
  }

  // init if necessary
  if (GAME.storeFromServer && GAME.storeFromServer.length) { // have to reconstruct path so far
    
    // if we're watching the live scene, catch up to the present ASAP 
    if (GAME.playbackType === 1) { 
      let state;
      for (var i = 0; i < GAME.storeFromServer.length; i++){
        state = GAME.storeFromServer[i];
        GAME.paths[0].path.push({x: state.balls[0].pos.x, 
            y: state.balls[0].pos.y, 
            z: state.balls[0].pos.z});
      }
      GAME.tethers[0].path[0].x = state.balls[0].pos.x;
      GAME.tethers[0].path[0].y = state.balls[0].pos.y;
      GAME.tethers[0].path[0].z = state.balls[0].pos.z;

      GAME.paths[0].updatePath();
      GAME.tethers[0].updatePath();
      GAME.illo.updateRenderGraph();
      GAME.storeFromServer = null;
    } else { 
      // else if we're reconstructing a past scene, process scene frames according to their original timing
      var processScene = true;
      while (processScene) { 
        let nextScene = GAME.storeFromServer[0];
        processScene = nextScene ? nextScene.runTime <= GAME.internalRuntime : false;
        if (processScene || isInitialFrame) 
          GAME.stateBuffer.push(GAME.storeFromServer.shift());
      }
    }
  }

  // update state via pos
  let stateUpdated = false;
  while (GAME.stateBuffer.length) {
    let state = GAME.stateBuffer.shift();
    stateUpdated = true;
    GAME.time = state.timeStamp;

    GAME.balls[0].translate.x = state.balls[0].pos.x;
    GAME.balls[0].translate.y = state.balls[0].pos.y;
    GAME.balls[0].translate.z = state.balls[0].pos.z;

    GAME.paths[0].path.push({x: GAME.balls[0].translate.x, 
      y: GAME.balls[0].translate.y, 
      z: GAME.balls[0].translate.z
    });

    GAME.tethers[0].path[0].x = GAME.balls[0].translate.x;
    GAME.tethers[0].path[0].y = GAME.balls[0].translate.y + 1.5;
    GAME.tethers[0].path[0].z = GAME.balls[0].translate.z;
    
    GAME.balls[0].rotate.x += 0.03;
    GAME.balls[0].rotate.y += 0.019;

    GAME.paths[0].updatePath();
    GAME.tethers[0].updatePath();
  }

  let canvas = document.querySelector('.zdog-canvas');
  let ctx = canvas.getContext('2d');
  
  GAME.illo.rotate.z += 0.000325;
  if (!GAME.stateBuffer.length && stateUpdated) { 
    GAME.illo.updateRenderGraph();

    let canvasWidth = document.querySelector('#canvasContainer').clientWidth;
    let fontSize = canvasWidth < 600 ? (canvasWidth < 400 ? 12 : 14) : 18;
    ctx.font = fontSize + "px " + "VCR OSD";
    ctx.filter = `brightness(125%)   
        drop-shadow(1px 0px 0px  rgba(33, 33, 33, 0.8)) 
        drop-shadow(0px 1px 0px  rgba(33,33,33, 0.8)) 
        drop-shadow(0px -1px 0px  rgba(33,33,33, 0.8)) 
        drop-shadow(-1px 0px 0px rgba(33,33,33, 0.8)) 
        drop-shadow(1px 0px 0px  rgba(33,33,33, 0.8)) 
        drop-shadow(0px 1px 0px  rgba(33,33,33, 0.8)) 
        drop-shadow(0px -1px 0px  rgba(33,33,33, 0.8)) 
        drop-shadow(-1px 0px 0px rgba(33,33,33, 0.8))`;
    ctx.fillStyle = "#F1F8F1";

    let date = new Date(GAME.time);
    let calendarDate = date.toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric'}).toUpperCase().replace(' ', '.').replace(',', '');
    let hours = date.toLocaleTimeString("en-US");

    // todo: fix this for tennis scene, redo since redesigned layout
    let x;
    if (window.innerWidth >= 1450) { 
      x = .0000249636 * canvasWidth * canvasWidth * canvasWidth - 0.043458 * canvasWidth * canvasWidth + 25.466 * canvasWidth - 4697.21;
    } else if (window.innerWidth >= 768) { 
      x = .0019957 * canvasWidth * canvasWidth - 1.86342 * canvasWidth + 670.056;
    } else if (window.innerWidth <= 350) { 
      x = .0019957 * canvasWidth * canvasWidth - 1.86342 * canvasWidth + 550.056;
    } else { 
      x = .0000249636 * canvasWidth * canvasWidth * canvasWidth - 0.043458 * canvasWidth * canvasWidth + 25.466 * canvasWidth - 4780.21;
    }
    
    let y = window.devicePixelRatio * (document.querySelector('#canvasContainer').clientHeight * 0.651252 - 18); 

    ctx.fillText(calendarDate, x, y);
    ctx.fillText(hours, x, y + fontSize * 1.25);
  }

  // these will effect the illustration too - choose whatever you want
  ctx.filter = `brightness(100%)   
      drop-shadow(1px 0px 0px  rgba(33, 33, 33, 0.4)) 
      drop-shadow(0px 1px 0px  rgba(33,33,33, 0.4)) 
      drop-shadow(0px -1px 0px  rgba(33,33,33, 0.4)) 
      drop-shadow(-1px 0px 0px rgba(33,33,33, 0.4))`;

  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  ctx.shadowBlur = 0;

  if (GAME.scene === 0)
    requestAnimationFrame( () => baseballSceneAnimate(GAME) );
}
