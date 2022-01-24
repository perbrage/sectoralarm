'use strict'

class Settings {
    constructor() {
        this.jsonOutput = true;
        this.numberOfRetries = 3;
        this.retryDelayInMs = 3000;
    }
}

module.exports = Settings;