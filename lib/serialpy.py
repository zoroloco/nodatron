#!/usr/bin/python2

import sys
import time
import threading
import getopt
import serial
from sys import stdin

device = '' # /dev/ttyACM0
baud   = '' #9600

#serialIn thread
class serialIn (threading.Thread):
    def __init__(self, threadID, name,device,baud):
        threading.Thread.__init__(self)
        self.threadID = threadID
        self.name     = name
        self.arduino  = connect(self.name,device,baud)
    def run(self):
        if not self.arduino:
            return 1

        receiveData(self.arduino)
        arduino.close()

#serialOut thread
class serialOut (threading.Thread):
    def __init__(self, threadID, name,device,baud):
        threading.Thread.__init__(self)
        self.threadID = threadID
        self.name     = name
        self.arduino  = connect(self.name,device,baud)
    def run(self):
        if not self.arduino:
            return 1

        sendData(self.arduino)
        arduino.close()

#Connect
def connect(threadName,device,baud):
    try:
        arduino = serial.Serial(device,baud,timeout=30)
        if arduino:
            return arduino
        else:
            sys.stderr.write(threadName+"Error with call to serial.Serial during connection.")
            return None
    except:
        sys.stderr.write(threadName+": Error opening serial port.\n")

    return None

#TX
def sendData(arduino):
    while 1:
        cmd = stdin.readline()
        arduino.write(cmd)

#RX
def receiveData(arduino):
    lastInput = ''
    while 1:
        input = arduino.readline()#read 1 byte at a time
        if(lastInput != input):#only stdout data if new
            sys.stdout.write(input)
            lastInput = input

#start
try:
    opts, args = getopt.getopt(sys.argv[1:], 'd:b', ['device=','baud='])
except getopt.GetoptError:
    sys.stderr.write("Invalid commandline argument.\n")
    sys.exit(2)

for opt, arg in opts:
    if opt in ('--device','d'):
        device = arg
    if opt in ('--baud','b'):
        baud = arg

if not baud or not device:
    sys.stderr.write("Device and Baud rate are required.\n")
    sys.exit(2)

#start thread management
serialInThread = serialIn(1, "SerialIn", device,baud)
if serialInThread:
    serialInThread.start()
else:
    sys.stderr.write("Error starting thread serialIn\n")

serialOutThread= serialOut(2, "SerialOut", device,baud)
if serialOutThread:
    serialOutThread.start()
else:
    sys.stderr.write("Error starting thread serialOut\n")

