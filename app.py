from flask import Flask, render_template
import os
from flask import Flask, request, redirect, url_for
from werkzeug.utils import secure_filename
from bs4 import BeautifulSoup
import pandas as pd
import nums_from_string as nfs

UPLOAD_FOLDER = r'C:\Users\leemi\Documents\GBF_Item_Data_Inport'
ALLOWED_EXTENSIONS = set(['html'])

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1] in ALLOWED_EXTENSIONS

def getData(filename):
    testData=open(filename,'r',encoding="utf-8")
    soup=BeautifulSoup(testData, 'html.parser')
    items=soup.find_all('div',class_='lis-item treasure se')
    ids=[]
    qs=[]
    for item in items:
        ids.append(nfs.get_nums(item.find('img')['src'])[0])
        qs.append(item.getText().strip())
    dict={'id':ids,'quantity':qs}
    df=pd.DataFrame(dict)
    return df

@app.route('/', methods=['GET', 'POST'])
def upload_file():
    if request.method == 'POST':
        file = request.files['file']
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file.save(os.path.join(app.config['UPLOAD_FOLDER'],filename))
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
    df=getData(filename)
    
    return render_template(
        "userinfo.html",
        data=df.to_html(),
    )
    
if __name__ == '__main__':
    app.run(debug=True)