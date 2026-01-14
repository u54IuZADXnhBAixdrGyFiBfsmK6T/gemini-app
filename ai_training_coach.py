# ai_training_coach.py
import os
from google import genai

class TrainingCoach:
    def __init__(self):
        try:
            self.client = genai.Client()  # ← シンプルにこれだけ
        except Exception as e:
            print(f"Gemini APIクライアント初期化エラー: {e}")
            self.client = None

    def suggest_exercises(self, *, target_muscle, training_level, equipment, goals):
        """メニュー提案機能"""
        if self.client is None:
            raise RuntimeError("Gemini APIクライアントが初期化されていません")

        prompt = f"""
あなたはプロのパーソナルトレーナーです。以下の情報に基づいて**科学的に効果的な**トレーニングメニューを提案してください。

【ユーザー情報】
- ターゲット筋肉: {target_muscle}
- トレーニングレベル: {training_level}
- 利用可能な器具: {equipment}
- 目標: {goals}

【出力形式】
## 💪 {target_muscle}のトレーニングメニュー

### 🎯 推奨種目

#### 1. [種目名]
- **難易度**: 初級/中級/上級
- **主働筋**: 具体的な筋肉名
- **セット数**: X セット
- **レップ数**: X-X 回
- **インターバル**: X 秒
- **重要ポイント**:
  - フォームの要点1
  - フォームの要点2
  - よくある間違い

（推奨種目を3-5個提案）

### 📊 トレーニングの組み方
（種目の順序、ボリューム調整、進捗の測り方）

### ⚠️ 注意事項
（怪我予防、オーバートレーニング対策）

### 💡 効果を最大化するコツ
（マインドマッスルコネクション、呼吸法など）

【制約】
- 出力はMarkdown形式
- 科学的根拠に基づく
- 具体的な数値を明記
- 前説不要、いきなり本題から
"""

        try:
            response = self.client.models.generate_content(
                model="gemini-2.5-flash-lite",
                contents=prompt
            )
            return response.text
        except Exception as e:
            raise RuntimeError(f"AI生成エラー: {str(e)}")

    def analyze_workout_history(self, *, workout_data, period_days):
        """運動記録分析機能"""
        if self.client is None:
            raise RuntimeError("Gemini APIクライアントが初期化されていません")

        prompt = f"""
あなたはプロのストレングスコーチです。以下のユーザーの過去{period_days}日間のトレーニング記録を分析し、**詳細なフィードバック**を提供してください。

【トレーニング記録】
{workout_data}

【出力形式】
## 📊 トレーニング分析レポート（過去{period_days}日間）

### 🎯 総合評価
（全体的なトレーニングの質を5段階で評価し、一言コメント）

### 📈 部位別の分析

#### 頻度が高い部位
- **部位名**: X回実施
  - 良い点: 〜
  - 改善点: 〜

#### 頻度が低い部位
- **部位名**: X回実施
  - リスク: 筋バランスの崩れなど
  - 推奨: 〜を追加

### 💪 重量・ボリュームの推移
（主要種目の重量変化、総ボリュームの傾向）

### ⚠️ 改善が必要な点
1. **バランスの偏り**: 〜
2. **オーバートレーニングのリスク**: 〜
3. **種目の偏り**: 〜

### ✅ 今後の推奨アクション
1. **短期（今週）**: 〜
2. **中期（今月）**: 〜
3. **長期（3ヶ月）**: 〜

### 💡 モチベーションメッセージ
（ポジティブな励ましの言葉）

【制約】
- データに基づく客観的分析
- 具体的な数値を使用
- 実行可能な提案
- 前説不要、いきなり本題から
"""

        try:
            response = self.client.models.generate_content(
                model="gemini-2.5-flash-lite",
                contents=prompt
            )
            return response.text
        except Exception as e:
            raise RuntimeError(f"AI生成エラー: {str(e)}")

    def improve_form(self, *, exercise_name, issue, experience):
        """フォーム改善機能"""
        if self.client is None:
            raise RuntimeError("Gemini APIクライアントが初期化されていません")

        prompt = f"""
あなたはプロのパーソナルトレーナー兼理学療法士です。以下のフォームに関する悩みを**詳細に分析**し、改善策を提案してください。

【種目情報】
- 種目名: {exercise_name}
- 悩み・問題: {issue}
- 経験レベル: {experience}

【出力形式】
## 🔧 フォーム改善アドバイス

### 🔍 問題の分析
（なぜその問題が起きているのか、考えられる原因）

### ✅ 改善ステップ

#### Step 1: [改善ポイント1]
- **具体的な動作**: 〜をする
- **意識すること**: 〜を感じる
- **チェック方法**: 〜で確認

（Step 2, 3... と続く）

### 🎥 セルフチェック方法
（動画撮影のポイント、見るべき角度）

### 💪 補助エクササイズ
（フォーム改善に役立つ補助種目）

### ⚡ すぐ試せるコツ
（次のトレーニングから実践できる即効性のあるヒント）

【制約】
- 実践的で具体的に
- 段階的なアプローチ
- 安全性を最優先
- 前説不要、いきなり本題から
"""

        try:
            response = self.client.models.generate_content(
                model="gemini-2.0-flash-exp",
                contents=prompt
            )
            return response.text
        except Exception as e:
            raise RuntimeError(f"AI生成エラー: {str(e)}")

    def injury_recovery(self, *, injury_location, symptoms, pain_level, occurrence):
        """怪我対応機能"""
        if self.client is None:
            raise RuntimeError("Gemini APIクライアントが初期化されていません")

        prompt = f"""
あなたはスポーツ医学の専門家です。以下の怪我情報に基づいて**安全なリハビリ計画**を提案してください。

【重要な注意】
まず必ず医師の診断を受けることを強く推奨してください。以下は一般的なアドバイスであり、医療行為ではありません。

【怪我情報】
- 部位: {injury_location}
- 症状: {symptoms}
- 痛みレベル: {pain_level}/10
- 発生状況: {occurrence}

【出力形式】
## 🩹 リハビリテーション計画

### ⚠️ 重要な注意事項
**必ず専門医の診断を受けてください。以下は一般的な情報提供です。**

### 🔍 考えられる原因
（一般的なケースでの原因分析）

### 📋 リハビリフェーズ

#### フェーズ1: 急性期（受傷直後〜X日）
- **目的**: 炎症抑制、痛み管理
- **やること**: RICE処置など
- **避けること**: 負荷をかける動作

#### フェーズ2: 回復期（X日〜X週間）
- **目的**: 可動域回復
- **推奨エクササイズ**: 軽い動き
- **進捗の目安**: 痛みの変化

#### フェーズ3: 強化期（X週間〜）
- **目的**: 筋力・機能回復
- **トレーニング内容**: 段階的負荷
- **復帰の目安**: 確認項目

### 🏥 医療機関受診が必要なケース
（すぐに病院に行くべき症状）

### 💊 セルフケア
（自宅でできる対処法、ストレッチ、生活習慣）

### 🔄 トレーニング再開の判断基準
（どの状態なら復帰OKか）

【制約】
- 安全性を最優先
- 医療行為ではないことを明記
- 段階的なアプローチ
- 前説不要、いきなり本題から
"""

        try:
            response = self.client.models.generate_content(
                model="gemini-2.0-flash-exp",
                contents=prompt
            )
            return response.text
        except Exception as e:
            raise RuntimeError(f"AI生成エラー: {str(e)}")

    def design_program(self, *, goal, frequency, level, available_time, limitations):
        """プログラム設計機能"""
        if self.client is None:
            raise RuntimeError("Gemini APIクライアントが初期化されていません")

        prompt = f"""
あなたはプロのストレングスコーチです。以下の情報に基づいて**包括的なトレーニングプログラム**を設計してください。

【トレーニング条件】
- 目標: {goal}
- 週の頻度: {frequency}
- レベル: {level}
- 1回の時間: {available_time}
- 制限事項: {limitations if limitations else "なし"}

【出力形式】
## 📅 あなた専用トレーニングプログラム

### 🎯 プログラムの概要
（期間、分割法、進捗の測り方）

### 📆 週間スケジュール

#### 月曜日: [部位/テーマ]
1. **[種目名]** - X セット × X-X レップ
2. **[種目名]** - X セット × X-X レップ
3. ...
- **所要時間**: 約X分
- **ポイント**: 重要な注意点

（週の各トレーニング日を記載）

#### 休息日の過ごし方
（アクティブリカバリー、ストレッチなど）

### 📈 プログレッション（進捗計画）
- **週1-2**: 〜に集中
- **週3-4**: 〜を強化
- **週5-8**: 〜でピークへ
- **週9-12**: 〜でさらに向上

### 📊 進捗の記録方法
（何をどう記録するか）

### ⚡ 成功のポイント
（継続のコツ、モチベーション維持）

### 🔄 プログラム見直しのタイミング
（いつ、どう調整するか）

【制約】
- 実行可能な現実的プラン
- 過度な負荷は避ける
- 個別の条件を考慮
- 前説不要、いきなり本題から
"""

        try:
            response = self.client.models.generate_content(
                model="gemini-2.0-flash-exp",
                contents=prompt
            )
            return response.text
        except Exception as e:
            raise RuntimeError(f"AI生成エラー: {str(e)}")