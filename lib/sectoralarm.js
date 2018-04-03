'use strict'

const Site = require('./site.js');

class SectorAlarm {
    connect(email, password, siteId) {

        var site = this._createSite(email, password, siteId);
        
        return site.login()
            .then(() => {
                return site;
            });
    }

    _createSite(email, password, siteId) {
        return new Site(email, password, siteId);
    };
};

module.exports = new SectorAlarm();
