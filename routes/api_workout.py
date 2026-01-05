# routes/api_workout.py
from flask import Blueprint, request, jsonify
from extensions import db
from models import WorkoutLog, Category, Exercise
from sqlalchemy import func
from datetime import datetime, date, timedelta

workout_bp = Blueprint('workout_api', __name__)

# API: 指定した月の日別トレーニング有無を取得
@workout_bp.route("/api/workout_dates", methods=["GET"])
def get_workout_dates():
    year = request.args.get('year', type=int)
    month = request.args.get('month', type=int)
    user_id = 1 
    
    if not year or not month:
        return jsonify({"dates": []})

    logs = WorkoutLog.query.filter(
        WorkoutLog.user_id == user_id,
        db.extract('year', WorkoutLog.date) == year,
        db.extract('month', WorkoutLog.date) == month
    ).all()
    
    dates = list(set([log.date.day for log in logs]))
    return jsonify({"dates": dates})

# API: 指定した日付のトレーニング詳細を取得
@workout_bp.route("/api/daily_log", methods=["GET"])
def get_daily_log():
    date_str = request.args.get('date')
    user_id = 1
    
    if not date_str:
        return jsonify({})

    try:
        target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
    except ValueError:
        return jsonify({"error": "Invalid date format"}), 400
    
    logs = WorkoutLog.query.filter_by(user_id=user_id, date=target_date).order_by(WorkoutLog.exercise_id, WorkoutLog.set_number).all()
    
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
        current_rm = log.calculated_rm if log.calculated_rm is not None else 0
        if current_rm > result[ex_name]["max_rm"]:
            result[ex_name]["max_rm"] = current_rm
            
    return jsonify(result)

# API: 種目とカテゴリの取得
@workout_bp.route("/api/exercises", methods=["GET"])
def get_exercises():
    categories = Category.query.order_by(Category.display_order, Category.id).all()
    data = []
    for cat in categories:
        ex_list = []
        exercises = sorted(cat.exercises, key=lambda x: (x.display_order, x.id))
        for ex in exercises:
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

# API: 単一セットの保存
@workout_bp.route("/api/save_set", methods=["POST"])
def save_set():
    data = request.json
    user_id = 1
    
    try:
        target_date = datetime.strptime(data['date'], '%Y-%m-%d').date()
        exercise_id = int(data['exercise_id'])
        set_number = int(data['set_number'])
        weight = float(data.get('weight', 0))
        reps = int(data.get('reps', 0))
        
        if weight > 0 and reps > 0:
            rm = weight * (1 + reps / 30.0)
        else:
            rm = 0
        
        existing = WorkoutLog.query.filter_by(
            user_id=user_id,
            date=target_date,
            exercise_id=exercise_id,
            set_number=set_number
        ).first()
        
        if existing:
            existing.weight = weight
            existing.reps = reps
            existing.calculated_rm = round(rm, 2)
        else:
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
        return jsonify({"status": "success", "calculated_rm": round(rm, 2)})
        
    except Exception as e:
        db.session.rollback()
        print(f"Error saving set: {e}")
        return jsonify({"error": str(e)}), 500

# API: セットの削除
@workout_bp.route("/api/delete_set", methods=["POST"])
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

# API: 月間統計
@workout_bp.route("/api/monthly_stats", methods=["GET"])
def get_monthly_stats():
    year = request.args.get('year', type=int)
    month = request.args.get('month', type=int)
    user_id = 1
    
    monthly_count = db.session.query(
        func.count(func.distinct(WorkoutLog.date))
    ).filter(
        WorkoutLog.user_id == user_id,
        db.extract('year', WorkoutLog.date) == year,
        db.extract('month', WorkoutLog.date) == month
    ).scalar() or 0
    
    total_count = db.session.query(
        func.count(func.distinct(WorkoutLog.date))
    ).filter(
        WorkoutLog.user_id == user_id
    ).scalar() or 0
    
    return jsonify({
        "monthly_days": monthly_count,
        "total_days": total_count
    })

# API: ログの保存（一括）
@workout_bp.route("/api/save_log", methods=["POST"])
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
                WorkoutLog.query.filter_by(user_id=user_id, date=target_date, exercise_id=exercise_id).delete()
                
                for i, s in enumerate(ex_data['sets']):
                    weight = float(s.get('weight', 0))
                    reps = float(s.get('reps', 0))

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
@workout_bp.route("/api/add_exercise", methods=["POST"])
def add_exercise():
    data = request.json
    user_id = 1
    
    try:
        category_id = int(data['category_id'])
        exercise_name = data['name'].strip()
        
        if not exercise_name:
            return jsonify({"error": "種目名を入力してください"}), 400
        
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
@workout_bp.route("/api/delete_exercise", methods=["POST"])
def delete_exercise():
    data = request.json
    user_id = 1
    
    try:
        exercise_id = int(data['id'])
        exercise = Exercise.query.filter_by(id=exercise_id).first()
        if not exercise:
            return jsonify({"error": "種目が見つかりません"}), 404
        
        if exercise.user_id is None:
            return jsonify({"error": "システム種目は削除できません"}), 403
        
        WorkoutLog.query.filter_by(exercise_id=exercise_id).delete()
        db.session.delete(exercise)
        db.session.commit()
        
        return jsonify({"status": "success"})
        
    except Exception as e:
        db.session.rollback()
        print(f"Error deleting exercise: {e}")
        return jsonify({"error": str(e)}), 500

# API: 種目の編集
@workout_bp.route("/api/edit_exercise", methods=["POST"])
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
        
        if exercise.user_id is None:
            return jsonify({"error": "システム種目は編集できません"}), 403
        
        exercise.name = new_name
        db.session.commit()
        return jsonify({"status": "success"})
        
    except Exception as e:
        db.session.rollback()
        print(f"Error editing exercise: {e}")
        return jsonify({"error": str(e)}), 500

# API: 週間統計
@workout_bp.route("/api/weekly_stats", methods=["GET"])
def get_weekly_stats():
    user_id = 1
    today = date.today()
    days_since_sunday = (today.weekday() + 1) % 7
    current_sunday = today - timedelta(days=days_since_sunday)
    
    weekly_data = []
    
    for i in range(5):
        week_start = current_sunday - timedelta(weeks=i)
        week_end = week_start + timedelta(days=6)
        
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
    
    weekly_data.reverse()
    return jsonify(weekly_data)

# API: 年間統計
@workout_bp.route("/api/yearly_stats", methods=["GET"])
def get_yearly_stats():
    year = request.args.get('year', type=int)
    user_id = 1
    
    if not year:
        year = datetime.now().year
    
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