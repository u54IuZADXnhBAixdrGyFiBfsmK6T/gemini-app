#!/usr/bin/env python
# -*- coding: utf-8 -*-

import argparse
import random
import json
import os
from datetime import datetime, timedelta
from app import create_app
from extensions import db
from models import MealLog, WorkoutLog, Exercise, Category, User, UserGoal

def load_config():
    config_path = os.path.join(os.path.dirname(__file__), 'static', 'json', 'dummy.json')
    with open(config_path, 'r', encoding='utf-8') as f:
        return json.load(f)

CONFIG = load_config()

def generate_random_date(days_back=30):
    today = datetime.now().date()
    random_days = random.randint(0, days_back)
    return today - timedelta(days=random_days)

def generate_meal_data(user_goal=None, meal_type=None):
    """
    ユーザーの目標PFC値に基づいて、複数の料理を組み合わせたダミー食事データを生成
    
    Args:
        user_goal: UserGoalオブジェクト。Noneの場合はデフォルト値を使用
        meal_type: 'breakfast', 'lunch', 'dinner', 'snack'のいずれか。Noneの場合はランダム
    
    Returns:
        食事データの辞書
    """
    # デフォルト値の設定（1日の目標値）
    default_protein = 150
    default_fat = 60
    default_carbs = 250
    
    # ユーザー目標値の取得（1日の目標値）
    if user_goal:
        daily_protein_goal = user_goal.target_protein
        daily_fat_goal = user_goal.target_fat
        daily_carbs_goal = user_goal.target_carbs
    else:
        daily_protein_goal = default_protein
        daily_fat_goal = default_fat
        daily_carbs_goal = default_carbs
    
    # 食事タイプをランダムに決定（未指定の場合）
    if meal_type is None:
        meal_type = random.choice(['breakfast', 'lunch', 'dinner'])
    
    # 食事タイプごとの目標配分率
    meal_ratios = {
        'breakfast': {'protein': 0.25, 'fat': 0.30, 'carbs': 0.30},  # 朝食: 25-30%
        'lunch': {'protein': 0.35, 'fat': 0.35, 'carbs': 0.40},      # 昼食: 35-40%
        'dinner': {'protein': 0.35, 'fat': 0.30, 'carbs': 0.25},     # 夕食: 25-35%
        'snack': {'protein': 0.10, 'fat': 0.10, 'carbs': 0.10}       # 間食: 5-10%
    }
    
    ratio = meal_ratios[meal_type]
    
    # この食事で目指すPFC値を計算
    target_protein = daily_protein_goal * ratio['protein']
    target_fat = daily_fat_goal * ratio['fat']
    target_carbs = daily_carbs_goal * ratio['carbs']
    
    # 食品リストから選択
    items_key = f'{meal_type}_items'
    available_items = CONFIG.get(items_key, CONFIG.get('breakfast_items', []))
    
    if not available_items:
        # フォールバック: デフォルトの食事名を使用
        return {
            'meal_name': random.choice(CONFIG['meal_names']),
            'protein': round(target_protein, 1),
            'fat': round(target_fat, 1),
            'carbs': round(target_carbs, 1),
            'calories': round((target_protein * 4) + (target_fat * 9) + (target_carbs * 4), 1),
            'date': generate_random_date()
        }
    
    # ユーザー目標値から±3%〜7%の範囲でランダムに変動
    # 各栄養素で独立した変動を生成
    variation_protein = random.uniform(0.03, 0.07)
    sign_protein = random.choice([-1, 1])
    final_protein = target_protein * (1 + sign_protein * variation_protein)
    
    variation_fat = random.uniform(0.03, 0.07)
    sign_fat = random.choice([-1, 1])
    final_fat = target_fat * (1 + sign_fat * variation_fat)
    
    variation_carbs = random.uniform(0.03, 0.07)
    sign_carbs = random.choice([-1, 1])
    final_carbs = target_carbs * (1 + sign_carbs * variation_carbs)
    
    # 食品リストから料理を選んで料理名を生成
    items_key = f'{meal_type}_items'
    available_items = CONFIG.get(items_key, CONFIG.get('breakfast_items', []))
    
    if available_items:
        # 2-4品を選んで料理名を組み合わせる
        num_items = random.randint(2, 4)
        selected_items = random.sample(available_items, min(num_items, len(available_items)))
        meal_names = [item['name'] for item in selected_items]
        combined_meal_name = ' / '.join(meal_names)
    else:
        # フォールバック
        combined_meal_name = f"{meal_type}の食事"
    
    # カロリー計算
    calories = (final_protein * 4) + (final_fat * 9) + (final_carbs * 4)
    
    return {
        'meal_name': combined_meal_name,
        'protein': round(final_protein, 1),
        'fat': round(final_fat, 1),
        'carbs': round(final_carbs, 1),
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
        
        # ユーザーの目標値を取得
        user_goal = UserGoal.query.filter_by(user_id=1).first()
        if not user_goal:
            print("目標値が設定されていません。デフォルト値を使用します。")
            print("デフォルト値: P=150g, F=60g, C=250g")
        else:
            print(f"目標値: P={user_goal.target_protein}g, F={user_goal.target_fat}g, C={user_goal.target_carbs}g")
        
        # 食事タイプをバランスよく配分
        meal_types = []
        for _ in range(count):
            # 朝食:昼食:夕食:間食 = 3:4:3:1 の比率で生成
            meal_type_choice = random.choices(
                ['breakfast', 'lunch', 'dinner', 'snack'],
                weights=[3, 4, 3, 1],
                k=1
            )[0]
            meal_types.append(meal_type_choice)
        
        created_count = 0
        meal_type_counts = {'breakfast': 0, 'lunch': 0, 'dinner': 0, 'snack': 0}
        
        for meal_type in meal_types:
            meal_data = generate_meal_data(user_goal, meal_type)
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
            meal_type_counts[meal_type] += 1
        
        db.session.commit()
        
        print(f"\n✓ {created_count}件の食事記録を生成しました")
        print(f"  朝食: {meal_type_counts['breakfast']}件")
        print(f"  昼食: {meal_type_counts['lunch']}件")
        print(f"  夕食: {meal_type_counts['dinner']}件")
        print(f"  間食: {meal_type_counts['snack']}件")

def create_weekly_meals(weeks=4):
    """
    週間単位で食事データを生成
    1日3食（朝・昼・夕）+ 間食1-2回の構成で、指定週数分のデータを作成
    
    Args:
        weeks: 生成する週数（デフォルト: 4週間）
    """
    app = create_app()
    with app.app_context():
        user = User.query.filter_by(id=1).first()
        if not user:
            user = User(id=1, username='default_user')
            db.session.add(user)
            db.session.commit()
            print("デフォルトユーザーを作成しました")
        
        # ユーザーの目標値を取得
        user_goal = UserGoal.query.filter_by(user_id=1).first()
        if not user_goal:
            print("目標値が設定されていません。デフォルト値を使用します。")
            print("デフォルト値: P=150g, F=60g, C=250g")
        else:
            print(f"目標値: P={user_goal.target_protein}g, F={user_goal.target_fat}g, C={user_goal.target_carbs}g")
        
        today = datetime.now().date()
        created_count = 0
        meal_type_counts = {'breakfast': 0, 'lunch': 0, 'dinner': 0, 'snack': 0}
        
        # 週ごとにデータを生成
        for week in range(weeks):
            # 1週間（7日間）のデータを生成
            for day_offset in range(7):
                target_date = today - timedelta(weeks=week, days=day_offset)
                
                # 1日の食事パターン: 朝食 + 昼食 + 夕食 + 間食(50%の確率)
                daily_meals = ['breakfast', 'lunch', 'dinner']
                
                # 50%の確率で間食を追加
                if random.random() < 0.5:
                    daily_meals.append('snack')
                
                # 時々、間食を2回追加（20%の確率）
                if random.random() < 0.2:
                    daily_meals.append('snack')
                
                # その日の食事を生成
                for meal_type in daily_meals:
                    meal_data = generate_meal_data(user_goal, meal_type)
                    meal_data['date'] = target_date  # 日付を指定
                    
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
                    meal_type_counts[meal_type] += 1
        
        db.session.commit()
        
        print(f"\n✓ {weeks}週間分の食事記録を生成しました")
        print(f"  合計: {created_count}件")
        print(f"  朝食: {meal_type_counts['breakfast']}件")
        print(f"  昼食: {meal_type_counts['lunch']}件")
        print(f"  夕食: {meal_type_counts['dinner']}件")
        print(f"  間食: {meal_type_counts['snack']}件")
        print(f"\n【期間】")
        start_date = today - timedelta(weeks=weeks-1, days=6)
        print(f"  {start_date} 〜 {today}")


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
    
    create_weekly_meals_parser = subparsers.add_parser('create_weekly_meals', help='週間単位で食事記録を生成（1日3-5食）')
    create_weekly_meals_parser.add_argument('weeks', type=int, help='生成する週数')
    
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
    
    elif args.command == 'create_weekly_meals':
        if args.weeks <= 0:
            print("エラー: 週数は1以上の整数を指定してください")
            return
        create_weekly_meals(args.weeks)
        
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