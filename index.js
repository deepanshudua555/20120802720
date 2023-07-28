const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 8008;

async function fetchJsonData(url) {
  try {
    const response = await axios.get(url, { timeout: 500 }); // Set timeout to 500 milliseconds
    return response.data;
  } catch (error) {
    console.error(`Error fetching data from ${url}:`, error.message);
    return null;
  }
}

app.get('/numbers', async (req, res, next) => {
  const urls = req.query.url;
  const uniqueIntegers = new Set();

  try {
    if (Array.isArray(urls)) {
      const requests = urls.map(url => fetchJsonData(url));
      const responses = await Promise.allSettled(requests);

      for (const response of responses) {
        if (response.status === 'fulfilled') {
          const jsonData = response.value;
          if (jsonData && Array.isArray(jsonData.numbers)) {
            jsonData.numbers.forEach(number => uniqueIntegers.add(number));
          }
        }
      }
    } else if (typeof urls === 'string') {
      const jsonData = await fetchJsonData(urls);
      if (jsonData && Array.isArray(jsonData.numbers)) {
        jsonData.numbers.forEach(number => uniqueIntegers.add(number));
      }
    }

    res.json({ numbers: Array.from(uniqueIntegers).sort((a, b) => a - b) });
  } catch (error) {
    console.error('Error processing request:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`number-management-service is running on port ${PORT}`);
});
