var assert = require('chai').assert;
var expect = require('chai').expect;
const sinon = require('sinon');
const https = require('https');
const nock = require('nock');
const client = require('../lib/client.js');


describe('client.js', function() {

    it('has the correct url to sector alarm api', function(){
        var url = client._sectoralarmsite;
        assert.equal(url, 'mypagesapi.sectoralarm.net');
    });

    describe('#login', function () {

        after(function () {
            nock.cleanAll()
        });

        it('connection problems throws error',function() {
            
            nock('https://mypagesapi.sectoralarm.net')
            .post('/User/Login?ReturnUrl=%2f')
            .replyWithError(404);

            return client.login('fake', 'fake', 'fake')
                .then(cookie => {
                    assert.fail();
                })
                .catch(error => {
                    expect(error.code).to.be.equal("ERR_COMMUNICATION_ERROR");
                });
        });

        it('bad login information throws credentials error',function() {
            
            nock('https://mypagesapi.sectoralarm.net')
            .post('/User/Login?ReturnUrl=%2f')
            .reply(200);

            return client.login('fake', 'fake', 'fake')
                .then(cookie => {
                    assert.fail();
                })
                .catch(error => {
                    expect(error.code).to.be.equal("ERR_INVALID_CREDENTIALS");
                });
        });        

        it('successful login returns access token', function() {

            var accessTokenCookie = 'mycookie';

            nock('https://mypagesapi.sectoralarm.net')
            .post('/User/Login?ReturnUrl=%2f')
            .reply(302, null, { "set-cookie": accessTokenCookie });

            return client.login('fake', 'fake', 'fake')
                .then(cookie => {
                    expect(cookie).to.equal(accessTokenCookie);
                })
                .catch(error => {
                    assert.fail();
                });
        });
    });

    describe('#getCookies', function() {
        
        after(function () {
            nock.cleanAll()
          })

        it('connection problems throws error',function() {
            
            nock('https://mypagesapi.sectoralarm.net')
            .head('/User/Login')
            .replyWithError(404);

            return client.getCookies()
                .then(cookie => {
                    assert.fail();
                })
                .catch(error => {
                    expect(error.code).to.be.equal("ERR_COMMUNICATION_ERROR");
                });
        });

        it('successful request returns request cookie', function() {

            var requestTokenCookie = "mycookie";

            nock('https://mypagesapi.sectoralarm.net')
            .head('/User/Login')
            .reply(200, null, { "set-cookie": requestTokenCookie });

            return client.getCookies()
                .then(cookie => {
                    expect(cookie).to.equal(requestTokenCookie);
                })
                .catch(error => {
                    assert.fail();
                });
                
        })
    });

    describe('#act', function() {
        after(function () {
            nock.cleanAll()
        });

        it('called with invalid command, throws error', function() {

            return client.act('fake', 'fake', 'fake', 'fake')
                .then(cookie => {
                    assert.fail();
                })
                .catch(error => {
                    expect(error.code).to.be.equal("ERR_INVALID_COMMAND");
                });
        });

        it('when session token expires, throws error',function() {
            
            nock('https://mypagesapi.sectoralarm.net')
            .post('/Panel/ArmPanel/')
            .reply(401);

            return client.act('fake', 'fake', 'fake', 'Disarm')
                .then(cookie => {
                    assert.fail();
                })
                .catch(error => {
                    expect(error.code).to.be.equal("ERR_INVALID_SESSION");
                });
        });

        it('connection problems throws error',function() {
            
            nock('https://mypagesapi.sectoralarm.net')
            .post('/Panel/ArmPanel/')
            .replyWithError(404);

            return client.act('fake', 'fake', 'fake', 'Total')
                .then(cookie => {
                    assert.fail();
                })
                .catch(error => {
                    expect(error.code).to.be.equal("ERR_COMMUNICATION_ERROR");
                });
        });

        it('with correct login information, returns response',function() {
            
            var fakeResponse = 'response';

            nock('https://mypagesapi.sectoralarm.net')
            .post('/Panel/ArmPanel/')
            .reply(200, fakeResponse);

            return client.act('fake', 'fake', 'fake', 'Total')
                .then(response => {
                    expect(response).to.be.equal(fakeResponse);
                })
                .catch(error => {
                    assert.fail();
                });
        });

    });

});
