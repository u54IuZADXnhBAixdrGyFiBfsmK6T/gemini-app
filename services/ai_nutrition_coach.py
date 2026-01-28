# ai_nutrition_coach_compact.py
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

        prompt = f"""スポーツ栄養学の専門家として、PFCバランスを算出してください。

【情報】身長:{height}cm / 体重:{weight}kg / 年齢:{age}歳 / 性別:{gender} / 活動量:{activity_level} / 目的:{goal}

【出力ルール】
- 前置き不要、見出しから開始
- 数値は整数（小数点切り捨て）
- パーセンテージも整数
- 根拠は1-2行

## 📊 推奨PFCバランス

**1日の目標**: XXXX kcal

### マクロ栄養素
| 栄養素 | グラム | カロリー | 比率 |
|--------|--------|----------|------|
| **タンパク質 (P)** | XX g | XXX kcal | XX% |
| **脂質 (F)** | XX g | XXX kcal | XX% |
| **炭水化物 (C)** | XX g | XXX kcal | XX% |

### 🧮 算出根拠
- BMR: XXXX kcal（Harris-Benedict式）
- TDEE: XXXX kcal（活動係数X.X）
- 調整: {goal}のためTDEE±XXX kcal

### 💡 実践アドバイス
**タンパク質 XX g**:
鶏むね肉XXXg / 卵X個 / プロテインX杯

**脂質 XX g**:
良質源（アボカド/ナッツ/青魚） / 目安：ナッツXXg、魚XXXg

**炭水化物 XX g**:
トレ前XXg（おにぎりX個） / トレ後XXg（バナナX本） / その他XXg

【禁止】抽象表現、詳細計算過程、複数選択肢、質問"""

        response = self.client.models.generate_content(
            model="gemini-2.0-flash-lite",
            contents=prompt
        )
        return response.text

    def analyze_meal_history(self, *, period_days, target_pfc, average_intake, daily_breakdown):
        """食事記録分析機能"""
        if self.client is None:
            raise RuntimeError("Gemini APIキーが設定されていません")

        prompt = f"""管理栄養士として、データを客観的に分析してください。

【期間】{period_days}日間
【目標】{target_pfc}
【平均】{average_intake}
【日別】{daily_breakdown}

【出力ルール】
- 前置き不要
- 達成率：整数%
- 評価：S/A/B/C/D
- 改善点：優先順
- 最後ポジティブ

## 📊 栄養分析（{period_days}日間）

### 🎯 総合評価: [S/A/B/C/D]
[理由1行]

### 📈 PFC達成状況
| 項目 | 実績平均 | 目標 | 達成率 | 評価 |
|------|----------|------|--------|------|
| **タンパク質** | XX.X g | XX.X g | XXX% | [過剰/適正/不足] |
| **脂質** | XX.X g | XX.X g | XXX% | [過剰/適正/不足] |
| **炭水化物** | XX.X g | XX.X g | XXX% | [過剰/適正/不足] |
| **総カロリー** | XXXX kcal | XXXX kcal | XXX% | [過剰/適正/不足] |

### 🔍 傾向
**最改善必要**: [栄養素]
- 差: ±XXg(±XXXkcal) / ばらつき:[大/普通/小] / パターン:[1-2行]

### ⚠️ 改善ポイント（優先順）

#### 🔴 [改善点1]
現状:[数値] / 影響:[1行] / 対策:[具体案]

#### 🟡 [改善点2]
（同様）

### ✅ 実践アクション
- **今日**: [行動、食材名・量明記]
- **今週**: [行動、頻度明記]
- **来週〜**: [習慣化]

### 💪 良い点
[データ基づく3点]

### 🌟 メッセージ
[{period_days}日継続讃え、前向き2-3行]

【禁止】データ外推測、曖昧表現、一般論、詳細計算"""

        response = self.client.models.generate_content(
            model="gemini-2.0-flash-lite",
            contents=prompt
        )
        return response.text

    def suggest_meals(self, *, protein, fat, carbs, meals_count, dietary_restrictions):
        """食事提案機能"""
        if self.client is None:
            raise RuntimeError("Gemini APIキーが設定されていません")

        prompt = f"""献立作成のプロとして、PFC目標±5%以内の献立を作成してください。

【目標】P:{protein}g / F:{fat}g / C:{carbs}g / {meals_count}回 / 制限:{dietary_restrictions if dietary_restrictions else "なし"}

【出力ルール】
- 前置き不要
- 食材：g表記
- 調理：20分以内
- コンビニ代替提示
- PFC計算必須
- 合計±5%以内

## 🍽️ 献立プラン

### 朝食（7:00-8:00）⏰
**メニュー**: [料理名]
**食材**: [食材1]XXg / [食材2]XXg / [食材3]XXg
**栄養**: P XXg / F XXg / C XXg / XXXkcal
**手順**: 1.[手順] 2.[手順] 3.[手順]
**コンビニ**: [商品1]+[商品2]（P XXg/F XXg/C XXg）

### 昼食（12:00-13:00）
（同様）

### 夕食（18:00-19:00）
（同様）

（{meals_count}回分記載、間食ある場合追加）

### 📊 合計栄養素
| 栄養素 | 実際 | 目標 | 達成率 |
|--------|------|------|--------|
| タンパク質 | XXg | {protein}g | XXX% |
| 脂質 | XXg | {fat}g | XXX% |
| 炭水化物 | XXg | {carbs}g | XXX% |
| カロリー | XXXXkcal | XXXXkcal | XXX% |

### 🛒 買い物リスト
[全食材]: XXg

### ⏱️ 時短
- [テク1]
- [テク2]

### 🔄 代替
**[食材]なし**: →[代替]（栄養同等）

【禁止】曖昧表現、PFC未計算、入手困難食材、30分超調理"""

        response = self.client.models.generate_content(
            model="gemini-2.0-flash-lite",
            contents=prompt
        )
        return response.text

    def nutrition_consultation(self, *, concern, user_info):
        """栄養相談機能"""
        if self.client is None:
            raise RuntimeError("Gemini APIキーが設定されていません")

        prompt = f"""管理栄養士兼メンタルコーチとして、共感的かつ実践的にアドバイスしてください。

【相談】{concern}
【情報】{user_info if user_info else "なし"}

【出力ルール】
- 前置き不要、共感から開始
- 「〜べき」禁止
- 選択肢3つまで
- 根拠簡潔
- 最後前向き

## 💬 [相談キーワード]について

### 🤝 まずお伝えしたいこと
[共感・理解2-3行。「よくある」「自然」と安心させる]

### 💡 3つのアプローチ

#### 1️⃣ 今日から
**方法**:
- [行動1]: いつ/何を/量
- [行動2]: いつ/何を/量

**効果**: X日後
**根拠**: [1-2行]

#### 2️⃣ 長期習慣
**変化**:
- [変化1]: 行動パターン
- [変化2]: 行動パターン

**ステップ**:
第1週:[内容] / 第2-4週:[内容] / 1ヶ月後:[変化]

#### 3️⃣ 別視点
[違う角度アプローチ]

### 📚 役立つ知識
[栄養・心理観点、仕組み2-3行]

### 🎯 第一歩
**最簡単・効果的**: [行動]
理由: [1行]

### 🌈 応援
[相談讃え、変化期待2-3行]

【禁止】命令口調、否定表現、専門用語羅列、一般論のみ、「頑張って」"""

        response = self.client.models.generate_content(
            model="gemini-2.0-flash-lite",
            contents=prompt
        )
        return response.text