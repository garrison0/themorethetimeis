// startingCategory: (c1,c2, or c3, etc)
// model: {c1: {c2: 1}, c2: {c2: .5, c3: .5}
// lexicon: {c1: ['...', '...', ...], c2: ['...', '...'], ...}
// currently, a word is randomly chosen from the lexicon. probabilities could be added later
class PoemGenerator { 
  constructor (lexicon, model, startingCategory, targetMax) { 
    this.currentCategory = startingCategory;
    this.targetMax = targetMax;
    this.betweenPhraseMode = 0; // 0 = space, 1 = arbitrary number of spaces, 2 = new line
    this.model = model;
    this.lexicon = lexicon;
  }

  // add more words to the given poem given model, lexicon, etc
  update(poem) 
  {
    // add phrase to poem given current category
    let categoryPhrases = this.lexicon[this.currentCategory];
    let phrase = categoryPhrases[Math.floor(Math.random() * categoryPhrases.length)];
    let newPoem = poem + ' ' + phrase;

    // pick new category
    let p = Math.random();
    let pSum = 0;
    let categoryEdges = this.model[this.currentCategory];

    for (const [category, probability] of Object.entries(categoryEdges)) { 
      pSum += probability;
      if ( p <= pSum ) { 
        this.currentCategory = category;
        break;
      }
    }

    return newPoem;
  }

  // generates and returns a poem from the lexicon and model
  generatePoem() { 
    let poem = '';
    for (var i = 0; i < this.targetMax; i++) { 
      poem = this.update(poem);
    }
    return poem;
  }
}

module.exports = PoemGenerator;