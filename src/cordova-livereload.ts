/// <reference path="../typings/node/node.d.ts" />
/// <reference path="../typings/q/Q.d.ts" />

"use strict";


import child_process = require("child_process");
import Q = require('q');
import ConfigXml = require('./ConfigXML');

var exec = child_process.execSync;

class CordovaLiveReload {

  public static run(): void {
    var platform: string;

    if (process.argv.length < 3) {
      console.error("missing platform id ios or android");
      return;
    }

    platform = process.argv[2];
    this.setupConfigXML()
      .then(()=>{
        console.log("cordova config.xml is ready for clive");
        console.log('exec: cordova run', platform);
        exec("cordova run", {
          "stdio": "inherit"
        });
        return this.resetConfigXML();
      })
      .then(()=>{
        console.log('clive: done reset config.xml');
      })
      .catch((error) => {
        console.error(error);
      });
    
  }
  private static setupConfigXML(): Q.Promise<any> {
    return ConfigXml.setConfigXml(process.cwd(), {
      errorWhenNotFound: true,
      devServer: "http://9.1.2.3"
    })
  }
  private static resetConfigXML(): Q.Promise<any> {
    return ConfigXml.resetConfigXml(process.cwd(), {
      errorWhenNotFound: true
    })
  }


}




export = CordovaLiveReload;