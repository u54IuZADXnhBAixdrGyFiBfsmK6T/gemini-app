# routes/nutrition_ai_routes.py
from flask import Blueprint, request, jsonify
from services.ai_nutrition_coach import NutritionCoach
from services.ai_tips_generator import TipsGenerator
import traceback

nutrition_ai_bp = Blueprint('nutrition_ai', __name__)
nutrition_coach = NutritionCoach()
tips_generator = TipsGenerator(use_ai=False) 
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
        from collections import defaultdict
        
        period_days = int(data.get("period_days", 7))
        user_id = data.get("user_id", 1)
        
        end_date = datetime.now().date()
        start_date = end_date - timedelta(days=period_days)
        
        logs = MealLog.query.filter(
            MealLog.user_id == user_id,
            MealLog.date >= start_date,
            MealLog.date <= end_date
        ).order_by(MealLog.date.desc()).all()
        
        user_goal = UserGoal.query.filter_by(user_id=user_id).first()
        
        if not logs:
            return jsonify({
                "result": f"## 📊 記録なし\n\n過去{period_days}日間の食事記録が見つかりませんでした。\n\nまずは記録をつけてみましょう！"
            })
            
        # 日毎の合計値を計算
        daily_totals = defaultdict(lambda: {'protein': 0, 'fat': 0, 'carbs': 0, 'calories': 0})
        for log in logs:
            date_str = log.date.strftime('%Y/%m/%d')
            daily_totals[date_str]['protein'] += log.protein
            daily_totals[date_str]['fat'] += log.fat
            daily_totals[date_str]['carbs'] += log.carbs
            daily_totals[date_str]['calories'] += log.calories

        # 期間内の総計を計算
        total_protein = sum(log.protein for log in logs)
        total_fat = sum(log.fat for log in logs)
        total_carbs = sum(log.carbs for log in logs)
        total_calories = sum(log.calories for log in logs)
        
        # 平均を計算するための実際の日数を取得
        num_days = len(daily_totals)
        
        # 1日あたりの平均摂取量を計算
        avg_protein = total_protein / num_days if num_days > 0 else 0
        avg_fat = total_fat / num_days if num_days > 0 else 0
        avg_carbs = total_carbs / num_days if num_days > 0 else 0
        avg_calories = total_calories / num_days if num_days > 0 else 0

        # AIに渡すためのサマリーを作成
        # 平均摂取量のサマリー
        average_intake_summary = (
            f"- **タンパク質**: {avg_protein:.1f} g/日\n"
            f"- **脂質**: {avg_fat:.1f} g/日\n"
            f"- **炭水化物**: {avg_carbs:.1f} g/日\n"
            f"- **総カロリー**: {avg_calories:.1f} kcal/日"
        )
        
        # 日毎の摂取量サマリー
        daily_intake_summary = []
        for date, totals in sorted(daily_totals.items(), key=lambda item: item[0], reverse=True):
            daily_summary = (
                f"#### {date}\n"
                f"- タンパク質: {totals['protein']:.1f}g, "
                f"脂質: {totals['fat']:.1f}g, "
                f"炭水化物: {totals['carbs']:.1f}g, "
                f"カロリー: {totals['calories']:.1f}kcal"
            )
            daily_intake_summary.append(daily_summary)
        
        if user_goal:
            target_pfc = (
                f"- タンパク質: {user_goal.target_protein}g\n"
                f"- 脂質: {user_goal.target_fat}g\n"
                f"- 炭水化物: {user_goal.target_carbs}g\n"
                f"- カロリー: {user_goal.target_calories}kcal"
            )
        else:
            target_pfc = "目標設定なし（一般的な推奨値を基準に分析します）"
        
        result = nutrition_coach.analyze_meal_history(
            period_days=num_days,
            target_pfc=target_pfc,
            average_intake=average_intake_summary,
            daily_breakdown="\n".join(daily_intake_summary)
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
    """健康相談API"""
    data = request.json
    try:
        result = nutrition_coach.nutrition_consultation(
            concern=data.get("concern"),
            user_info=data.get("user_info", "")
        )
        return jsonify({"result": result})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ========================================
# 🆕 Tips生成エンドポイント（追加）
# ========================================
@nutrition_ai_bp.route('/api/nutrition/generate-tips', methods=['POST'])
def generate_nutrition_tips():
    """栄養関連のTipsを動的生成"""
    try:
        data = request.get_json()
        
        context_data = {
            'goal': data.get('goal', ''),
            'activity_level': data.get('activity_level', '')
        }
        
        tips_list = tips_generator.generate_nutrition_tips(context_data=context_data)
        
        return jsonify({
            'success': True,
            'tips': tips_list
        })
    
    except Exception as e:
        print(f"Tips生成エラー: {e}")
        traceback.print_exc()
        fallback_tips = [
            '💡 タンパク質は体重×2gを目安に摂取しましょう',
            '💡 炭水化物はトレーニング前後に集中させると効率的',
            '💡 良質な脂質は1日50-70gが目安です'
        ]
        return jsonify({
            'success': True,
            'tips': fallback_tips
        })