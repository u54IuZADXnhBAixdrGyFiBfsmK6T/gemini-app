# app.py

from dotenv import load_dotenv
load_dotenv()

from flask import Flask, render_template, request, jsonify
from ai_coach import AICoach

# models.py から db とモデルクラスをインポート
from models import db, User, Category, Exercise, WorkoutLog, MealLog, UserGoal
from datetime import datetime
from sqlalchemy import func

app = Flask(__name__)
ai_coach = AICoach()

# データベース設定
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///fitness.db' # 開発用SQLite
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# DB初期化
db.init_app(app)

# アプリ起動時にテーブルを作成
with app.app_context():
    db.create_all()

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

# --- ここからトレーニング記録機能の追加ルート ---

@app.route("/record_workout")
def record_workout():
    return render_template("record_workout.html")

@app.route("/manage_exercises")
def manage_exercises():
    return render_template("manage_exercises.html")

@app.route("/record_meal")
def record_meal():
    return render_template("record_meal.html")

# ===== 食事記録API =====

# API: 指定した月の日別トレーニング有無を取得（カレンダーのドット用）
@app.route("/api/workout_dates", methods=["GET"])
def get_workout_dates():
    year = request.args.get('year', type=int)
    month = request.args.get('month', type=int)
    # 簡易認証: user_id=1 と仮定
    user_id = 1 
    
    if not year or not month:
        return jsonify({"dates": []})

    logs = WorkoutLog.query.filter(
        WorkoutLog.user_id == user_id,
        db.extract('year', WorkoutLog.date) == year,
        db.extract('month', WorkoutLog.date) == month
    ).all()
    
    # 重複を除いて日付リストを返す
    dates = list(set([log.date.day for log in logs]))
    return jsonify({"dates": dates})

# API: 指定した日付のトレーニング詳細を取得
@app.route("/api/daily_log", methods=["GET"])
def get_daily_log():
    date_str = request.args.get('date') # YYYY-MM-DD
    user_id = 1
    
    if not date_str:
        return jsonify({})

    try:
        target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
    except ValueError:
        return jsonify({"error": "Invalid date format"}), 400
    
    logs = WorkoutLog.query.filter_by(user_id=user_id, date=target_date).order_by(WorkoutLog.exercise_id, WorkoutLog.set_number).all()
    
    # 種目ごとにグループ化
    result = {}
    for log in logs:
        ex_name = log.exercise.name
        if ex_name not in result:
            result[ex_name] = {
                "exercise_id": log.exercise_id,
                "max_rm": 0, 
                "sets": []
            }
        
        result[ex_name]["sets"].append({
            "id": log.id,
            "set": log.set_number,
            "weight": log.weight,
            "reps": log.reps,
            "rm": log.calculated_rm
        })
        # その日のMax RMを更新
        current_rm = log.calculated_rm if log.calculated_rm is not None else 0
        if current_rm > result[ex_name]["max_rm"]:
            result[ex_name]["max_rm"] = current_rm
            
    return jsonify(result)

# API: 種目とカテゴリの取得（マスタデータ）
@app.route("/api/exercises", methods=["GET"])
def get_exercises():
    categories = Category.query.order_by(Category.display_order, Category.id).all()
    data = []
    for cat in categories:
        ex_list = []
        exercises = sorted(cat.exercises, key=lambda x: (x.display_order, x.id))
        for ex in exercises:
            # 最終実施日を取得
            last_log = WorkoutLog.query.filter_by(exercise_id=ex.id).order_by(WorkoutLog.date.desc()).first()
            last_date = last_log.date.strftime('%Y-%m-%d') if last_log else None
            
            ex_list.append({
                "id": ex.id, 
                "name": ex.name,
                "last_date": last_date,
                "is_recommended": ex.is_recommended,
                "user_id": ex.user_id
            })
        data.append({
            "category_id": cat.id,
            "category": cat.name, 
            "exercises": ex_list
        })
    return jsonify(data)

# API: 単一セットの保存（オートセーブ用）
@app.route("/api/save_set", methods=["POST"])
def save_set():
    data = request.json
    user_id = 1
    
    try:
        target_date = datetime.strptime(data['date'], '%Y-%m-%d').date()
        exercise_id = int(data['exercise_id'])
        set_number = int(data['set_number'])
        weight = float(data.get('weight', 0))
        reps = int(data.get('reps', 0))
        
        # RM計算 (エプリー式)
        if weight > 0 and reps > 0:
            rm = weight * (1 + reps / 30.0)
        else:
            rm = 0
        
        # 既存のレコードを検索
        existing = WorkoutLog.query.filter_by(
            user_id=user_id,
            date=target_date,
            exercise_id=exercise_id,
            set_number=set_number
        ).first()
        
        if existing:
            # 更新
            existing.weight = weight
            existing.reps = reps
            existing.calculated_rm = round(rm, 2)
        else:
            # 新規作成
            new_log = WorkoutLog(
                user_id=user_id,
                exercise_id=exercise_id,
                date=target_date,
                set_number=set_number,
                weight=weight,
                reps=reps,
                calculated_rm=round(rm, 2)
            )
            db.session.add(new_log)
        
        db.session.commit()
        
        return jsonify({
            "status": "success",
            "calculated_rm": round(rm, 2)
        })
        
    except Exception as e:
        db.session.rollback()
        print(f"Error saving set: {e}")
        return jsonify({"error": str(e)}), 500

