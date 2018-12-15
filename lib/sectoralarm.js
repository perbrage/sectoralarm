'use strict'

const Site = require('./site.js');
var Settings = require("./settings.js");
var SectorAlarmError = require('./sectoralarmerror.js');

class SectorAlarm {

    connect(email, password, siteId, settings) {

        if (settings != undefined) {
            if (!(settings instanceof Settings)) {
                throw new SectorAlarmError('ERR_INVALIDSETTINGS', 'Settings argument is not of the correct type');
            } 
        } else {
            settings = new Settings();
        }

        var site = this._createSite(email, password, siteId, settings);
        
        return site.login()
            .then(() => {
                return site;
            });
    }

    _createSite(email, password, siteId, settings) {
        return new Site(email, password, siteId, settings);
    };
};

module.exports = new SectorAlarm();
