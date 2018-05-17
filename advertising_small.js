//NRF.setLowPowerConnection(true);

var pressCount = 0;

var beaconData = {
  uuid : [
    0xb1, 
    0xae, 
    0x51, 
    0x2b, 
    0x97, 
    0x03, 
    0x4a, 
    0xe2, 
    0xb9, 
    0xc3, 
    0x9e, 
    0x26, 
    0x0c, 
    0xa7, 
    0xb3, 
    0x99], // ibeacon uuid
  major : 0x0001, // optional
  minor : 0x0001, // optional
  rssi : -59 // optional RSSI at 1 meter distance in dBm
};

var beaconService = require("ble_ibeacon");

function getAdvertising() {
  var b = Puck.getBatteryPercentage();
  var t = Math.round(E.getTemperature());
  var l = Math.round(Puck.light()*100);
  var m = Puck.mag();
  var env = {
    //0x1801 : [pressCount],
    0x180F : [b],
    0x1809 : [t],
    0x2A77 : [l],
    //0x2AA1 : [m.x>>8,m.x,m.y>>8,m.y,m.z>>8,m.z]
  };
  digitalPulse(3,1,150);
  return [beaconService.get(beaconData),env];
}

function getManufacturerData() {

  return {
    manufacturer: 0x0590,
    manufacturerData: [pressCount],
    interval: 5000
  };
}

setWatch(function() {
  try {
    pressCount++;
    var ad = getAdvertising();
    var md = getManufacturerData();
    console.log('ad',ad);
    console.log('md',md);
    NRF.setAdvertising(ad,md);
  } catch(e) {
    console.log(e);
    digitalPulse(1,1,500);
  }
}, BTN, {edge:"rising", repeat:1, debounce:20});

