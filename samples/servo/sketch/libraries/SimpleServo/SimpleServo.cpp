#include "Arduino.h"
#include "SimpleServo.h"
#include "Servo.h"
#include "SimpleMessaging.h"

SimpleServo::SimpleServo()
{
    _moveStartTime    = 0;
    _lastIntervalTime = 0;
    _timeInterval     = 0;
    _curAngle         = 0;
    _initMove         = false;
    _targetAngle      = 0;
    _timeElapsed      = 0;
}

void SimpleServo::attachPin(int pin){
        _pin = pin;

    if(_servo.attached())
        detach();

    _servo.attach(pin);
}

void SimpleServo::detach(){
    _servo.detach();
}

void SimpleServo::reset(){
    move(0);
}

void SimpleServo::setAngle(int angle){
    _targetAngle = angle;
}

//speed is given in range [1-10]
void SimpleServo::setSpeed(int speed){
    if(speed >0 && speed<=10){
        _timeInterval = 110 - speed*10;
    }
}

int SimpleServo::moveAtSpeed(int angle,int speed){
    setSpeed(speed);
    return move(angle);
}

boolean SimpleServo::isMoving(){
    return (_targetAngle!=_curAngle);
}

int SimpleServo::move(){
    move(_curAngle);
}

int SimpleServo::move(int angle){

        if(angle>180 || angle<0)//bounds check
                return _curAngle;

        unsigned long currentMillis = millis();//always moving

        //do once per move
        if(!_initMove){
                _timeElapsed      = 0;
                _targetAngle      = angle;
                _moveStartTime    = currentMillis;
                _initMove         = true;
                _lastIntervalTime = _moveStartTime;
        }


        _timeElapsed = currentMillis - _lastIntervalTime;

        //did our set time interval satisfy?
        if(_timeElapsed >= _timeInterval){
                _lastIntervalTime = currentMillis;//slide over
                _timeElapsed      = 0;//reset

                if(_curAngle < _targetAngle){//we want to move forward
                        processMove();
                        _curAngle++;
                }
                else if(_curAngle > _targetAngle){//we want to move backward
                        processMove();
                        _curAngle--;
                }
                else{//pos has reached target _targetAngle
                        _initMove = false;//ready for next move
                }

                return _curAngle;
        }
        else{//move did not occur in this cycle.
                return -1;
        }
}

void SimpleServo::processMove(){
    if(_servo.attached()){
        _servo.write(_curAngle);
        //Serial.println(_servo.read());
    }
}
