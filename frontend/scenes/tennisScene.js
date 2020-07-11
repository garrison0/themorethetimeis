var tennisSceneSetup = (GAME) => { 
  GAME.illo = new Zdog.Illustration({
    element: '.zdog-canvas',
    rotate: { z: Zdog.TAU / 14.5, x: Zdog.TAU/6.25 },
    dragRotate: true,
    zoom: 1.75 * RELATIVE_SCREEN_SIZE_CONSTANT
  });
  
  var courtGroup = new Zdog.Group({
    addTo: GAME.illo,
  });
  
  let court = new Zdog.Rect({
    addTo: courtGroup,
    width: 72,
    height: 154,
    color: '#226d4b',
    fill: true
  });
  
  let courtOutline = new Zdog.Rect({
    addTo: courtGroup,
    width: 72,
    height: 154,
    color: '#efefef'
  });
  
  let insideSideline = new Zdog.Rect({
    addTo: courtGroup,
    width: 54,
    height: 154,
    color: '#efefef'
  });
  
  let serviceArea = new Zdog.Rect({
    addTo: courtGroup,
    width: 54,
    height: 84,
    color: '#efefef'
  });
  
  let serviceLine = new Zdog.Shape({
    addTo: courtGroup,
    path: [
      { x: 0, y: -42, z: 0},
      { x: 0, y: 42, z: 0},
    ],
    color: '#efefef'
  });
  
  let leftPole = new Zdog.Cylinder({
    addTo: courtGroup,
    diameter: 1,
    length: 8,
    translate: { x: -39, z: 4 },
    color: '#222',
    backface: '#111'
  });
  
  let rightPole = new Zdog.Cylinder({
    addTo: courtGroup,
    diameter: 1,
    length: 8,
    translate: { x: 39, z: 4 },
    color: '#222',
    backface: '#111'
  });
  
  let netTopLine = new Zdog.Shape({
    addTo: courtGroup,
    path: [
      { x: -37, y: 0, z: 8},
      { x: 37, y: 0, z: 8},
    ],
    color: '#efefef',
    stroke: 0.6
  });
  
  for (var i = 0; i < 12; i++)
  {
    new Zdog.Shape({
      addTo: courtGroup,
      diameter: 1,
      path: [
        { x: -39, z: 8/12 * i, y: 0},
        { x: 39, z: 8/12 * i, y: 0},
      ],
      color: '#222',
      stroke: 0.15
    });
  }
  
  for (var i = 0; i < 70; i++)
  {
    new Zdog.Shape({
      addTo: courtGroup,
      diameter: 1,
      path: [
        { x: -39 + 78 / 70 * i, z: 0, y: 0},
        { x: -39 + 78 / 70 * i, z: 8, y: 0},
      ],
      color: '#222',
      stroke: 0.1
    });
  }
    
  let pole1 = new Zdog.Cylinder({
    addTo: courtGroup,
    diameter: 2,
    length: 12,
    translate: { z: 6, y: 62, x: 16 },
    stroke: false,
    color: '#333',
    backface: '#111',
  });
  
  let pole2 = new Zdog.Cylinder({
    addTo: courtGroup,
    diameter: 2,
    length: 12,
    translate: { z: 6, y: -62, x: -16 },
    stroke: false,
    color: '#333',
    backface: '#111',
  });
  
  GAME.tethers[0] = new Zdog.Shape({
    addTo: courtGroup,
    path: [
      { z: 12, y: 62, x: 16 }, // start at 1st point
      { z: 16, y: 62, x: 16 }, // line to 2nd point
    ],
    stroke: 1,
    color: '#FFF',
  });
  
  GAME.tethers[1] = new Zdog.Shape({
    addTo: courtGroup,
    path: [
      { z: 12, y: -62, x: -16 }, // start at 1st point
      { z: 16, y: -62, x: -16 }, // line to 2nd point
    ],
    stroke: 1,
    color: '#FFF',
  });
  
  GAME.paths[0] = new Zdog.Shape({
    addTo: courtGroup,
    path: [
        {z: 16, y: 62, x: 16}
    ],
    stroke: 0.4,
    color: '#EF0000',
    closed: false
  });
  
  GAME.paths[1] = new Zdog.Shape({
    addTo: courtGroup,
    path: [
        {z: 16, y: -62, x: -16}
    ],
    stroke: 0.4,
    color: '#0033EF',
    closed: false
  });
  
  let firstBall = new Zdog.Group({
    translate: { z: 16, y: 62, x: 16 },
    addTo: courtGroup
  });
  
  
  let firstHalfBall1 = new Zdog.Hemisphere({
    addTo: firstBall,
    diameter: 3,
    color: '#dedede',
    backface: false,
    stroke: false
  });
  
  let secondHalfBall1 = firstHalfBall1.copy({
    rotate: { y: Zdog.TAU/2 },
    color: '#444',
    backface: false,
  });

  GAME.balls[0] = firstBall;
  
  let secondBall = new Zdog.Group({
    addTo: courtGroup,
    translate: { z: 16, y: -62, x: -16 }
  });
  
  let firstHalfBall2 = new Zdog.Hemisphere({
    addTo: secondBall,
    diameter: 3,
    color: '#dedede',
    backface: false,
    stroke: false
  });
  
  let secondHalfBall2 = firstHalfBall2.copy({
    rotate: { y: Zdog.TAU/2 },
    color: '#444',
    backface: false,
  });

  GAME.balls[1] = secondBall;
}

