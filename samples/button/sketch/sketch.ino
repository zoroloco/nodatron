//digital pins

//buttons
const int pin  = 6;

int buttonState     = 0;
bool buttonPressed  = false;

void setup()
{
  //serial setup
  Serial.begin(9600);

  //button setup
  pinMode(pin,INPUT);
}

void loop()
{
  if(digitalRead(pin)){
    buttonPressed = true;
  }
  else{
    if(buttonPressed){
      buttonPressed = false;

      if(buttonState){
        String msg = "{";
        msg.concat(pin);
        msg.concat(":0}");
        Serial.println(msg);
        buttonState = 0;
      }
      else{
        String msg = "{";
        msg.concat(pin);
        msg.concat(":1}");
        Serial.println(msg);
        buttonState = 1;
      }
    }
  }
}
