#!/usr/bin/env python
# -*- coding: utf-8 -*-

import argparse
import random
import json
import os
from datetime import datetime, timedelta
from app import create_app
from extensions import db
from models import MealLog, WorkoutLog, Exercise, Category, User

def load_config():
    config_path = os.path.join(os.path.dirname(__file__), 'static', 'json', 'dummy.json')
    with open(config_path, 'r', encoding='utf-8') as f:
        return json.load(f)

CONFIG = load_config()

def generate_random_date(days_back=30):
    today = datetime.now().date()
    random_days = random.randint(0, days_back)
    return today - timedelta(days=random_days)

def generate_meal_data():
    protein = round(random.uniform(10, 60), 1)
    fat = round(random.uniform(5, 30), 1)
    carbs = round(random.uniform(20, 80), 1)
    calories = (protein * 4) + (fat * 9) + (carbs * 4)
    
    return {
        'meal_name': random.choice(CONFIG['meal_names']),
        'protein': protein,
        'fat': fat,
        'carbs': carbs,
        'calories': round(calories, 1),
        'date': generate_random_date()
    }

def generate_workout_data(exercise_id, target_date=None):
    app = create_app()
    with app.app_context():
        exercise = Exercise.query.get(exercise_id)
        if not exercise:
            weight = round(random.uniform(20, 80), 1)
            reps = random.randint(6, 12)
        else:
            if exercise.name in CONFIG['exercise_ranges']:
                range_data = CONFIG['exercise_ranges'][exercise.name]
            else:
                category = Category.query.get(exercise.category_id)
                if category and category.name in CONFIG['category_defaults']:
                    range_data = CONFIG['category_defaults'][category.name]
                else:
                    range_data = {"weight": [20, 80], "reps": [6, 12]}
            
            weight = round(random.uniform(range_data["weight"][0], range_data["weight"][1]), 1)
            reps = random.randint(range_data["reps"][0], range_data["reps"][1])
        
        rm = weight * (1 + reps / 30.0) if weight > 0 and reps > 0 else 0
        
        return {
            'exercise_id': exercise_id,
            'weight': weight,
            'reps': reps,
            'calculated_rm': round(rm, 2),
            'set_number': random.randint(1, 5),
            'date': target_date if target_date else generate_random_date()
        }

def create_meals(count):
    app = create_app()
    with app.app_context():
        user = User.query.filter_by(id=1).first()
        if not user:
            user = User(id=1, username='default_user')
            db.session.add(user)
            db.session.commit()
            print("デフォルトユーザーを作成しました")
        
        created_count = 0
        for _ in range(count):
            meal_data = generate_meal_data()
            meal = MealLog(
                user_id=1,
                date=meal_data['date'],
                meal_name=meal_data['meal_name'],
                protein=meal_data['protein'],
                fat=meal_data['fat'],
                carbs=meal_data['carbs'],
                calories=meal_data['calories']
            )
            db.session.add(meal)
            created_count += 1
        
        db.session.commit()
        print(f"✓ {created_count}件の食事記録を生成しました")

def create_workouts(count):
    app = create_app()
    with app.app_context():
        user = User.query.filter_by(id=1).first()
        if not user:
            user = User(id=1, username='default_user')
            db.session.add(user)
            db.session.commit()
            print("デフォルトユーザーを作成しました")
        
        exercises = Exercise.query.all()
        if not exercises:
            print("エラー: データベースに種目が登録されていません")
            return
        
        created_count = 0
        for _ in range(count):
            exercise = random.choice(exercises)
            workout_data = generate_workout_data(exercise.id)
            workout = WorkoutLog(
                user_id=1,
                exercise_id=workout_data['exercise_id'],
                date=workout_data['date'],
                set_number=workout_data['set_number'],
                weight=workout_data['weight'],
                reps=workout_data['reps'],
                calculated_rm=workout_data['calculated_rm']
            )
            db.session.add(workout)
            created_count += 1
        
        db.session.commit()
        print(f"✓ {created_count}件のトレーニング記録を生成しました")

