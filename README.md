##cdvlive [![Build Status](https://travis-ci.org/csantanapr/cdvlive.svg?branch=master)](https://travis-ci.org/csantanapr/cdvlive)

Live Reload for Apache Cordova

## Install

    $ npm install -g cdvlive cordova


```bash    
    Usage: cdvlive <command> [options] [ -- ropts]
      <command>  ...... ios || android || ip
        ios      ...... use cordova run ios
        android  ...... use cordova run android
        ip       ...... reset ip address saved in config  
        
      [options]  ...... --ip <ip address>
      
      [ropts]  ........ -- <cordova run options>
      
    Examples:
      $ cdvlive ios
      $ cdvlive android
      $ cdvlive ip
    
      Starts emulator/simulator unless device is attached pass --emulator to force


```
Tip: For Android is better to have the android emulator running before running cdvlive command
 
  Demo:
 ![](cdvlive.gif)
 
## Missing Platorms
Need to add platfoms first before running `cdvlive`
- To add android run `cordova platform add androi@latest`
- To add ios run `cordova platform add ios@latest`
- To add browser run `cordova platform add browser@latest`

## Managing IP Addresses
 By default the cli prompts for ip address to use, it saves the value for later use to avoid prompting all the time if the address is still valid
 
 - To reset the saved ip address use `cdvlive ip`
 - To specify an ip address or hostname use `--ip` flag like `cdvlive android --ip 10.10.0.2`
 
## Debugging Android 
 Open Chrome or Chome Canary with url `chome://inspect`
 
## Debugging Android
  Open Web Inspector on Safari or Nightly Webkit then select Develop-> 
  On iOS devide enabe in Settings->Safari->Advanced->Web inspector


 
## Contributing
Use Github issues to report bugs, questions, and enhancement requests

## License
Licensed under [Apache 2.0](LICENSE-Apache-2.0)
 