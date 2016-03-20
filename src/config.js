/// <reference path="../typings/tsd.d.ts" />
/*eslint no-process-env: 0*/
"use strict";
var path = require('path');
var fs = require('fs');
var CDVLiveConfig = (function () {
    function CDVLiveConfig() {
        this.home = path.join(process.env.HOME || process.env.USERPROFILE || process.env.HOMEPATH, '.cdvlive');
        this.file = path.join(this.home, 'config.json');
        this.load();
    }
    CDVLiveConfig.prototype.load = function () {
        if (fs.existsSync(this.file)) {
            this.data = JSON.parse(fs.readFileSync(this.file, 'utf8'));
        }
        else {
            this.data = {};
        }
        return this;
    };
    CDVLiveConfig.prototype.save = function () {
        if (!this.data) {
            return this;
        }
        try {
            if (!fs.existsSync(this.home)) {
                fs.mkdirSync(this.home);
            }
            fs.writeFileSync(this.file, JSON.stringify(this.data, null, 2));
        }
        catch (e) {
            console.error('Unable to save settings file: ' + e);
        }
    };
    CDVLiveConfig.prototype.get = function (k) {
        return this.data[k];
    };
    CDVLiveConfig.prototype.set = function (k, v) {
        if (!this.data) {
            this.data = {};
        }
        this.data[k] = v;
        this.save();
    };
    //known keys
    CDVLiveConfig.IP_ADDRESS = 'IP_ADDRESS';
    return CDVLiveConfig;
}());
module.exports = CDVLiveConfig;
//# sourceMappingURL=config.js.map