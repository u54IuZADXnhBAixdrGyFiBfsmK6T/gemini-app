render
    gunicorn app:app --workers 2 --bind 0.0.0.0:$PORT
    pip install -r requirements.txt
    GEMINI_API_KEY=""


terminal
    1.スクリプト実行許可
    Set-ExecutionPolicy RemoteSigned -Scope CurrentUser -Force

    2.pip 
    python -m pip install --upgrade pip

    3.仮想環境を作成
    python -m venv venv


    4.仮想環境をアクティベート
    .\venv\Scripts\Activate.ps1


    5.必要な全ライブラリをインストール
    pip install -r requirements.txt


    6.APIキーを設定
    $env:GEMINI_API_KEY=""


    7.起動
    python app.py