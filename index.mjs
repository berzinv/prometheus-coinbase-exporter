import * as fs from 'node:fs/promises';
import express from "express";

async function loadConfig(filename) {
    const data = await fs.readFile(filename);
    return JSON.parse(data);
}

async function get_crypto_prices(cur) {
    const response = await fetch(`https://api.coinbase.com/v2/prices/${cur}/spot`);
    const currencies = await response.json();

    let res = "";

    currencies.data.map(currency => {
        res += `coinbase_${currency.base}_${currency.currency} ${currency.amount}\n`.toLowerCase();
    });

    return res;
}

let config = {};

try {
    config = await loadConfig("config.json");
}
catch(err) {
    console.error(err);
}

const app = express();
const port = config.port;

app.get('/metrics', async (req, res) => {
    res.set('Content-Type', 'text/plain')
    res.send(await get_crypto_prices(config.currency));
});

app.listen(port, () => {
    console.log(`Coinbase exporter listening on port ${port}`)
});
