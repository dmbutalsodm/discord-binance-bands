const request  = require('request-promise');
const stats    = require('stats-lite');
const pairs    = require('./pairs.json');
const config   = require('./config.json');
const dateFormat = require('dateformat');
function average(array) {
    let total = 0;
    for(i = 0 ; i < array.length ; i++) {
        total += array[i];
    }
    return total / array.length;
}



function getBuyablePairs() {
    requests = [];
    for (i = 0; i < pairs.length; i++) {
        requests[i] = request({
            uri: `https://www.binance.com/api/v1/klines?symbol=${pairs[i]}&interval=${config.interval}&limit=${config.limit}`,
            json: true,
        });
    }

    return Promise.all(requests).then((values) => {
        buyablePairs = {
            time: dateFormat(new Date(), "h:MM:ss TT"),
            pairs: []
        };
        pairIndex = 0;
        values.forEach((candlesticks) => {
            const closingPrices = [];
            for (i = 0; i < candlesticks.length; i++) {
                closingPrices.push(parseFloat(candlesticks[i][config.mode]));
            }
            const movingAverage = average(closingPrices);
            const standardDeviation = stats.stdev(closingPrices);
            const bands = [movingAverage - (standardDeviation * config.deviation), movingAverage, movingAverage + (standardDeviation * config.deviation)];
            if (bands[2] / bands[0] > config.spread && closingPrices[20] < bands[0] * config.bottomTolerance)
                buyablePairs.pairs.push(pairs[pairIndex]);
            pairIndex += 1;
        });
        return buyablePairs;
    });
}

module.exports = getBuyablePairs;