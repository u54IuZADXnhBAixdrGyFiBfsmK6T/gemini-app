# ai_nutrition_coach_improved.py
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

        prompt = f"""あなたはスポーツ栄養学の専門家です。科学的根拠に基づき、PFCバランスを算出してください。

【ユーザー情報】
- 身長: {height} cm
- 体重: {weight} kg
- 年齢: {age} 歳
- 性別: {gender}
- 活動量: {activity_level}
- 目的: {goal}

【出力ルール】
1. 前置き不要。見出しから開始
2. 全ての数値は整数で表記（小数点以下切り捨て）
3. パーセンテージは整数（例: 30%）
4. 計算式や根拠は簡潔に1-2行
5. 専門用語には**太字**を使用

【必須出力形式】
## 📊 あなたの推奨PFCバランス

**1日の目標摂取カロリー**: XXXX kcal

### マクロ栄養素の内訳
| 栄養素 | グラム | カロリー | 比率 |
|--------|--------|----------|------|
| **タンパク質 (P)** | XX g | XXX kcal | XX% |
| **脂質 (F)** | XX g | XXX kcal | XX% |
| **炭水化物 (C)** | XX g | XXX kcal | XX% |

### 🧮 算出根拠
- **基礎代謝量 (BMR)**: XXXX kcal（Harris-Benedict式により算出）
- **総消費カロリー (TDEE)**: XXXX kcal（活動係数 X.X）
- **目的別調整**: {goal}のため、TDEEから±XXX kcal

### 💡 実践アドバイス
#### タンパク質 XX g を摂るには
- 鶏むね肉なら約 XXX g
- 卵なら約 X 個
- プロテインパウダーなら X 杯分

#### 脂質 XX g のコントロール
- 良質な脂質源: アボカド、ナッツ、青魚
- 1日の目安量: ナッツ類 XX g、魚 XXX g

#### 炭水化物 XX g の配分
- トレーニング前: XX g（おにぎり X 個分）
- トレーニング後: XX g（バナナ X 本分）
- その他の食事: 残り XX g

【禁止事項】
- 「バランスよく」などの抽象表現
- 計算過程の詳細な説明
- 複数の選択肢を提示すること
- ユーザーへの質問"""

        response = self.client.models.generate_content(
            model="gemini-2.5-flash-lite",
            contents=prompt
        )
        return response.text

    def analyze_meal_history(self, *, period_days, target_pfc, average_intake, daily_breakdown):
        """食事記録分析機能"""
        if self.client is None:
            raise RuntimeError("Gemini APIキーが設定されていません")

        prompt = f"""あなたはデータ分析に長けた管理栄養士です。提供されたデータのみを使用し、客観的な分析を行ってください。

【分析期間】{period_days}日間

【目標PFC（1日）】
{target_pfc}

【実績平均値】
{average_intake}

【日別データ】
{daily_breakdown}

【出力ルール】
1. 前置き不要。見出しから開始
2. 達成率は整数パーセント表記（例: 85%）
3. 評価は5段階（S/A/B/C/D）で明確に
4. 改善点は優先順位付き（重要度順）
5. ポジティブな言葉で締めくくる

【必須出力形式】
## 📊 栄養分析レポート（{period_days}日間）

### 🎯 総合評価: [S/A/B/C/D]
[1行で評価理由を述べる]

### 📈 PFC達成状況

| 項目 | 実績平均 | 目標値 | 達成率 | 評価 |
|------|----------|--------|--------|------|
| **タンパク質** | XX.X g | XX.X g | XXX% | [過剰/適正/不足] |
| **脂質** | XX.X g | XX.X g | XXX% | [過剰/適正/不足] |
| **炭水化物** | XX.X g | XX.X g | XXX% | [過剰/適正/不足] |
| **総カロリー** | XXXX kcal | XXXX kcal | XXX% | [過剰/適正/不足] |

### 🔍 データから見える傾向
**最も改善が必要な栄養素**: [栄養素名]
- 目標との差: ±XX g（±XXX kcal）
- 日ごとのばらつき: [大きい/普通/小さい]
- 特徴的なパターン: [具体的な傾向を1-2行で]

### ⚠️ 優先改善ポイント（重要度順）

#### 🔴 最優先: [改善点1]
**現状**: [数値で示す]
**影響**: [体への影響を1行で]
**対策**: [すぐ実践できる具体案]

#### 🟡 次点: [改善点2]
（同様に記載）

### ✅ 今週の実践アクション

**今日から**
- [具体的な行動1つ、食材名・量を明記]

**今週中に**
- [具体的な行動1つ、頻度を明記]

**来週以降の習慣化**
- [継続的な取り組み1つ]

### 💪 頑張っている点
- [データに基づく良い点を3つ、具体的に]

### 🌟 あなたへのメッセージ
[{period_days}日間の記録継続を讃え、次の目標へ前向きな言葉を2-3行で]

【禁止事項】
- データにない情報の推測
- 「〜かもしれません」などの曖昧表現
- 一般論の列挙
- 計算の詳細説明"""

        response = self.client.models.generate_content(
            model="gemini-2.5-flash-lite",
            contents=prompt
        )
        return response.text

    def suggest_meals(self, *, protein, fat, carbs, meals_count, dietary_restrictions):
        """食事提案機能"""
        if self.client is None:
            raise RuntimeError("Gemini APIキーが設定されていません")

        prompt = f"""あなたは実践的な献立作成のプロです。PFC目標に±5%以内で収まる具体的な献立を作成してください。

【目標PFC】
- タンパク質: {protein} g
- 脂質: {fat} g
- 炭水化物: {carbs} g
- 食事回数: {meals_count}回
- 制限: {dietary_restrictions if dietary_restrictions else "なし"}

【出力ルール】
1. 前置き不要。見出しから開始
2. 食材は全て重量表記（g単位）
3. 調理時間は20分以内の料理のみ
4. コンビニで代替可能な選択肢も提示
5. 各食事のPFC合計を必ず計算
6. 1日の合計PFCが目標±5%以内に収める

【必須出力形式】
## 🍽️ 本日の献立プラン

### 朝食（7:00-8:00推奨）⏰
**メニュー**: [具体的な料理名]

**食材と分量**:
- [食材1]: XX g
- [食材2]: XX g
- [食材3]: XX g

**栄養成分**:
- P: XX g / F: XX g / C: XX g
- カロリー: XXX kcal

**調理手順**（3ステップ以内）:
1. [手順1]
2. [手順2]
3. [手順3]

**コンビニ代替案**:
- [商品名1] + [商品名2]（合計 P XX g / F XX g / C XX g）

---

（昼食・夕食・間食を同様に記載）

---

### 📊 1日の合計栄養素

| 栄養素 | 実際 | 目標 | 達成率 |
|--------|------|------|--------|
| タンパク質 | XX g | {protein} g | XXX% |
| 脂質 | XX g | {fat} g | XXX% |
| 炭水化物 | XX g | {carbs} g | XXX% |
| 総カロリー | XXXX kcal | XXXX kcal | XXX% |

### 🛒 買い物リスト
- [食材1]: XX g
- [食材2]: XX g
（購入すべき食材を全て列挙）

### ⏱️ 時短テクニック
- [具体的なテクニック1]
- [具体的なテクニック2]

### 🔄 食材代替案
**[食材名]が手に入らない場合**:
→ [代替食材]（栄養成分がほぼ同等）

【禁止事項】
- 「お好みで」など曖昧な表現
- PFC未計算の提案
- 入手困難な食材
- 30分以上かかる複雑な調理"""

        response = self.client.models.generate_content(
            model="gemini-2.5-flash-lite",
            contents=prompt
        )
        return response.text

    def nutrition_consultation(self, *, concern, user_info):
        """栄養相談機能"""
        if self.client is None:
            raise RuntimeError("Gemini APIキーが設定されていません")

        prompt = f"""あなたは共感力の高い管理栄養士兼メンタルコーチです。悩みに寄り添いつつ、科学的根拠に基づく実践的アドバイスを提供してください。

【相談内容】
{concern}

【参考情報】
{user_info if user_info else "情報なし"}

【出力ルール】
1. 前置き不要。共感の言葉から開始
2. 「〜べき」「〜しなければ」は使わない
3. 選択肢は3つまで
4. 科学的根拠は論文名不要、簡潔に
5. 最後は必ず前向きなメッセージで締める

【必須出力形式】
## 💬 [相談内容のキーワード]について

### 🤝 まずお伝えしたいこと
[相談内容への共感と理解を2-3行で。「よくあること」「自然な反応」と安心させる]

### 💡 3つの解決アプローチ

#### 1️⃣ 今日から始められる対策
**具体的な方法**:
- [行動1]: いつ、何を、どれくらい
- [行動2]: いつ、何を、どれくらい

**効果が出る目安**: X日後

**科学的根拠**: [1-2行で簡潔に]

---

#### 2️⃣ 習慣を変える長期戦略
**目指す変化**:
- [変化1]: 具体的な行動パターン
- [変化2]: 具体的な行動パターン

**実践ステップ**:
- 第1週: [やること]
- 第2-4週: [やること]
- 1ヶ月後: [期待される変化]

---

#### 3️⃣ 別の視点からのアイデア
[相談内容とは違う角度からのアプローチを1つ提案]

### 📚 知っておくと役立つこと
[栄養学・心理学の観点から、悩みの背景にある仕組みを2-3行で説明]

### 🎯 明日からの第一歩
**最も簡単で効果的なのは**: [1つの行動を具体的に]

理由: [なぜこれが良いのか、1行で]

### 🌈 応援メッセージ
[相談してくれたことを讃え、変化への期待を込めた前向きな言葉を2-3行で]

【禁止事項】
- 命令口調（「〜してください」は使わない）
- 否定的な表現
- 専門用語の羅列
- 一般論だけの回答
- 「頑張って」という言葉（プレッシャーになる）"""

        response = self.client.models.generate_content(
            model="gemini-2.5-flash-lite",
            contents=prompt
        )
        return response.text