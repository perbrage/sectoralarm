'use strict'

var Promise = require('promise');
var jsonMapper = require('json-mapper');
var moment = require('moment');

class Parser {

    transformStatusToOutput(statusJson) {
        return new Promise(function(resolve, reject) {

            var converter = jsonMapper.makeConverter({
                siteId: function(input){
                    return input.Panel.PanelId;
                },
                name: function(input) {
                    return input.Panel.PanelDisplayName;
                },
                armedStatus: function(input){
                    return input.Panel.ArmedStatus;
                },
                partialArmingAvailabile: function (input) {
                    return input.Panel.PartialAvalible;
                },
                user: function(input){
                    return input.user;
                }

            });
            
            try
            {
                var result = converter(JSON.parse(statusJson));
                resolve(result);
            }
            catch(e)
            {
                var error = new Error("Could not parse the response, report as a bug on github");
                error.code = "ERR_PARSING_ERROR";
                reject(error);
            }
        });
    }

    transformHistoryToOutput(historyJson, top) {
        return new Promise(function(resolve, reject) {

            var converter = jsonMapper.makeConverter({
                events: ['LogDetails', jsonMapper.map({
                    time: function(input){
                        return moment(input.Time).format('YYYY-MM-DD HH:mm:ss');
                    },
                    action: function(input) {
                        return input.EventType;
                    },
                    user: function(input) {
                        if (input.User == 'Kod')
                            return 'Code';
                        else
                            return input.User;
                    }
                })]
            });
            
            try
            {
                var result = converter(JSON.parse(historyJson));
                result = result.events.slice(0, top);
                resolve(result);
            }
            catch(e) {
                var error = new Error("Could not parse the response, report as a bug on github");
                error.code = "ERR_PARSING_ERROR";
                reject(error);
            }

        });
    }
};

module.exports = new Parser();