var Site = require('../lib/site.js');
var assert = require('chai').assert;
var expect = require('chai').expect;
const sinon = require('sinon');
const sectoralarm = require('../lib/sectoralarm.js');
var Settings = require('../lib/settings.js');
const https = require('https');
const nock = require('nock');


describe('sectoralarm.js', function() {

    describe('#connect', function () {

        var sessionScope, loginScope;

        afterEach(function () {
            nock.cleanAll()
        });

        beforeEach(function() {
            
            sessionScope = nock('https://mypagesapi.sectoralarm.net')
            .post('/User/Login?ReturnUrl=%2f')
            .reply(302, null, { "set-cookie": "mycookie" });

            loginScope = nock('https://mypagesapi.sectoralarm.net')
            .get('/User/Login')
            .reply(200, '/Scripts/main.js?v1_1_68"', { "set-cookie": "requestTokenCookie" });
        });

        it('When called, without settings object, defaults are assigned', function() {
            return sectoralarm.connect('email', 'password', 'siteId')
                .then(site => {
                    expect(site._settings.jsonOutput).to.be.equal(true);
                });
        });

        it('When called, with invalid settings object, throws error', async function() {
            try {
                await sectoralarm.connect('email', 'password', 'siteId', 'invalid');
                assert.fail();
            }
            catch (error) {
                expect(error.code).to.be.equal('ERR_INVALIDSETTINGS');
            }
        });

        it('When called, with settings object and turning jsonOutput off, jsonOutput is false', function() {
            var settings = new Settings();
            settings.jsonOutput = false;
            
            return sectoralarm.connect('email', 'password', 'siteId', settings)
                .then(site => {
                    expect(site._settings.jsonOutput).to.be.equal(false);
                });
        });

        it('When called, returns promise with site object', function() {
            return sectoralarm.connect('email', 'password', 'siteId')
                .then(site => {
                    expect(site).is.not.undefined;
                });
        });

        it('Calls login on site object', function () {
            return sectoralarm.connect('email', 'password', 'siteId')
                .then(() => {
                    sessionScope.done();
                    loginScope.done();
                });
        });
    });
});