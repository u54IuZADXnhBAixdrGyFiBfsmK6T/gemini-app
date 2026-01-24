# ai_coach.py
from google import genai

class AICoach:
    def __init__(self):
        try:
            self.client = genai.Client()
        except Exception as e:
            print(f"Gemini APIクライアント初期化エラー: {e}")
            self.client = None

    def get_recommendation(self, *, height, weight, activity, ideal):
        if self.client is None:
            raise RuntimeError("Gemini APIキーが設定されていません")

        prompt = f"""
あなたはプロの栄養士とフィットネストレーナーです。
以下のユーザー情報に基づいて、** ボディメイク目線の食生活 **と ** ボディメイク目線の運動習慣 **と ** ボディメイク目線のの生活習慣 **を提案してください
以下のユーザー情報に基づいて、**最適な食事の提案（3食分）**と、**簡単なトレーニングメニュー（3種類）**を提案してください。
出力は前説はいりません。いきなり本題から入ってください。

【制約事項】
- 出力は**Markdown形式**
- 重要語は **太字**
- 見出しは ##
- 箇条書き使用

【ユーザー情報】
- 身長 : {height} cm
- 体重 : {weight} kg
- 日常生活 : {activity}
- 理想の体型 : {ideal}

##食生活
##運動習慣
##生活習慣

## 🍽️ おすすめの献立
（朝食・**昼食**・**夕食** を含める）

## 💪 トレーニングメニュー
"""

        response = self.client.models.generate_content(
            model="gemini-2.5-flash-lite",
            contents=prompt
        )

        return response.text