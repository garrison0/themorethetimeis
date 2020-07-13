class PoemGeneratorInterface { 
    constructor (targetMax){ 
        if(!this.update) {
            throw new Error("Poem generators must have an update function (this.update)");
        }
    }
  
    // generates and returns a poem from whatever generator semantics
    async generatePoem() { 
      let poem = '';
      for (var i = 0; i < this.targetMax; i++) { 
        poem = await this.update(poem);
      }
      return poem;
    }
  }
  
  module.exports = PoemGeneratorInterface;