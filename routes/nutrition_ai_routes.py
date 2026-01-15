# routes/nutrition_ai_routes.py
from flask import Blueprint, request, jsonify
from ai_nutrition_coach import NutritionCoach

nutrition_ai_bp = Blueprint('nutrition_ai', __name__)
nutrition_coach = NutritionCoach()

@nutrition_ai_bp.route("/api/nutrition/calculate-pfc", methods=["POST"])
def calculate_pfc():
    """PFC計算API"""
    data = request.json
    try:
        result = nutrition_coach.calculate_pfc(
            height=data.get("height"),
            weight=data.get("weight"),
            age=data.get("age"),
            gender=data.get("gender"),
            activity_level=data.get("activity_level"),
            goal=data.get("goal")
        )
        return jsonify({"result": result})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@nutrition_ai_bp.route("/api/nutrition/analyze-history", methods=["POST"])
def analyze_history():
    """食事記録分析API"""
    data = request.json
    try:
        from models import MealLog, UserGoal
        from extensions import db
        from datetime import datetime, timedelta
        
        period_days = int(data.get("period_days", 7))
        user_id = data.get("user_id", 1)  # trainingとおなじででふぉるとゆーざーだけ
        
        # 期間の計算
        end_date = datetime.now().date()
        start_date = end_date - timedelta(days=period_days)
        
        # 食事ログを取得
        logs = MealLog.query.filter(
            MealLog.user_id == user_id,
            MealLog.date >= start_date,
            MealLog.date <= end_date
        ).order_by(MealLog.date.desc()).all()
        
        # ユーザーの目標PFCを取得
        user_goal = UserGoal.query.filter_by(user_id=user_id).first()
        
        if not logs:
            return jsonify({
                "result": f"## 📊 記録なし\n\n過去{period_days}日間の食事記録が見つかりませんでした。\n\nまずは記録をつけてみましょう！"
            })
        
        # データを整形
        meal_summary = []
        for log in logs:
            meal_summary.append(
                f"- {log.date.strftime('%Y/%m/%d')}: {log.meal_name} "
                f"(P: {log.protein}g / F: {log.fat}g / C: {log.carbs}g / {log.calories}kcal)"
            )
        
        meal_data = "\n".join(meal_summary)
        
        # 目標PFCの整形
        if user_goal:
            target_pfc = (
                f"- タンパク質: {user_goal.target_protein}g\n"
                f"- 脂質: {user_goal.target_fat}g\n"
                f"- 炭水化物: {user_goal.target_carbs}g\n"
                f"- カロリー: {user_goal.target_calories}kcal"
            )
        else:
            target_pfc = "目標設定なし（一般的な推奨値を基準に分析します）"
        
        # AIに分析させる
        result = nutrition_coach.analyze_meal_history(
            meal_data=meal_data,
            period_days=period_days,
            target_pfc=target_pfc
        )
        return jsonify({"result": result})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@nutrition_ai_bp.route("/api/nutrition/suggest-meals", methods=["POST"])
def suggest_meals():
    """食事提案API"""
    data = request.json
    try:
        result = nutrition_coach.suggest_meals(
            protein=data.get("protein"),
            fat=data.get("fat"),
            carbs=data.get("carbs"),
            meals_count=data.get("meals_count", 3),
            dietary_restrictions=data.get("dietary_restrictions", "")
        )
        return jsonify({"result": result})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@nutrition_ai_bp.route("/api/nutrition/consultation", methods=["POST"])
def consultation():
    """栄養相談API"""
    data = request.json
    try:
        result = nutrition_coach.nutrition_consultation(
            concern=data.get("concern"),
            user_info=data.get("user_info", "")
        )
        return jsonify({"result": result})
    except Exception as e:
        return jsonify({"error": str(e)}), 500