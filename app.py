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


app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'C:\\PYTHON\\GBF_Item_Data_Inport'
ALLOWED_EXTENSIONS = {'html'}

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB
app.config['JSON_FILE'] = datetime.now().strftime("%Y%m%d%H%M%S") + '_yan.json'

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
        with open(app.config['JSON_FILE'], 'w') as f:
            #print(data)
            json.dump(datas, f, indent=4)
            return 'Data saved to ' + app.config['JSON_FILE']
    else:
        return 'No data found'

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
    with open(app.config['JSON_FILE'], 'r') as f:
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
    return status

if __name__ == '__main__':
    #app.debug = True
    app.run(debug=True)
