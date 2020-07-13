const Scene = require("./Scene");
const sceneTypeEnum = require("./sceneTypeEnum");
var _ = require('lodash');
const fetch = require('node-fetch');

// todo: put these queries somewhere safe
var GET_SCENE = `query GetScene {
    scenes(where: {startTime: {_gte: "2020-06-27T19:55:00+00:00", _lte: "2020-06-27T20:05:00+00:00"}}) {
      id
      store
      startTime
    }
  }
`;

var GET_START_TIMES = `query GetStartTimes {
    scenes {
      startTime
    }
  }
`;

var ADD_SCENE = (time) => `mutation AddScene ($store: json!) {
    insert_scenes_one(object: {startTime: "${time}", store: $store}) {
      id
    }
  }`;

function roundMinutes(date) {
    date.setHours(date.getHours() + Math.round(date.getMinutes()/60));
    date.setMinutes(0, 0, 0);
    return date;
}

class SceneManager {
    constructor(sceneType) { 
        this.sceneType = sceneType;
    }

    async initScene(){
        this.scene = new Scene(this.sceneType);
        await this.scene.initPoem();
        // this.getScene();
    }

    async update(delta) { 
        let readyToGenerateNewScene = await this.scene.update(delta);
        if (readyToGenerateNewScene) { 
            this.saveScene();
            await this.generateNewScene();
        }
    }

    async generateNewScene() { 
        this.scene = new Scene(sceneTypeEnum.BASEBALL);
        await this.scene.initPoem();
    }

    // todo: put http logic somewhere else
    saveScene() { 
        let nearestHour = (roundMinutes(new Date(Date.now()))).toISOString();
        let query = { query: ADD_SCENE(nearestHour), variables: { store: this.scene.store } };
        fetch('https://themorethetimeis.herokuapp.com/v1/graphql', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-hasura-admin-secret': 'Gm15621530' },
            body: JSON.stringify(query)
        })
        .then(res => res.json())
        .then(res => {
            console.log(res);
        });
    }

    getScene() {
        let query = { query: GET_SCENE };
        fetch('https://themorethetimeis.herokuapp.com/v1/graphql', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-hasura-admin-secret': 'Gm15621530' },
            body: JSON.stringify(query)
        })
        .then(res => res.json())
        .then(res => {
            console.log(res.data);
        });
    }

    async getSceneStartTimes() { 
        let query = { query: GET_START_TIMES };
        let res = await fetch('https://themorethetimeis.herokuapp.com/v1/graphql', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-hasura-admin-secret': 'Gm15621530' },
            body: JSON.stringify(query)
        })
        res = await res.json();
        return _.map(res.data.scenes, (scene) => { return scene.startTime });
    }
}

module.exports = SceneManager;