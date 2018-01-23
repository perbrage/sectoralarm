'use strict'

var Promise = require('promise');
var jsonMapper = require('json-mapper');
var moment = require('moment');

class Parser {

    transformStatusToOutput(statusJson) {
        return new Promise(function(fulfill, reject) {

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
            
            var result = converter(JSON.parse(statusJson));

            fulfill(result);
        });
    }

    transformHistoryToOutput(historyJson, top) {
        return new Promise(function(fulfill, reject) {

            var converter = jsonMapper.makeConverter({
                events: ['LogDetails', jsonMapper.map({
                    time: function(input){
                        return moment(input.Time).format('YYYY-MM-DD HH:mm:ss');
                    },
                    action: function(input) {
                        return input.EventType;
                    },
                    user: function(input){
                        return input.User;
                    }
                })]
            });
            
            var result = converter(JSON.parse(historyJson));
            result = result.events.slice(0, top);

            fulfill(result);
        });
    }
};

module.exports = new Parser();