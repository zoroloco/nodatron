
/*
  This example sketch will rotate a servo 180 degrees when a push button is pushed.
  Servo will go back to 0 degrees when button turned off. There is an LED that will 
  be on/off depending on the state of the push button.  Another LED will blink to show
  activity while the servo is moving.
*/


#include<SimpleServo.h>
#include<Servo.h>

const int servoPin = 5;
const int pin2     = 2;  // pushbutton pin
const int ledPin   = 12; // LED pin
const int actPin   = 13; // activity LED pin

int ledState   = 0;
int ledChanged = 0;

SimpleServo servo(servoPin);

void setup()
{
  Serial.begin(9600);
  pinMode(ledPin, OUTPUT);
  pinMode(actPin, OUTPUT);
  servo.attachPin(servoPin);
  servo.setSpeed(8);
}


void loop()
{
  if(digitalRead(pin2)){
    if(!ledChanged){
         if(HIGH == ledState){//OFF position will reset servo
             servo.setAngle(0);
         }
         else{
             servo.setAngle(180);
         }

         ledState   = !digitalRead(ledPin);
         //Serial.println(ledState);
         ledChanged = 1;
    }
  }
  else{
      ledChanged = 0;
  }

  digitalWrite(ledPin,ledState);

  int moveVal = servo.move();
  Serial.println(moveVal);

  //blink activity light only if servo is moving.
  if(servo.isMoving()){
      if(-1==moveVal){
          digitalWrite(actPin,LOW);
      }
      else{
          digitalWrite(actPin,HIGH);
      }
  }
}