const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 3000; 
const WINDOW_SIZE = 10;

let windowNumbers = [];
let prevWindowNumbers = [];
let currWindowNumbers = [];

async function fetchNumbers(numberid) {
    try {
        const response = await axios.get(`http://20.244.56.144/numbers/${numberid}`);
        return response.data.numbers;
    } catch (error) {
        console.error('Error fetching numbers from test server:', error.message);
        return [];
    }
}

function calculateAverage(numbers) {
    const sum = numbers.reduce((acc, curr) => acc + curr, 0);
    return sum / numbers.length;
}

app.get('/numbers/:numberid', async (req, res) => {
    const { numberid } = req.params;
    const qualifiedIds = ['primes', 'fibo', 'even', 'rand']; 

    if (!qualifiedIds.includes(numberid)) {
        return res.status(400).json({ error: 'Invalid number ID' });
    }
    
    prevWindowNumbers=currWindowNumbers;
    currWindowNumbers = await fetchNumbers(numberid);

    if (currWindowNumbers.length > WINDOW_SIZE) {
        currWindowNumbers = currWindowNumbers.slice(currWindowNumbers.length - WINDOW_SIZE);
    }

    if (currWindowNumbers.length === 0) {
        return res.status(500).json({ error: 'Failed to fetch numbers from test server' });
    }

    windowNumbers = [...new Set([...currWindowNumbers, ...prevWindowNumbers])];

    // if (windowNumbers.length > WINDOW_SIZE) {
    //     windowNumbers = windowNumbers.slice(windowNumbers.length - WINDOW_SIZE);
    // }

    const average = calculateAverage(currWindowNumbers);

    const response = {
        numbers: windowNumbers.sort(),
        windowPrevState: [...prevWindowNumbers],
        windowCurrState: [...currWindowNumbers],
        avg: average.toFixed(2)
    };

    res.json(response);
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
