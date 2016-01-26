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

        if(receiveData(self.arduino)):
		    return 1
			
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

        if(sendData(self.arduino)):
		    return 1
			
        arduino.close()

#Connect
def connect(threadName,device,baud):
    try:
        arduino = serial.Serial(device,baud,timeout=30)
        if arduino:
		    sys.stdout.write("CONNECTED - "+threadName)
            sys.stdout.flush()
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
	    try:
            cmd = stdin.readline()
            arduino.write(cmd)
		except serial.SerialException:
		    sys.stderr.write("Serial exception while writing. Port probably closed.")			
			return 1
		except serial.SerialTimeoutException:
		    sys.stderr.write("Serial timeout exception while writing.")
			return 1

#RX
def receiveData(arduino):
    while 1:
	    try:
		    bytesInBuffer = arduino.in_Waiting()
			if(bytesInBuffer > 0):
                input = arduino.read(bytesInBuffer)
				if(input is not None):
                    sys.stdout.write(input)
                    sys.stdout.flush()
		except serial.SerialException:
		    sys.stderr.write("Serial exception while reading. Port probably closed.")
			return 1

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

