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