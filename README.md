Live Reload for Apache Cordova

Install

    $ npm install -g cdvlive cordova


```bash    
Usage: cdvlive <platform> [OPTIONS] [ROPTS]

  OPTIONS   --ip <ip address>
  ROPTS     -- <cordova run options>

Examples:
  $ cdvlive ios
  $ cdvlive android
  $ cdvlive android --ip 10.10.0.2
  $ cdvlive android --ip 10.10.0.2 -- --emulator

Runs on device, if device not attached then runs on emulator/simulator
```

   
Tip: For Android is better to have the android emulator running before running cdvlive command
 