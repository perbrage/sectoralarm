'use strict'

var https = require('https');
var Promise = require('promise');
var SectorAlarmError = require('./sectoralarmerror.js');

class Client {
    constructor(settings) {
        this._sectoralarmsite = "mypagesapi.sectoralarm.net";
        this._settings = settings;
    }

    snooze = ms => new Promise(resolve => setTimeout(resolve, ms));

    getMetadata() {
        var client = this;
        var content = '';
        var options = {
            host: this._sectoralarmsite,
            port: 443,
            path: '/User/Login',
            method: 'GET'
        };

        return new Promise(function(resolve, reject) {
            var request = https.request(options, function(response) {
                response.setEncoding("utf8");
                response.on("data", function (chunk) {
                    content += chunk;
                });
                
                response.on("end", function () {
                    var cookie = response.headers['set-cookie'];
                    var output = { "version" : client._extractVersion(content), "cookie": cookie };
                    resolve(output);
                });
            });

            request.on('error', function(e) {
                reject(new SectorAlarmError('ERR_COMMUNICATION_ERROR', 'Communication with Sector Alarm failed. See innerError for details', e));
            });

            request.end();
        });
    }

    _extractVersion(content) {
        var startPosition = content.search("/Scripts/main.js?");
        var modifiedContent = content.slice(startPosition+17);
        var endPosition = modifiedContent.search("\"");
        var version = modifiedContent.slice(0, endPosition);
        return version;
    }

    login(email, password, cookies) {
        
        var formdata = 'userID=' + email + '&password=' + password;

        var options = {
            host: this._sectoralarmsite,
            port: 443,
            path: '/User/Login?ReturnUrl=%2f',
            method: 'POST',
            headers: {
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
                'Accept-Encoding': 'gzip, deflate, br',
                'Accept-Language': 'en-US,en;q=0.9,sv;q=0.8',
                'Cache-Control': 'max-age=0',
                'Connection': 'keep-alive',
                'Cookie': cookies,
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(formdata),
                'Upgrade-Insecure-Requests' : 1,
                'User-Agent' : 'Safari/537.36'
            }
        };

        return new Promise(function(resolve, reject) {
            
            var request = https.request(options, function(response) {
                response.setEncoding("utf8");

                if (response.statusCode != 302) {
                    reject(new SectorAlarmError('ERR_INVALID_CREDENTIALS', 'Invalid login credentials, or account is locked out'));
                }

                response.on("data", function () {
                });
                
                response.on("end", function () {
                    if (response.headers['set-cookie']!=undefined) {
                        var output = response.headers['set-cookie'][0]; 
                        resolve(output);
                    } else {
                        resolve("");
                    }
                    
                 });
            });

            request.on("error", function (e) {
                reject(new SectorAlarmError('ERR_COMMUNICATION_ERROR', 'Communication with Sector Alarm failed. See innerError for details', e));
            });

            request.write(formdata);
            request.end();
        });
    }

    getStatus(siteId, sessionCookie, version, retry = this._settings.numberOfRetries) {
        var client = this;
        var content = '';
        var payload = JSON.stringify({
            "id": siteId,
            "Version": version
        });

        var options = {
            host: this._sectoralarmsite,
            port: 443,
            path: '/Panel/GetOverview/',
            method: 'POST',
            headers: {
                'accept': 'application/json, text/plain, */*',
                'accept-Encoding': 'gzip, deflate, br',
                'accept-Language': 'en-US,en;q=0.9',
                'cache-Control': 'max-age=0',
                'content-Type': 'application/json;charset=UTF-8',
                'content-Length': Buffer.byteLength(payload),
                'cookie': sessionCookie,
                'origin': 'https://mypagesapi.sectoralarm.net',
                'referer': 'https://mypagesapi.sectoralarm.net/',
                'sec-ch-ua': '" Not;A Brand";v="99", "Google Chrome";v="91", "Chromium";v="91"',
                'sec-ch-ua-mobile': '?0',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-origin',
                'user-agent' : 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.101 Safari/537.36'

            }
        };

        return new Promise(function(resolve, reject) {
            
            const requestWithRetry = (siteId, sessionCookie, version, retry) => {

                var request = https.request(options, async function(response) {

                    if (response.statusCode == 401) {
                        if (retry != 0) {
                            await client.snooze(client._settings.retryDelayInMs);
                            retry--;
                            requestWithRetry(siteId, sessionCookie, version, retry);
                            return;
                        } else {
                            reject(new SectorAlarmError('ERR_INVALID_SESSION', 'Invalid session, please re-login'));
                        }
                    }

                    response.setEncoding("utf8");
                    response.on("data", function (chunk) {
                        content += chunk;
                    });
                    
                    response.on("end", function () {
                        resolve(content);
                    });
                });
                
                request.on("error", function (e) {
                    reject(new SectorAlarmError('ERR_COMMUNICATION_ERROR', 'Communication with Sector Alarm failed. See innerError for details', e));
                });

                request.write(payload);
                request.end();
            }

            return requestWithRetry(siteId, sessionCookie, version, retry);

        });
    }