def create_split_workouts(weeks=4):
    app = create_app()
    with app.app_context():
        user = User.query.filter_by(id=1).first()
        if not user:
            user = User(id=1, username='default_user')
            db.session.add(user)
            db.session.commit()
        
        categories = Category.query.all()
        if not categories:
            print("エラー: カテゴリが登録されていません")
            return
        
        category_exercises = {}
        for cat in categories:
            exercises_in_cat = Exercise.query.filter_by(category_id=cat.id).all()
            category_exercises[cat.name] = exercises_in_cat
        
        split_schedule = CONFIG['split_schedule']
        today = datetime.now().date()
        created_count = 0
        
        for week in range(weeks):
            for day_offset in range(7):
                target_date = today - timedelta(weeks=week, days=day_offset)
                weekday = target_date.weekday()
                weekday = (weekday + 1) % 7
                
                target_categories = split_schedule.get(str(weekday), [])
                
                if not target_categories:
                    continue
                
                daily_exercises = []
                for cat_name in target_categories:
                    if cat_name in category_exercises and category_exercises[cat_name]:
                        num_exercises = random.randint(1, min(3, len(category_exercises[cat_name])))
                        selected = random.sample(category_exercises[cat_name], num_exercises)
                        daily_exercises.extend(selected)
                
                for exercise in daily_exercises:
                    num_sets = random.randint(3, 5)
                    for set_num in range(1, num_sets + 1):
                        workout_data = generate_workout_data(exercise.id, target_date)
                        workout = WorkoutLog(
                            user_id=1,
                            exercise_id=exercise.id,
                            date=target_date,
                            set_number=set_num,
                            weight=workout_data['weight'],
                            reps=workout_data['reps'],
                            calculated_rm=workout_data['calculated_rm']
                        )
                        db.session.add(workout)
                        created_count += 1
        
        db.session.commit()
        print(f"✓ {weeks}週間分の分割トレーニングデータを生成しました")
        print(f"  合計 {created_count}件のセット記録")
        print("\n【トレーニング分割】")
        print("  月・木: 脚")
        print("  火・金: 胸・肩")
        print("  水・土: 背中・腕")
        print("  日: 休息日")

def delete_all_meals():
    app = create_app()
    with app.app_context():
        deleted_count = MealLog.query.delete()
        db.session.commit()
        print(f"✓ {deleted_count}件の食事記録を削除しました")

def delete_all_workouts():
    app = create_app()
    with app.app_context():
        deleted_count = WorkoutLog.query.delete()
        db.session.commit()
        print(f"✓ {deleted_count}件のトレーニング記録を削除しました")

def show_stats():
    app = create_app()
    with app.app_context():
        meal_count = MealLog.query.count()
        workout_count = WorkoutLog.query.count()
        exercise_count = Exercise.query.count()
        category_count = Category.query.count()
        
        print("\n=== データベース統計 ===")
        print(f"食事記録: {meal_count}件")
        print(f"トレーニング記録: {workout_count}件")
        print(f"登録種目数: {exercise_count}件")
        print(f"カテゴリ数: {category_count}件")
        print("========================\n")

def main():
    parser = argparse.ArgumentParser(
        description='フィットネストラッキングアプリのダミーデータ管理ツール'
    )
    
    subparsers = parser.add_subparsers(dest='command', help='実行するコマンド')
    
    create_meals_parser = subparsers.add_parser('create_meals', help='指定された数の食事記録を生成')
    create_meals_parser.add_argument('count', type=int, help='生成する食事記録の数')
    
    create_workouts_parser = subparsers.add_parser('create_workouts', help='指定された数のトレーニング記録を生成')
    create_workouts_parser.add_argument('count', type=int, help='生成するトレーニング記録の数')
    
    create_split_parser = subparsers.add_parser('create_split', help='曜日別の分割トレーニングスケジュールでデータを生成')
    create_split_parser.add_argument('--weeks', type=int, default=4, help='生成する週数（デフォルト: 4週間）')
    
    subparsers.add_parser('delete_meals', help='全ての食事記録を削除')
    subparsers.add_parser('delete_workouts', help='全てのトレーニング記録を削除')
    subparsers.add_parser('stats', help='データベースの統計情報を表示')
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        return
    
    if args.command == 'create_meals':
        if args.count <= 0:
            print("エラー: 件数は1以上の整数を指定してください")
            return
        create_meals(args.count)
        
    elif args.command == 'create_workouts':
        if args.count <= 0:
            print("エラー: 件数は1以上の整数を指定してください")
            return
        create_workouts(args.count)
    
    elif args.command == 'create_split':
        if args.weeks <= 0:
            print("エラー: 週数は1以上の整数を指定してください")
            return
        create_split_workouts(args.weeks)
        
    elif args.command == 'delete_meals':
        confirmation = input("全ての食事記録を削除します。よろしいですか？ (yes/no): ")
        if confirmation.lower() in ['yes', 'y']:
            delete_all_meals()
        else:
            print("キャンセルしました")
            
    elif args.command == 'delete_workouts':
        confirmation = input("全てのトレーニング記録を削除します。よろしいですか？ (yes/no): ")
        if confirmation.lower() in ['yes', 'y']:
            delete_all_workouts()
        else:
            print("キャンセルしました")
            
    elif args.command == 'stats':
        show_stats()

if __name__ == '__main__':
    main()