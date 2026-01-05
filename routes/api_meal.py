# routes/api_meal.py
from flask import Blueprint, request, jsonify
from extensions import db
from models import MealLog, UserGoal
from sqlalchemy import func
from datetime import datetime

meal_bp = Blueprint('meal_api', __name__)

# API: 指定日の食事記録取得
@meal_bp.route("/api/daily_meals", methods=["GET"])
def get_daily_meals():
    date_str = request.args.get('date')
    user_id = 1
    
    if not date_str:
        return jsonify([])
    
    try:
        target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
    except ValueError:
        return jsonify({"error": "Invalid date format"}), 400
    
    meals = MealLog.query.filter_by(
        user_id=user_id,
        date=target_date
    ).order_by(MealLog.created_at).all()
    
    result = []
    for meal in meals:
        result.append({
            "id": meal.id,
            "meal_name": meal.meal_name,
            "protein": meal.protein,
            "fat": meal.fat,
            "carbs": meal.carbs,
            "calories": meal.calories
        })
    
    return jsonify(result)

# API: 食事の保存
@meal_bp.route("/api/save_meal", methods=["POST"])
def save_meal():
    data = request.json
    user_id = 1
    
    try:
        target_date = datetime.strptime(data['date'], '%Y-%m-%d').date()
        meal_name = data.get('meal_name', '').strip()
        protein = float(data.get('protein', 0))
        fat = float(data.get('fat', 0))
        carbs = float(data.get('carbs', 0))
        
        calories = (protein * 4) + (fat * 9) + (carbs * 4)
        
        if not meal_name:
            return jsonify({"error": "食事名を入力してください"}), 400
        
        new_meal = MealLog(
            user_id=user_id,
            date=target_date,
            meal_name=meal_name,
            protein=protein,
            fat=fat,
            carbs=carbs,
            calories=calories
        )
        
        db.session.add(new_meal)
        db.session.commit()
        
        return jsonify({
            "status": "success",
            "meal": {
                "id": new_meal.id,
                "meal_name": new_meal.meal_name,
                "protein": new_meal.protein,
                "fat": new_meal.fat,
                "carbs": new_meal.carbs,
                "calories": new_meal.calories
            }
        })
        
    except Exception as e:
        db.session.rollback()
        print(f"Error saving meal: {e}")
        return jsonify({"error": str(e)}), 500

# API: 食事の削除
@meal_bp.route("/api/delete_meal", methods=["POST"])
def delete_meal():
    data = request.json
    user_id = 1
    
    try:
        meal_id = int(data.get('id'))
        meal = MealLog.query.filter_by(id=meal_id, user_id=user_id).first()
        if not meal:
            return jsonify({"error": "食事記録が見つかりません"}), 404
        
        db.session.delete(meal)
        db.session.commit()
        return jsonify({"status": "success"})
        
    except Exception as e:
        db.session.rollback()
        print(f"Error deleting meal: {e}")
        return jsonify({"error": str(e)}), 500

# API: 指定月の食事記録日取得
@meal_bp.route("/api/meal_dates", methods=["GET"])
def get_meal_dates():
    year = request.args.get('year', type=int)
    month = request.args.get('month', type=int)
    user_id = 1
    
    if not year or not month:
        return jsonify({"dates": []})
    
    meals = MealLog.query.filter(
        MealLog.user_id == user_id,
        db.extract('year', MealLog.date) == year,
        db.extract('month', MealLog.date) == month
    ).all()
    
    dates = list(set([meal.date.day for meal in meals]))
    return jsonify({"dates": dates})

# API: 指定月の食事記録日数
@meal_bp.route("/api/meal_monthly_stats", methods=["GET"])
def get_meal_monthly_stats():
    year = request.args.get('year', type=int)
    month = request.args.get('month', type=int)
    user_id = 1
    
    monthly_count = db.session.query(
        func.count(func.distinct(MealLog.date))
    ).filter(
        MealLog.user_id == user_id,
        db.extract('year', MealLog.date) == year,
        db.extract('month', MealLog.date) == month
    ).scalar() or 0
    
    total_count = db.session.query(
        func.count(func.distinct(MealLog.date))
    ).filter(
        MealLog.user_id == user_id
    ).scalar() or 0
    
    return jsonify({
        "monthly_days": monthly_count,
        "total_days": total_count
    })

# API: ユーザーの目標取得・設定
@meal_bp.route("/api/user_goal", methods=["GET", "POST"])
def user_goal():
    user_id = 1
    
    if request.method == "GET":
        goal = UserGoal.query.filter_by(user_id=user_id).first()
        if not goal:
            goal = UserGoal(
                user_id=user_id,
                target_calories=2000,
                target_protein=150,
                target_fat=60,
                target_carbs=250
            )
            db.session.add(goal)
            db.session.commit()
        
        return jsonify({
            "target_calories": goal.target_calories,
            "target_protein": goal.target_protein,
            "target_fat": goal.target_fat,
            "target_carbs": goal.target_carbs
        })
    
    else:  # POST
        data = request.json
        goal = UserGoal.query.filter_by(user_id=user_id).first()
        
        if not goal:
            goal = UserGoal(user_id=user_id)
            db.session.add(goal)
        
        goal.target_calories = float(data.get('target_calories', 2000))
        goal.target_protein = float(data.get('target_protein', 150))
        goal.target_fat = float(data.get('target_fat', 60))
        goal.target_carbs = float(data.get('target_carbs', 250))
        
        db.session.commit()
        return jsonify({"status": "success"})

# API: 指定日のPFC合計
@meal_bp.route("/api/daily_pfc", methods=["GET"])
def get_daily_pfc():
    date_str = request.args.get('date')
    user_id = 1
    
    if not date_str:
        return jsonify({})
    
    try:
        target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
    except ValueError:
        return jsonify({"error": "Invalid date format"}), 400
    
    meals = MealLog.query.filter_by(user_id=user_id, date=target_date).all()
    
    total_protein = sum(m.protein for m in meals)
    total_fat = sum(m.fat for m in meals)
    total_carbs = sum(m.carbs for m in meals)
    total_calories = sum(m.calories for m in meals)
    
    return jsonify({
        "protein": round(total_protein, 1),
        "fat": round(total_fat, 1),
        "carbs": round(total_carbs, 1),
        "calories": round(total_calories, 1)
    })