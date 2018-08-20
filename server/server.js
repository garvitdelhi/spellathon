const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const md5 = require('md5');
const Memcached = require('memcached');

const memcached = new Memcached('127.0.0.1:11211');

const INCREASE_SCORE_BY = 5;
const DECREASE_SCORE_BY = 2;

app.use(bodyParser.text({
    type: '*/*'
}));

app.use(function(req, res, next) {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
      next();
});

let store = {};

//memcached.set('store', JSON.stringify({}), 1000000, () => console.log('done'));

memcached.get('store', (err, data) => {
    console.log(data, err, 'here');
    store = JSON.parse(data);
});

const secure = {};

function getStore(key) {
    return store[key];
}

function setStore(key, value) {
    store[key] = value;
    memcached.set('store', JSON.stringify(store), 1000000, err => err !== undefined ? console.log(err) : console.log('memcache set'));
    console.log('Saving as backup to memcached');
}

app.get('/escape', (req, res) => {
    const result = [];
    for (participant in store) {
        result.push(store[participant]);
    }
    result.sort((a, b) => {
        if (a.score < b.score) {
            return 1;
        }
        if (a.score > b.score) {
            return -1;
        }
        return 0;
    });
    res.json(result);
})

app.get('/escape/participation', (req, res) => {
    res.json(Object.keys(store).length);
})

app.post('/escape/participation/setselectedstudentslimit/:number/:step', (req, res) => {
    const number = req.params.number;
    const step = parseInt(req.params.step);
    const participants = [];
    for (participant in store) {
        participants.push(store[participant]);
    }
    participants.sort((a, b) => {
        if (a.score < b.score) {
            return 1;
        }
        if (a.score > b.score) {
            return -1;
        }
        return 0;
    });
    const quailified = [];
    if (number <= participants.length) {
        for (i = 0; i < number && participants[i].step === step-1; ++i) {
            quailified.push({
                name: participants[i].name,
                email: participants[i].email,
                score: participants[i].score
            });
            store[participants[i].hash].step = step;
        }
        const last_score = participants[number-1].score;
        for (i = number; i < participants.length && participants[i].score === last_score && participants[i].step === step-1; ++i) {
            quailified.push({
                name: participants[i].name,
                email: participants[i].email,
                score: participants[i].score
            });
            store[participants[i].hash].step = step;
        }
    }
    memcached.set('store', JSON.stringify(store), 1000000, err => console.log(err));
    res.json(quailified);
})

app.post('/out', (req, res) => {
    const body = JSON.parse(req.body);
    if (body.hash !== undefined && getStore(body.hash) !== undefined) {
        console.log(body.hash, ' went out');
        const user_data = getStore(body.hash);
        user_data.score = user_data.score - DECREASE_SCORE_BY;
        setStore(body.hash, user_data);
    }
    res.json({});
})

app.post('/step1', (req, res) => {
    const body = JSON.parse(req.body);
    const hash = md5(body.email + 'randomizing the secret so that they cannot guess it');
    console.log('step 1 for: ', hash);
    if (getStore(hash) === undefined) {
        secure[body.email] = md5(body.password);
        setStore(hash, {
            name: body.name,
            email: body.email,
            step: 2,
            score: 0,
            hash: hash
        });
    }
    //if (secure[body.email] === md5(body.password)) {
        res.status(200).json({
            step: getStore(hash).step,
            hash: hash
        });
    // } else {
    //  res.json({
    //       error: 'Wrong Password'
    //    });
    //}
});

app.post('/step2', (req, res) => {
    const body = JSON.parse(req.body);
    if (body.hash !== undefined && getStore(body.hash) !== undefined && getStore(body.hash).step === 2) {
        const user_data = getStore(body.hash);
        user_data.step_2_ans = body.filled_inputs;
        user_data.step = 3;
        const ans = ["Glossary",
            "Competition",
            "Definition",
            "Committee",
            "Commandment",
            "Vacuum",
            "Embarrassment",
            "Accommodate",
            "Weird",
            "Indict",
            "Millennium",
            "Pharaoh",
            "Supersede",
            "Pronunciation",
            "Renaissance",
            "Ascetic",
            "Omelette",
            "harassment",
            "commensurate",
            "embezzlement",
            "phlegmatic",
            "Caribbean",
            "Maintenance",
            "Deductible",
            "occasion",
            "Brewery",
            "Deteriorate",
            "Massachusetts",
            "Mississippi",
            "Jocular"];
        let score = user_data.score;
        for (let i = 0; i < ans.length; ++i) {
            if (user_data.step_2_ans[i].toLocaleLowerCase() === ans[i].toLocaleLowerCase()) {
                score = score + INCREASE_SCORE_BY;
            }
        }
        user_data.score = score;
        setStore(body.hash, user_data);
        res.json({
            step: user_data.step
        });
    } else {
        res.json({
            error: '-_-'
        });
    }
});

app.post('/step4', (req, res) => {
    const body = JSON.parse(req.body);
    if (body.hash !== undefined && getStore(body.hash) !== undefined && getStore(body.hash).step === 4) {
        const user_data = getStore(body.hash);
        user_data.step_4_ans = body.filled_inputs;
        user_data.step = 5;
        const ans = ["Loquacious",
            "parentheses",
            "epitome",
            "Cemetery",
            "Liaison ",
            "Convalesce",
            "sanctimonious",
            "scurrilous",
            "conscience",
            "Ignominious",
            "Synecdoche",
            "Encomium",
            "Eugenic",
            "despotism",
            "camaraderie",
            // images
            'Marriott',
            'Hallmark',
            'Heineken',
            'Versace',
            'Michelin'
        ];
        //Todo add images solution as well
        let score = user_data.score;
        for (let i = 0; i < ans.length; ++i) {
            if (user_data.step_4_ans[i].toLocaleLowerCase() === ans[i].toLocaleLowerCase()) {
                score = score + INCREASE_SCORE_BY;
            }
        }
        user_data.score = score;
        setStore(body.hash, user_data);
        res.json({
            step: user_data.step
        });
    } else {
        res.json({
            error: '-_-'
        });
    }
});

app.post('/step6', (req, res) => {
    const body = JSON.parse(req.body);
    if (body.hash !== undefined && getStore(body.hash) !== undefined && getStore(body.hash).step === 6) {
        const user_data = getStore(body.hash);
        user_data.step_6_ans = body.filled_inputs;
        user_data.step = 7;
        const ans = ["Vicissitudes",
            "Maneuver",
            "Phosphorescence",
            "obsequious",
            "penchant",
            // images
            "Lamborghini",
            "Croissant",
            "Jalapeno",
            "Hippopotamus",
            "MailChimp",
            // meaning to word
            "prestigious",
            "freight",
            "criticize",
            "unbelievable",
            "voracious"
        ];
        //Todo add solutions for step 6 prelims 3
        let score = user_data.score;
        for (let i = 0; i < ans.length; ++i) {
            if (user_data.step_6_ans[i].toLocaleLowerCase() === ans[i].toLocaleLowerCase()) {
                score = score + INCREASE_SCORE_BY;
            }
        }
        user_data.score = score;
        setStore(body.hash, user_data);
        res.json({
            step: user_data.step
        });
    } else {
        res.json({
            error: '-_-'
        });
    }
});

app.listen(7080, () => console.log('Example app listening on port 7080!'));
