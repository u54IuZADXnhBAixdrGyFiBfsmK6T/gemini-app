
# git

**start**
```
cd <work folder>
git pull
venv\Scripts\Activate.ps1
code .
```
**end**
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
```

```
cd <work folder>
git clone git@github.com:u54IuZADXnhBAixdrGyFiBfsmK6T/gemini-app.git
cd <repositorie name>
```

# vscode terminal
```
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
python -m pip install --upgrade pip
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
$env:GEMINI_API_KEY=""
python app.py
```

# render
```
gunicorn app:app --workers 2 --bind 0.0.0.0:$PORT
pip install -r requirements.txt
GEMINI_API_KEY=""
```

