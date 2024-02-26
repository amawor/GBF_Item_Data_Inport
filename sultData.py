import requests
from bs4 import BeautifulSoup
import pandas as pd
import nums_from_string as nfs

testData=open('グランブルーファンタジー.html','r',encoding="utf-8")
soup=BeautifulSoup(testData, 'html.parser')
items=soup.find_all('div',class_='lis-item treasure se')
ids=[]
qs=[]
for item in items:
    ids.append(nfs.get_nums(item.find('img')['src'])[0])
    qs.append(item.getText().strip())
dict={'id':ids,'quantity':qs}
df=pd.DataFrame(dict)
print(df)