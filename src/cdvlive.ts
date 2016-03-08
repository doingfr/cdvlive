/// <reference path="../typings/tsd.d.ts" />

"use strict";

import child_process = require('child_process');
import Q = require('q');
import ConfigXml = require('./ConfigXML');
import bSync = require('browser-sync');
var nopt = require('nopt');

var exec = child_process.execSync;
var bs = bSync.create();

class CordovaLiveReload {

  public static run(): void {
    var platform: string;
    var liveUrl: string;
    var serverPath: string;
    var knownOpts = { "ip": String };
    var cmd = nopt(knownOpts,{},process.argv, 3);

    if (process.argv.length < 3) {
      console.error('Error: missing platform ios or android');
      this.printUsage();
      process.exit(1);
    }
    platform = process.argv[2];
   
    if(platform === 'ios'){
      serverPath = 'platforms/ios/www';
    } else if (platform == 'android'){
      serverPath = 'platforms/android/assets/www';
    } else {
      this.printUsage();
      process.exit(1);
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
      open: false,
      rewriteRules: [
        {
          match: /<meta http-equiv="Content-Security-Policy".*>/g,
          fn: function(match) {
            //console.log('server: rewrite remove <meta http-equiv='Content-Security-Policy'...  ');

            return '';
          }
        }
      ]
    }, (err: Error, bs: { options: any }) => {
      if (cmd.ip) {
        liveUrl = 'http://' + cmd.ip + ':' + bs.options.getIn(['port']);
      } else {
        liveUrl = bs.options.getIn(['urls', 'external']);
      }
      this.setupConfigXML(liveUrl)
        .then(() => {
          
          console.log('exec: cordova run ' + platform + ' ' + cmd.argv.remain.join(' '));
          console.log('This takes a while if you don\'t have emulator or simulator already running');
          exec('cordova run ' + platform + ' ' + cmd.argv.remain.join(' '));
          /* TODO: if debug then print output from run
          exec('cordova run ' + platform, {
            'stdio': 'inherit'
          });
          */
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
    console.log('\nLive Reload for Apache Cordova');
    console.log('\nUsage: cdvlive <platform> [OPTIONS] [ROPTS]');
    console.log('  OPTIONS   --ip <ip address>');
    console.log('  ROPTS     -- <cordova run options>');
    console.log('\nExamples:');
    console.log('  $ cdvlive ios');
    console.log('  $ cdvlive android');
    console.log('  $ cdvlive android --ip 10.10.0.2');
    console.log('  $ cdvlive android --ip 10.10.0.2 -- --emulator');
    console.log('\n');
    console.log('If device is attached then it runs on device if not then falls back to emulator/simulator');
  }

}




export = CordovaLiveReload;