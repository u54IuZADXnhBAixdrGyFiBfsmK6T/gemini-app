
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

**miss**
```
git reset --hard HEAD~1
git push --force
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
python app.py
```
# dummy-data
食事記録を50件追加
python dummy_data.py create_meals 50

トレーニング記録を100件追加
python dummy_data.py create_workouts 100

4週間分の分割トレーニング記録をスケジュールに沿って追加
python dummy_data.py create_split --weeks 4

全ての食事記録を削除
python dummy_data.py delete_meals

全てのトレーニング記録を削除
python dummy_data.py delete_workouts

# render
```
gunicorn app:app --workers 2 --bind 0.0.0.0:$PORT
pip install -r requirements.txt
GEMINI_API_KEY=""
```

