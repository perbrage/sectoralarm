'use strict'

const client = require('./client.js');
const parser = require('./parser.js');
const Settings = require("./settings.js");

module.exports = class Site {
    constructor(email, password, siteId, settings) {
        this._siteId = siteId;
        this._email = email;
        this._password = password;
        this._status = 'unknown';
        this._annex_status = 'unknown';

        if (settings != undefined) {
            this._settings = settings;
        } else {
            this._settings = new Settings();
        }
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

    info() {
        return Promise.resolve()
            .then(() => client.getStatus(this._siteId, this._sessionCookie))
                .then(info => parser.transformInfoToOutput(info))
                .then(info => this.formatOutput(info));
    }

    status() {
        return Promise.resolve()
            .then(() => client.getStatus(this._siteId, this._sessionCookie))
            .then(status => parser.transformStatusToOutput(status))
            .then(status => this.formatOutput(status));
    }

    history(top = 10) {
        return Promise.resolve()
            .then(() => client.getHistory(this._siteId, this._sessionCookie))
            .then(history => parser.transformHistoryToOutput(history, top))
            .then(history => this.formatOutput(history));
    }

    temperatures() {
        return Promise.resolve()
            .then(() => client.getTemperatures(this._siteId, this._sessionCookie))
            .then(temperatures => parser.transformTemperaturesToOutput(temperatures))
            .then(temperatures => this.formatOutput(temperatures));
    }

    locks() {
        return Promise.resolve()
            .then(() => client.getLocks(this._siteId, this._sessionCookie))
            .then(locks => parser.transformLocksToOutput(locks))
            .then(locks => this.formatOutput(locks));
    }

    cameras() {
        return Promise.resolve()
            .then(() => this.formatOutput([]));
    }

    smartPlugs() {
        return Promise.resolve()
            .then(() => this.formatOutput([]));
    }

    notify(checkIntervalInMs, changedCallback, changedAnnexCallback) {
        setInterval(async function() {
            var status = await this.status();
            var jsonStatus = JSON.parse(status);
            
            if (this._status == 'unknown')
            {
                this._status = jsonStatus.armedStatus;
                if (this._annex_status == 'unknown') 
                {
                    this._annex_status = jsonStatus.annexArmedStatus;
                }
                return;
            }

            if (this._status != jsonStatus.armedStatus)
            {
                this._status = jsonStatus.armedStatus;
                var formated = this.formatOutput(status);
                changedCallback(formated);
            }

            if (this._annex_status != jsonStatus.annexArmedStatus) 
            {
                this._annex_status = jsonStatus.annexArmedStatus;
                var formated = this.formatOutput(status);
                changedAnnexCallback(formated);
            }  

        }.bind(this), checkIntervalInMs);
    }   

    arm(code) {
        return Promise.resolve()
            .then(() => client.act(this._siteId, this._sessionCookie, code, 'Total'))
            .then(action => parser.transformActionToOutput(action))
            .then(action => this.formatOutput(action));
    }

    partialArm(code) {
        return Promise.resolve()
            .then(() => client.act(this._siteId, this._sessionCookie, code, 'Partial'))
            .then(action => parser.transformActionToOutput(action))
            .then(action => this.formatOutput(action));

    }

    annexArm(code) {
        return Promise.resolve()
            .then(() => client.act(this._siteId, this._sessionCookie, code, 'ArmAnnex'))
            .then(action => parser.transformActionToOutput(action))
            .then(action => this.formatOutput(action));

    }

    disarm(code) {
        return Promise.resolve()
            .then(() => client.act(this._siteId, this._sessionCookie, code, 'Disarm'))
            .then(action => parser.transformActionToOutput(action))
            .then(action => this.formatOutput(action));
    }

    annexDisarm(code) {
        return Promise.resolve()
            .then(() => client.act(this._siteId, this._sessionCookie, code, 'DisarmAnnex'))
            .then(action => parser.transformActionToOutput(action))
            .then(action => this.formatOutput(action));
    }

    lock(lockId, code) {
        return Promise.resolve()
            .then(() => client.actOnLock(this._siteId, lockId, this._sessionCookie, code, 'Lock'))
            .then(action => parser.transformActionOnLockToOutput(action))
            .then(action => this.formatOutput(action));

    }

    unlock(lockId, code) {
        return Promise.resolve()
            .then(() => client.actOnLock(this._siteId, lockId, this._sessionCookie, code, 'Unlock'))
            .then(action => parser.transformActionOnLockToOutput(action))
            .then(action => this.formatOutput(action));
    }

    formatOutput(output) {
        return Promise.resolve()
            .then(() => {
                if (this._settings.jsonOutput == true) {
                    return JSON.stringify(output);
                }

                return output;
            })
        }
};