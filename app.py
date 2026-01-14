# app.py

from dotenv import load_dotenv
load_dotenv(override=True)

from flask import Flask
from extensions import db

# 分割したブループリントをインポート
from routes.main_routes import main_bp
from routes.ai_routes import ai_bp
from routes.api_workout import workout_bp
from routes.api_meal import meal_bp
from routes.nutrition_ai_routes import nutrition_ai_bp
from routes.training_ai_routes import training_ai_bp  # ← この行を追加

import models 

def create_app():
    app = Flask(__name__)

    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///fitness.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    db.init_app(app)

    # Blueprintの登録
    app.register_blueprint(main_bp)
    app.register_blueprint(ai_bp)
    app.register_blueprint(workout_bp)
    app.register_blueprint(meal_bp)
    app.register_blueprint(nutrition_ai_bp)
    app.register_blueprint(training_ai_bp) 

    with app.app_context():
        db.create_all()
    
    return app

app = create_app()

if __name__ == "__main__":
    app.run(debug=True)