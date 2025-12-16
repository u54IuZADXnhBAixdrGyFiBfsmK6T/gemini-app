
# git first setting

**作業開始**
```
cd <repositorie name>
git pull
venv\Scripts\Activate.ps1
code .
```
**作業終了**
```
git add .
git commit -m "作業内容の説明"
git push

```
**最初だけ**
```
ssh-keygen -t ed25519
cat ~/.ssh/id_ed25519.pub
ssh -T git@github.com

**2.リポジトリを取得**
cd <work folder>
git clone git@github.com:u54IuZADXnhBAixdrGyFiBfsmK6T/gemini-app.git
cd <repositorie name>
```




# vscode terminal
```
**1.スクリプト実行許可**
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
**2.pip**
python -m pip install --upgrade pip
**3.仮想環境を作成**
python -m venv venv
**4.仮想環境をアクティベート**
.\venv\Scripts\Activate.ps1
**5.必要な全ライブラリをインストール**
pip install -r requirements.txt
**6.APIキーを設定**
$env:GEMINI_API_KEY=""
**7.起動**
python app.py
```
# render
```
gunicorn app:app --workers 2 --bind 0.0.0.0:$PORT
pip install -r requirements.txt
GEMINI_API_KEY=""
```