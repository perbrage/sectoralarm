'use strict'

var Promise = require('promise');
var jsonMapper = require('json-mapper');
var moment = require('moment');
var SectorAlarmError = require('./sectoralarmerror.js');

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
                armedStatus: function(input) {
                    if (input.Panel.ArmedStatus == 'partialarmed')
                        return 'partialArmed';
                    else
                        return input.Panel.ArmedStatus;
                },
                partialArmingAvailable: function (input) {
                    return input.Panel.PartialAvalible;
                },
                annexArmingAvailable: function (input) {
                    return input.Panel.AnnexAvalible;
                },
                annexArmedStatus: function (input) {
                    return input.Panel.StatusAnnex;
                },
                lastInteractionBy: function(input) {
                    if (input.lastInteractionBy == 'Kod' || input.lastInteractionBy == 'kode')
                    return 'Code';
                else
                    return input.lastInteractionBy;
                },
                lastInteractionTime: function(input) {
                    return moment(input.lastInteractionTime).format('YYYY-MM-DD HH:mm:ss');
                },
                locksAvailable: function(input) {
                    if (input.Locks == undefined || input.Locks.length < 1) {
                        return false;
                    }
                    return true;
                },
                locks: ['Locks', jsonMapper.map(function(input) {
                    return {
                        lockId: input.Serial,
                        //name: input.Label,     //not included in status update, will be fixed in next version with api changes
                        status: input.Status + 'ed',
                        autoLockEnabled: input.AutoLockEnabled
                    }
                })]
            });
            
            try
            {
                var result = converter(JSON.parse(statusJson));
                var json = JSON.stringify(result);
                resolve(json);
            }
            catch(e)
            {
                reject(new SectorAlarmError('ERR_PARSING_ERROR', 'Could not parse the response received from Sector Alarm. See innerError for more details', e));
                return;
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
                        if (input.EventType == 'partialarmed')
                            return 'partialArmed';
                        else if (input.EventType == 'armedannex')
                            return 'armedAnnex';
                        else if (input.EventType == 'disarmedAnnex')
                            return 'disarmedAnnex';
                        else
                            return input.EventType;
                    },
                    user: function(input) {
                        if (input.User == 'Kod' || input.User == 'kode')
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
                var json = JSON.stringify(result);
                resolve(json);
            }
            catch(e) {
                reject(new SectorAlarmError('ERR_PARSING_ERROR', 'Could not parse the response received from Sector Alarm. See innerError for more details', e));
                return;
            }
        });
    }

    transformActionToOutput(actionJson) {
        return new Promise(function(resolve, reject) {

            var converter = jsonMapper.makeConverter({
                status: function(input){
                    return input.status;
                },
                name: function(input) {
                    return input.panelData.PanelDisplayName;
                },
                armedStatus: function(input) {
                    if (input.panelData.ArmedStatus == 'partialarmed')
                        return 'partialArmed';
                    else 
                        return input.panelData.ArmedStatus;
                }
            });
            
            try
            {
                var json = JSON.parse(actionJson);

                if (json.status != 'success') {
                    reject(new SectorAlarmError('ERR_INVALID_CODE', 'Invalid code, could not act upon alarm of the site'));
                    return;
                }

                var result = converter(json);
                var json = JSON.stringify(result);
                resolve(json);
            }
            catch(e)
            {
                reject(new SectorAlarmError('ERR_PARSING_ERROR', 'Could not parse the response received from Sector Alarm. See innerError for more details', e));
                return;
            }
        });
    }

    transformActionOnLockToOutput(actionJson) {
        return new Promise(function(resolve, reject) {

            var converter = jsonMapper.makeConverter({
                status: function(input) {
                    return input.Status;
                }
            });
            
            try
            {
                var json = JSON.parse(actionJson);

                if (json.Status != 'success') {
                    reject(new SectorAlarmError('ERR_INVALID_CODE', 'Invalid code, could not act upon lock of the site'));
                    return;
                }

                var result = converter(json);
                var json = JSON.stringify(result);
                resolve(json);
            }
            catch(e)
            {
                reject(new SectorAlarmError('ERR_PARSING_ERROR', 'Could not parse the response received from Sector Alarm. See innerError for more details', e));
                return;
            }
        });
    }

    transformTemperaturesToOutput(temperaturesJson) {
        return new Promise(function(resolve, reject) {

            var converter = jsonMapper.makeConverter({
                temperatures: [jsonMapper.map({
                    sensorId: function(input) {
                        return input.SerialNo;
                    },
                    name: function(input) {
                            return input.Label;
                    },
                    temperature: function(input) {
                            return input.Temprature;
                    }
                })]
            });

            try
            {
                var result = converter(JSON.parse(temperaturesJson));
                result = result.temperatures;
                var json = JSON.stringify(result);
                resolve(json);
            }
            catch(e) {
                reject(new SectorAlarmError('ERR_PARSING_ERROR', 'Could not parse the response received from Sector Alarm. See innerError for more details', e));
                return;
            }
        });
    }
};

module.exports = new Parser();