'use strict'

const client = require('./client.js');
const parser = require('./parser.js');
const Site = require('./site.js');

class SectorAlarm {

    connect(email, password, siteId) {

        var cookies;
        this._email = email;
        this._password = password;

        return this.relogin()
            .then((sessionCookie) => {
                return new Site(siteId, sessionCookie);
            })
            .catch((error) => {
                console.log('An internal error occured somewhere')
                console.log(error);
            });
    }

    relogin() {
        return Promise.resolve()
            .then(client.getLoginPage)
            .then((cookies) => client.login(this._email, this._password, cookies));
    }
};

module.exports = new SectorAlarm();