# API: セットの削除
@app.route("/api/delete_set", methods=["POST"])
def delete_set():
    data = request.json
    user_id = 1
    
    try:
        log_id = int(data.get('id'))
        
        log = WorkoutLog.query.filter_by(id=log_id, user_id=user_id).first()
        if not log:
            return jsonify({"error": "Log not found"}), 404
        
        db.session.delete(log)
        db.session.commit()
        
        return jsonify({"status": "success"})
        
    except Exception as e:
        db.session.rollback()
        print(f"Error deleting set: {e}")
        return jsonify({"error": str(e)}), 500

# API: 月間統計の取得
@app.route("/api/monthly_stats", methods=["GET"])
def get_monthly_stats():
    year = request.args.get('year', type=int)
    month = request.args.get('month', type=int)
    user_id = 1
    
    # 指定月の実施日数
    monthly_count = db.session.query(
        func.count(func.distinct(WorkoutLog.date))
    ).filter(
        WorkoutLog.user_id == user_id,
        db.extract('year', WorkoutLog.date) == year,
        db.extract('month', WorkoutLog.date) == month
    ).scalar() or 0
    
    # 全累計日数
    total_count = db.session.query(
        func.count(func.distinct(WorkoutLog.date))
    ).filter(
        WorkoutLog.user_id == user_id
    ).scalar() or 0
    
    return jsonify({
        "monthly_days": monthly_count,
        "total_days": total_count
    })

# API: ログの保存（一括保存・従来互換用）
@app.route("/api/save_log", methods=["POST"])
def save_log():
    data = request.json
    user_id = 1
    
    try:
        target_date = datetime.strptime(data['date'], '%Y-%m-%d').date()
    except (ValueError, TypeError):
        return jsonify({"error": "Invalid date format"}), 400
    
    try:
        if 'exercises' in data:
            for ex_data in data['exercises']:
                exercise_id = ex_data['id']
                # 既存の同日・同種目のログを一度消す（上書きのため）
                WorkoutLog.query.filter_by(user_id=user_id, date=target_date, exercise_id=exercise_id).delete()
                
                for i, s in enumerate(ex_data['sets']):
                    weight = float(s.get('weight', 0))
                    reps = float(s.get('reps', 0))

                    # RM計算 (エプリー式)
                    if weight > 0 and reps > 0:
                        rm = weight * (1 + reps / 30.0)
                    else:
                        rm = 0

                    new_log = WorkoutLog(
                        user_id=user_id,
                        exercise_id=exercise_id,
                        date=target_date,
                        set_number=i + 1,
                        weight=weight,
                        reps=reps,
                        calculated_rm=round(rm, 2)
                    )
                    db.session.add(new_log)
        
        db.session.commit()
        return jsonify({"status": "success"})

    except Exception as e:
        db.session.rollback()
        print(f"Error saving log: {e}")
        return jsonify({"error": str(e)}), 500

# API: 種目の追加
@app.route("/api/add_exercise", methods=["POST"])
def add_exercise():
    data = request.json
    user_id = 1
    
    try:
        category_id = int(data['category_id'])
        exercise_name = data['name'].strip()
        
        if not exercise_name:
            return jsonify({"error": "種目名を入力してください"}), 400
        
        # 同じ名前の種目が既に存在するかチェック
        existing = Exercise.query.filter_by(
            category_id=category_id,
            name=exercise_name
        ).first()
        
        if existing:
            return jsonify({"error": "この種目は既に登録されています"}), 400
        
        new_exercise = Exercise(
            name=exercise_name,
            category_id=category_id,
            user_id=user_id,
            is_recommended=False
        )
        
        db.session.add(new_exercise)
        db.session.commit()
        
        return jsonify({
            "status": "success",
            "exercise": {
                "id": new_exercise.id,
                "name": new_exercise.name,
                "category_id": new_exercise.category_id
            }
        })
        
    except Exception as e:
        db.session.rollback()
        print(f"Error adding exercise: {e}")
        return jsonify({"error": str(e)}), 500

