/// <reference path="../typings/tsd.d.ts" />
"use strict";
var child_process = require('child_process');
var ConfigXml = require('./configxml');
var bSync = require('browser-sync');
//FixMe: nopt doesn't provide a good typings definition
var nopt = require('nopt');
var exec = child_process.execSync;
var bs = bSync.create();
var pkg = require('../package.json');
var CordovaLiveReload = (function () {
    function CordovaLiveReload() {
    }
    CordovaLiveReload.run = function () {
        var _this = this;
        var platform;
        var liveUrl;
        var serverPath;
        var knownOpts = { "ip": String };
        var cmd = nopt(knownOpts, {}, process.argv, 3);
        if (process.argv.length < 3) {
            console.error('Error: missing <action> use ios, android or ip');
            this.printUsage();
            process.exit(1);
        }
        platform = process.argv[2];
        if (platform === 'ios') {
            serverPath = 'platforms/ios/www';
        }
        else if (platform == 'android') {
            serverPath = 'platforms/android/assets/www';
        }
        else {
            this.printUsage();
            process.exit(1);
        }
        // Listen to change events on HTML and reload
        bs.watch('www/**/*.*').on('change', function (file) {
            console.log('exec: cordova prepare');
            exec('cordova prepare');
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
                    fn: function () {
                        return '';
                    }
                }
            ]
        }, function (err, bs) {
            if (cmd.ip) {
                liveUrl = 'http://' + cmd.ip + ':' + bs.options.getIn(['port']);
            }
            else {
                liveUrl = bs.options.getIn(['urls', 'external']);
            }
            _this.setupConfigXML(liveUrl)
                .then(function () {
                console.log('exec: cordova run ' + platform + ' ' + cmd.argv.remain.join(' '));
                console.log('This takes a while if you don\'t have emulator or simulator already running');
                exec('cordova run ' + platform + ' ' + cmd.argv.remain.join(' '));
                /* TODO: if debug then print output from run
                exec('cordova run ' + platform, {
                  'stdio': 'inherit'
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
        console.log(this.usage);
    };
    CordovaLiveReload.usage = "\n    Live Reload for Apache Cordova " + pkg.version + "\n    \n    Usage: cdvlive <command> [options] [ -- ropts]\n      <command>  ...... ios || android || ip\n        ios      ...... use cordova run ios\n        android  ...... use cordova run android\n        ip       ...... reset ip address saved in config  \n        \n      [options]  ...... --ip <ip address>\n      \n      [ropts]  ........ -- <cordova run options>\n      \n    Examples:\n      $ cdvlive ios\n      $ cdvlive android\n      $ cdvlive android --ip 10.10.0.2\n      $ cdvlive android --ip 10.10.0.2 -- --emulator\n      $ cdvlive ip\n    \n      Starts emulator/simulator unless device is attached pass --emulator to force\n  ";
    return CordovaLiveReload;
}());
module.exports = CordovaLiveReload;
//# sourceMappingURL=cdvlive.js.map