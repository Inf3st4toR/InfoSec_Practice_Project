'use strict';
const bcrypt = require('bcrypt'); // Salt=4

const chest = {};

const likesHandler = async (symbol, ip) => {
  if (!chest[symbol]) chest[symbol] = { count: 0, hashs: [] };
  for (let hash of chest[symbol].hashs) {
    if(await bcrypt.compare(ip, hash)) return;
  }
  chest[symbol].count++;
  chest[symbol].hashs.push(await bcrypt.hash(ip, 4));
  return;
}

module.exports = function (app) {

  app.route('/api/stock-prices').get(async (req, res) => {
    try {
      console.log('Route hit:', req.query);
      const symbol = req.query.stock;

      // 2 stocks
      if (Array.isArray(symbol)) {
        // Handle like query
        if (req.query.like) {
          const userIP = req.ip;
          for (let i = 0; i < symbol.length; i++) await likesHandler(symbol[i], userIP);
        }
        //return stock info
        let diff = (chest[symbol[0]] ? chest[symbol[0]].count : 0) - (chest[symbol[1]] ? chest[symbol[1]].count : 0);
        const stock_table = [];
        for (let i = 0; i < symbol.length; i++) {
          const stock = await fetch(`https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${symbol[i]}/quote`);
          const data = await stock.json();
          const obj = {"stock": data.symbol, "price": data.latestPrice, "rel_likes": diff * ((-1)**i) }
          stock_table.push(obj);
        }
        res.json({"stockData": stock_table})

      // 1 stock
      } else {
        // Handle like query
        if (req.query.like) {
          const userIP = req.ip;
          await likesHandler(symbol, userIP);
        }
      
        // Return stock info
        const response = await fetch(`https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${symbol}/quote`);
        const data = await response.json();
        res.json({"stockData":{"stock": data.symbol, "price": data.latestPrice ,"likes": chest[symbol] ? chest[symbol].count : 0 }});
      }
    } catch (err) {
      res.status(500).json({ error: 'Server error' });
    }
  });

};

