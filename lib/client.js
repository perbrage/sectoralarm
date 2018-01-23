'use strict'

var https = require('https');
var Promise = require('promise');
var parser = require('./parser.js')

class Client {

    login(email, password, cookies) {
        
        var content = '';
        var formdata = 'userID=' + email + '&password=' + password;

        var options = {
            host: 'minasidor.sectoralarm.se',
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

        return new Promise(function(fulfill, reject) {
            var req = https.request(options, function(res) {
                res.setEncoding("utf8");
                res.on("data", function (chunk) {
                    content += chunk;
                });
                
                res.on("end", function () {
                    fulfill(res.headers['set-cookie']);
                 });

                 res.on("error", function (error) {
                     reject(error);
                 });
    
            });

            req.write(formdata);
            req.end();
        });
    }

    getLoginPage() {
        var content = '';
        
        var options = {
            host: 'minasidor.sectoralarm.se',
            port: 443,
            path: '/User/Login',
            method: 'HEAD'
        };

        return new Promise(function(fulfill, reject) {
            var req = https.request(options, function(res) {
                fulfill(res.headers['set-cookie']);
            });
    
            req.end();
        });
    }

    status(siteid, sessionCookie) {

        var content = '';
        var payload = '{"PanelId": "' + siteid + '"}';

        var options = {
            host: 'minasidor.sectoralarm.se',
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

        return new Promise(function(fulfill, reject) {
            var req = https.request(options, function(res) {
                res.setEncoding("utf8");
                res.on("data", function (chunk) {
                    content += chunk;
                });
                
                res.on("end", function () {
                    fulfill(content);
                 });

                res.on("error", function (error) {
                     reject(error);
                 });
    
            });

            req.write(payload);
            req.end();
        });
    }

    history(siteid, sessionCookie) {
        var content = '';

        var options = {
            host: 'minasidor.sectoralarm.se',
            port: 443,
            path: '/Panel/GetPanelHistory/' + siteid,
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

        return new Promise(function(fulfill, reject) {
            var req = https.request(options, function(res) {
                res.setEncoding("utf8");
                res.on("data", function (chunk) {
                    content += chunk;
                });
                
                res.on("end", function () {
                    fulfill(content);
                 });

                 res.on("error", function (error) {
                     reject(error);
                 });
    
            });

            req.end();
        });

    }
};

module.exports = new Client();