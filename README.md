##cdvlive : Live Reload for Apache Cordova
[![Build Status](https://travis-ci.org/csantanapr/cdvlive.svg?branch=master)](https://travis-ci.org/csantanapr/cdvlive)
[![Dependency Status](https://david-dm.org/csantanapr/cdvlive.svg)](https://david-dm.org/csantanapr/cdvlive)
[![devDependency Status](https://david-dm.org/csantanapr/cdvlive/dev-status.svg)](https://david-dm.org/csantanapr/cdvlive#info=devDependencies)



## Install

    $ npm install -g cdvlive cordova


```bash    
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
      $ cdvlive browser
      $ cdvlive ip
    
      Starts emulator/simulator unless device is attached pass --emulator to force


```
Tip: For Android is better to have the android emulator running before running cdvlive command
 
  Demo:
 ![](cdvlive.gif)
 
## Add Platorms first
Need to add platfoms before running `cdvlive`
- To add android run `cordova platform add androi@latest`
- To add ios run `cordova platform add ios@latest`
- To add browser run `cordova platform add browser@latest`

## Managing Live Reload IP Addresses
 By default the cli prompts for ip address to use, it saves the value for later use to avoid prompting all the time if the address is still valid
 
 - To reset the saved ip address use `cdvlive ip`
 - To specify an ip address or hostname use `--ip` flag like `cdvlive android --ip 10.10.0.2`
 
### Debugging Cordova on Android 
  - Open Chrome or [Chome Canary](https://www.google.com/chrome/browser/canary.html) with url [chrome://inspect](chrome://inspect/#devices) this works for Android 4.4+
  - For Android less than 4.4 use Browser-Sync UI -> Remote Debugger (weinre)
 
### Debugging Cordova on iOS (iPhone or iPad)
  - On iOS device (i.e. iPhone) enable in Settings->Safari->Advanced->Web inspector
  - Open Safari or [Nightly Webkit](https://webkit.org/nightly/) then enable in Preferences -> Advanced - > Show Develop menu
  - Open Web Inspector on Safari or [Nightly Webkit](https://webkit.org/nightly/) then select Develop->(Simulator or Device) 

### Debugging Cordova on Browser
  - Right click on Web App and select `Inspect Element` 
 
## Contributing
Use Github issues to report bugs, questions, and enhancement requests

## License
Licensed under [Apache 2.0](LICENSE-Apache-2.0)
 