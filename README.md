# Puck JS Modules
By James Petersen
Published under an MIT License

## Files

### media_control.js
This is a Bluetooth HID media controller, with play/pause, skip forward, skip backward, volume up, and volume down commands. To use, program your [Puck JS](https://www.puck-js.com/) with the contents of the media_control.js file.

You will need to disconnect and un-pair your Puck in order to use the media controls, as the available services will have changed. Recommended use is paired with a phone using either a media player app (music playback or video) or a remote control app.

The operations are as follows:

##### *When Connected*

- **play/pause**: a short click (less than 0.3 ms). Accompanied by a flash of the Green LED.

- **skip forward**: a longer click (> 0.3 ms, and < 2s) with the Puck sitting right-side-up. Accompanied by a flash of the Blue LED.

- **skip backward**: a longer click (> 0.3 ms, and < 2s) with the Puck sitting up-side-down. Accompanied by a flash of the Blue LED.

- **volume up**: start with the Puck up-side-down. Click and hold, and turn the Puck right-side-up. Volume up commands will repeat every 250 ms until you release the button. Each volume up command is accompanied by a flash of the Green LED.

- **volume down**: start with the Puck right-side-up. Click and hold, and turn the Puck up-side-down. Volume down commands will repeat every 250 ms until you release the button. Each volume up command is accompanied by a flash of the Red LED.

- **disconnect**: press and hold the button for more than 2 seconds, keeping the Puck right-side-up. Sending the disconnect command is accompanied by a flash of both Blue and Red LEDs. When successfully disconnected, the Puck will flash the Red LED once.

##### *When Disconnected*

- **connect to the last device used**: any button press shorter than 2 seconds. The Puck show the Red and Green LEDs, and then flash Green if reconnected, or Red if the connection failed.

- **connect to the specified device ID**: press the button for more than 2 seconds to attempt a connection with the device corresponding to the ID specified as `knownDeviceId` in media_control.js file.
