/// <reference path="../typings/tsd.d.ts" />
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
        try {
            var addresses = [];
            var ifaces = os.networkInterfaces();
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
            if (ifaces) {
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
            }
            if (tryAddress) {
                if (tryAddress === 'localhost') {
                    options.address = tryAddress;
                    q.resolve(options.address);
                    return q.promise;
                }
                for (var x = 0; x < addresses.length; x++) {
                    // double check if this address is still available
                    if (addresses[x].address === tryAddress) {
                        options.address = addresses[x].address;
                        q.resolve(options.address);
                        return q.promise;
                    }
                }
                if (options.address) {
                    console.error('Address ' + options.address + ' not available.');
                    return q.promise;
                }
            }
            if (addresses.length > 0) {
                if (!options.isPlatformServe) {
                    addresses.push({
                        address: 'localhost'
                    });
                }
                if (addresses.length === 1) {
                    options.address = addresses[0].address;
                    q.resolve(options.address);
                    return q.promise;
                }
                console.log(chalk.red.bold('\nMultiple addresses available.'));
                console.log(chalk.red.bold('Please select which address to use by entering its number from the list below:'));
                console.log(chalk.gray.underline('Note that the emulator/device must be able to access the given IP address'));
                for (var x = 0; x < addresses.length; x++) {
                    if (addresses[x].address === 'localhost') {
                        console.log(chalk.yellow((' ' + (x + 1) + ') ' + addresses[x].address + ' (ios simulator only)')));
                    }
                    else {
                        console.log(chalk.yellow((' ' + (x + 1) + ') ' + addresses[x].address + (addresses[x].dev ? ' (' + addresses[x].dev + ')' : ''))));
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
                    for (var x = 0; x < addresses.length; x++) {
                        if (selection == (x + 1) || selection == addresses[x].address || selection == addresses[x].dev) {
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
            else if (options.isPlatformServe) {
                // no addresses found
                console.error('Unable to find an IPv4 address for run/emulate live reload.\nIs WiFi disabled or LAN disconnected?');
            }
            else {
                // no address found, but doesn't matter if it doesn't need an ip address and localhost will do
                options.address = 'localhost';
                q.resolve(options.address);
            }
        }
        catch (e) {
            console.error('Error getting IPv4 address: ' + e);
        }
        return q.promise;
    };
    return Address;
}());
module.exports = Address;
//# sourceMappingURL=address.js.map