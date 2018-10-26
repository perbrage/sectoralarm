'use strict'

const client = require('./client.js');
const parser = require('./parser.js');

module.exports = class Site {
    constructor(email, password, siteId) {
        this._siteId = siteId;
        this._email = email;
        this._password = password;

        this._status = 'unknown';
    }

    login() {
        return Promise.resolve()
            .then(() => client.getCookies())
            .then(cookies => client.login(this._email, this._password, cookies))
            .then(sessionCookie => {
                this._sessionCookie = sessionCookie;
                return sessionCookie;
            });
    }

    status() {
        return Promise.all([client.getStatus(this._siteId, this._sessionCookie), this.history(1)])
            .then(info => {
                var json = JSON.parse(info[0]);
                json.user = info[1][0].user;
                return JSON.stringify(json);
            })
            .then(json => parser.transformStatusToOutput(json));

    }

    history(top = 10) {
        return Promise.resolve()
            .then(() => client.getHistory(this._siteId, this._sessionCookie))
            .then(json => parser.transformHistoryToOutput(json, top));
    }

    temperatures() {
        return Promise.resolve()
            .then(() => client.getTemperatures(this._siteId, this._sessionCookie))
            .then(json => parser.transformTemperaturesToOutput(json));
    }

    notify(checkIntervalInMs, changedCallback) {
        setInterval(async function() {
            var status = await this.status();

            if (this._status == 'unknown')
            {
                this._status = status.armedStatus;
                return;
            }

            if (this._status != status.armedStatus)
            {
                this._status = status.armedStatus;
                changedCallback(status);
            }

        }.bind(this), checkIntervalInMs);
    }   

    arm(code) {
        return Promise.resolve()
            .then(() => client.act(this._siteId, this._sessionCookie, code, 'Total'))
            .then(json => parser.transformActionToOutput(json));
    }

    partialArm(code) {
        return Promise.resolve()
            .then(() => client.act(this._siteId, this._sessionCookie, code, 'Partial'))
            .then(json => parser.transformActionToOutput(json));

    }

    annexArm(code) {
        return Promise.resolve()
            .then(() => client.act(this._siteId, this._sessionCookie, code, 'ArmAnnex'))
            .then(json => parser.transformActionToOutput(json));

    }

    disarm(code) {
        return Promise.resolve()
            .then(() => client.act(this._siteId, this._sessionCookie, code, 'Disarm'))
            .then(json => parser.transformActionToOutput(json));
    }

    annexDisarm(code) {
        return Promise.resolve()
            .then(() => client.act(this._siteId, this._sessionCookie, code, 'DisarmAnnex'))
            .then(json => parser.transformActionToOutput(json));
    }
};