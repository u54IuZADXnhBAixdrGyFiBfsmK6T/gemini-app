# migrate_meal_tables.py
from app import app
from extensions import db
from models import MealLog, UserGoal

def migrate():
    with app.app_context():
        # テーブル作成
        db.create_all()
        
        # デフォルトのユーザー目標を作成（user_id=1）
        existing_goal = UserGoal.query.filter_by(user_id=1).first()
        if not existing_goal:
            default_goal = UserGoal(
                user_id=1,
                target_calories=2000,
                target_protein=150,
                target_fat=60,
                target_carbs=250
            )
            db.session.add(default_goal)
            db.session.commit()
            print("✅ デフォルトの目標を作成しました")
        else:
            print("⚠️  ユーザー目標は既に存在します")
        
        print("✅ 食事記録テーブルのマイグレーション完了！")
        print("   - meal_logs テーブル")
        print("   - user_goals テーブル")

if __name__ == '__main__':
    migrate()