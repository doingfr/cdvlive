/// <reference path="../typings/tsd.d.ts" />
/*eslint no-process-env: 0*/

import path = require('path');
import fs = require('fs');

class CDVLiveConfig {
  private data: any;
  private home: string = path.join(process.env.HOME || process.env.USERPROFILE || process.env.HOMEPATH, '.cdvlive');
  private file: string = path.join(this.home, 'config.json')

  constructor() {
    this.load();
  }

  public load(): CDVLiveConfig {
    if (fs.existsSync(this.file)) {
      this.data = JSON.parse(fs.readFileSync(this.file,'utf8'));
    } else {
      this.data = {};
    }
    return this;
  }

  public save(): CDVLiveConfig {
    if (!this.data) {
      return this;
    }
    try {
      if (!fs.existsSync(this.home)) {
        fs.mkdirSync(this.home);
      }
      fs.writeFileSync(this.file, JSON.stringify(this.data, null, 2));
    } catch (e) {
      console.error('Unable to save settings file: ' + e);
    }
  }

  public get(k: string): any {
    return this.data[k];
  }

  public set(k: string, v: any) {
    if (!this.data) {
      this.data = {};
    }
    this.data[k] = v;

    this.save();
  }
  
  //known keys
  public static IP_ADDRESS: string = 'IP_ADDRESS';

}
export = CDVLiveConfig;