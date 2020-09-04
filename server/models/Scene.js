const uniqid = require("uniqid");
var _ = require('lodash');
var sceneTypeEnum = require('./sceneTypeEnum.js');
var poemModels = require('./poemModels.js');
var FSMPoemGenerator = require('./FSMPoemGenerator.js');
var WordSearchPoemGenerator = require('./WordSearchPoemGenerator.js');
var Zdog = require('Zdog');

// todo: move these to separate files
var updateRuleTypeEnum = {
  RANDOM: 0,
  INTERACT: 1,
  FLY_AWAY: 2
};

// todo: file of constants
var MS_IN_HOUR = 3600000;
var MS_IN_MINUTE = MS_IN_HOUR / 60;
var SEC_IN_HR = 60 * 60;
var SEC_IN_MIN = 60;
var HRS_PER_SCENE = 1;

class Ball { 
  constructor (sceneType, order) { 
    this.id = uniqid();
    switch (sceneType) { 
      case sceneTypeEnum.TENNIS:
        this.pos = order === 0 ? new Zdog.Vector({ z: 16, y: 62, x: 16 }) : new Zdog.Vector({ z: 16, y: -62, x: -16 });
        this.vel = order === 0 ? new Zdog.Vector({x: Math.random() * 4, y: Math.random() * 4, z: Math.random() * 2}) : new Zdog.Vector({x: Math.random() * -4, y: Math.random() * -4, z: Math.random() * 2})
        break;
      case sceneTypeEnum.BASEBALL:
        this.pos = new Zdog.Vector({x:0,y:0,z:14.5});
        this.vel = new Zdog.Vector({x:0,y:0,z:0});
        break;
    }
  }

  update(delta, updateRule, balls) 
  {
    switch (updateRule) { 
      case updateRuleTypeEnum.RANDOM:
        var acc = new Zdog.Vector({x: Math.random() * 500 * (Math.random() < 0.5 ? -1 : 1),
                   y: Math.random() * 500 * (Math.random() < 0.5 ? -1 : 1),
                   z: Math.random() * 500 * (Math.random() < 0.5 ? -1 : 1)});
        this.vel = this.vel.add(acc.multiply(delta));
        this.pos = this.pos.add(this.vel.multiply(delta));
        // todo: constrain based on scene
        this.constrain(new Zdog.Vector({x:-150, y:-125, z:0}), new Zdog.Vector({x:150, y:125, z:100}), "BOUNCE");
        break;

      case updateRuleTypeEnum.INTERACT:
        var acc = new Zdog.Vector({x:0,y:0,z:0});
        
        // find balls with different ids
        // apply gravity in direction of other balls
        var id = this.id;
        var otherBalls = _.filter(balls, function(b) { return b.id !== id } );
        for (var i = 0; i < otherBalls.length; i++){
          let b = otherBalls[i];
          // console.log(otherBalls);
          
          let diff = b.pos.copy().subtract(this.pos);
          // console.log(diff);
          let r = diff.magnitude();

          // potentially turn off the gravity if they're too close ( for effect )
          if (r >= 2.5) { 
            let GRAVITATIONAL_CONSTANT = 750;
            diff.multiply(GRAVITATIONAL_CONSTANT / Math.pow(r, 2));
            acc.add(diff);
          } else { 
            let bv = b.vel.magnitude();
            b.vel.multiply(-2).add(diff.copy().multiply(bv * 1.75)).multiply(0.74);
            let tv = this.vel.magnitude();
            this.vel.multiply(-2).add(diff.copy().multiply(-1 * tv * 1.75)).multiply(0.74);
          }
        }

        this.vel.add(acc.multiply(delta));
        this.pos.add(this.vel.copy().multiply(delta));

        // tennis constraints -- todo: switch based on scene
        this.constrain(new Zdog.Vector({x:-80, y:-130, z:0}), new Zdog.Vector({x:80,y:130,z:80}), "ACCELERATE");

        if (this.vel.magnitude() > 25) { 
          this.vel.multiply(0.98);
        }
        break;
    }
  }

