/// <reference path="../typings/tsd.d.ts" />
"use strict";
var child_process = require('child_process');
var ConfigXml = require('./configxml');
var bSync = require('browser-sync');
var address = require('./address');
//FixMe: nopt doesn't provide a good typings definition
var nopt = require('nopt');
var exec = child_process.execSync;
var pkg = require('../package.json');
var CordovaLiveReload = (function () {
    function CordovaLiveReload() {
    }
    CordovaLiveReload.run = function () {
        var platform;
        var command;
        var serverPath;
        var knownOpts = { "ip": String };
        var options = nopt(knownOpts, {}, process.argv, 3);
        if (process.argv.length < 3) {
            console.error('Error: missing <command> use ios, android, browser or ip');
            this.printUsage();
            process.exit(1);
        }
        command = process.argv[2];
        switch (command) {
            case 'ip':
                return address.getIp({ 'isAddressCmd': true });
            case 'ios':
            case 'android':
            case 'browser':
                options.platform = command;
                return this.runBrowserSync(options);
            case 'help':
                this.printUsage();
                return process.exit(0);
            default:
                console.error('Error: unrecognize <command> use ios, android, browser or ip');
                this.printUsage();
                return process.exit(1);
        }
    };
    CordovaLiveReload.runBrowserSync = function (options) {
        var _this = this;
        var serverPath = 'www';
        var liveUrl;
        var platform = options.platform;
        var bs = bSync.create();
        var openBrowser = false;
        if (platform === 'ios') {
            serverPath = 'platforms/ios/www';
        }
        else if (platform == 'android') {
            serverPath = 'platforms/android/assets/www';
        }
        else if (platform == 'browser') {
            serverPath = 'platforms/browser/www';
            openBrowser = true;
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
            open: openBrowser,
            rewriteRules: [
                {
                    match: /<meta http-equiv="Content-Security-Policy".*>/g,
                    fn: function () {
                        return '';
                    }
                }
            ]
        }, function (err, bs) {
            if (platform === 'browser') {
                _this.runCordova(platform, options);
                console.log('Ctrl+C to exit');
            }
            else {
                // for android and ios 
                address.getIp({ 'address': options.ip, 'isPlatformServe': true }).then(function (ip) {
                    _this.setupConfigXML('http://' + ip + ':' + bs.options.getIn(['port']))
                        .then(function () {
                        _this.runCordova(platform, options);
                        return _this.resetConfigXML();
                    })
                        .then(function () {
                        console.log('Ctrl+C to exit');
                    })
                        .catch(function (error) {
                        console.error(error);
                    });
                });
            }
        });
    };
    CordovaLiveReload.runCordova = function (platform, options) {
        if (platform !== 'browser') {
            console.log('exec: cordova run ' + platform + ' ' + options.argv.remain.join(' '));
            console.log('This takes a while if you don\'t have emulator or simulator already running');
            exec('cordova run ' + platform + ' ' + options.argv.remain.join(' '));
        }
        else {
            console.log('exec: cordova prepare ' + platform);
            exec('cordova prepare ' + platform);
        }
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
    CordovaLiveReload.usage = "\n    Live Reload for Apache Cordova " + pkg.version + "\n    \n    Usage: cdvlive <command> [options] [ -- ropts]\n      <command>  ...... ios || android || browser || ip\n        ios      ...... use cordova run ios\n        android  ...... use cordova run android\n        browser  ...... use cordova prepare browser\n        ip       ...... reset ip address saved in config  \n        \n      [options]  ...... --ip <ip address>\n      \n      [ropts]  ........ -- <cordova run options>\n      \n    Examples:\n      $ cdvlive ios\n      $ cdvlive android\n      $ cdvlive android --ip 10.10.0.2\n      $ cdvlive android --ip 10.10.0.2 -- --emulator\n      $ cdvlive ip\n    \n      Starts emulator/simulator unless device is attached pass --emulator to force\n  ";
    return CordovaLiveReload;
}());
module.exports = CordovaLiveReload;
//# sourceMappingURL=cdvlive.js.map