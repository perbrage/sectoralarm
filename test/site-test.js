var assert = require('chai').assert;
var expect = require('chai').expect;
const sinon = require('sinon');
const https = require('https');
const nock = require('nock');
const client = require('../lib/client.js');
const parser = require('../lib/parser.js');
const Site = require('../lib/site.js');



describe('site.js', function() {

    it('when created, all parameters are set correctly', function() {
        var site = new Site("email", "password", "siteid");
        assert.equal(site._email, "email");
        assert.equal(site._password, "password");
        assert.equal(site._siteId, "siteid");
    });

    it('when created, all defaults are set correctly', function() {
        var site = new Site("email", "password", "siteid");
        assert.equal(site._status, "unknown");
    });

    describe('#login', function () {


    });

    describe('#status', function () {
        var getHistoryStub, getStatusStub, historyParserStub, statusParserStub, site;
        
        beforeEach(function() {

            var statusResponse = JSON.stringify({
                "Panel": {
                    "PanelId": 1000,
                    "PanelDisplayName": "Home",
                    "ArmedStatus": "armed",
                    "PartialAvalible": true }
            });

            var historyResponse = JSON.stringify(
                [{
                    "time": '2017-06-18 16:17:00',
                    "action": "armed",
                    "user": "Code"
                }]);

            getStatusStub = sinon.stub(client, 'getStatus');
            getStatusStub.resolves(statusResponse);
            getHistoryStub = sinon.stub(client, 'getHistory');
            getHistoryStub.resolves('dummy response');
            historyParserStub = sinon.stub(parser, 'transformHistoryToOutput');
            historyParserStub.resolves(historyResponse);
            statusParserStub = sinon.stub(parser, 'transformStatusToOutput');
            statusParserStub.resolves('dummy response');
            site = new Site('email', 'password', 'siteId');
            site._sessionCookie = 'sessionCookie';
        });

        afterEach(function() {
            getStatusStub.restore();
            getHistoryStub.restore();
            historyParserStub.restore();
            statusParserStub.restore();
        });

        it('calls status and history on client, and transformStatusToOutput on parser', function() {
            return site.status()
                .then(history => {
                    sinon.assert.calledOnce(getHistoryStub);
                    sinon.assert.calledOnce(getStatusStub);
                    sinon.assert.calledOnce(historyParserStub);
                    sinon.assert.calledOnce(statusParserStub)
                });

        });
    });

    describe('#history', function () {
        var getHistoryStub, parserStub, site;
        
        beforeEach(function() {
            getHistoryStub = sinon.stub(client, 'getHistory');
            getHistoryStub.resolves({ "response": "response"});
            parserStub = sinon.stub(parser, 'transformHistoryToOutput');
            parserStub.resolves({ "output": "output"});
            site = new Site('email', 'password', 'siteId');
            site._sessionCookie = 'sessionCookie';
        });

        afterEach(function() {
            getHistoryStub.restore();
            parserStub.restore();
        });

        it('when called without any argument, calls history on client with 10 as default filter', function() {
            return site.history()
                .then(history => {
                    sinon.assert.calledWith(parserStub, { "response": "response"}, 10);
                });
        });

        it('when called with top filter, calls history on client with same value as filter', function() {
            return site.history(7)
                .then(history => {
                    sinon.assert.calledWith(parserStub, { "response": "response"}, 7);
                });
        });

        it('calls getHistory on client and transformHistoryToOutput on parser', function () {
            return site.history()
                .then(history => {
                    sinon.assert.calledOnce(getHistoryStub);
                    sinon.assert.calledOnce(parserStub);
                });
        });
    });

    describe('#login', function () {
        var loginStub, getCookiesStub;

        beforeEach(function() {
            loginStub = sinon.stub(client, 'login');
            getCookiesStub = sinon.stub(client, "getCookies");
            getCookiesStub.resolves('cookies')
            loginStub.resolves("sessionCookie");
            site = new Site('email', 'password', 'siteId');
            site._sessionCookie = 'sessionCookie';
        });

        afterEach(function() {
            loginStub.restore();
            getCookiesStub.restore();
        });

        it('login calls getCookies and login on client', function () {
            return site.login()
                .then(response => {
                    sinon.assert.calledOnce(loginStub);
                    sinon.assert.calledOnce(getCookiesStub);
                });
       });
    
        it('login is called with correct arguments', function () {
            return site.login()
                .then(response => {
                    sinon.assert.calledWith(loginStub, 'email', 'password', 'cookies');
                });
        });

        it('login called with correct login information, assigns sites sessionCookie', function () {
            return site.login()
                .then(response => {
                    sinon.assert.calledWith(loginStub, 'email', 'password', 'cookies');
                    expect(site._sessionCookie).to.be.equal('sessionCookie');
                });
        });
    });

    describe('#arm', function () {
        var actStub, parserStub, site;
        
        beforeEach(function() {
            actStub = sinon.stub(client, 'act');
            parserStub = sinon.stub(parser, 'transformActionToOutput');
            actStub.resolves({ "response": "aresponse"});
            parserStub.resolves({ "output": "output"});
            site = new Site('email', 'password', 'siteId');
            site._sessionCookie = 'sessionCookie';
        });

        afterEach(function() {
            actStub.restore();
            parserStub.restore();
        });

        it('calls act on client, with correct parameters', function() {
            return site.arm('code')
                .then(response => {
                    sinon.assert.calledWith(actStub, 'siteId', 'sessionCookie', 'code', 'Total');
                });
        });

        it('calling arm, calls act on client and transformActionToOutput on parser', function () {
            return site.arm('fake')
                .then(response => {
                    sinon.assert.calledOnce(actStub);
                    sinon.assert.calledOnce(parserStub);
                });
        });
    });

    describe('#partialArm', function () {
        var actStub, parserStub, site;
        
        beforeEach(function() {
            actStub = sinon.stub(client, 'act');
            parserStub = sinon.stub(parser, 'transformActionToOutput');
            actStub.resolves({ "response": "aresponse"});
            parserStub.resolves({ "output": "output"});
            site = new Site('email', 'password', 'siteId');
            site._sessionCookie = 'sessionCookie';
        });

        afterEach(function() {
            actStub.restore();
            parserStub.restore();
        });

        it('calls act on client, with correct parameters', function() {
            return site.partialArm('code')
                .then(response => {
                    sinon.assert.calledWith(actStub, 'siteId', 'sessionCookie', 'code', 'Partial');
                });
        });

        it('calling partialArm, calls act on client and transformActionToOutput on parser', function () {
            return site.partialArm('fake')
                .then(response => {
                    sinon.assert.calledOnce(actStub);
                    sinon.assert.calledOnce(parserStub);
                });
        });
    });

    describe('#disarm', function () {

        var actStub, parserStub, site;
        
        beforeEach(function() {
            actStub = sinon.stub(client, 'act');
            parserStub = sinon.stub(parser, 'transformActionToOutput');
            actStub.resolves({ "response": "aresponse"});
            parserStub.resolves({ "output": "output"});
            site = new Site('email', 'password', 'siteId');
            site._sessionCookie = 'sessionCookie';
        });

        afterEach(function() {
            actStub.restore();
            parserStub.restore();
        });

        it('calls act on client, with correct parameters', function() {
            return site.disarm('code')
                .then(response => {
                    sinon.assert.calledWith(actStub, 'siteId', 'sessionCookie', 'code', 'Disarm');
                });
        });

        it('calling disarm, calls act on client and transformActionToOutput on parser', function () {
            return site.disarm('fake')
                .then(response => {
                    sinon.assert.calledOnce(actStub);
                    sinon.assert.calledOnce(parserStub);
                });
        });
    });


});