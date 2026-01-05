# init_db.py
from app import app
from extensions import db  
from models import User, Category, Exercise

def init_database():
    with app.app_context():
        # テーブルの削除と再作成
        db.drop_all()
        db.create_all()
        
        # デフォルトユーザーの作成
        user = User(username='default_user')
        db.session.add(user)
        db.session.flush()
        
        # カテゴリと種目の作成
        categories_data = [
            {
                'name': '胸',
                'exercises': [
                    'ベンチプレス', 'インクラインベンチプレス', 'デクラインベンチプレス',
                    'ダンベルプレス', 'ダンベルフライ', 'ケーブルクロスオーバー', 
                    'プッシュアップ', 'ディップス'
                ]
            },
            {
                'name': '背中',
                'exercises': [
                    'デッドリフト', 'ベントオーバーロウ', 'ラットプルダウン', 
                    'チンニング', 'ワンハンドダンベルロウ', 'シーテッドロウ', 
                    'Tバーロウ', 'ケーブルロウ'
                ]
            },
            {
                'name': '脚',
                'exercises': [
                    'スクワット', 'レッグプレス', 'レッグエクステンション', 
                    'レッグカール', 'ランジ', 'ブルガリアンスクワット', 
                    'カーフレイズ', 'レッグアダクション'
                ]
            },
            {
                'name': '肩',
                'exercises': [
                    'ショルダープレス', 'サイドレイズ', 'フロントレイズ', 
                    'リアレイズ', 'アップライトロウ', 'シュラッグ', 
                    'ダンベルショルダープレス', 'アーノルドプレス'
                ]
            },
            {
                'name': '腕',
                'exercises': [
                    'バーベルカール', 'ダンベルカール', 'ハンマーカール', 
                    'トライセプスエクステンション', 'トライセプスキックバック', 
                    'クローズグリップベンチプレス', 'ケーブルプレスダウン', 'リストカール'
                ]
            },
            {
                'name': '腹筋',
                'exercises': [
                    'クランチ', 'レッグレイズ', 'プランク', 'サイドプランク', 
                    'ロシアンツイスト', 'バイシクルクランチ', 'ハンギングレッグレイズ', 
                    'アブローラー'
                ]
            }
        ]
        
        for cat_data in categories_data:
            category = Category(name=cat_data['name'], user_id=None)
            db.session.add(category)
            db.session.flush()
            
            for ex_name in cat_data['exercises']:
                exercise = Exercise(
                    name=ex_name,
                    category_id=category.id,
                    user_id=None
                )
                db.session.add(exercise)
        
        db.session.commit()
        print('✅ データベースの初期化が完了しました！')
        print(f'   - ユーザー: 1人')
        print(f'   - カテゴリ: {len(categories_data)}個')
        print(f'   - 種目: {sum(len(c["exercises"]) for c in categories_data)}個')

if __name__ == '__main__':
    init_database()