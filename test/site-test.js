var assert = require('chai').assert;
var expect = require('chai').expect;
const sinon = require('sinon');
const https = require('https');
const nock = require('nock');
const client = require('../lib/client.js');
const parser = require('../lib/parser.js');
const Site = require('../lib/site.js');
const Settings = require("../lib/settings.js");

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

    describe('#formatOutput', function () {

        it('without settings, jsonOutput is true', function() {
            var site = new Site("email", "password", "siteid");
            assert.equal(site._settings.jsonOutput, true);
        });

        it('with settings and jsonOutput off, jsonOutput is false', function() {
            var settings = new Settings();
            settings.jsonOutput = false;
            var site = new Site("email", "password", "siteid", settings);
            assert.equal(site._settings.jsonOutput, false);
        });

        it('with settings and jsonOutput off, returns javascript object', async function() {
            var settings = new Settings();
            settings.jsonOutput = false;
            var site = new Site("email", "password", "siteid", settings);
            var obj = { a: "test", b: "test" };

            var result = await site.formatOutput(obj);

            assert.equal(result.a, "test");
        });

        it('with settings and jsonOutput on, returns json string', async function() {
            var site = new Site("email", "password", "siteid");
            var obj = { a: "test", b: "test" };

            var result = await site.formatOutput(obj);

            var jsonResult = JSON.parse(result);

            assert.equal(jsonResult.a, "test");
        });
    });

    describe('#info', function () {

        var getStatusStub, parserStub;
        
        beforeEach(function() {

            var statusResponse = JSON.stringify({
                "Panel": {
                    "PanelId": 1000,
                    "PanelDisplayName": "Home",
                    "ArmedStatus": "armed",
                    "PartialAvalible": true },
                "Locks": [{"Label":"yaledoorman","PanelId":1000,"Serial":"123","Status":"","SoundLevel":2,"AutoLockEnabled":false,"Languages":null}]
            });

            getStatusStub = sinon.stub(client, 'getStatus');
            getStatusStub.resolves(statusResponse);
            parserStub = sinon.stub(parser, 'transformInfoToOutput');
            parserStub.resolves({ "output": "output"});
            site = new Site('email', 'password', 'siteId');
            site._sessionCookie = 'sessionCookie';
        });

        afterEach(function() {
            getStatusStub.restore();
            parserStub.restore();
        });

        it('calls getStatus and transformInfoToOutput on parser', function() {
            return site.info()
                .then(() => {
                    sinon.assert.calledOnce(getStatusStub);
                    sinon.assert.calledOnce(parserStub);
                });

        });

    });

    describe('#status', function () {
        var getStatusStub, parserStub;
        
        beforeEach(function() {

            var statusResponse = JSON.stringify({
                "Panel": {
                    "PanelId": 1000,
                    "PanelDisplayName": "Home",
                    "ArmedStatus": "armed",
                    "PartialAvalible": true },
                "Locks": [{"Label":"yaledoorman","PanelId":1000,"Serial":"123","Status":"","SoundLevel":2,"AutoLockEnabled":false,"Languages":null}]
            });

            getStatusStub = sinon.stub(client, 'getStatus');
            getStatusStub.resolves(statusResponse);
            parserStub = sinon.stub(parser, 'transformStatusToOutput');
            parserStub.resolves({ "output": "output"});

            site = new Site('email', 'password', 'siteId');
            site._sessionCookie = 'sessionCookie';
        });

        afterEach(function() {
            getStatusStub.restore();
            parserStub.restore();
        });


        it('calls getStatus and transformStatusToOutput on parser', function() {
            return site.status()
                .then(() => {
                    sinon.assert.calledOnce(getStatusStub);
                    sinon.assert.calledOnce(parserStub);
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

    describe('#annexArm', function () {
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
            return site.annexArm('code')
                .then(response => {
                    sinon.assert.calledWith(actStub, 'siteId', 'sessionCookie', 'code', 'ArmAnnex');
                });
        });

        it('calling arm annex, calls act on client and transformActionToOutput on parser', function () {
            return site.annexArm('fake')
                .then(response => {
                    sinon.assert.calledOnce(actStub);
                    sinon.assert.calledOnce(parserStub);
                });
        });
    });

    describe('#annexDisarm', function () {
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
            return site.annexDisarm('code')
                .then(response => {
                    sinon.assert.calledWith(actStub, 'siteId', 'sessionCookie', 'code', 'DisarmAnnex');
                });
        });

        it('calling disarm annex, calls act on client and transformActionToOutput on parser', function () {
            return site.annexDisarm('fake')
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

    describe('#lock', function () {
        var actOnLockStub, parserStub, site;
        
        beforeEach(function() {
            actOnLockStub = sinon.stub(client, 'actOnLock');
            parserStub = sinon.stub(parser, 'transformActionOnLockToOutput');
            actOnLockStub.resolves({ "response": "aresponse"});
            parserStub.resolves({ "output": "output"});
            site = new Site('email', 'password', 'siteId');
            site._sessionCookie = 'sessionCookie';
        });

        afterEach(function() {
            actOnLockStub.restore();
            parserStub.restore();
        });

        it('calling lock, calls actOnLock on client, with correct parameters', function() {
            return site.lock('lockId', 'code')
                .then(response => {
                    sinon.assert.calledWith(actOnLockStub, 'siteId', 'lockId', 'sessionCookie', 'code', 'Lock');
                });
        });

        it('calling lock, calls actOnLock on client and transformActionOnLockToOutput on parser', function () {
            return site.lock('lockId', 'code')
                .then(response => {
                    sinon.assert.calledOnce(actOnLockStub);
                    sinon.assert.calledOnce(parserStub);
                });
        });
    });

    describe('#unlock', function () {
        var actOnLockStub, parserStub, site;
        
        beforeEach(function() {
            actOnLockStub = sinon.stub(client, 'actOnLock');
            parserStub = sinon.stub(parser, 'transformActionOnLockToOutput');
            actOnLockStub.resolves({ "response": "aresponse"});
            parserStub.resolves({ "output": "output"});
            site = new Site('email', 'password', 'siteId');
            site._sessionCookie = 'sessionCookie';
        });

        afterEach(function() {
            actOnLockStub.restore();
            parserStub.restore();
        });

        it('calling unlock, calls actOnLock on client, with correct parameters', function() {
            return site.unlock('lockId', 'code')
                .then(response => {
                    sinon.assert.calledWith(actOnLockStub, 'siteId', 'lockId', 'sessionCookie', 'code', 'Unlock');
                });
        });

        it('calling unlock, calls actOnLock on client and transformActionOnLockToOutput on parser', function () {
            return site.unlock('lockId', 'code')
                .then(response => {
                    sinon.assert.calledOnce(actOnLockStub);
                    sinon.assert.calledOnce(parserStub);
                });
        });
    });

});