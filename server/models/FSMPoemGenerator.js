var PoemGeneratorInterface = require('./PoemGeneratorInterface');

// generate poems based on finite state machine
// startingCategory: (c1,c2, or c3, etc)
// model: {c1: {c2: 1}, c2: {c2: .5, c3: .5}
// lexicon: {c1: ['...', '...', ...], c2: ['...', '...'], ...}
// currently, a word is randomly chosen from the lexicon. probabilities could be added later
class FSMPoemGenerator extends PoemGeneratorInterface{ 
  constructor (lexicon, model, startingCategory, targetMax) {
    super();  
    this.targetMax = targetMax;
    this.currentCategory = startingCategory;
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
}

module.exports = FSMPoemGenerator;