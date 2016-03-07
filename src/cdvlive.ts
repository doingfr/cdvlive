/// <reference path="../typings/tsd.d.ts" />

"use strict";

import child_process = require("child_process");
import Q = require('q');
import ConfigXml = require('./ConfigXML');

var exec = child_process.execSync;

// Create a Browsersync instance
import bSync = require("browser-sync");

var bs = bSync.create();

class CordovaLiveReload {

  public static run(): void {
    var platform: string;
    var liveUrl: string;
    var serverPath: string;

    if (process.argv.length < 3) {
      console.error("Error: missing platform ios or android");
      this.printUsage();
      process.exit(1);
    }
    platform = process.argv[2];

    serverPath = platform === 'ios' ? 'platforms/ios/www' : 'platforms/android/assets/www';
    
    // Listen to change events on HTML and reload
    bs.watch("www/**/*.*").on("change", (file:string) => {
      console.log('exec: cordova prepare');
      exec("cordova prepare");
      console.log(file);
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
    }, (err: Error, bs: { options: any }) => {
      liveUrl = bs.options.getIn(["urls", "external"]);
      this.setupConfigXML(liveUrl)
        .then(() => {
          console.log('exec: cordova run ', platform);
          
          exec("cordova run " + platform);
          /* TODO: if debug then print output from run
          exec("cordova run " + platform, {
            "stdio": "inherit"
          });
          */
          return this.resetConfigXML();
        })
        .then(() => {
          console.log('This takes a while if you don\'t have emulator or simulator already running');
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
  }

}




export = CordovaLiveReload;