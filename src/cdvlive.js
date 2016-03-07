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
            console.error("Error: missing platform ios or android");
            this.printUsage();
            process.exit(1);
        }
        platform = process.argv[2];
        serverPath = platform === 'ios' ? 'platforms/ios/www' : 'platforms/android/assets/www';
        // Listen to change events on HTML and reload
        bs.watch("www/**/*.*").on("change", function (file) {
            console.log('exec: cordova prepare');
            exec("cordova prepare");
            bs.reload(file);
        });
        // Now init the Browsersync server
        bs.init({
            server: serverPath,
            notify: false,
            open: false,
            rewriteRules: [
                {
                    match: /<meta http-equiv="Content-Security-Policy".*>/g,
                    fn: function (match) {
                        //console.log('server: rewrite remove <meta http-equiv="Content-Security-Policy"...  ');
                        return '';
                    }
                }
            ]
        }, function (err, bs) {
            liveUrl = bs.options.getIn(["urls", "external"]);
            _this.setupConfigXML(liveUrl)
                .then(function () {
                console.log('exec: cordova run', platform);
                console.log('This takes a while if you don\'t have emulator or simulator already running');
                exec("cordova run " + platform);
                /* TODO: if debug then print output from run
                exec("cordova run " + platform, {
                  "stdio": "inherit"
                });
                */
                return _this.resetConfigXML();
            })
                .then(function () {
                console.log('Ctrl+C to exit');
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
    CordovaLiveReload.printUsage = function () {
        console.log("\nLive Reload for Apache Cordova");
        console.log("\nUsage: cdvlive <platform>");
        console.log("\nSupported platforms:");
        console.log("  ios ........ iOS");
        console.log("  android .... Android");
        console.log("\nExamples:");
        console.log("  $ cdvlive ios");
        console.log("  $ cdvlive android");
        console.log("\n");
        console.log("If device is attached then it runs on device if not then falls back to emulator/simulator");
    };
    return CordovaLiveReload;
}());
module.exports = CordovaLiveReload;
//# sourceMappingURL=cdvlive.js.map