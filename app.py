# app.py

from dotenv import load_dotenv
load_dotenv()

from flask import Flask, render_template, request, jsonify
from ai_coach import AICoach

app = Flask(__name__)
ai_coach = AICoach()

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/training")
def training():
    return render_template("training.html")

@app.route("/gemini_fitness")
def gemini_fitness():
    return render_template("gemini_fitness.html")

@app.route("/get_recommendation", methods=["POST"])
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

if __name__ == "__main__":
    app.run(debug=True)