  // resolve out-of-boundary conditions given min, max, and type of resolution 
  // @min : Zdog.Vector
  // @max : Zdog.Vector
  // @type: "ACCELERATE" - accelerate back into bounds, "BOUNCE" - bounce off the wall, like pong
  constrain(min, max, type) { 
    let acc = new Zdog.Vector();
    if (this.pos.x < min.x) {
      switch (type) { 
        case "BOUNCE": 
          this.vel.x = this.vel.x * -1;
          break;
        case "ACCELERATE":
          acc.add({x: min.x - this.pos.x})
          break;
      }
    }
    if (this.pos.x >= max.x) {
      switch (type) { 
        case "BOUNCE": 
          this.vel.x = this.vel.x * -1;
          break;
        case "ACCELERATE":
          acc.add({x: max.x - this.pos.x});
          break;
      }
    }
    if (this.pos.y < min.y) {
      switch (type) { 
        case "BOUNCE": 
          this.vel.y = this.vel.y * -1;
          break;
        case "ACCELERATE":
          acc.add({y: min.y - this.pos.y});
          break;
      }
    } 
    if (this.pos.y >= max.y) {
      switch (type) { 
        case "BOUNCE": 
          this.vel.y = this.vel.y * -1;
          break;
        case "ACCELERATE":
          acc.add({y: max.y - this.pos.y});
          break;
      }
    } 
    if (this.pos.z < min.z) {
      switch (type) { 
        case "BOUNCE": 
          this.vel.z = this.vel.z * -1;
          break;
        case "ACCELERATE":
          acc.add({z: min.z - this.pos.z});
          break;
      }
    }
    if (this.pos.z >= max.z) {
      switch (type) { 
        case "BOUNCE": 
          this.vel.z = this.vel.z * -1;
          break;
        case "ACCELERATE":
          acc.add({z: max.z - this.pos.z});
          break;
      }
    }
    this.vel.add(acc);

    if (type === "BOUNCE") { 
      this.pos.x = Math.min(max.x, Math.max(min.x, this.pos.x));
      this.pos.y = Math.min(max.y, Math.max(min.y, this.pos.y));
      this.pos.z = Math.min(max.z, Math.max(min.z, this.pos.z));
    }
  }
}

class Scene { 
  constructor(sceneType) { 
    // when all scenes are implemented, choose randomly
    this.sceneType = sceneType;
    switch (sceneType) { 
      case sceneTypeEnum.BASEBALL:
        this.balls = [new Ball(sceneType)];
        this.updateRule = updateRuleTypeEnum.RANDOM;
        break;
      case sceneTypeEnum.TENNIS:
        this.balls = [new Ball(sceneType, 0), new Ball(sceneType, 1)];
        this.updateRule = updateRuleTypeEnum.INTERACT;
        break;
    }
    this.timeStamp = Date.now();
    this.runTime = 0;
    this.store = []; // past states
  }

  async initPoem() { 
    let poemModel = poemModels[Math.floor(Math.random() * Object.keys(poemModels).length)];
    let poemGenerator = new FSMPoemGenerator(poemModel.lexicon, poemModel.model, poemModel.startingCategory, Math.random() * 100);
    // let poemGenerator = new WordSearchPoemGenerator(2, ['miss', 'dislike'], 1);
    this.poem = await poemGenerator.generatePoem();
  }

  // update returns whether it's time to end the scene
  update(delta) {
    for (var i = 0; i < this.balls.length; i++)
    {
      this.balls[i].update(delta, this.updateRule, this.balls);
    };
    this.timeStamp = Date.now();
    this.runTime += delta;
    this.storeState();

    // if the scene has been running for n hours, where n > (HOURS / SCENE), or if we're within a minute of an exact hour...
    return this.runTime >= 0.05 || this.timestamp % MS_IN_HOUR < MS_IN_MINUTE;
  }

  storeState() { 
    let newState = {balls: _.cloneDeep(this.balls), timeStamp: Date.now(), runTime: this.runTime, sceneType: this.sceneType, updateRule: this.updateRule, poem: this.poem};
    // console.log(newState.balls);
    this.store.push(newState);
  }
}

module.exports = Scene;