function tennisSceneAnimate(GAME) {
  requestAnimationFrame( () => tennisSceneAnimate(GAME) );
  
  // init if necessary
  if (GAME.storeFromServer) { // have to reconstruct path so far
    let state;
    for (var i = 0; i < GAME.storeFromServer.length; i++){
      state = GAME.storeFromServer[i];
      // update paths 'so far'
      for (var p = 0; p < GAME.paths.length; p++) {
        GAME.paths[p].path.push({x: state.balls[p].pos.x, 
          y: state.balls[p].pos.y, 
          z: state.balls[p].pos.z});
        // only re-render if latest state
        if (i >= GAME.storeFromServer.length - 1){
          GAME.paths[p].updatePath();
        } 
      }
    }

    // update initial position for each tether
    for (var t = 0; t < GAME.tethers.length; t++){
      GAME.tethers[t].path[0].x = state.balls[t].pos.x;
      GAME.tethers[t].path[0].y = state.balls[t].pos.y;
      GAME.tethers[t].path[0].z = state.balls[t].pos.z;
      GAME.tethers[t].updatePath();
    }
    
    GAME.illo.updateRenderGraph();
    GAME.storeFromServer = null; // already updated from store, delete it
  }

  // update state via pos
  console.log(GAME.stateBuffer.length);
  var t = Date.now();
  console.log(t);
  while (GAME.stateBuffer.length) {
    let state = GAME.stateBuffer.shift();

    GAME.time = state.timeStamp;

    // update new ball position, path position
    for (var b = 0; b < GAME.balls.length; b++) {
      GAME.paths[b].path.push({x: GAME.balls[b].translate.x, 
        y: GAME.balls[b].translate.y, 
        z: GAME.balls[b].translate.z
      });

      // if this is latest state, update ball position, call updatePath to re-render
      if (!GAME.stateBuffer.length) {
        GAME.balls[b].translate.x = state.balls[b].pos.x;
        GAME.balls[b].translate.y = state.balls[b].pos.y;
        GAME.balls[b].translate.z = state.balls[b].pos.z;
        GAME.balls[b].rotate.x += 0.03;
        GAME.balls[b].rotate.y += 0.019;

        GAME.paths[b].updatePath();
      }
    }

    // change tether endpoint if latest state state
    if (!GAME.stateBuffer.length) { 
      for (var t = 0; t < GAME.tethers.length; t++) {
        GAME.tethers[t].path[0].x = GAME.balls[t].translate.x;
        GAME.tethers[t].path[0].y = GAME.balls[t].translate.y + 1.5;
        GAME.tethers[t].path[0].z = GAME.balls[t].translate.z;
        GAME.tethers[t].updatePath();
      }
    } 
  }
  console.log('update state: ' + Date.now());
  
  GAME.illo.rotate.z += 0.000325;
  if (!GAME.stateBuffer.length) { 
    GAME.illo.updateRenderGraph();
    let canvas = document.querySelector('.zdog-canvas');
    let ctx = canvas.getContext('2d');

    let fontSize = 24 * RELATIVE_SCREEN_SIZE_CONSTANT;
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
    ctx.fillText(calendarDate, 600 * RELATIVE_SCREEN_SIZE_CONSTANT, 465 * RELATIVE_SCREEN_SIZE_CONSTANT);
    ctx.fillText(hours, 600 * RELATIVE_SCREEN_SIZE_CONSTANT, 500 * RELATIVE_SCREEN_SIZE_CONSTANT);

    // these will effect the illustration too - choose whatever you want
    ctx.filter = 'brightness(75%)';

    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur = 0;
  }
}
