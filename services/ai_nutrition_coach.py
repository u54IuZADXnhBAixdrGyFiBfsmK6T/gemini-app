# ai_nutrition_coach.py
from google import genai

class NutritionCoach:
    def __init__(self):
        try:
            self.client = genai.Client()
        except Exception as e:
            print(f"Gemini APIクライアント初期化エラー: {e}")
            self.client = None

    def calculate_pfc(self, *, height, weight, age, gender, activity_level, goal):
        """PFC計算機能"""
        if self.client is None:
            raise RuntimeError("Gemini APIキーが設定されていません")

        prompt = f"""
あなたはプロの栄養士です。以下の情報から**科学的根拠に基づいた**PFCバランスを計算してください。

【ユーザー情報】
- 身長: {height} cm
- 体重: {weight} kg
- 年齢: {age} 歳
- 性別: {gender}
- 活動量: {activity_level}
- 目的: {goal}

【出力形式】
## 📊 あなたの推奨PFC

**1日の目標摂取カロリー**: XXX kcal

### マクロ栄養素
- **タンパク質 (P)**: XX g (XX kcal) - XX%
- **脂質 (F)**: XX g (XX kcal) - XX%
- **炭水化物 (C)**: XX g (XX kcal) - XX%

### 📝 算出根拠
（BMR・TDEE・目的に応じた調整など簡潔に説明）

### 💡 ワンポイントアドバイス
（このPFCバランスを達成するための実践的なヒント）

【制約】
- 出力はMarkdown形式
- 数値は具体的に
- 根拠を簡潔に説明
- 前説不要、いきなり本題から
"""

        response = self.client.models.generate_content(
            model="gemini-2.5-flash-lite",
            contents=prompt
        )
        return response.text

    def analyze_meal_history(self, *, meal_data, period_days, target_pfc):
        """食事記録分析機能"""
        if self.client is None:
            raise RuntimeError("Gemini APIキーが設定されていません")

        prompt = f"""
あなたはプロの栄養士です。以下のユーザーの過去{period_days}日間の食事記録を分析し、**詳細な栄養評価とアドバイス**を提供してください。

【食事記録】
{meal_data}

【目標PFC（1日あたり）】
{target_pfc}

【出力形式】
## 📊 栄養分析レポート（過去{period_days}日間）

### 🎯 総合評価
（栄養バランスを5段階で評価し、一言コメント）

### 📈 PFCバランスの分析

#### 平均摂取量
- **タンパク質**: XX g/日（目標: XX g） - 達成率 XX%
- **脂質**: XX g/日（目標: XX g） - 達成率 XX%
- **炭水化物**: XX g/日（目標: XX g） - 達成率 XX%
- **総カロリー**: XX kcal/日（目標: XX kcal）

#### 傾向分析
（過剰/不足している栄養素、日ごとのばらつきなど）

### ⚠️ 改善が必要な点
1. **タンパク質不足**: 〜
2. **脂質の摂りすぎ**: 〜
3. **炭水化物の偏り**: 〜

### ✅ 改善のための具体的アクション
1. **短期（今週）**: 〜を追加/減らす
2. **中期（今月）**: 〜の習慣をつける
3. **長期（3ヶ月）**: 〜を目指す

### 💡 食事改善のヒント
（簡単に実践できる食材選びや調理法のアドバイス）

### 🌟 ポジティブフィードバック
（良い点を褒め、モチベーションを高める）

【制約】
- データに基づく客観的分析
- 具体的な数値を使用
- 実現可能な提案
- ポジティブで励ます口調
- 前説不要、いきなり本題から
"""

        response = self.client.models.generate_content(
            model="gemini-2.5-flash-lite",
            contents=prompt
        )
        return response.text

    def suggest_meals(self, *, protein, fat, carbs, meals_count, dietary_restrictions):
        """食事提案機能"""
        if self.client is None:
            raise RuntimeError("Gemini APIキーが設定されていません")

        prompt = f"""
あなたはプロの栄養士です。以下のPFC目標値に合わせた**具体的な献立**を提案してください。

【目標PFC】
- タンパク質: {protein} g
- 脂質: {fat} g
- 炭水化物: {carbs} g
- 食事回数: {meals_count}回
- 制限事項: {dietary_restrictions if dietary_restrictions else "なし"}

【出力形式】
## 🍽️ 本日の献立プラン

### 朝食 (XX:XX推奨)
- **メニュー**: 具体的な料理名
- **食材**: 材料と分量
- **PFC**: P XX g / F XX g / C XX g / カロリー XX kcal

（食事回数に応じて昼食・夕食・間食を追加）

### 📝 調理のポイント
（簡単な調理法や食材の代替案）

### 💡 PFC達成のコツ
（目標値に近づけるための実践的アドバイス）

【制約】
- 日本で手に入る食材のみ
- 調理時間は30分以内を推奨
- 各食事のPFC内訳を明記
- 合計がターゲットに近くなるよう調整
- 前説不要、いきなり本題から
"""

        response = self.client.models.generate_content(
            model="gemini-2.5-flash-lite",
            contents=prompt
        )
        return response.text

    def nutrition_consultation(self, *, concern, user_info):
        """栄養相談機能"""
        if self.client is None:
            raise RuntimeError("Gemini APIキーが設定されていません")

        prompt = f"""
あなたはプロの栄養士兼メンタルコーチです。以下の悩みに対して**共感的かつ実践的な**アドバイスをしてください。

【相談内容】
{concern}

【ユーザー情報】
{user_info if user_info else "情報なし"}

【出力形式】
## 💬 アドバイス

### 🤝 理解と共感
（悩みに対する理解を示す）

### 💡 具体的な解決策
（3つ程度の実践的なアプローチ）
1. **短期的な対策**
2. **長期的な習慣改善**
3. **代替アイデア**

### 📊 科学的根拠
（栄養学・心理学的な裏付けを簡潔に）

### 🎯 今日から始められること
（最も簡単な第一歩）

【制約】
- 押し付けがましくない、寄り添う口調
- 実現可能な提案
- ネガティブな表現を避ける
- 前説不要、いきなり本題から
"""

        response = self.client.models.generate_content(
            model="gemini-2.5-flash-lite",
            contents=prompt
        )
        return response.text