from machine import Pin, ADC, UART
from time import sleep_ms
import sys
import gc

class ADCReader():
    
    def __init__(self, pin):
        
        self.adc = ADC(Pin(pin))
        
    def read(self):
        
        self.adc.read_u16()
        
        return self.adc.read_u16().to_bytes(2, 'big')
        

adcs = [ADCReader(26), ADCReader(27)]

buf = None

start = 192

while True:
    gc.collect()
    buf = start.to_bytes(1, 'big')
    for adc in adcs:
        buf += adc.read()
    sys.stdout.buffer.write(buf)
    sleep_ms(5)