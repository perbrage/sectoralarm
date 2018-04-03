var Site = require('../lib/site.js');
var assert = require('chai').assert;
var expect = require('chai').expect;
const sinon = require('sinon');
const sectoralarm = require('../lib/sectoralarm.js');

describe('sectoralarm.js', function() {

    describe('#connect', function () {

        var createSiteStub;
        var siteStub;

        beforeEach(function() {
            
            siteStub = sinon.createStubInstance(Site);
            siteStub._email = 'email';
            siteStub._password = 'password';
            siteStub._siteId = 'siteId';
        
            siteStub.login.resolves();
            createSiteStub = sinon.stub(sectoralarm, '_createSite');
            createSiteStub.returns(siteStub);
            
        });

        afterEach(function() {
            createSiteStub.restore();
            siteStub.login.restore();
        });

        it('When called, returns promise with site object', function() {
            return sectoralarm.connect('email', 'password', 'siteId')
                .then(site => {
                    expect(site).is.not.undefined;
                });
        });

        it('Calls login on site object', function () {
            return sectoralarm.connect('email', 'password', 'siteId')
                .then(site => {
                    sinon.assert.calledOnce(siteStub.login);
                });
        });
    });
});