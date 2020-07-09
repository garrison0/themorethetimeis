var poemModelsEnum = {
    I_WANT_TO_SEE: 0
}

// must match poem models enum
// using cn to denote 'category n' 
var poemModels = {
    0: {
        startingCategory: 'c1',
        model: {
            c1: {c2: 1},
            c2: {c1: .28, c3: .72},
            c3: {c3: .63, c1: .37}
        }, 
        lexicon: {
            c1: ['i want to'],
            c2: ['know', 'see', 'understand'],
            c3: ['how very', 'how are you', 'how are you keeping up', 'how\'s it going']
        }
    }
}

module.exports = poemModels; 