# Nodatron

This module will allow you to easily create objects for your
Arduino components, such as LEDs, sensors, buttons and servos.  You can send commands
by easily calling methods on these objects.  These objects will also emit events when
something happens, such as a button being pressed.  

# Note

This module is NOT Johnny-five.  Use Johnny-five for a completely tested framework that supports
many different boards and a lot more components. Each sample here comes with its corresponding sketch.
You will still need to upload that sketch to your Arduino for any of this to work. I created Nodatron
because I was having too many issues getting the serialport package to work on a Raspberry Pi.


This framework has only been tested on the following:
- Arduino Uno R3 board connected to a Raspberry Pi 2/3.
- Arduino Uno R3 board connected to a Raspberry Pi Zero.

#INSTALL

npm install nodatron

pip install pyserial

#RUN

npm test (will test a connection.)

npm button (will print out to the console whenever a button is toggled.)
npm led (will blink an led.)
npm sensor (will print out to the console when a sensor is triggered.)
npm servo (will sweep a servo from 0-180 degrees.)


#LED blink
```javascript
var nodatron = require('nodatron');

var arduino = new nodatron({"device" : "/dev/ttyACM0","baud" : 9600});

arduino.on("connected", function(){
  var led          = arduino.createLed(2);

  led.startBlink();
});
```

#Sensor
```javascript
var nodatron = require('nodatron');

var arduino = new nodatron({"device" : "/dev/ttyACM0","baud" : 9600});

arduino.on("connected", function(){

  var motionSensor = arduino.createPir(7);

  motionSensor.on('start',function(){
    console.log("sensor detected some movement! Intruder alert!");
  });

  motionSensor.on('stop',function(){
    console.log("movement has stopped.");
  });

});
```

#Servo sweep
```javascript
var nodatron = require('nodatron');

var arduino = new nodatron({"device" : "/dev/ttyACM0","baud" : 9600});

arduino.on("connected", function(){
  var servo         = arduino.createServo(9);

  var resetFlag = false;

  setInterval(function(){
    if(!resetFlag){
      servo.move(180);
      resetFlag = true;
    }
    else{
      servo.move(0);
    }
  },10000);

});
```

#Button
```javascript
var nodatron = require('nodatron');

var arduino = new nodatron({"device" : "/dev/ttyACM0","baud" : 9600});

arduino.on("connected", function(){

  var button = arduino.createButton(6);

  button.on('on',function(){
    console.log("button toggled to on.");
  });

  button.on('off',function(){
    console.log("button toggled to off.");
  });

});
```

#Emic to speech module
```javascript
var nodatron = require('nodatron');

var arduino = new nodatron({"device" : "/dev/ttyACM0","baud" : 9600});

arduino.on("connected", function(){
  var emic          = arduino.createEmicToSpeech(12);

  emic.speak("Hello. Do you want to play a game?");//this will be spoken.
});
```

#Gracefully shutting down
```javascript
process.on('SIGTERM', function() {//called from /etc/init.d/nodatron.sh from kill pid
  log.info("Got kill signal. Exiting.");
  arduino.shutdown();
});

process.on('SIGINT', function() {
  log.warn("Caught interrupt signal(Ctrl-C)");
  arduino.shutdown();
});
```

#enable raw input from commandline (good for debugging)
```javascript

arduino.enableConsole();

```

#catch a serial connection error
```javascript

arduino.on("serialLostConnection", function(msg){
  console.error(msg);
});
```
