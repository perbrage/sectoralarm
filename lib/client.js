'use strict'

var https = require('https');
var Promise = require('promise');

class Client {
    constructor() {
        this._sectoralarmsite = 'mypagesapi.sectoralarm.net';
    }

    login(email, password, cookies) {
        
        var content = '';
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
                    var error = new Error('Invalid login credentials, or account is locked out');
                    error.code = "ERR_INVALID_CREDENTIALS";
                    reject(error);
                }

                response.on("data", function (chunk) {
                    content += chunk;
                });
                
                response.on("end", function () {
                    resolve(response.headers['set-cookie']);
                 });
            });

            request.on("error", function (e) {
                var error = new Error("Communication with Sector Alarm failed. Report as a bug on Github");
                error.code = "ERR_COMMUNICATION_ERROR";
                reject(error);
            });

            request.write(formdata);
            request.end();
        });
    }

    getCookies() {
        var content = '';
        
        var options = {
            host: this._sectoralarmsite,
            port: 443,
            path: '/User/Login',
            method: 'HEAD'
        };

        return new Promise(function(resolve, reject) {
            var request = https.request(options, function(response) {
                resolve(response.headers['set-cookie']);
            });

            request.on('error', function(e) {
                var error = new Error("Communication with Sector Alarm failed. Report as a bug on Github");
                error.code = "ERR_COMMUNICATION_ERROR";
                reject(error);
            });

            request.end();
        });
    }

    getStatus(siteId, sessionCookie) {

        var content = '';

        var payload = JSON.stringify({
            "PanelId": siteId
        });

        var options = {
            host: this._sectoralarmsite,
            port: 443,
            path: '/Panel/GetOverview/',
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
            var request = https.request(options, function(response) {

                if (response.statusCode == 401) {
                    var error = new Error('Invalid session, please re-login');
                    error.code = "ERR_INVALID_SESSION";
                    reject(error);
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
                var error = new Error("Communication with Sector Alarm failed. Report as a bug on Github");
                error.code = "ERR_COMMUNICATION_ERROR";
                reject(error);
            });

            request.write(payload);
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
                    var error = new Error('Invalid session, please re-login');
                    error.code = "ERR_INVALID_SESSION";
                    reject(error);
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
                var error = new Error("Communication with Sector Alarm failed. Report as a bug on Github");
                error.code = "ERR_COMMUNICATION_ERROR";
                reject(error);
            });

            request.end();
        });
    }

    act(siteId, sessionCookie, code, command) {
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
            var request = https.request(options, function(response) {

                if (response.statusCode == 401) {
                    var error = new Error('Invalid session, please re-login');
                    error.code = "ERR_INVALID_SESSION";
                    reject(error);
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
                var error = new Error("Communication with Sector Alarm failed. Report as a bug on Github");
                error.code = "ERR_COMMUNICATION_ERROR";
                reject(error);
            });

            request.write(payload);
            request.end();
        });
    }
};

module.exports = new Client();