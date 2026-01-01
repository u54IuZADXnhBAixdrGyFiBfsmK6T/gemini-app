from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

# ユーザーテーブル
class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)

# 部位（胸、背中、脚など）
class Category(db.Model):
    __tablename__ = 'categories'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    display_order = db.Column(db.Integer, default=0)  # 表示順

# 種目（ベンチプレスなど）
class Exercise(db.Model):
    __tablename__ = 'exercises'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    is_recommended = db.Column(db.Boolean, default=False)  # 推奨種目フラグ
    display_order = db.Column(db.Integer, default=0)  # 表示順
    
    # リレーション定義
    category = db.relationship('Category', backref=db.backref('exercises', lazy=True))

# ワークアウトログ（セットごとの記録）
class WorkoutLog(db.Model):
    __tablename__ = 'workout_logs'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    exercise_id = db.Column(db.Integer, db.ForeignKey('exercises.id'), nullable=False)
    date = db.Column(db.Date, nullable=False, default=datetime.utcnow)
    set_number = db.Column(db.Integer, nullable=False)
    weight = db.Column(db.Float, nullable=False)
    reps = db.Column(db.Integer, nullable=False)
    calculated_rm = db.Column(db.Float, nullable=True)
    
    # リレーション
    exercise = db.relationship('Exercise', backref=db.backref('logs', lazy=True))

# 食事記録
class MealLog(db.Model):
    __tablename__ = 'meal_logs'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    date = db.Column(db.Date, nullable=False, default=datetime.utcnow)
    meal_name = db.Column(db.String(100), nullable=False)  # 朝食、昼食、寿司、焼肉など
    protein = db.Column(db.Float, nullable=False, default=0)  # タンパク質(g)
    fat = db.Column(db.Float, nullable=False, default=0)  # 脂質(g)
    carbs = db.Column(db.Float, nullable=False, default=0)  # 炭水化物(g)
    calories = db.Column(db.Float, nullable=False, default=0)  # カロリー(kcal)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# ユーザーの目標設定
class UserGoal(db.Model):
    __tablename__ = 'user_goals'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, unique=True)
    target_calories = db.Column(db.Float, nullable=False, default=2000)  # 目標カロリー
    target_protein = db.Column(db.Float, nullable=False, default=150)  # 目標タンパク質(g)
    target_fat = db.Column(db.Float, nullable=False, default=60)  # 目標脂質(g)
    target_carbs = db.Column(db.Float, nullable=False, default=250)  # 目標炭水化物(g)