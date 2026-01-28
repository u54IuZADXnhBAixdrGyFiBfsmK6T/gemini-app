# services/ai_tips_generator.py - JSON/AI切り替え対応版
from google import genai
import json
import random
import os
from pathlib import Path

class TipsGenerator:
    def __init__(self, use_ai=False):
        """
        Args:
            use_ai (bool): TrueならAI生成、FalseならJSONから読み込み
        """
        self.use_ai = use_ai
        
        self.base_path = Path(__file__).parent.parent / 'static' / 'json' / 'tips'
        self.training_tips_path = self.base_path / 'training_tips.json'
        self.nutrition_tips_path = self.base_path / 'nutrition_tips.json'
        
        self.training_tips = self._load_json(self.training_tips_path)
        self.nutrition_tips = self._load_json(self.nutrition_tips_path)
        
        if self.use_ai:
            try:
                self.client = genai.Client()
            except Exception as e:
                print(f"Gemini APIクライアント初期化エラー: {e}")
                print("JSONモードにフォールバックします")
                self.use_ai = False
                self.client = None
        else:
            self.client = None

    def _load_json(self, filepath):
        """JSONファイルを読み込む"""
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                return json.load(f)
        except FileNotFoundError:
            print(f"JSONファイルが見つかりません: {filepath}")
            return {}
        except json.JSONDecodeError as e:
            print(f"JSON解析エラー: {e}")
            return {}

    def _get_tips_from_json(self, tips_data, context_keys, count=3):
        """
        JSONからコンテキストに合ったTipsを取得
        
        Args:
            tips_data (dict): Tipsデータ辞書
            context_keys (list): コンテキストキーのリスト（優先順）
            count (int): 取得するTips数
        
        Returns:
            list: Tipsのリスト
        """
        all_tips = []
        
        for key in context_keys:
            if key in tips_data:
                all_tips.extend(tips_data[key])
        
        if 'general' in tips_data:
            all_tips.extend(tips_data['general'])
        
        # 重複を削除してランダムに選択
        unique_tips = list(set(all_tips))
        
        if len(unique_tips) < count:
            return random.sample(unique_tips * 2, min(count, len(unique_tips) * 2))
        
        return random.sample(unique_tips, count)

    def generate_training_tips(self, *, context_data):
        """トレーニング関連のTipsを生成"""
        
        # JSONモード
        if not self.use_ai:
            context_keys = []
            
            target_muscle = context_data.get('target_muscle', '')
            training_level = context_data.get('training_level', '')
            
            if target_muscle:
                context_keys.append(target_muscle)
            
            if '初心者' in training_level:
                context_keys.append('初心者')
            elif '中級者' in training_level:
                context_keys.append('中級者')
            elif '上級者' in training_level:
                context_keys.append('上級者')
            
            tips = self._get_tips_from_json(self.training_tips, context_keys, count=5)
            return tips
        
        else:
            if self.client is None:
                return self.generate_training_tips(context_data=context_data)
            
            target_muscle = context_data.get('target_muscle', '')
            training_level = context_data.get('training_level', '')
            goals = context_data.get('goals', '')

            prompt = f"""あなたはフィットネスの専門家です。以下のユーザー情報に基づいて、待ち時間中に表示する**豆知識（Tips）を3つ**生成してください。

【ユーザー情報】
- 鍛えたい筋肉: {target_muscle}
- トレーニングレベル: {training_level}
- 目標: {goals}

【出力ルール】
1. 各Tipsは1-2文で簡潔に（最大50文字）
2. 必ず💡絵文字で始める
3. ユーザーの状況に合わせた実践的な内容
4. 専門用語は使うが、分かりやすく
5. 数値や具体例を含める
6. 出力形式: 1行1Tipsで、改行で区切る

【禁止事項】
- 前置き・挨拶不要
- 「〜かもしれません」などの曖昧表現
- 一般論だけの内容

【出力例】
💡 {target_muscle}の成長には週2-3回の刺激が最適です
💡 トレーニング後30分以内のタンパク質摂取が効果的
💡 同じ重量で3セット完遂できたら、次回は5%増量しましょう"""

            try:
                response = self.client.models.generate_content(
                    model="gemini-2.0-flash-lite",
                    contents=prompt
                )
                tips_list = [tip.strip() for tip in response.text.strip().split('\n') if tip.strip()]
                return tips_list
            except Exception as e:
                print(f"AI生成エラー: {e}")
                # エラー時はJSONにフォールバック
                return self._get_tips_from_json(
                    self.training_tips, 
                    [target_muscle, '初心者' if '初心者' in training_level else 'general'],
                    count=5
                )

    def generate_nutrition_tips(self, *, context_data):
        """栄養関連のTipsを生成"""
        
        # JSONモード
        if not self.use_ai:
            context_keys = []
            
            goal = context_data.get('goal', '')
            
            # 目的に応じたキー
            if '減量' in goal or '脂肪' in goal:
                context_keys.append('減量')
            elif '増量' in goal or '筋肉' in goal:
                context_keys.append('増量')
            elif '維持' in goal or 'キープ' in goal:
                context_keys.append('維持')
            elif 'リコンプ' in goal:
                context_keys.append('リコンプ')
            
            # タンパク質・炭水化物・脂質の基本も含める
            context_keys.extend(['protein', 'carbs', 'fat', 'timing'])
            
            tips = self._get_tips_from_json(self.nutrition_tips, context_keys, count=5)
            return tips
        
        # AI生成モード
        else:
            if self.client is None:
                return self.generate_nutrition_tips(context_data=context_data)
            
            goal = context_data.get('goal', '')
            activity_level = context_data.get('activity_level', '')

            prompt = f"""あなたはスポーツ栄養学の専門家です。以下のユーザー情報に基づいて、待ち時間中に表示する**豆知識（Tips）を3つ**生成してください。

【ユーザー情報】
- 目的: {goal}
- 活動量: {activity_level}

【出力ルール】
1. 各Tipsは1-2文で簡潔に（最大50文字）
2. 必ず💡絵文字で始める
3. ユーザーの目的に合わせた実践的な内容
4. 数値や具体的な食材名を含める
5. 出力形式: 1行1Tipsで、改行で区切る

【禁止事項】
- 前置き・挨拶不要
- 「バランスよく」などの抽象表現
- 医学的アドバイス（あくまで栄養知識）

【出力例】
💡 タンパク質1gあたり4kcal、脂質は9kcalです
💡 {goal}なら、炭水化物は朝・トレーニング前後に集中
💡 水分は体重×30mlが1日の目安量です"""

            try:
                response = self.client.models.generate_content(
                    model="gemini-1.5-flash",
                    contents=prompt
                )
                tips_list = [tip.strip() for tip in response.text.strip().split('\n') if tip.strip()]
                return tips_list
            except Exception as e:
                print(f"AI生成エラー: {e}")
                return self._get_tips_from_json(
                    self.nutrition_tips,
                    ['減量' if '減量' in goal else 'general'],
                    count=5
                )

    def generate_general_fitness_tips(self):
        """汎用フィットネスTipsを生成"""
        
        if not self.use_ai:
            # 両方のデータから汎用Tipsを取得
            all_general = []
            if 'general' in self.training_tips:
                all_general.extend(self.training_tips['general'])
            if 'general' in self.nutrition_tips:
                all_general.extend(self.nutrition_tips['general'])
            
            return random.sample(all_general, min(5, len(all_general)))
        
        else:
            # AI生成版（省略 - 上記と同様の実装）
            pass