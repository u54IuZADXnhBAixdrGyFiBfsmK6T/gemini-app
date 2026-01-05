# routes/ai_routes.py
from flask import Blueprint, request, jsonify
from ai_coach import AICoach

ai_bp = Blueprint('ai', __name__)
ai_coach = AICoach()

@ai_bp.route("/get_recommendation", methods=["POST"])
def get_recommendation():
    data = request.json
    try:
        result = ai_coach.get_recommendation(
            height=data.get("height"),
            weight=data.get("weight"),
            activity=data.get("activity"),
            ideal=data.get("ideal"),
        )
        return jsonify({"recommendation": result})
    except Exception as e:
        return jsonify({"error": str(e)}), 500