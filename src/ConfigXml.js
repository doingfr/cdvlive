/// <reference path="../typings/tsd.d.ts" />
"use strict";
var fs = require('fs');
var path = require('path');
var xml2js = require('xml2js');
var Q = require('q');
var ConfigXml = (function () {
    function ConfigXml() {
    }
    ConfigXml.loadToJson = function (appDirectory) {
        var d = Q.defer();
        if (!appDirectory) {
            appDirectory = process.cwd();
        }
        var configXmlPath = path.join(appDirectory, 'config.xml');
        var file = path.join(appDirectory, 'config.xml');
        fs.readFile(configXmlPath, { encoding: 'utf8' }, function (err, data) {
            if (err)
                return d.reject(err);
            xml2js.parseString(data, function (err, configJson) {
                if (err)
                    return d.reject(err);
                d.resolve(configJson);
            });
        });
        return d.promise;
    };
    ConfigXml.setConfigXml = function (appDirectory, options) {
        var madeChange = false;
        if (!appDirectory) {
            appDirectory = process.cwd();
        }
        //console.log('ConfigXml.setConfigXml', appDirectory, options);
        var configXmlPath = path.join(appDirectory, 'config.xml');
        if (!fs.existsSync(configXmlPath)) {
            // working directory does not have the config.xml file
            if (options.errorWhenNotFound) {
                return Q.reject('Unable to locate config.xml file. Please ensure the working directory is at the root of the app where the config.xml should be located.');
            }
        }
        return this.loadToJson(appDirectory)
            .then(function (configJson) {
            if (!configJson.widget) {
                throw new Error('\nYour config.xml file is invalid. You must have a <widget> element.');
            }
            else if (configJson.widget && !configJson.widget.content) {
                throw new Error('\nYour config.xml file does not have a <content> element. \nAdd something like: <content src="index.html"/>');
            }
            if (options.devServer) {
                if (!configJson.widget.content[0].$['original-src']) {
                    configJson.widget.content[0].$['original-src'] = configJson.widget.content[0].$.src;
                    madeChange = true;
                }
                if (configJson.widget.content[0].$.src !== options.devServer) {
                    configJson.widget.content[0].$.src = options.devServer;
                    console.log('update: config.xml <content src="' + options.devServer + '" />');
                    madeChange = true;
                }
            }
            //add <allow-navigation href="*">
            if (configJson.widget['allow-navigation']) {
                //add additional one
                var allowclive = configJson.widget['allow-navigation'].filter(function (element) { return element.$['clive']; });
                if (allowclive.length == 0) {
                    //not found a clive allow-nagivation let add
                    configJson.widget['allow-navigation'].push({
                        '$': {
                            'href': '*',
                            'clive': true
                        }
                    });
                    console.log('update: config.xml <allow-navigation href="*" />');
                    madeChange = true;
                }
            }
            else {
                configJson.widget['allow-navigation'] = new Array(1);
                configJson.widget['allow-navigation'][0] = {
                    '$': {
                        'href': '*',
                        'clive': true
                    }
                };
                console.log('update: config.xml <content src="', options.devServer, '" />');
                madeChange = true;
            }
            if (madeChange) {
                var xmlBuilder = new xml2js.Builder();
                var configString = xmlBuilder.buildObject(configJson);
                fs.writeFileSync(configXmlPath, configString);
            }
        });
    };
    ConfigXml.resetConfigXml = function (appDirectory, options) {
        var madeChange = false;
        if (!appDirectory) {
            appDirectory = process.cwd();
        }
        //console.log('ConfigXml.resetConfigXml', appDirectory);
        var configXmlPath = path.join(appDirectory, 'config.xml');
        if (!fs.existsSync(configXmlPath)) {
            // working directory does not have the config.xml file
            if (options.errorWhenNotFound) {
                return Q.reject('Unable to locate config.xml file. Please ensure the working directory is at the root of the app where the config.xml should be located.');
            }
        }
        return this.loadToJson(appDirectory)
            .then(function (configJson) {
            if (!configJson.widget) {
                throw new Error('\nYour config.xml file is invalid. You must have a <widget> element.');
            }
            else if (configJson.widget && !configJson.widget.content) {
                throw new Error('\nYour config.xml file does not have a <content> element. \nAdd something like: <content src="index.html"/>');
            }
            //reset content
            if (configJson.widget.content[0].$['original-src']) {
                configJson.widget.content[0].$.src = configJson.widget.content[0].$['original-src'];
                console.log('update: config.xml restore <content src="' + configJson.widget.content[0].$['original-src'] + '" />');
                delete configJson.widget.content[0].$['original-src'];
                madeChange = true;
            }
            //remove <allow-navigation href="*" clive="true">
            if (configJson.widget['allow-navigation']) {
                var allowclive = configJson.widget['allow-navigation'].filter(function (element) { return element.$['clive']; });
                configJson.widget['allow-navigation'].forEach(function (element, index, array) {
                    if (element.$['clive']) {
                        array.splice(index, 1);
                        console.log('update: config.xml remove <allow-navigation href="*" />');
                    }
                });
            }
            if (madeChange) {
                var xmlBuilder = new xml2js.Builder();
                var configString = xmlBuilder.buildObject(configJson);
                fs.writeFileSync(configXmlPath, configString);
            }
        });
    };
    return ConfigXml;
}());
module.exports = ConfigXml;
//# sourceMappingURL=ConfigXml.js.map