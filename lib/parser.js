'use strict'

var Promise = require('promise');
var jsonMapper = require('json-mapper');
var moment = require('moment');
var SectorAlarmError = require('./sectoralarmerror.js');

class Parser {
    constructor() {
        this._codeTranslation = ["KOD", "KODE"];
    }

    translateCode(codeValue) {
        if (this._codeTranslation.includes(codeValue.toUpperCase())) {
            return "code";
        }

        return codeValue;
    }

    transformInfoToOutput(infoJson) {
        return new Promise(function(resolve, reject) {

            var converter = jsonMapper.makeConverter({
                siteId: function(input){
                    return input.Panel.PanelId;
                },
                name: function(input) {
                    return input.Panel.PanelDisplayName;
                },
                partialArmingAvailable: function (input) {
                    return input.Panel.PartialAvalible;
                },
                annexArmingAvailable: function (input) {
                    return input.Panel.AnnexAvalible;
                },
                locksAvailable: function(input) {
                    if (input.Locks == undefined || input.Locks.length < 1) {
                        return false;
                    }
                    return true;
                },
                smartPlugsAvailable: function(input) {
                    if (input.Smartplugs == undefined || input.Smartplugs.length < 1) {
                        return false;
                    }
                    return true;
                },
                temperaturesAvailable: function(input) {
                    if (input.Temperatures == undefined || input.Temperatures.length < 1) {
                        return false;
                    }
                    return true;
                },
                camerasAvailable: function(input) {
                    if (input.Cameras == undefined || input.Cameras.length < 1) {
                        return false;
                    }
                    return true;
                },                
                locks: ['Locks', jsonMapper.map(function(input) {
                    return {
                        lockId: input.Serial,
                        name: input.Label,
                        autoLockEnabled: input.AutoLockEnabled
                    }
                })],
                temperatures: ['Temperatures', jsonMapper.map(function(input) {
                    return {
                    }
                })],                
                smartPlugs: ['Smartplugs', jsonMapper.map(function(input) {
                    return {
                    }
                })],                
                cameras: ['Cameras', jsonMapper.map(function(input) {
                    return {
                    }
                })]                
            });
            
            try
            {
                var result = converter(JSON.parse(infoJson));
                resolve(result);
            }
            catch(e)
            {
                if (infoJson == '"INVALID_VERSION"')
                    return reject(new SectorAlarmError('ERR_INVALID_VERSION', "Invalid version was detected. A restart helps to resolve this", e));

                return reject(new SectorAlarmError('ERR_PARSING_ERROR', 'Could not parse the response received from Sector Alarm. See innerError for more details', e));
            }
        });
    }


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
                annexArmedStatus: function (input) {
                    return input.Panel.StatusAnnex;
                }
            });
            
            try
            {
                var result = converter(JSON.parse(statusJson));
                resolve(result);
            }
            catch(e)
            {
                if (statusJson == '"INVALID_VERSION"')
                    return reject(new SectorAlarmError('ERR_INVALID_VERSION', "Invalid version was detected. A restart helps to resolve this", e));

                return reject(new SectorAlarmError('ERR_PARSING_ERROR', 'Could not parse the response received from Sector Alarm. See innerError for more details', e, statusJson));
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
                resolve(result);
            }
            catch(e) {
                return reject(new SectorAlarmError('ERR_PARSING_ERROR', 'Could not parse the response received from Sector Alarm. See innerError for more details', e));
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
                resolve(result);
            }
            catch(e)
            {
                return reject(new SectorAlarmError('ERR_PARSING_ERROR', 'Could not parse the response received from Sector Alarm. See innerError for more details', e));
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
                resolve(result);
            }
            catch(e)
            {
                return reject(new SectorAlarmError('ERR_PARSING_ERROR', 'Could not parse the response received from Sector Alarm. See innerError for more details', e));
            }
        });
    }

    transformTemperaturesToOutput(temperaturesJson, sensorId) {
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
                if (sensorId != undefined) {
                    result = result.filter(entry => {
                        return entry.sensorId === sensorId;
                    });
                }
                resolve(result);
            }
            catch(e) {
                if (temperaturesJson == '"INVALID_VERSION"')
                    return reject(new SectorAlarmError('ERR_INVALID_VERSION', "Invalid version was detected. A restart helps to resolve this", e));

                return reject(new SectorAlarmError('ERR_PARSING_ERROR', 'Could not parse the response received from Sector Alarm. See innerError for more details', e));
            }
        });
    }

    transformLocksToOutput(locksJson, lockId) {
        return new Promise(function(resolve, reject) {

            var objectConverter = jsonMapper.makeConverter({
                    lockId: function(input) {
                        return input.Serial;
                    },
                    status: function(input) {
                        return input.Status + 'ed';
                    }
            });

            var converter = jsonMapper.makeMapConverter(objectConverter);

            try
            {
                var result = converter(JSON.parse(locksJson));
                if (lockId != undefined) {
                    result = result.filter(entry => {
                        return entry.lockId === lockId;
                    });
                }
                resolve(result);
            }
            catch(e) {
                reject(new SectorAlarmError('ERR_PARSING_ERROR', 'Could not parse the response received from Sector Alarm. See innerError for more details', e));
                return;
            }
        });
    }
};

module.exports = Parser;