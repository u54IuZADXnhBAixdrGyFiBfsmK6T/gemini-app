# migrate_db.py
# 既存のデータベースに新しいカラムを追加

import sqlite3
from app import app

def migrate_database():
    with app.app_context():
        conn = sqlite3.connect('instance/fitness.db')
        cursor = conn.cursor()
        
        try:
            # Exercise テーブルに is_recommended カラムを追加
            cursor.execute("""
                ALTER TABLE exercises 
                ADD COLUMN is_recommended INTEGER DEFAULT 0
            """)
            print("✅ exercises.is_recommended カラムを追加しました")
        except sqlite3.OperationalError as e:
            if "duplicate column name" in str(e):
                print("⚠️  is_recommended カラムは既に存在します")
            else:
                raise e
        
        try:
            # Exercise テーブルに display_order カラムを追加
            cursor.execute("""
                ALTER TABLE exercises 
                ADD COLUMN display_order INTEGER DEFAULT 0
            """)
            print("✅ exercises.display_order カラムを追加しました")
        except sqlite3.OperationalError as e:
            if "duplicate column name" in str(e):
                print("⚠️  display_order カラムは既に存在します")
            else:
                raise e
        
        try:
            # Category テーブルに display_order カラムを追加
            cursor.execute("""
                ALTER TABLE categories 
                ADD COLUMN display_order INTEGER DEFAULT 0
            """)
            print("✅ categories.display_order カラムを追加しました")
        except sqlite3.OperationalError as e:
            if "duplicate column name" in str(e):
                print("⚠️  display_order カラムは既に存在します")
            else:
                raise e
        
        # 推奨種目にフラグを立てる
        recommended = {
            'ベンチプレス': True,
            'アームカール': True,
            '懸垂': True,
            'ショルダープレス': True,
            'スクワット': True,
            'アブローラー': True
        }
        
        for exercise_name, is_rec in recommended.items():
            cursor.execute("""
                UPDATE exercises 
                SET is_recommended = ? 
                WHERE name = ?
            """, (1 if is_rec else 0, exercise_name))
        
        conn.commit()
        conn.close()
        
        print("✅ マイグレーション完了！")
        print("   - 推奨種目のフラグを設定しました")

if __name__ == '__main__':
    migrate_database()