# app.py

from dotenv import load_dotenv
load_dotenv()

from flask import Flask
from extensions import db

# 分割したブループリントをインポート
from routes.main_routes import main_bp
from routes.ai_routes import ai_bp
from routes.api_workout import workout_bp
from routes.api_meal import meal_bp

# モデルもインポート（create_all用）
# 注: ここでインポートしないとSQLAlchemyがモデルを認識できない場合があります
import models 

def create_app():
    app = Flask(__name__)

    # データベース設定
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///fitness.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # DB初期化
    db.init_app(app)

    # Blueprintの登録
    app.register_blueprint(main_bp)
    app.register_blueprint(ai_bp)
    app.register_blueprint(workout_bp)
    app.register_blueprint(meal_bp)

    # アプリ起動時にテーブルを作成
    with app.app_context():
        db.create_all()
    
    return app

app = create_app()

if __name__ == "__main__":
    app.run(debug=True)