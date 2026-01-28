# ai_coach_improved.py
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

        prompt = f"""あなたはプロの栄養士とフィットネストレーナーです。
以下のユーザー情報に基づき、ボディメイクに特化した総合的なアドバイスを提供してください。

【ユーザー情報】
- 身長: {height} cm
- 体重: {weight} kg
- 日常生活: {activity}
- 理想の体型: {ideal}

【出力ルール】
1. 前置き・挨拶は一切不要。見出しから始めること
2. Markdown形式で出力
3. 見出しは必ず ## を使用
4. 重要な用語・数値は **太字**
5. 各セクションは箇条書きで3-5項目
6. 具体的な数値・食材名・種目名を必ず含める
7. 「〜など」「〜等」は使わず、具体例を列挙

【必須セクション】
## 🍽️ 食生活改善ポイント
（PFCバランス、食材選び、食事タイミングを具体的に）

## 💪 運動習慣の構築
（週の頻度、時間帯、種目の優先順位を明確に）

## 😴 生活習慣の最適化
（睡眠時間、水分摂取、ストレス管理を数値で）

## 🍱 1日の献立例
### 朝食
- メニュー名: 具体的な料理名
- 主な食材: 分量付き（例: 鶏むね肉150g）
- 目安PFC: P XX g / F XX g / C XX g

### 昼食
（同様に記載）

### 夕食
（同様に記載）

## 🏋️ 推奨トレーニングメニュー
### 種目1: 具体的な種目名
- ターゲット: 主働筋名
- セット×レップ: X セット × X-X 回
- 頻度: 週 X 回
- ポイント: 1-2行で簡潔に

（種目2、種目3も同様）

【禁止事項】
- 「バランスの良い」など抽象的表現
- 「適度に」「ほどほどに」など曖昧な表現
- ユーザーへの質問や確認
- 追加情報の要求"""

        response = self.client.models.generate_content(
            model="gemini-2.0-flash-lite",
            contents=prompt
        )

        return response.text