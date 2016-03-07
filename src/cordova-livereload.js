/// <reference path="../typings/tsd.d.ts" />
"use strict";
var child_process = require("child_process");
var ConfigXml = require('./ConfigXML');
var exec = child_process.execSync;
// Create a Browsersync instance
var bSync = require("browser-sync");
var bs = bSync.create();
var CordovaLiveReload = (function () {
    function CordovaLiveReload() {
    }
    CordovaLiveReload.run = function () {
        var _this = this;
        var platform;
        var liveUrl;
        var serverPath;
        if (process.argv.length < 3) {
            console.error("missing platform id ios or android");
            return;
        }
        platform = process.argv[2];
        serverPath = platform === 'ios' ? 'platforms/ios/www' : 'platforms/android/assets/www';
        // Listen to change events on HTML and reload
        bs.watch("www/**/*.*").on("change", function () {
            console.log('running cordova prepare');
            exec("cordova prepare");
            bs.reload();
        });
        // Now init the Browsersync server
        bs.init({
            server: serverPath,
            notify: false,
            open: false
        }, function (err, bs) {
            liveUrl = bs.options.getIn(["urls", "external"]);
            _this.setupConfigXML(liveUrl)
                .then(function () {
                console.log("cordova config.xml is ready for clive");
                console.log('exec: cordova run', platform);
                exec("cordova run " + platform, {
                    "stdio": "inherit"
                });
                return _this.resetConfigXML();
            })
                .then(function () {
                console.log('clive: done reset config.xml');
            })
                .catch(function (error) {
                console.error(error);
            });
        });
    };
    CordovaLiveReload.setupConfigXML = function (liveUrl) {
        return ConfigXml.setConfigXml(process.cwd(), {
            errorWhenNotFound: true,
            devServer: liveUrl
        });
    };
    CordovaLiveReload.resetConfigXML = function () {
        return ConfigXml.resetConfigXml(process.cwd(), {
            errorWhenNotFound: true
        });
    };
    return CordovaLiveReload;
}());
module.exports = CordovaLiveReload;
//# sourceMappingURL=cordova-livereload.js.map