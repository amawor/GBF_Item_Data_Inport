from datetime import datetime
import json
import pandas as pd


L=[1,2,3,4]
C=[5,6,7,8]
print(L+C)


item = json.load(open(r'C:\PYTHON\GBF_Item_Data_Inport\20240308131915_yan.json','r'))
print (item[0]['id'])
et=json.load(open('yan.json','r'))
data = json.load(open('requiredItem .json','r'))

with open('ids.json','r') as f:
    data = json.load(f)
    