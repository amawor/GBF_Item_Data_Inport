# app.py (Flask 應用程式)

from flask import Flask, render_template, request, redirect, url_for, send_from_directory
from werkzeug.utils import secure_filename
from bs4 import BeautifulSoup
import pandas as pd
import os
import sqlite3

UPLOAD_FOLDER = 'C:\\PYTHON\\GBF_Item_Data_Inport'
ALLOWED_EXTENSIONS = {'html'}

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB

# 設定資料庫
DATABASE = 'database.db'

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def getData(filename):
    testData=open(filename,'r',encoding="utf-8")
    soup=BeautifulSoup(testData, 'html.parser')
    items=soup.find_all('div',class_='lis-item treasure se')
    ids=[]
    qs=[]
    for item in items:
        ids.append(item.find('img')['src'].replace('https://prd-game-a-granbluefantasy.akamaized.net/assets/img/sp/assets/item/article/s/','').replace('.jpg',''))
        qs.append(item.getText().strip())
    dict={'id':ids,'quantity':qs}
    df=pd.DataFrame(dict)
    return df

def init_db():
    with sqlite3.connect(app.config['DATABASE']) as conn:
        conn.execute('CREATE TABLE IF NOT EXISTS items (id INTEGER PRIMARY KEY AUTOINCREMENT, item_id TEXT, quantity TEXT)')
        conn.commit()

def insert_data(df):
    with sqlite3.connect(app.config['DATABASE']) as conn:
        df.to_sql('items', conn, if_exists='append', index=False)
        conn.commit()

@app.before_first_request
def before_first_request():
    init_db()

@app.route('/', methods=['GET', 'POST'])
def upload_file():
    if request.method == 'POST':
        file = request.files['file']
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            df = getData(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            insert_data(df)
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
    df = getData(os.path.join(app.config['UPLOAD_FOLDER'], filename))
    return render_template("userinfo.html", data=df.to_html())

@app.route('/api/uploadHTML', methods=['POST'])
def upload_html():
    if 'html' not in request.files:
        return 'No file part'

    file = request.files['html']
    if file.filename == '':
        return 'No selected file'

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
        df = getData(os.path.join(app.config['UPLOAD_FOLDER'], filename))
        insert_data(df)
        return 'HTML file uploaded successfully'

if __name__ == '__main__':
    app.run(debug=True)
