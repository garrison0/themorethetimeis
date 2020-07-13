var PoemGeneratorInterface = require('./PoemGeneratorInterface');
var _ = require('lodash');
const fetch = require('node-fetch');

templateNumberEnum = {
  ARE_YOU: 0,
  SAME_DAY: 1,
  I_SURE_DO: 2
}

var template = (templateNumber) => { 
  return (word) => { 
    switch (templateNumber) { 
      case templateNumberEnum.ARE_YOU:
        return `are you ${word}?`    
      case templateNumberEnum.SAME_DAY:
        return `same ${word}`
      case templateNumberEnum.I_SURE_DO:
        return `i sure do ${word} you`
    }
  }
}

var thesaurusEndPoint = (word) => `https://words.bighugelabs.com/api/2/06208ad77b1f272df3e7d49df82ff0b9/${word}/json`

// defines where in the list of related words we should pick the next word from
// the list is roughly ordered from most similar to least similar (we don't care about exactness)
var relatedWordsPriorityEnum = {
  FIRST: 0,
  RANDOM: 1,
  LAST: 2
};

// template : string -> string 
class WordSearchPoemGenerator extends PoemGeneratorInterface { 
  constructor (templateNumber, startingWords, targetMax) { 
    super();
    this.startingWords = startingWords;
    this.relatedWordsPriority = relatedWordsPriorityEnum.LAST; 
    this.wordsUsed = [];
    this.currentWord = startingWords[0];
    this.targetMax = targetMax;
    this.betweenPhraseMode = 2; // 0 = space, 1 = arbitrary number of spaces, 2 = new line
    this.template = template(templateNumber);
  }

  // add more words to the given poem given model, lexicon, etc
  async update(poem) 
  {
    // update poem 
    let newPoem;
    if (poem) {
      newPoem = poem + '\n ' + this.template(this.currentWord);
    } else { 
      newPoem = this.template(this.currentWord);
    }
    
    //update current word: 
    let relatedWords = await this.getRelatedWords(this.currentWord);

    //filter out words that have already been used from the result
    relatedWords = _.filter(relatedWords, (word) => { return !this.wordsUsed.includes(word) });

    let newWord = "";

    if (relatedWords.length) {
      switch (this.relatedWordsPriority) { 
        case relatedWordsPriorityEnum.RANDOM:
          newWord = relatedWords[Math.floor(Math.random * relatedWords.length)];
        case relatedWordsPriorityEnum.LAST:
          newWord = relatedWords[relatedWords.length - 1];
        case relatedWordsPriorityEnum.FIRST:
          newWord = relatedWords[0];
      }
    } else { 
      // can't find a related word that hasn't already been used
      // check if any words that were initially provided haven't been used yet
      let startingWordsFiltered = _.filter(this.startingWords, (word) => { return !this.wordsUsed.includes(word) });
      if (startingWordsFiltered.length) { 
        newWord = this.startingWords[0];
      }
    }

    // if no new word is found, the poem will keep the current word and repeat
    if (newWord.length) { 
      this.wordsUsed.push(this.currentWord); 
      this.currentWord = newWord;
    }

    return newPoem;
  }

  async getRelatedWords(word) { 
    var result = await this.getThesaurusResultForWord(word);
    console.log(result);
    if (result) { 
      // json response is an object where words are all the leafs on the 3rd level, extract them 
      return (_.map(Object.values(result), (obj) => { return Object.values(obj) })).flat(2);
    }
  }

  // todo: move all pure http handling logic to somewhere else (a utilities class or something)
  async getThesaurusResultForWord (word) { 
    let res = await fetch(thesaurusEndPoint(word), { headers: { 'Content-Type': 'application/json' }});
    return await res.json();
  }
}

module.exports = WordSearchPoemGenerator;