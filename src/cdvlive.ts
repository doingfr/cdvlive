/// <reference path="../typings/tsd.d.ts" />

"use strict";

import child_process = require('child_process');
import Q = require('q');
import ConfigXml = require('./configxml');
import bSync = require('browser-sync');
import address = require('./address');

//FixMe: nopt doesn't provide a good typings definition
var nopt = require('nopt');

var pkg = require('../package.json');

class CordovaLiveReload {

  public static run(): any {
    var platform: string;
    var command: string;

    var serverPath: string;
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

  }

  private static runBrowserSync(options: any) {
    var serverPath: string = 'www';
    var liveUrl: string;
    var platform: string = options.platform;
    var exec = child_process.execSync;
    var bs = bSync.create();
    var openBrowser: boolean = false;

    if (platform === 'ios') {
      serverPath = 'platforms/ios/www';
    } else if (platform == 'android') {
      serverPath = 'platforms/android/assets/www';
    } else if (platform == 'browser') {
      serverPath = 'platforms/browser/www';
      openBrowser = true;
    }


    // Listen to change events on HTML and reload
    bs.watch('www/**/*.*').on('change', (file: string) => {
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
          fn: function() {
            return '';
          }
        }
      ]
    }, (err: Error, bs: { options: any }) => {
      if (options.ip) {
        liveUrl = 'http://' + options.ip + ':' + bs.options.getIn(['port']);
      } else {
        liveUrl = bs.options.getIn(['urls', 'external']);
      }
      this.setupConfigXML(liveUrl)
        .then(() => {
          if(platform !== 'browser'){
            console.log('exec: cordova run ' + platform + ' ' + options.argv.remain.join(' '));
            console.log('This takes a while if you don\'t have emulator or simulator already running');
            exec('cordova run ' + platform + ' ' + options.argv.remain.join(' '));
            /* TODO: if debug then print output from run
            exec('cordova run ' + platform, {
              'stdio': 'inherit'
            });
            */
          } else {
            exec('cordova prepare ' + platform);
          }
          
          return this.resetConfigXML();
        })
        .then(() => {

          console.log('Ctrl+C to exit');
        })
        .catch((error) => {
          console.error(error);
        });
    });
  }

  private static setupConfigXML(liveUrl: string): Q.Promise<any> {
    return ConfigXml.setConfigXml(process.cwd(), {
      errorWhenNotFound: true,
      devServer: liveUrl
    })
  }
  private static resetConfigXML(): Q.Promise<any> {
    return ConfigXml.resetConfigXml(process.cwd(), {
      errorWhenNotFound: true
    })
  }
  private static printUsage(): void {
    console.log(this.usage);
  }
  private static usage: string = `
    Live Reload for Apache Cordova ${pkg.version}
    
    Usage: cdvlive <command> [options] [ -- ropts]
      <command>  ...... ios || android || browser || ip
        ios      ...... use cordova run ios
        android  ...... use cordova run android
        browser  ...... use cordova prepare browser
        ip       ...... reset ip address saved in config  
        
      [options]  ...... --ip <ip address>
      
      [ropts]  ........ -- <cordova run options>
      
    Examples:
      $ cdvlive ios
      $ cdvlive android
      $ cdvlive android --ip 10.10.0.2
      $ cdvlive android --ip 10.10.0.2 -- --emulator
      $ cdvlive ip
    
      Starts emulator/simulator unless device is attached pass --emulator to force
  `;

}




export = CordovaLiveReload;