'use strict'

const Site = require('./site.js');

class SectorAlarm {
    connect(email, password, siteId) {

        var site = new Site(email, password, siteId);
        
        return site.login()
            .then(() => {
                return site;
            });
    }
};

module.exports = new SectorAlarm();
