// server.js
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Mock access token
const mockAccessToken = 'PHCW3OVMXQZX5FJUR6ZK4FAA2MK2CWWA';

function randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

// Mock user data
const mockUserData = {
    sleep: {
        deepRatio: 10,
        shallowRatio: 86,
        awakeRatio: 4,
        sumDuration: 431,
        list: [
            { date: '2024-09-15', deepY: 59, shallowY: 468, awakeY: 7 },
            { date: '2024-09-16', deepY: 37, shallowY: 384, awakeY: 20 },
            { date: '2024-09-17', deepY: 44, shallowY: 265, awakeY: 10 },
        ],
    },
    temperature: {
        list: [
            { date: '2024-09-16', temperature: 98.6 },
            { date: '2024-09-17', temperature: 98.5 },
            { date: '2024-09-18', temperature: 98.7 },
        ],
    },
    calories: {
        list: [
            { date: '2024-09-16', caloriesBurned: 300 },
            { date: '2024-09-17', caloriesBurned: 500 },
            { date: '2024-09-18', caloriesBurned: 450 },
        ],
    },
};

app.get("/", (req, res) => {
    res.json("mock server for cudis api")
})

app.get('/oauth/authorize', (req, res) => {
    const redirectUri = req.query.redirect_uri || 'http://localhost:3000/callback'; // Default to localhost if not provided
    // Simulate successful authorization
    res.redirect(`${redirectUri}?access_token=${mockAccessToken}&scope=daily`);
});

// Mock heartbeat endpoint
app.get('/partner/v1/query/heart_beat', (req, res) => {
    const max = randomIntFromInterval(80, 100)
    const min = randomIntFromInterval(60, 80)
    const randomHeartData = {
        maximum: max,
        minimum: min,
        average: (max + min) / 2,
        list: [
            { date: '2024-09-16', maxY: 80.0, minY: 70.0 },
            { date: '2024-09-17', maxY: 80.0, minY: 60.0 },
            { date: '2024-09-18', maxY: 80.0, minY: 75.0 },
        ],
    }
    res.json({
        code: 200,
        msg: 'success',
        data: randomHeartData,
    });
});

// Mock sleep endpoint
app.get('/partner/v1/query/sleep', (req, res) => {
    const deepRatio = randomIntFromInterval(10, 15)
    const shallowRatio = randomIntFromInterval(70, 80)
    const awakeRatio = 100 - deepRatio - shallowRatio
    const mockSleepData = {
        deepRatio: deepRatio,
        shallowRatio: shallowRatio,
        awakeRatio: awakeRatio,
        sumDuration: 431,
        list: [
            { date: '2024-09-15', deepY: 59, shallowY: 468, awakeY: 7 },
            { date: '2024-09-16', deepY: 37, shallowY: 384, awakeY: 20 },
            { date: '2024-09-17', deepY: 44, shallowY: 265, awakeY: 10 },
        ],
    }
    res.json({
        code: 200,
        msg: 'success',
        data: mockSleepData,
    });
});

// Mock temperature endpoint
app.get('/partner/v1/query/temperature', (req, res) => {
    res.json({
        code: 200,
        msg: 'success',
        data: mockUserData.temperature,
    });
});

// Mock calories endpoint
app.get('/partner/v1/query/calories', (req, res) => {
    res.json({
        code: 200,
        msg: 'success',
        data: mockUserData.calories,
    });
});

// Mock step count endpoint
app.get('/partner/v1/query/step', (req, res) => {
    const startTime = req.query.startTime;
    const endTime = req.query.endTime;

    // Mock response for the step count API
    const mockStepData = {
        code: 200,
        msg: 'success',
        data: {
            countStep: randomIntFromInterval(4000, 10000),
            list: [
                { date: '2024-09-16', y: 2523.0 },
                { date: '2024-09-17', y: 771.0 },
                { date: '2024-09-18', y: 997.0 },
            ]
        }
    };

    res.json(mockStepData);
});


// Start the server
app.listen(PORT, () => {
    console.log(`Mock server is running on http://localhost:${PORT}`);
});
