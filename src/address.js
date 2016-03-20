/// <reference path="../typings/tsd.d.ts" />
/* eslint no-loop-func: 0 */
"use strict";
var Q = require('q');
var os = require('os');
var CDVLiveConfig = require('./config');
var chalk = require('chalk');
//TODO: replace prompt with inquirer
var prompt = require('prompt');
var Address = (function () {
    function Address() {
    }
    Address.getIp = function (options) {
        return this.getRealIp(options);
    };
    Address.getRealIp = function (options) {
        var q = Q.defer();
        var x;
        var addresses = [];
        var ifaces;
        var cdvliveConfig = new CDVLiveConfig();
        var addressConfigKey = CDVLiveConfig.IP_ADDRESS;
        var tryAddress;
        if (options.isAddressCmd) {
            // reset any address configs
            cdvliveConfig.set(addressConfigKey, null);
        }
        else if (options.address) {
            tryAddress = options.address;
        }
        else {
            tryAddress = cdvliveConfig.get(addressConfigKey);
        }
        try {
            ifaces = os.networkInterfaces();
        }
        catch (e) {
            console.error('Error getting IPv4 address: ' + e);
            q.reject(e);
            return q.promise;
        }
        for (var dev in ifaces) {
            if (dev) {
                ifaces[dev].forEach(function (details) {
                    if (details && details.family == 'IPv4' && !details.internal && details.address) {
                        addresses.push({
                            address: details.address,
                            dev: dev
                        });
                    }
                });
            }
        }
        for (x = 0; x < addresses.length; x += 1) {
            // double check if this address is still available
            if (addresses[x].address === tryAddress) {
                options.address = addresses[x].address;
                q.resolve(options.address);
                return q.promise;
            }
        }
        if (addresses.length > 0) {
            if (addresses.length === 1) {
                options.address = addresses[0].address;
                q.resolve(options.address);
                return q.promise;
            }
            console.log(chalk.red.bold('\nMultiple addresses available.'));
            console.log(chalk.red.bold('Please select which address to use by entering its number from the list below:'));
            console.log(chalk.gray.underline('Note that the emulator/device must be able to access the given IP address'));
            var displayAddress;
            for (x = 0; x < addresses.length; x += 1) {
                if (addresses[x].address === 'localhost') {
                    displayAddress = ' ' + (x + 1) + ') ' + addresses[x].address + ' (ios simulator only)';
                    console.log(chalk.yellow(displayAddress));
                }
                else {
                    displayAddress = ' ' + (x + 1) + ') ' + addresses[x].address;
                    if (addresses[x].dev) {
                        displayAddress += ' (' + addresses[x].dev + ')';
                    }
                    console.log(chalk.yellow(displayAddress));
                }
            }
            var promptProperties = {
                selection: {
                    name: 'selection',
                    description: chalk.yellow('Address Selection: '),
                    required: true
                }
            };
            // prompt.override = argv;
            prompt.message = '';
            prompt.delimiter = '';
            prompt.start();
            prompt.get({ properties: promptProperties }, function (err, promptResult) {
                if (err && err.message !== 'canceled') {
                    console.error('User prompted to select address - an error occured: %s', err, {});
                    q.reject(err);
                }
                var selection = promptResult.selection;
                for (x = 0; x < addresses.length; x += 1) {
                    if (selection == x + 1 || selection == addresses[x].address || selection == addresses[x].dev) {
                        options.address = addresses[x].address;
                        if (!options.isAddressCmd) {
                            console.log(chalk.green.bold('Selected address: ') + options.address);
                        }
                        cdvliveConfig.set(addressConfigKey, options.address);
                        prompt.resume();
                        q.resolve(options.address);
                        return q.promise;
                    }
                }
                console.error('Invalid address selection');
            });
        }
        else {
            // no addresses found
            console.error('Unable to find an IPv4 address for run/emulate live reload.\nIs WiFi disabled or LAN disconnected?');
        }
        return q.promise;
    };
    return Address;
}());
module.exports = Address;
//# sourceMappingURL=address.js.map