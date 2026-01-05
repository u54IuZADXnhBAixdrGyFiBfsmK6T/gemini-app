# routes/main_routes.py
from flask import Blueprint, render_template

main_bp = Blueprint('main', __name__)

@main_bp.route("/")
def index():
    return render_template("index.html")

@main_bp.route("/training")
def training():
    return render_template("training.html")

@main_bp.route("/gemini_fitness")
def gemini_fitness():
    return render_template("gemini_fitness.html")

@main_bp.route("/record_workout")
def record_workout():
    return render_template("record_workout.html")

@main_bp.route("/manage_exercises")
def manage_exercises():
    return render_template("manage_exercises.html")

@main_bp.route("/record_meal")
def record_meal():
    return render_template("record_meal.html")

@main_bp.route('/meals')
def meals():
    return render_template('meals.html')