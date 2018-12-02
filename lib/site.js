'use strict'

const client = require('./client.js');
const parser = require('./parser.js');

module.exports = class Site {
    constructor(email, password, siteId) {
        this._siteId = siteId;
        this._email = email;
        this._password = password;
        this._status = 'unknown';
        this._annex_status = 'unknown';
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
                .then(info => JSON.stringify(info));
    }

    status() {
        return Promise.resolve()
            .then(() => client.getStatus(this._siteId, this._sessionCookie))
            .then(status => parser.transformStatusToOutput(status))
            .then(status => JSON.stringify(status));
    }

    history(top = 10) {
        return Promise.resolve()
            .then(() => client.getHistory(this._siteId, this._sessionCookie))
            .then(history => parser.transformHistoryToOutput(history, top))
            .then(history => JSON.stringify(history));
    }

    temperatures() {
        return Promise.resolve()
            .then(() => client.getTemperatures(this._siteId, this._sessionCookie))
            .then(temperatures => parser.transformTemperaturesToOutput(temperatures))
            .then(temperatures => JSON.stringify(temperatures));
    }

    locks() {
        return Promise.resolve()
            .then(() => client.getLocks(this._siteId, this._sessionCookie))
            //.then(locks => parser.transformLocksToOutput(locks))
            .then(locks => JSON.stringify(locks));
    }

    cameras() {
        return Promise.resolve()
            .then(() => JSON.stringify([]));
    }

    smartPlugs() {
        return Promise.resolve()
            .then(() => JSON.stringify([]));
    }

    notify(checkIntervalInMs, changedCallback, changedAnnexCallback) {
        setInterval(async function() {
            var status = await this.status();
            var jsonStatus = JSON.parse(status);
            
            if (this._status == 'unknown')
            {
                this._status = jsonStatus.armedStatus;
                if(jsonStatus.annexArmingAvailable && 
                    this._annex_status == 'unknown') 
                {
                    this._annex_status = jsonStatus.annexArmedStatus;
                }
                return;
            }

            if (this._status != jsonStatus.armedStatus)
            {
                this._status = jsonStatus.armedStatus;
                changedCallback(status);
            }

            if(jsonStatus.annexArmingAvailable &&
                this._annex_status != jsonStatus.annexArmedStatus) 
            {
                this._annex_status = jsonStatus.annexArmedStatus;
                changedAnnexCallback(status);
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

    lock(lockId, code) {
        return Promise.resolve()
            .then(() => client.actOnLock(this._siteId, lockId, this._sessionCookie, code, 'Lock'))
            .then(json => parser.transformActionOnLockToOutput(json));
    }

    unlock(lockId, code) {
        return Promise.resolve()
            .then(() => client.actOnLock(this._siteId, lockId, this._sessionCookie, code, 'Unlock'))
            .then(json => parser.transformActionOnLockToOutput(json));
    }
};