const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);


suite('Functional Tests', function() {
    test('GET request to view one stock', function(done) {
        chai.request(server).get('/api/stock-prices/').query({ stock: 'GOOG' }).end(function(err, res) {
            chai.expect(res).to.have.status(200);
            chai.expect(res.body).to.have.property('stockData');
            chai.expect(res.body.stockData).to.have.property('stock');
            chai.expect(res.body.stockData).to.have.property('price');
            chai.expect(res.body.stockData).to.have.property('likes');
            chai.expect(res.body.stockData.stock).to.equal('GOOG');
            chai.expect(res.body.stockData.price).to.be.a('number');
            chai.expect(res.body.stockData.likes).to.be.a('number');
            done();
        });
    });

    test('GET request and like', function(done) {
        chai.request(server).get('/api/stock-prices/').query({ stock: 'GOOG', like: true }).end(function(err, res) {
            chai.expect(res).to.have.status(200);
            chai.expect(res.body.stockData.likes).to.be.a('number');
            chai.expect(res.body.stockData.likes).to.equal(1);
            done();
        });
    });

    test('GET request and like same IP', function(done) {
        chai.request(server).get('/api/stock-prices/').query({ stock: 'GOOG', like: true }).end(function(err, res) {
            chai.expect(res).to.have.status(200);
            chai.expect(res.body.stockData.likes).to.be.a('number');
            chai.expect(res.body.stockData.likes).to.equal(1);
            done();
        });
    });

    test('GET request for 2 stocks', function(done) {
        chai.request(server).get('/api/stock-prices/').query({ stock: ['GOOG', 'MSFT'] }).end(function(err, res) {
            chai.expect(res).to.have.status(200);
            chai.expect(res.body.stockData).to.be.a('array');
            done();
        });
    });

    test('GET request for 2 stocks and like', function(done) {
        chai.request(server).get('/api/stock-prices/').query({ stock: ['GOOG', 'MSFT'], like: true }).end(function(err, res) {
            chai.expect(res).to.have.status(200);
            chai.expect(res.body.stockData).to.be.a('array');
            chai.expect(res.body.stockData[0].rel_likes + res.body.stockData[1].rel_likes).to.equal(0);
            done();
        });
    });
});

