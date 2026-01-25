# app.py
import os
from dotenv import load_dotenv
load_dotenv(override=True)

from flask import Flask
from flask_migrate import Migrate
from extensions import db
import models

# Blueprintのインポート
from routes.main_routes import main_bp
from routes.ai_routes import ai_bp
from routes.api_workout import workout_bp
from routes.api_meal import meal_bp
from routes.nutrition_ai_routes import nutrition_ai_bp
from routes.training_ai_routes import training_ai_bp

def create_app():
    app = Flask(__name__)
    
    # .envファイルからデータベースのパスを読み込む、なければデフォルト値
    db_path = os.environ.get('DATABASE_URL', 'sqlite:///fitness.db').replace('sqlite:///', 'sqlite:///./')
    
    app.config['SQLALCHEMY_DATABASE_URI'] = db_path
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    db.init_app(app)
    
    # Blueprintの登録
    app.register_blueprint(main_bp)
    app.register_blueprint(ai_bp)
    app.register_blueprint(workout_bp)
    app.register_blueprint(meal_bp)
    app.register_blueprint(nutrition_ai_bp)
    app.register_blueprint(training_ai_bp) 

    return app

app = create_app()
migrate = Migrate(app, db)

@app.cli.command('init-db')
def init_db_command():
    """データベースをクリアし、初期データを投入します。"""
    with app.app_context():
        db.drop_all()
        db.create_all()
        
        # デフォルトユーザーの作成
        user = models.User(username='default_user')
        db.session.add(user)
        db.session.flush()
        
        # カテゴリと種目の作成
        categories_data = [
            {'name': '胸', 'exercises': ['ベンチプレス', 'インクラインベンチプレス', 'デクラインベンチプレス', 'ダンベルプレス', 'ダンベルフライ', 'ケーブルクロスオーバー', 'プッシュアップ', 'ディップス']},
            {'name': '背中', 'exercises': ['デッドリフト', 'ベントオーバーロウ', 'ラットプルダウン', 'チンニング', 'ワンハンドダンベルロウ', 'シーテッドロウ', 'Tバーロウ', 'ケーブルロウ']},
            {'name': '脚', 'exercises': ['スクワット', 'レッグプレス', 'レッグエクステンション', 'レッグカール', 'ランジ', 'ブルガリアンスクワット', 'カーフレイズ', 'レッグアダクション']},
            {'name': '肩', 'exercises': ['ショルダープレス', 'サイドレイズ', 'フロントレイズ', 'リアレイズ', 'アップライトロウ', 'シュラッグ', 'ダンベルショルダープレス', 'アーノルドプレス']},
            {'name': '腕', 'exercises': ['バーベルカール', 'ダンベルカール', 'ハンマーカール', 'トライセプスエクステンション', 'トライセプスキックバック', 'クローズグリップベンチプレス', 'ケーブルプレスダウン', 'リストカール']},
            {'name': '腹筋', 'exercises': ['クランチ', 'レッグレイズ', 'プランク', 'サイドプランク', 'ロシアンツイスト', 'バイシクルクランチ', 'ハンギングレッグレイズ', 'アブローラー']}
        ]
        
        for cat_data in categories_data:
            category = models.Category(name=cat_data['name'], user_id=None)
            db.session.add(category)
            db.session.flush()
            
            for ex_name in cat_data['exercises']:
                exercise = models.Exercise(name=ex_name, category_id=category.id, user_id=None)
                db.session.add(exercise)
        
        db.session.commit()
        print('OK: データベースの初期化が完了しました！')

    return app

app = create_app()

if __name__ == "__main__":
    app.run(debug=True)