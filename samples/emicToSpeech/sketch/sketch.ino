#include<SoftwareSerial.h>

//emic 2 speech module
const int soutPin         = 13;
const int sinPin          = 12;
SoftwareSerial emicSerial = SoftwareSerial(soutPin,sinPin);

//globals
const byte numChars      = 32;
bool  newDataFlag        = false;
char receivedChars[numChars];

void setup()
{
  //serial setup
  Serial.begin(9600);

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
     bool emicFlag          = false;

     char * seg = strtok(receivedChars,":");
     int i = 0;

     while (seg != NULL)
     {
       if(i==0){//what pin?
           if(isNumeric(seg)){
             switch(atoi(seg)){
              case pin:
                emicFlag = true;
                break;
              default:
                break;
             }
           }
        }
        else if(i==1){//do something
          if(emicFlag){
            emicSerial.print('S');
            emicSerial.print(seg);
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
