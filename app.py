# app.py (Flask 應用程式)

from datetime import datetime
import json
from flask import Flask, render_template, request, redirect, url_for, send_from_directory, jsonify
from werkzeug.utils import secure_filename
from bs4 import BeautifulSoup
import pandas as pd
import os
from flask_cors import CORS
import nums_from_string as nfs
import requests
import openpyxl

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'C:\\PYTHON\\GBF_Item_Data_Inport'
ALLOWED_EXTENSIONS = {'html'}

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB
app.config['JSON_FILE'] = datetime.now().strftime("%Y%m%d%H%M%S") 

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def save_data_to_json(data):
    soup = BeautifulSoup(data, 'html.parser')
    items = soup.find_all('div', class_='lis-item treasure se')
    datas = []
    for item in items:
        item_id = nfs.get_nums(item.find('img')['src'])[0]
        quantity = item.get_text().strip()
        datas.append({'id': item_id, 'quantity': quantity})
    if datas:
        with open(app.config['JSON_FILE']+ '_yan.json', 'w') as f:
            #print(data)
            json.dump(datas, f, indent=4)
            return app.config['JSON_FILE']
    else:
        return 'No data found'

def search(json_str, no):
    return [datum['quantity'] for datum in json.loads(json_str) if datum['id']==no]
    
def outputData(filename):
    wb = openpyxl.load_workbook('GBF素材需求量 (1).xlsx')     # 開啟 Excel 檔案

    s1 = wb['工作表6']

    jsonFile = open(filename+ '_yan.json','r')
    f =  jsonFile.read()   # 要先使用 read 讀取檔案
    a = json.loads(f)      # 再使用 loads
    print (a[0]['id'])
    with open('ids.json','r') as f:
        data = json.load(f)
        for i in range(data.__len__()):
            s1['B'+(str(i+1))].value=search(json.dumps(a), data[i])[0]
    wb.save(filename+'.xlsx')  # 存檔
    return 'success'

@app.route('/', methods=['GET', 'POST'])
def upload_file():
    if request.method == 'POST':
        file = request.files['file']
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            testData = open(os.path.join(app.config['UPLOAD_FOLDER'], filename), 'r', encoding="utf-8")
            #data = getData(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            save_data_to_json(testData)
            return redirect(url_for('uploaded_file', filename=filename))
    return '''
    <!doctype html>
    <title>Upload new File</title>
    <h1>Upload new File</h1>
    <form action="" method=post enctype=multipart/form-data>
      <p><input type=file name=file>
         <input type=submit value=Upload>
    </form>
    '''

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    with open(app.config['JSON_FILE']+ '_yan.json', 'r') as f:
        data = json.load(f)
    return render_template("userinfo.html", data=data)

@app.route('/api/uploadHTML', methods=['POST'])
def upload_html():
    if request.data.__contains__(b'html') == False:
        print('No file part')
        print(request.data)
        return 'No file part'

    status=save_data_to_json(request.data)
    print(status)
    if(status == 'No data found'):
        return status
    else:
        status = outputData(status)
        return status

if __name__ == '__main__':
    #app.debug = True
    app.run(debug=True)
