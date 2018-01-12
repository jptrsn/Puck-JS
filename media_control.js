var controls = require("ble_hid_controls");

NRF.setServices(undefined, { hid : controls.report });
var isSleeping = true;
var connected = true;
var toggleSleeping;
var lastDeviceId;
var orientationMidpoint = -1500;
var phoneId = "48:59:29:05:b5:38";
var pcId = "00:1a:7d:da:71:11";
var lastErr, risingOrientation, fallingOrientation;

NRF.on('connect', function(id) {
  lastDeviceId = id.split(" ")[0];
  connected = true;
  //NRF.setLowPowerConnection(true);
  blinkLeds(2,1500);
});

NRF.on('disconnect', function() {
  blinkLeds(1,1500);
  connected = false;
});

var activeButtonHandler = function(e) {
  try {
    console.log('activeButtonHandler');
    var len = e.time - e.lastTime;
    var orientationDelta = getOrientationDelta();
   
    if (len > 0.2 && len < 2) {
      if (orientationDelta) {
        if (orientationDelta > 0) {
          console.log('volume up');
          controls.volumeUp();
        } else {
          console.log('volume down');
          controls.volumeDown();
        }
      } else {
        if (getStaticOrientation()) { 
          console.log('next');
          controls.next();
        } else {
          console.log('previous');
          controls.prev();
        }
      }
      
      blinkLeds(3,100);
    } else if (len <= 0.3) {
      console.log('playpause');
      controls.playpause();
      blinkLeds(2,100);
    } else {
      console.log('going to sleep');
      //blinkLeds(4,1000, toggleSleeping);
    }
  } catch(err) {
      handle(err);
  }
};

function handle(e) {
  blinkLeds(1,150);
  console.log(e.msg);
  lastErr = e;
}

function lastError() {
  console.log(lastErr);
}

var wakeupButtonHandler = function(e) {
  try {
    console.log('wakeupButtonHandler');
    //NRF.wake();
    var len = e.time - e.lastTime;
    if (len > 2) {
      setLeds(3);
      NRF.connect(lastDeviceId).then(function() {
        blinkLeds(2,1000);
      }, handle);
    } else {
      setLeds(5);
      NRF.connect(pcId).then(function() {
        blinkLeds(2,1000);
      }, handle);
    }
    blinkLeds(7,150, toggleSleeping);
  } catch(err) {
    handle(err);
  }
};

function blinkLeds(c, d, optCallback) {
  setLeds(c);
  setTimeout(function() {
    setLeds(0);
    if (optCallback) {
      optCallback();
    }
  },d || 500);
}

function setLeds(color) {
  digitalWrite([LED3,LED2,LED1], color);
}

function connectTo(id) {
  //NRF.wake();
  setLeds(3);
  NRF.connect(id).then(function(ev){
    blinkLeds(2,500);
    setLeds(0);
    console.log(ev);
  }, function(ev) {
    blinkLeds(1,250);
  });
}

toggleSleeping = function() {
  if (isSleeping) {
    //NRF.wake();
    blinkLeds(6,500);
  } else {
    blinkLeds(1,150);
    NRF.disconnect(function() {
      //blinkLeds(1,5000, NRF.sleep);
      blinkLeds(2,5000);
    });
  }
  isSleeping = !isSleeping;
};

function fallingEdgeClickHandler(e) {
  try {
    var len = e.time - e.lastTime;
    
    if (!connected) {
      if (lastDeviceId) {
        console.log('connecting to '+lastDeviceId);
        setLeds(3);
        connectTo(lastDeviceId);
      } else {
        
        if (len < 2) {
          setLeds(1);
          console.log('connecting to pc');
          connectTo(pcId);
        } else {
          console.log('ready state');
          blinkLeds(6,500);
        }
      }
      
      return;
    }
    blinkLeds(2,100);
    if (isSleeping) {
      console.log('waking up');
      wakeupButtonHandler(e);
    } else {
      console.log('awake');
      activeButtonHandler(e);
    }
    
  } catch(err) {
    blinkLeds(1,5000);
  }
}

function getOrientationDelta() {
  var o = Puck.mag();
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

function risingEdgeClickHandler(e) {
  risingOrientation = Puck.mag();
  //console.log(risingOrientation);
}

blinkLeds(2,100);
toggleSleeping();

setWatch(fallingEdgeClickHandler, BTN, { edge:"falling",repeat:true,debounce:50});

setWatch(risingEdgeClickHandler, BTN, { edge:"rising",repeat:true,debounce:50});