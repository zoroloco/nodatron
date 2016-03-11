//digital pins

//sensors
const int pin     = 7;

//globals
int pirState      = LOW;

void setup()
{
  //serial setup
  Serial.begin(9600);

  pinMode(pin,INPUT);
}

void loop()
{
  if(digitalRead(pin)){
    if(pirState==LOW){
      String msg = "{";
      msg.concat(pin);
      msg.concat(":1}");
      Serial.println(msg);
      pirState = HIGH;
    }
  }
  else{
    if(pirState==HIGH){
      String msg = "{";
      msg.concat(pin);
      msg.concat(":0}");
      Serial.println(msg);
      pirState = LOW;
    }
  }
}
