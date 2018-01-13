var controls = require("ble_hid_controls");
NRF.setServices(undefined, { hid : controls.report });

var connected = true;
var lastDeviceId, lastErr, risingOrientation;
var orientationMidpoint = -1500;
var knownDeviceId = "00:1a:7d:da:71:11";

NRF.on("connect", function (id) {lastDeviceId = id.split(" ")[0];
  connected = true;
  NRF.setLowPowerConnection(true);
  blinkLeds(2,1500);
});

NRF.on("disconnect", function () {
  connected = false;
  blinkLeds(1,1500);
});


function activeButtonHandler(e) {try {
    var len = e.time - e.lastTime;
    console.log('activeButtonHandler', len);
    var orientationDelta = getOrientationDelta();
    if (!orientationDelta && len > 0.3 && len < 2) {
      if (getStaticOrientation()) {
        console.log('next');
        controls.next();
        blinkLeds(5,100);
      } else {
        console.log('previous');
        controls.prev();
        blinkLeds(5,100);
      }
    } else if (len <= 0.3) {
      console.log('playpause');
      controls.playpause();
      blinkLeds(2,100);
    } else if (!orientationDelta) {
      console.log('disconnecting');
      NRF.disconnect(function(reason){
        blinkLeds(4,1000);
      });
    }
  } catch(err) {
      handle(err);
  }
}

function handle(e) {blinkLeds(1,150);
  lastErr = e;
  console.log(e.msg);
}

function lastError() {console.log(lastErr);}

function checkVolumeCommand() {
  var delta = getOrientationDelta();
  console.log('delta',delta);
  if (delta) {
    var btn = digitalRead(BTN);
    console.log(btn);
    if (btn) {
      if (delta > 0) {
        controls.volumeUp();
        blinkLeds(2,100);
      } else if (delta < 0) {
        controls.volumeDown();
        blinkLeds(1,100);
      }
      setTimeout(checkVolumeCommand,250);
    }
  }
}

function wakeupButtonHandler(e) {try {
    console.log('wakeupButtonHandler');
    var len = e.time - e.lastTime;
    if (len < 2) {
      setLeds(3);
      NRF.connect(lastDeviceId).then(function() {
        blinkLeds(2,1000);
      }, handle);
    } else {
      setLeds(5);
      NRF.connect(knownDeviceId).then(function() {
        blinkLeds(2,1000);
      }, handle);
    }
  } catch(err) {
    handle(err);
  }
}

function blinkLeds(c,d,optCallback) {setLeds(c);
  setTimeout(function() {
    setLeds(0);
    if (optCallback) {
      optCallback();
    }
  },d || 500);
}

function setLeds(color) {digitalWrite([LED3,LED2,LED1], color);}

function connectTo(id) {setLeds(3);
  NRF.connect(id).then(function(ev){
    blinkLeds(2,500);
    setLeds(0);
    console.log(ev);
  }, function(ev) {
    blinkLeds(1,250);
  });}

function fallingEdgeClickHandler(e) {
  try {
    var len = e.time - e.lastTime;
    blinkLeds(2,100);
    if (!connected) {
      console.log('disconnected');
      wakeupButtonHandler(e);
    } else {
      console.log('connected');
      activeButtonHandler(e);
    }
  } catch(err) {
    blinkLeds(1,5000);
  }
}

function getOrientationDelta() {var o = Puck.mag();
  var dz = o.z-risingOrientation.z;
  if (dz < -500) {
    orientationMidpoint = (risingOrientation.z + o.z) / 2;
    return -1;
  } else if (dz > 400) {
    orientationMidpoint = (risingOrientation.z + o.z) / 2;
    return 1;
  } else {
    return 0;
  }
}

function getStaticOrientation() {
  var o = Puck.mag();
  return (o.z > orientationMidpoint);
}

function risingEdgeClickHandler(e) {risingOrientation = Puck.mag();
  setTimeout(checkVolumeCommand,250);
}

setWatch(fallingEdgeClickHandler, D0, { repeat:true, edge:'falling', debounce : 50 });

setWatch(risingEdgeClickHandler, D0, { repeat:true, edge:'rising', debounce : 50 });
