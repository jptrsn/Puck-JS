//NRF.setLowPowerConnection(true);
var pressCount = 0;
var nrfEnabled = true;
var sleepTime = 15000;
var persistBroadcast = 1500;
var timerId = null;
var adTimerId = null;
var beaconInterval = (1000 * 60 * 5); // 5 minutes

function wakeUp() {
  digitalPulse(LED2,1,250);
  NRF.wake();
  nrfEnabled = true;
}

function putPuckToSleep() {
  if (nrfEnabled) {
    timerId = null;
    nrfEnabled = false;
    console.log('going to sleep');
    digitalPulse(LED1, 1, 250);
    setTimeout(NRF.sleep,1000);
  } else {
    console.log('flag not set');
  }
}

function setSleep() {
  if (!timerId) {
    timerId = setTimeout(putPuckToSleep, sleepTime);
    console.log('sleep timer '+timerId+' set.');
  }
}

function getBeaconData() {
  return {
    uuid : [0xb1, 0xae, 0x51, 0x2b, 0x97, 0x03, 0x4a, 0xe2, 0xb9, 0xc3, 0x9e, 0x26, 0x0c, 0xa7, 0xb3, 0x99],
    major : 0x0001,
    minor : pressCount,
    rssi : -59
  };
}

var beaconService = require("ble_ibeacon");

function getAdvertising() {
  var b = Puck.getBatteryPercentage();
  var t = Math.round(E.getTemperature());
  var l = Math.round(Puck.light()*100);
  var m = Puck.mag();
  var env = {
    0x1801 : [pressCount],
    0x180F : [b],
    0x1809 : [t],
    0x2A77 : [l],
    //0x2AA1 : [m.x>>8,m.x,m.y>>8,m.y,m.z>>8,m.z]
  };
  digitalPulse(3,1,150);
  return env;
}

function getManufacturerData() {
  return {name: 'Puck'};
}

function advertise() {
  adTimerId = null;
  digitalPulse(LED2, 1, 250);
  var ad = getAdvertising();
  var md = getManufacturerData();
  console.log('ad');
  NRF.setAdvertising(ad,md);
  setSleep();
}

setWatch(function() {
  try {
    pressCount++;
    if (!nrfEnabled) {
      digitalPulse(LED1, 1, 250);
      wakeUp();
    } else if (timerId) {
      console.log('sleep timer '+timerId+' cleared');
      clearTimeout(timerId);
      timerId = null;
    }

    if (adTimerId) {
      clearTimeout(adTimerId);
      console.log('adTimer '+adTimerId+' cleared');
    }

    broadcastBeacon(true);
    adTimer = setTimeout(advertise,persistBroadcast);

  } catch(e) {
    console.log(e);
    digitalPulse(1,1,500);
  }
}, BTN, {edge:"rising", repeat:1, debounce:50});

function broadcastBeacon(stayAwake) {
  if (!nrfEnabled) {
    wakeUp();
    digitalPulse(LED2,1,500);
    return setTimeout(broadcastBeacon, 750);
  }
  digitalPulse(LED3,1,500);
  beaconService.advertise(getBeaconData());
  if (!stayAwake) {
    setSleep();
  }
}

setInterval(broadcastBeacon,beaconInterval);

broadcastBeacon();