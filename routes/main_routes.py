# routes/main_routes.py
from flask import Blueprint, render_template

main_bp = Blueprint('main', __name__)

@main_bp.route("/")
def index():
    return render_template("index.html")

@main_bp.route("/training")
def training():
    return render_template("db_training.html")

@main_bp.route("/gemini_fitness")
def gemini_fitness():
    return render_template("coach_fitness.html")

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
    return render_template('db_meals.html')

@main_bp.route('/lifestyle')
def lifestyle():
    return render_template('lifestyle.html')

@main_bp.route('/lifestyle/drinking')
def lifestyle_drinking():
    return render_template('lifestyle/lifestyle_drinking.html')

@main_bp.route('/lifestyle/hydration')
def lifestyle_hydration():
    return render_template('lifestyle/lifestyle_hydration.html')

@main_bp.route('/lifestyle/sleep')
def lifestyle_sleep():
    return render_template('lifestyle/lifestyle_sleep.html')

@main_bp.route('/lifestyle/stress')
def lifestyle_stress():
    return render_template('lifestyle/lifestyle_stress.html')

@main_bp.route('/lifestyle/recovery')
def lifestyle_recovery():
    return render_template('lifestyle/lifestyle_recovery.html')

@main_bp.route('/lifestyle/smoking')
def lifestyle_smoking():
    return render_template('lifestyle/lifestyle_smoking.html')

@main_bp.route('/lifestyle/mental_health')
def lifestyle_mental_health():
    return render_template('lifestyle/lifestyle_mental_health.html')

@main_bp.route("/coach_meals")
def coach_meals():
    return render_template("coach_meals.html")

@main_bp.route("/coach_training")
def coach_training():
    return render_template("coach_training.html")