const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/scan', async (req, res) => {
    const { url } = req.query;
    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    try {
        await page.goto(url, { waitUntil: 'networkidle2' });
        const axeSource = fs.readFileSync(
            require.resolve('axe-core/axe.min.js'),
            'utf8'
        );

        await page.evaluate(axeSource);

        const results = await page.evaluate(() => {
            return axe.run();
        });
        
        await browser.close();
        res.json(results);
    } catch (error) {
        await browser.close();
        console.error('Error during scan:', error);
        res.status(500).json({ error: 'Failed to scan the URL' });
    } 
});

app.listen(5000, () => {
  console.log('Server running on http://localhost:5000');
});