# app.py

from dotenv import load_dotenv
load_dotenv()

from flask import Flask, render_template, request, jsonify
from ai_coach import AICoach


# Flask 初期化
app = Flask(__name__)
ai_coach = AICoach()

# 画面ルーティング
@app.route("/")
def index():
    return render_template("index.html")

@app.route("/training")
def training():
    return render_template("training.html")

@app.route("/gemini_fitness")
def gemini_fitness():
    return render_template("gemini_fitness.html")

# AI 推薦 API
def validate_number(value, min_, max_, name):
    if value is None:
        raise ValueError(f"{name} が未入力です")

    try:
        v = float(value)
    except (TypeError, ValueError):
        raise ValueError(f"{name} は数値で入力してください")

    if not (min_ <= v <= max_):
        raise ValueError(f"{name} は {min_}〜{max_} の範囲で入力してください")

    return v

@app.route("/get_recommendation", methods=["POST"])
def get_recommendation():
    data = request.json

    if not data:
        return jsonify({"error": "不正なリクエストです"}), 400

    try:
        height = validate_number(data.get("height"), 100, 250, "身長")
        weight = validate_number(data.get("weight"), 30, 200, "体重")

        activity = data.get("activity")
        ideal = data.get("ideal")

        if not activity or not activity.strip() or not ideal or not ideal.strip():
            raise ValueError("生活習慣と理想の体型は必須です")

        result = ai_coach.get_recommendation(
            height=height,
            weight=weight,
            activity=activity,
            ideal=ideal,
        )

        return jsonify({"recommendation": result})

    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception:
        return jsonify({"error": "サーバー内部エラー"}), 500


# 起動
if __name__ == "__main__":
    app.run(debug=True)
