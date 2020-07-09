var poemModelsEnum = {
    I_WANT_TO_SEE: 0,
    IM_GOOD: 1,
    FEELS_LIKE_FOREVER: 2
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
    },
    1: { 
        startingCategory: 'c1',
        model: {
            c1: {c2: 1},
            c2: {c2: .6, c3: .4},
            c3: {c2: .9, c1: .1}
        },
        lexicon: { 
            c1: ['i\'d say', 'well', 'actually', 'yeah'],
            c2: ['most of the times', 'one time', 'three times', 'seven times', 'five times', 'lots of days', 'most days', 'yesterday', 'tomorrow', 'today'],
            c3: ['i\'m good', 'i\'m pretty good', 'i\'m doing not bad', 'not too bad']
        }
    },
    2: {
        startingCategory: 'c1',
        model: {
            c1: {c2: 0.5, c3: 0.5},
            c2: {c1: 1},
            c3: {c1: 1}
        }, 
        lexicon: {
            c1: ['it follows me', '10 years ago', '2 years ago', 'a year ago', 'five years ago', 'forever', 'yesterday', 'today', 'tomorrow', 'the past', 'it\'s coming on', 'it never ends'],
            c2: ['feels like', 'feels like'],
            c3: ['and', 'but', 'yet']
        }
    }
}

module.exports = poemModels; 



// 2nd poem like this:




// 2 years ago feels like forever but 10 years ago feels like yesterday but last week feels like it follows me and tomorrow feels like it follows me and 10 years ago feels like today


// {time} {feels like ...} {conjunction}
// 1 2 3 


// start: time

// target max : 10

// time -> feels like (100%)

// feels like -> conjunction (100%)

// conjuncton -> time (100%)