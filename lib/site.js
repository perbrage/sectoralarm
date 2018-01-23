'use strict'

const client = require('./client.js');
const parser = require('./parser.js');

module.exports = class Site {
    constructor(siteId, sessionCookie) {
        this._siteId = siteId;
        this._sessionCookie = sessionCookie;

        this._status = 'unknown';
    }

    status() {
        return Promise.resolve()
            .then(() => client.status(this._siteId, this._sessionCookie))
            .then(async (status) =>  {
                var history = await this.history(1);
                return { "status": status, "history": history[0] };
            })
            .then((info) => {
                var json = JSON.parse(info.status);
                json.user = info.history.user;
                return JSON.stringify(json);
            })
            .then((json) => parser.transformStatusToOutput(json));
    }

    history(top = 10) {
        return Promise.resolve()
            .then(() => client.history(this._siteId, this._sessionCookie))
            .then((json) => parser.transformHistoryToOutput(json, top));
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
    
};