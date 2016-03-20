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
      $ cdvlive android --ip 10.10.0.2
      $ cdvlive android --ip 10.10.0.2 -- --emulator
      $ cdvlive ip
    
      Starts emulator/simulator unless device is attached pass --emulator to force


```
Tip: For Android is better to have the android emulator running before running cdvlive command
 
 Demo:
 ![](cdvlive.gif)
 
## Contributing
Use Github issues to report bugs, questions, and enhancement requests

## License
Licensed under [Apache 2.0](LICENSE-Apache-2.0)
 