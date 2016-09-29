/*
  SimpleServo.h - Library for feeding a servo an
  angle and speed. This class enables you to control
  a servo in a non-blocking fashion.
*/

#ifndef SimpleServo_h
#define SimpleServo_h

#include "Arduino.h"
#include "Servo.h"
#include "SimpleMessaging.h"

class SimpleServo : public SimpleMessaging
{
    public:
        //This should be called at top of your file.
        SimpleServo();
        //Sets the target angle you want to go to.
        void setAngle(int angle);
        //Value from 1-10. 10 would give you 10ms interval between steps.
        //1 would give you 100ms between steps.
        void setSpeed(int speed);
        int moveAtSpeed(int angle,int speed);
        int move(int angle);
        //Execute the move (non-blocking) for given angle and given speed.
        int move();
        //Move back to 0 degrees.
        void reset();
        //True if current angle not equal to target angle.
        boolean isMoving();
        //Call this in your setup()
        void attachPin(int pin);
        //Kill the servo.
        void detach();
    private:
        //The servo object.
        Servo _servo;
        //The time in ms that the current move began.
        unsigned long _moveStartTime;
        //The time you want elapsed between steps.(calculated from speed).
        unsigned long _timeInterval;
        //Time in ms that last interval occurred.
        unsigned long _lastIntervalTime;
        //Time in ms that has elapsed since last time inerval occurred.
        unsigned long _timeElapsed;
        int _pin;
        //The current angle of the servo.(retains state between moves)
        int _curAngle;
        //The desired target angle of the servo.
        int _targetAngle;
        //Flag to trigger an action only once per unique move.
        boolean _initMove;
        void processMove();
};

#endif