# API: 種目の削除
@app.route("/api/delete_exercise", methods=["POST"])
def delete_exercise():
    data = request.json
    user_id = 1
    
    try:
        exercise_id = int(data['id'])
        
        exercise = Exercise.query.filter_by(id=exercise_id).first()
        if not exercise:
            return jsonify({"error": "種目が見つかりません"}), 404
        
        # システムデフォルト種目は削除不可
        if exercise.user_id is None:
            return jsonify({"error": "システム種目は削除できません"}), 403
        
        # 関連するログも削除
        WorkoutLog.query.filter_by(exercise_id=exercise_id).delete()
        
        db.session.delete(exercise)
        db.session.commit()
        
        return jsonify({"status": "success"})
        
    except Exception as e:
        db.session.rollback()
        print(f"Error deleting exercise: {e}")
        return jsonify({"error": str(e)}), 500

# API: 種目の編集
@app.route("/api/edit_exercise", methods=["POST"])
def edit_exercise():
    data = request.json
    user_id = 1
    
    try:
        exercise_id = int(data['id'])
        new_name = data['name'].strip()
        
        if not new_name:
            return jsonify({"error": "種目名を入力してください"}), 400
        
        exercise = Exercise.query.filter_by(id=exercise_id).first()
        if not exercise:
            return jsonify({"error": "種目が見つかりません"}), 404
        
        # システムデフォルト種目は編集不可
        if exercise.user_id is None:
            return jsonify({"error": "システム種目は編集できません"}), 403
        
        exercise.name = new_name
        db.session.commit()
        
        return jsonify({"status": "success"})
        
    except Exception as e:
        db.session.rollback()
        print(f"Error editing exercise: {e}")
        return jsonify({"error": str(e)}), 500

# API: 週間統計の取得（過去5週間の総重量）
@app.route("/api/weekly_stats", methods=["GET"])
def get_weekly_stats():
    user_id = 1
    
    from datetime import date, timedelta
    
    today = date.today()
    # 日曜日を週の始まりとする
    days_since_sunday = (today.weekday() + 1) % 7
    current_sunday = today - timedelta(days=days_since_sunday)
    
    weekly_data = []
    
    for i in range(5):
        week_start = current_sunday - timedelta(weeks=i)
        week_end = week_start + timedelta(days=6)
        
        # その週の総重量を計算（kg * reps * sets）
        logs = WorkoutLog.query.filter(
            WorkoutLog.user_id == user_id,
            WorkoutLog.date >= week_start,
            WorkoutLog.date <= week_end
        ).all()
        
        total_volume = sum(log.weight * log.reps for log in logs)
        
        weekly_data.append({
            "week_start": week_start.strftime('%Y-%m-%d'),
            "week_end": week_end.strftime('%Y-%m-%d'),
            "total_volume": round(total_volume, 2),
            "is_current": i == 0
        })
    
    # 最新が先頭になるよう（現在は逆順なので反転）
    weekly_data.reverse()
    
    return jsonify(weekly_data)

# API: 年間統計の取得
@app.route("/api/yearly_stats", methods=["GET"])
def get_yearly_stats():
    year = request.args.get('year', type=int)
    user_id = 1
    
    if not year:
        year = datetime.now().year
    
    # 指定年の実施日数
    yearly_count = db.session.query(
        func.count(func.distinct(WorkoutLog.date))
    ).filter(
        WorkoutLog.user_id == user_id,
        db.extract('year', WorkoutLog.date) == year
    ).scalar() or 0
    
    return jsonify({
        "year": year,
        "total_days": yearly_count
    })

# ===== 食事記録API =====

# models.py からインポート（既に上部でインポート済みの場合は不要）
# from models import db, User, Category, Exercise, WorkoutLog, MealLog, UserGoal

# API: 指定日の食事記録取得
@app.route("/api/daily_meals", methods=["GET"])
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
@app.route("/api/save_meal", methods=["POST"])
def save_meal():
    data = request.json
    user_id = 1
    
    try:
        target_date = datetime.strptime(data['date'], '%Y-%m-%d').date()
        meal_name = data.get('meal_name', '').strip()
        protein = float(data.get('protein', 0))
        fat = float(data.get('fat', 0))
        carbs = float(data.get('carbs', 0))
        
        # カロリー計算: P=4kcal/g, F=9kcal/g, C=4kcal/g
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
@app.route("/api/delete_meal", methods=["POST"])
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
@app.route("/api/meal_dates", methods=["GET"])
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
@app.route("/api/meal_monthly_stats", methods=["GET"])
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
@app.route("/api/user_goal", methods=["GET", "POST"])
def user_goal():
    user_id = 1
    
    if request.method == "GET":
        goal = UserGoal.query.filter_by(user_id=user_id).first()
        if not goal:
            # デフォルト目標を作成
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
@app.route("/api/daily_pfc", methods=["GET"])
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

if __name__ == "__main__":
    app.run(debug=True)