var pressCount = 0;
var sleepFlag = false;
var connected = false;
var lastDeviceId;


function test() {
  return 'test';
}

NRF.setAdvertising({},{name: "Puck", uart: true});
NRF.setLowPowerConnection(true);

function setLeds(c) {
  digitalWrite([LED3,LED2,LED1], c);
}

function blinkLeds(c, d, optCallback) {
  setLeds(c);
  setTimeout(function() {
    setLeds(0);
    if (optCallback) {
      optCallback();
    }
  },d || 500);
}

function wakeupAndAdvertise() {
  //NRF.wake();
  pressCount++;
  console.log(pressCount);

  NRF.setAdvertising({
    0x180F : [Puck.getBatteryPercentage()],
    0x1809 : [Math.round(E.getTemperature())],
    0xFFFF : [pressCount]
  });

  sleepFlag = true;
  blinkLeds(3,150);
  //setTimeout(goToSleep,500);
}

function goToSleep() {
  if (sleepFlag) {
    console.log('going to sleep');
    blinkLeds(5,100);
    sleepFlag = false;
    //NRF.disconnect();
    //NRF.sleep();
  } else {
    blinkLeds(2,100);
    console.log('sleep flag was not set');
  }
}

function cancelSleep() {
  console.log('cancelSleep');
  sleepFlag = false;
  setLeds(1);
}

function connectToLastDevice() {
  const pcId = "00:1a:7d:da:71:11";
  console.log('connectToLastDevice');
  if (lastDeviceId) {
    blinkLeds(3,150);
  } else {
    blinkLeds(6,150);
  }
  var target = lastDeviceId;
  NRF.connect(target).then(function(){
      blinkLeds(2,500);
    }, function() {
      blinkLeds(1,500);
    });
}

function handleClick(ev) {
  console.log('click');
  //if (sleepFlag) {
  //  return cancelSleep();
  //}
  if (connected) {
    blinkLeds(7,50);
    //if (sleepFlag) {
    //  console.log('cancelling sleep');
    //  cancelSleep();
    //} else {
      wakeupAndAdvertise();
    //}
  } else {
    var holdTime = ev.time - ev.lastTime;
    if (holdTime < 2) {
      wakeupAndAdvertise();
    } else {
      //NRF.wake();
      connectToLastDevice();
    }
  }
}

setWatch(handleClick, BTN, { edge:"falling", repeat:true, debounce:50 });

NRF.on('disconnect', function(reason) {
  connected = false;
});

NRF.on('connect', function(id) {
  lastDeviceId = id.split(" ")[0];
  connected = true;
});
