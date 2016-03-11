//digital pins

//leds
const int pin = 2;

//globals
const byte numChars      = 32;
bool  newDataFlag        = false;
char receivedChars[numChars];

void setup()
{
  //serial setup
  Serial.begin(9600);

  //led setup
  pinMode(pin,OUTPUT);
}

void loop()
{
  rxData();
  if(newDataFlag){
     bool ledFlag        = false;

     char * seg = strtok(receivedChars,":");
     int i = 0;

     while (seg != NULL)
     {
       if(i==0){//what pin?
           if(isNumeric(seg)){
             switch(atoi(seg)){
              case pin:
                ledFlag = true;
                break;
              default:
                break;
             }
           }
        }
        else if(i==1){//do something
          if(ledFlag){
            digitalWrite(pin,atoi(seg));
          }
        }

        seg = strtok (NULL, ":");
        i++;
     }

     newDataFlag = false;//reset
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
