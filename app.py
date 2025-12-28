# app.py

from dotenv import load_dotenv
load_dotenv()

from flask import Flask, render_template, request, jsonify
from ai_coach import AICoach

# models.py から db とモデルクラスをインポート
from models import db, User, Category, Exercise, WorkoutLog
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

if __name__ == "__main__":
    app.run(debug=True)