import requests
from bs4 import BeautifulSoup
import pandas as pd

testData=open('testData.html','r',encoding="utf-8")
soup=BeautifulSoup(testData, 'html.parser')
items=soup.find_all('div',class_='lis-item treasure se')
ids=[]
qs=[]
for item in items:
    ids.append(item.find('img')['src'].replace('https://prd-game-a-granbluefantasy.akamaized.net/assets/img/sp/assets/item/article/s/','').replace('.jpg',''))
    qs.append(item.getText().strip())
dict={'id':ids,'quantity':qs}
df=pd.DataFrame(dict)
print(df)