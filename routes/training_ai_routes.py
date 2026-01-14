# routes/training_ai_routes.py
from flask import Blueprint, request, jsonify
import traceback

training_ai_bp = Blueprint('training_ai', __name__)

# TrainingCoach のインポート（エラーハンドリング付き）
try:
    from ai_training_coach import TrainingCoach
    training_coach = TrainingCoach()
except Exception as e:
    print(f"TrainingCoach インポートエラー: {e}")
    traceback.print_exc()
    training_coach = None

@training_ai_bp.route("/api/training/suggest-exercises", methods=["POST"])
def suggest_exercises():
    """メニュー提案API"""
    if training_coach is None:
        return jsonify({"error": "TrainingCoach が初期化されていません"}), 500
    
    try:
        data = request.json
        result = training_coach.suggest_exercises(
            target_muscle=data.get("target_muscle"),
            training_level=data.get("training_level"),
            equipment=data.get("equipment"),
            goals=data.get("goals")
        )
        return jsonify({"result": result})
    except Exception as e:
        print(f"suggest_exercises エラー: {e}")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@training_ai_bp.route("/api/training/improve-form", methods=["POST"])
def improve_form():
    """フォーム改善API"""
    if training_coach is None:
        return jsonify({"error": "TrainingCoach が初期化されていません"}), 500
    
    try:
        data = request.json
        result = training_coach.improve_form(
            exercise_name=data.get("exercise_name"),
            issue=data.get("issue"),
            experience=data.get("experience")
        )
        return jsonify({"result": result})
    except Exception as e:
        print(f"improve_form エラー: {e}")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@training_ai_bp.route("/api/training/injury-recovery", methods=["POST"])
def injury_recovery():
    """怪我対応API"""
    if training_coach is None:
        return jsonify({"error": "TrainingCoach が初期化されていません"}), 500
    
    try:
        data = request.json
        result = training_coach.injury_recovery(
            injury_location=data.get("injury_location"),
            symptoms=data.get("symptoms"),
            pain_level=data.get("pain_level"),
            occurrence=data.get("occurrence")
        )
        return jsonify({"result": result})
    except Exception as e:
        print(f"injury_recovery エラー: {e}")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@training_ai_bp.route("/api/training/design-program", methods=["POST"])
def design_program():
    """プログラム設計API"""
    if training_coach is None:
        return jsonify({"error": "TrainingCoach が初期化されていません"}), 500
    
    try:
        data = request.json
        result = training_coach.design_program(
            goal=data.get("goal"),
            frequency=data.get("frequency"),
            level=data.get("level"),
            available_time=data.get("available_time"),
            limitations=data.get("limitations", "")
        )
        return jsonify({"result": result})
    except Exception as e:
        print(f"design_program エラー: {e}")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500