    getLocks(siteId, sessionCookie) {
        var content = '';

        var options = {
            host: this._sectoralarmsite,
            port: 443,
            path: '/Locks/GetLocks/?WithStatus=true&id=' + siteId,
            method: 'GET',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Accept-Encoding': 'gzip, deflate, br',
                'Accept-Language': 'en-US,en;q=0.9,sv;q=0.8',
                'Cache-Control': 'max-age=0',
                'Connection': 'keep-alive',
                'Cookie': sessionCookie,
                'User-Agent' : 'Safari/537.36'
            }
        };

        return new Promise(function(resolve, reject) {
            var request = https.request(options, function(response) {

                if (response.statusCode == 401) {
                    reject(new SectorAlarmError('ERR_INVALID_SESSION', 'Invalid session, please re-login'));
                }

                if (response.statusCode == 500) {
                    // In the case of locks, when trying to get it for some reason Sector alarm sends out a 500 if you don't have any locks
                    resolve(JSON.stringify([]));
                }

                response.setEncoding("utf8");
                response.on("data", function (chunk) {
                    content += chunk;
                });
                
                response.on("end", function () {
                    resolve(content);
                 });
            });

            request.on("error", function (e) {
                reject(new SectorAlarmError('ERR_COMMUNICATION_ERROR', 'Communication with Sector Alarm failed. See innerError for details', e));
            });

            request.end();
        });
    }

    getHistory(siteId, sessionCookie) {
        var content = '';

        var options = {
            host: this._sectoralarmsite,
            port: 443,
            path: '/Panel/GetPanelHistory/' + siteId,
            method: 'GET',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Accept-Encoding': 'gzip, deflate, br',
                'Accept-Language': 'en-US,en;q=0.9,sv;q=0.8',
                'Cache-Control': 'max-age=0',
                'Connection': 'keep-alive',
                'Cookie': sessionCookie,
                'User-Agent' : 'Safari/537.36'
            }
        };

        return new Promise(function(resolve, reject) {
            var request = https.request(options, function(response) {

                if (response.statusCode == 401) {
                    reject(new SectorAlarmError('ERR_INVALID_SESSION', 'Invalid session, please re-login'));
                }

                response.setEncoding("utf8");
                response.on("data", function (chunk) {
                    content += chunk;
                });
                
                response.on("end", function () {

                    if (content.indexOf("<!DOCTYPE html>")>0) {
                        reject(new SectorAlarmError('ERR_COMMUNICATION_ERROR', 'Communication with Sector Alarm failed. This error is often due to problems on sector alarm servers. No additional information'));
                    }

                    resolve(content);
                 });
            });

            request.on("error", function (e) {
                reject(new SectorAlarmError('ERR_COMMUNICATION_ERROR', 'Communication with Sector Alarm failed. See innerError for details', e));
            });

            request.end();
        });
    }

    getTemperatures(siteId, sessionCookie, version) {
        
        var payload = JSON.stringify({
            "id": siteId,
            "Version": version
        });

        var content = '';

        var options = {
            host: this._sectoralarmsite,
            port: 443,
            path: '/Panel/GetTempratures/',
            method: 'POST',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Accept-Encoding': 'gzip, deflate, br',
                'Accept-Language': 'en-US,en;q=0.9,sv;q=0.8',
                'Content-Type': 'application/json;charset=UTF-8',
                'Content-Length': Buffer.byteLength(payload),                
                'Cache-Control': 'max-age=0',
                'Connection': 'keep-alive',
                'Cookie': sessionCookie,
                'User-Agent' : 'Safari/537.36'
            }
        };

        return new Promise(function(resolve, reject) {
            var request = https.request(options, function(response) {

                if (response.statusCode == 401) {
                    reject(new SectorAlarmError('ERR_INVALID_SESSION', 'Invalid session, please re-login'));
                }

                response.setEncoding("utf8");
                response.on("data", function (chunk) {
                    content += chunk;
                });
                
                response.on("end", function () {

                    if (content.indexOf("<!DOCTYPE html>")>0) {
                        reject(new SectorAlarmError('ERR_COMMUNICATION_ERROR', 'Communication with Sector Alarm failed. This error is often due to problems on sector alarm servers. No additional information'));
                    }

                    resolve(content);
                 });
            });

            request.on("error", function (e) {
                reject(new SectorAlarmError('ERR_COMMUNICATION_ERROR', 'Communication with Sector Alarm failed. See innerError for details', e));
            });

            request.write(payload);
            request.end();
        });
    }

    act(siteId, sessionCookie, code, command, retry = this._settings.numberOfRetries) {
        var client = this;
        var content = '';

        var payload = JSON.stringify({
            "ArmCmd": command,
            "PanelCode": code,
            "HasLocks": false,
            "id": siteId
        });

        var options = {
            host: this._sectoralarmsite,
            port: 443,
            path: '/Panel/ArmPanel/',
            method: 'POST',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Accept-Encoding': 'gzip, deflate, br',
                'Accept-Language': 'en-US,en;q=0.9,sv;q=0.8',
                'Cache-Control': 'max-age=0',
                'Content-Type': 'application/json;charset=UTF-8',
                'Content-Length': Buffer.byteLength(payload),
                'Connection': 'keep-alive',
                'Cookie': sessionCookie,
                'User-Agent' : 'Safari/537.36'
            }
        };

        return new Promise(function(resolve, reject) {

            if (command != 'Disarm' && command != 'Total' && command != 'Partial' && command != 'ArmAnnex' && command != 'DisarmAnnex') {
                reject(new SectorAlarmError('ERR_INVALID_COMMAND','Invalid command sent to act on site. Should be Disarm, Total, Partial, ArmAnnex or DisarmAnnex'));
                return;
            }

            const requestWithRetry = (siteId, sessionCookie, code, command, retry) => {

                var request = https.request(options, async function(response) {

                    if (response.statusCode == 401) {
                        if (retry != 0) {
                            await client.snooze(client._settings.retryDelayInMs);
                            retry--;
                            requestWithRetry(siteId, sessionCookie, code, command, retry);
                            return;
                        } else {
                            reject(new SectorAlarmError('ERR_INVALID_SESSION', 'Invalid session, please re-login'));
                        }
                    }

                    response.setEncoding("utf8");
                    response.on("data", function (chunk) {
                        content += chunk;
                    });
                    
                    response.on("end", function () {

                        if (content.indexOf("<!DOCTYPE html>")>0) {
                            reject(new SectorAlarmError('ERR_COMMUNICATION_ERROR', 'Communication with Sector Alarm failed. This error is often due to problems on sector alarm servers. No additional information'));
                        }

                        resolve(content);
                    });
                });

                request.on("error", function (e) {
                    reject(new SectorAlarmError('ERR_COMMUNICATION_ERROR', 'Communication with Sector Alarm failed. See innerError for details', e));
                });

                request.write(payload);
                request.end();
            }

            return requestWithRetry(siteId, sessionCookie, code, command, retry);
        });
    }

    actOnLock(siteId, lockId, sessionCookie, code, command) {
        var content = '';

        var payload = JSON.stringify({
            "id": siteId,
            "LockSerial": lockId,
            "DisarmCode": code
        });

        var options = {
            host: this._sectoralarmsite,
            port: 443,
            method: 'POST',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Accept-Encoding': 'gzip, deflate, br',
                'Accept-Language': 'en-US,en;q=0.9,sv;q=0.8',
                'Cache-Control': 'max-age=0',
                'Content-Type': 'application/json;charset=UTF-8',
                'Content-Length': Buffer.byteLength(payload),
                'Connection': 'keep-alive',
                'Cookie': sessionCookie,
                'User-Agent' : 'Safari/537.36'
            }
        };

        return new Promise(function(resolve, reject) {

            if (command == 'Lock') {
                options.path = '/Locks/Lock';
            } else if (command == 'Unlock') {
                options.path = '/Locks/Unlock';
            } else {
                reject(new SectorAlarmError('ERR_INVALID_COMMAND','Invalid command sent to act on lock for site. Should be Lock or Unlock'));
                return;
            }

            var request = https.request(options, function(response) {

                if (response.statusCode == 401) {
                    reject(new SectorAlarmError('ERR_INVALID_SESSION', 'Invalid session, please re-login'));
                }

                response.setEncoding("utf8");
                response.on("data", function (chunk) {
                    content += chunk;
                });
                
                response.on("end", function () {

                    if (content.indexOf("<!DOCTYPE html>")>0) {
                        reject(new SectorAlarmError('ERR_COMMUNICATION_ERROR', 'Communication with Sector Alarm failed. This error is often due to problems on sector alarm servers. No additional information'));
                    }

                    resolve(content);
                 });
            });

            request.on("error", function (e) {
                reject(new SectorAlarmError('ERR_COMMUNICATION_ERROR', 'Communication with Sector Alarm failed. See innerError for details', e));
            });

            request.write(payload);
            request.end();
        });
    }
};

module.exports = Client;