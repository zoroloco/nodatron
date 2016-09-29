#include<SoftwareSerial.h>
#include<SimpleServo.h>
#include<Servo.h>

//digital pins

//leds
const int powerLedPin     = 2;
const int activityLedPin  = 3;
const int motionLedPin    = 4;
const int tcpLedPin       = 5;

//emic 2 speech module
const int soutPin         = 13;
const int sinPin          = 12;
SoftwareSerial emicSerial = SoftwareSerial(soutPin,sinPin);

//buttons
const int powerButtonPin  = 6;

//sensors
const int pirFrontPin     = 7;
const int pirLeftPin      = 8;
const int pirRightPin     = 11;

//servos
const int servoBasePin    = 9;
const int servoCamPin     = 10;

SimpleServo baseServo;
SimpleServo camServo;

//globals
int pirFrontState        = LOW;
int pirLeftState         = LOW;
int pirRightState        = LOW;
int powerButtonState     = 0;
bool powerButtonPressed  = false;
const byte numChars      = 32;
bool  newDataFlag        = false;
char receivedChars[numChars];

void setup()
{
  //serial setup
  Serial.begin(9600);

  //servo setup
  baseServo.attachPin(servoBasePin);
  camServo.attachPin(servoCamPin);
  baseServo.setSpeed(8);
  camServo.setSpeed(8);

  //led setup
  pinMode(powerLedPin,OUTPUT);
  pinMode(activityLedPin,OUTPUT);
  pinMode(motionLedPin,OUTPUT);
  pinMode(tcpLedPin,OUTPUT);

  //sensor setup
  pinMode(pirFrontPin,INPUT);
  pinMode(pirLeftPin,INPUT);
  pinMode(pirRightPin,INPUT);

  //button setup
  pinMode(powerButtonPin,INPUT);

  //emic 2 speech module setup
  pinMode(soutPin,INPUT);
  pinMode(sinPin,OUTPUT);
  emicSerial.begin(9600);
  emicSerial.print('\n');
  while(emicSerial.read() != ':');
  delay(10);
  emicSerial.flush();
}

void loop()
{
  rxData();
  if(newDataFlag){
     bool servoBaseFlag     = false;
     bool servoCamFlag      = false;

     bool powerLedFlag      = false;
     bool activityLedFlag   = false;
     bool motionLedFlag     = false;
     bool tcpLedFlag        = false;

     bool emicFlag          = false;

     char * seg = strtok(receivedChars,":");
     int i = 0;

     while (seg != NULL)
     {
       if(i==0){//what pin?
           if(isNumeric(seg)){
             switch(atoi(seg)){
              case servoBasePin:
                servoBaseFlag = true;
                break;
              case servoCamPin:
                servoCamFlag = true;
                break;
              case powerLedPin:
                powerLedFlag = true;
                break;
              case activityLedPin:
                activityLedFlag = true;
                break;
              case motionLedPin:
                motionLedFlag = true;
                break;
              case tcpLedPin:
                tcpLedFlag = true;
              case sinPin:
                emicFlag = true;
              default:
                break;
             }
           }
           else{//analog pin
             if( strcmp (seg,"A0") == 0){

             }
             else if( strcmp (seg, "A1") == 0){

             }
             else if( strcmp (seg, "A2") == 0){

             }
             else if( strcmp (seg, "A3") == 0){

             }
             else if( strcmp (seg, "A4") == 0){

             }
             else if( strcmp (seg, "A5") == 0){

             }
           }
        }
        else if(i==1){//do something
          if(servoBaseFlag){
            baseServo.setAngle(atoi(seg));
          }
          else if(servoCamFlag){
            camServo.setAngle(atoi(seg));
          }
          else if(powerLedFlag){
            digitalWrite(powerLedPin,atoi(seg));
          }
          else if(activityLedFlag){
            digitalWrite(activityLedPin,atoi(seg));
          }
          else if(motionLedFlag){
            digitalWrite(motionLedPin,atoi(seg));
          }
          else if(tcpLedFlag){
            digitalWrite(tcpLedPin,atoi(seg));
          }
          else if(emicFlag){
            emicSerial.print('S');
            emicSerial.print(seg);
          }
        }

        seg = strtok (NULL, ":");
        i++;
     }

     newDataFlag = false;//reset
  }

  detectPowerButton();
  detectFrontMotion();
  detectLeftMotion();
  detectRightMotion();
  baseServo.move();
  camServo.move();
}

void detectPowerButton(){
  if(digitalRead(powerButtonPin)){
    powerButtonPressed = true;
  }
  else{
    if(powerButtonPressed){
      powerButtonPressed = false;

      if(powerButtonState){
        String msg = "{";
        msg.concat(powerButtonPin);
        msg.concat(":0}");
        Serial.println(msg);

        powerButtonState = LOW;
      }
      else{
        String msg = "{";
        msg.concat(powerButtonPin);
        msg.concat(":1}");
        Serial.println(msg);

        powerButtonState = HIGH;
      }
    }
  }
}

void detectFrontMotion(){
  if(digitalRead(pirFrontPin)){
    if(pirFrontState==LOW){
      String msg = "{";
      msg.concat(pirFrontPin);
      msg.concat(":1}");
      Serial.println(msg);

      pirFrontState = HIGH;
    }
  }
  else{
    if(pirFrontState==HIGH){
      String msg = "{";
      msg.concat(pirFrontPin);
      msg.concat(":0}");
      Serial.println(msg);

      pirFrontState = LOW;
    }
  }
}

void detectLeftMotion(){
  if(digitalRead(pirLeftPin)){
    if(pirLeftState==LOW){
      String msg = "{";
      msg.concat(pirLeftPin);
      msg.concat(":1}");
      Serial.println(msg);

      pirLeftState = HIGH;
    }
  }
  else{
    if(pirLeftState==HIGH){
      String msg = "{";
      msg.concat(pirLeftPin);
      msg.concat(":0}");
      Serial.println(msg);

      pirLeftState = LOW;
    }
  }
}

void detectRightMotion(){
  if(digitalRead(pirRightPin)){
    if(pirRightState==LOW){
      String msg = "{";
      msg.concat(pirRightPin);
      msg.concat(":1}");
      Serial.println(msg);

      pirRightState = HIGH;
    }
  }
  else{
    if(pirRightState==HIGH){
      String msg = "{";
      msg.concat(pirRightPin);
      msg.concat(":0}");
      Serial.println(msg);

      pirRightState = LOW;
    }
  }
}

void rxData() {
        static byte ndx = 0;
        char endMarker = '\n';
        char rc;

    while (Serial.available() > 0 && newDataFlag == false) {
        rc = Serial.read();

        if (rc != endMarker) {
            receivedChars[ndx] = rc;
            ndx++;
            if (ndx >= numChars) {
                ndx = numChars - 1;
            }
        }
        else {
          receivedChars[ndx] = '\0'; // terminate the string
          ndx = 0;
          newDataFlag = true;
        }
    }
}

bool isNumeric(char *string)
{
    int sizeOfString = strlen(string);
    int iteration = 0;
    bool isNumeric = true;

    while(iteration < sizeOfString)
    {
        if(!isdigit(string[iteration]))
        {
            isNumeric = false;
            break;
        }

        iteration++;

    }

    return isNumeric;
}
