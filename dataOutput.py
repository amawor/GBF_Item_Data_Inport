from datetime import datetime
import json
import pandas as pd


item = json.load(open(r'C:\PYTHON\GBF_Item_Data_Inport\20240308131915_yan.json','r'))
#print (datum['quantity'] for datum in item if datum['id']=='1202')
#print (item[0]['id'])
et=json.load(open('yan.json','r',encoding='utf-8'))
data = json.load(open(r'C:\PYTHON\GBF_Item_Data_Inport\requiredItem.json','r',encoding='utf-8'))

def search(json_str, no):
   # print(json.loads(json_str)[1])
    q=0
    for datum in json.loads(json_str):
        #print(datum['id'])
        if(datum['id']==int(no)):
            q=datum['quantity']
            break
    
    return int(q)

lack={}
for i in range(et.__len__()):
    temp={'name':data['十天眾'][i]['name']}
    print(data['十天眾'][i]['name'])
    lv=int(et[i])
    l=[]
    while(lv<150):
        tn=[]
        td=[]
        lv+=10
        print(lv)
        e=data['十天眾'][i]['levels'][0][str(lv)]
        for j in (range(e.__len__())):
            #print(data['十天眾'][0]['levels'][0]['110'][j]['id'])
            print(e[j]['name']+':'+str(int(e[j]['demand'])-search(json.dumps(item),e[j]['id'])))
            tn.append({e[j]['name']})
            td.append({int(e[j]['demand'])-search(json.dumps(item),e[j]['id'])})
        tl={'name':tn,'demand':td}
        l.append(tl)
    temp.update({str(lv):l})
    lack.update({data['十天眾'][i]['name']:temp})
print(lack)
