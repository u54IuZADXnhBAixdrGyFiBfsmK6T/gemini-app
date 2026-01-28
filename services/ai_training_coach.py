# ai_training_coach_compact.py
import os
from google import genai

class TrainingCoach:
    def __init__(self):
        try:
            self.client = genai.Client()
        except Exception as e:
            print(f"Gemini APIクライアント初期化エラー: {e}")
            self.client = None

    def suggest_exercises(self, *, target_muscle, training_level, equipment, goals):
        """メニュー提案機能"""
        if self.client is None:
            raise RuntimeError("Gemini APIクライアントが初期化されていません")

        prompt = f"""あなたはストレングスコーチです。{target_muscle}の効果的なトレーニングを提案してください。

【条件】レベル:{training_level} / 器具:{equipment} / 目標:{goals}

【出力ルール】
- 前置き不要、見出しから開始
- 種目4-6個、優先度順
- 数値は具体的に（セット×レップ、インターバル秒）
- フォームポイント3つまで

## 💪 {target_muscle}トレーニング

### 🎯 推奨種目
#### 1. [種目名]
- 難易度: {training_level}向け
- 主働筋: [筋肉名]
- セット×レップ: X × X-X回
- インターバル: X秒
- 重量: [XRM or 体重○%]
- フォーム: 1.[要点] 2.[要点] 3.[要点]
- よくある間違い: ❌[間違い1] ❌[間違い2]
- 呼吸: [タイミング]

（種目2-6も同様）

### 📊 実施方法
- 順序: [種目1]→[種目2]→[種目3]（理由: [1行]）
- 週頻度: 初心者X回/中級者X回/上級者X回
- 週間総セット数: XX-XXセット
- 進捗測定: 毎週[項目]、毎月[項目]

### ⚠️ 注意点
- ウォームアップ: [種目]Xセット（軽重量）
- 即中止すべき症状: [3つ]
- オーバートレーニング防止: 連続X日まで

### 💡 効果最大化
- 意識: [ターゲット筋]に集中
- 可動域: ストレッチ位[範囲]/収縮位[範囲]
- テンポ: 下X秒/上X秒/静止X秒
- 重量選択: 最後2レップがギリギリ

【禁止】「適度に」等の曖昧表現、安全性無視、エビデンス無し"""

        try:
            response = self.client.models.generate_content(
                model="gemini-2.0-flash-lite",
                contents=prompt
            )
            return response.text
        except Exception as e:
            raise RuntimeError(f"AI生成エラー: {str(e)}")

    def analyze_workout_history(self, *, workout_data, period_days):
        """運動記録分析機能"""
        if self.client is None:
            raise RuntimeError("Gemini APIクライアントが初期化されていません")

        prompt = f"""ストレングスコーチとして{period_days}日間の記録を分析してください。

【データ】
{workout_data}

【出力ルール】
- 前置き不要
- 評価: S/A/B/C/D
- 改善点3つまで、優先度順
- 最後はポジティブに

## 📊 分析レポート（{period_days}日間）

### 🎯 総合評価: [S/A/B/C/D]
[理由1行]

### 📈 実績サマリー
| 指標 | 数値 | 評価 |
|------|------|------|
| トレーニング日数 | X日 | [多/適/少] |
| 平均時間 | XX分 | [長/適/短] |
| 週頻度 | X.X回 | [多/適/少] |
| 総ボリューム | X,XXXkg | [増/維/減] |

### 💪 部位別頻度
| 部位 | 回数 | 評価 | 推奨 |
|------|------|------|------|
| [部位] | X回 | ⭕/⚠️/❌ | 週X回 |

### 📊 主要種目進捗
- [種目]: 最大XXkg(初回XXkg) / 変化+XXkg(+XX%) / 評価:[順調/停滞/要見直し]

### 🔍 改善課題（優先順）
#### 🔴 [課題1]
- 現状:[データ] / リスク:[問題] / 解決:[アクション]

#### 🟡 [課題2]
（同様）

### ✅ アクションプラン
- 今週: [行動1-2]
- 今月: [数値目標]
- 3ヶ月後: [長期目標]

### 🌟 あなたへ
[努力を讃える2文 + 前向きなメッセージ2-3行]

【禁止】データ外の推測、曖昧評価、ネガティブな締め"""

        try:
            response = self.client.models.generate_content(
                model="gemini-2.0-flash-lite",
                contents=prompt
            )
            return response.text
        except Exception as e:
            raise RuntimeError(f"AI生成エラー: {str(e)}")

    def improve_form(self, *, exercise_name, issue, experience):
        """フォーム改善機能"""
        if self.client is None:
            raise RuntimeError("Gemini APIクライアントが初期化されていません")

        prompt = f"""パーソナルトレーナーとして{exercise_name}のフォーム問題を解決してください。

【情報】問題:{issue} / 経験:{experience}

【出力ルール】
- 前置き不要
- 改善ステップ5つまで、優先順
- 即実践可能な内容

## 🔧 [{exercise_name}] フォーム改善

### 🔍 問題分析
- 症状: {issue}
- 原因: 1.[原因] 2.[原因] 3.[原因]
- 最も可能性高: [原因X]

### ✅ 改善ステップ

#### Step 1: [改善点]（最優先）
- 目的: [達成内容]
- 動作: [部位]を[どう動かす]
- 感覚: [どこに][どんな感じ]
- チェック: [確認項目]○○できればOK
- 練習: 軽重量(体重○%)でXセット×X回、各レップX秒

（Step 2-5も同様）

### 🎥 撮影チェック
- 正面: [確認内容] カメラ[高さ・距離]
- 側面: [確認内容] カメラ[高さ・距離]
- チェックリスト: [ ][項目1-3]

### 💪 補助種目
- [種目名]: 目的[内容] / XセットXX回 / 週X回

### ⚡ 即効テクニック
- キュー1: [動作]→[感じる変化]
- キュー2: [動作]→[感じる変化]
- キュー3: [動作]→[感じる変化]

### 📅 習得ロードマップ
- 第1週: 通常X%の重量、目標[内容]
- 第2-3週: X%→X%、目標[内容]
- 第4週〜: 通常重量、確認[内容]

### 🚨 危険信号
❌[症状]:[リスク] → 対処:[方法]

【禁止】抽象的アドバイス、一度に多数変更、経験無視、安全軽視"""

        try:
            response = self.client.models.generate_content(
                model="gemini-2.0-flash-lite",
                contents=prompt
            )
            return response.text
        except Exception as e:
            raise RuntimeError(f"AI生成エラー: {str(e)}")

    def injury_recovery(self, *, injury_location, symptoms, pain_level, occurrence):
        """怪我対応機能"""
        if self.client is None:
            raise RuntimeError("Gemini APIクライアントが初期化されていません")

        prompt = f"""理学療法士として{injury_location}のリハビリ計画を提案してください。

【重要】医療行為ではありません。必ず医療機関受診を推奨してください。

【情報】部位:{injury_location} / 症状:{symptoms} / 痛み:{pain_level}/10 / 発生:{occurrence}

【出力ルール】
- 冒頭に受診推奨を明記
- 各フェーズに期間・痛み目安を設定
- 禁止事項明確化

## 🩹 [{injury_location}] リハビリガイド

### 🚨 最初に（必読）
**一般的ガイドラインです。以下該当なら今すぐ受診**:
❌痛み7/10以上 ❌著しい腫れ・内出血 ❌関節動かせない ❌痺れ ❌痛み悪化 ❌48-72h経過で改善なし
→整形外科/スポーツ医学専門医へ

### 🔍 考えられる原因
- {injury_location}に多い怪我: 1.[種類]:[特徴] 2.[種類]:[特徴] 3.[種類]:[特徴]
- {occurrence}の場合のパターン: [説明]

### 📋 リハビリプログラム

#### 🔴 フェーズ1: 急性期（受傷〜3日）
- 目的: 炎症・痛み管理
- 痛み目安: {pain_level}/10→X/10
- 実施: RICE処置（Rest/Ice X分X回/Compression/Elevation）、避ける動作❌[3つ]
- 次へ: ✅痛みX/10以下 ✅腫れ軽減

#### 🟡 フェーズ2: 回復期（3日〜2週）
- 目的: 可動域回復・軽筋力維持
- 痛み目安: X/10→2-3/10
- 実施: 可動域エクササイズ[2種]X回Xセット、アイソメトリック[2種]X秒Xセット
- 禁止: ❌重量運動 ❌ジャンプ ❌痛み我慢
- 次へ: ✅痛み2/10以下 ✅日常動作OK

#### 🟢 フェーズ3: 強化期（2週〜6週）
- 目的: 筋力・機能完全回復
- 痛み目安: 2/10→0-1/10
- 実施: 週1-2[種目]体重X%、週3-4重量X%増、週5-6通常X%
- 復帰基準: ✅痛み0 ✅受傷前同等 ✅不安なし

### 🏥 受診必要ケース
1週間改善なし/痛み増加/新症状/日常支障/不安→整形外科/スポーツ整形/リハビリ科

### 💊 セルフケア
- 痛み管理: 冷却(運動後)/温熱(慢性期)/鎮痛剤(要相談)
- ストレッチ: [2種]X秒キープ、1日X回
- 生活: 睡眠X時間/タンパク質XXg・ビタミンC・D/水分XL

### 🔄 再開チェック
- 基本動作: [ ]スクワットX回OK [ ]ジャンプ着地OK [ ]競技動作OK
- 筋力: [ ]左右差10%以内 [ ]主要種目X%以上
- 不安: [ ]恐怖心なし [ ]自信あり
→全OK: 段階的復帰

### ⚠️ 再発防止
- 予防: [3つ]
- ウォーム: [方法]最低X分
- メンテ: [ケア]週X回

### 🌟 メッセージ
焦らず段階的に。痛みはシグナル。無理すると遅れます。不安時は医療機関へ。

【禁止】医療診断、「大丈夫」等安易表現、痛み我慢推奨、受診軽視"""

        try:
            response = self.client.models.generate_content(
                model="gemini-2.0-flash-lite",
                contents=prompt
            )
            return response.text
        except Exception as e:
            raise RuntimeError(f"AI生成エラー: {str(e)}")

    def design_program(self, *, goal, frequency, level, available_time, limitations):
        """プログラム設計機能"""
        if self.client is None:
            raise RuntimeError("Gemini APIクライアントが初期化されていません")

        prompt = f"""ストレングスコーチとして12週間プログラムを設計してください。

【条件】目標:{goal} / 週{frequency}回 / {level} / 1回{available_time}分 / 制限:{limitations if limitations else "なし"}

【出力ルール】
- 前置き不要
- 期間12週間
- 各トレーニング{available_time}分以内
- 種目・セット・レップ明記

## 📅 12週間プログラム

### 🎯 概要
- 期間:12週 / 目標:{goal} / 分割:[名称] / 週{frequency}回 / 1回{available_time}分
- 成果: [3つ、数値目標]

### 📆 週間スケジュール

#### Day 1: [部位]
- 所要:XX分 / 目的:[狙い]
- ウォーム(5分): [2種]
- メイン:
  1. [種目]：XセットX-X回/休憩X秒/重量[方法]/所要X分
  2. [種目]：（同様）
  （合計{available_time}分以内）
- クール(5分): [ストレッチ2種]

（Day 2,3...{frequency}回分）

#### 休息日
- 積極的休息: 有酸素20-30分/ストレッチ15-20分
- 完全休息: 週X日、睡眠優先

### 📈 プログレッション

#### フェーズ1: 適応期(1-3週)
- 目的:フォーム確立
- 負荷: 主種目60-70%/補助50-60%
- ボリューム: 週XX-XXセット/レップX-X
- 進捗: 毎週Xkg増

#### フェーズ2: 成長期(4-8週)
- 目的:筋力・筋肥大
- 負荷: 主70-80%/補助60-70%
- ボリューム: 週XX-XXセット/レップX-X
- テクニック: [2種]
- 進捗: 2週毎テスト、第8週[数値]

#### フェーズ3: ピーク期(9-12週)
- 目的:最大化・目標達成
- 負荷: 主80-90%/補助70-80%
- ボリューム: 週XX-XXセット(減)/レップX-X(強度↑)
- ディロード: 第11週50%減、第12週テスト
- 最終目標: [種目1]:[重量] [種目2]:[重量]

### 📊 記録方法
- 必須: [ ]重量 [ ]セット×レップ [ ]RPE(1-10) [ ]疲労度 [ ]睡眠
- 週次: 体重/重量推移/体感
- 月次: 体組成/見直し/再設定

### 💪 成功ポイント
- トレ中: ウォーム必須/フォーム優先/記録継続
- トレ外: タンパク質体重1kgあたりXg/総カロリー[量]/水XL、睡眠X時間/ストレス管理/リカバリー、ストレッチ/週Xモビリティ

### 🔄 見直しタイミング
- 停滞(2週+重量伸びず): ディロード/種目変更/スキーム変更
- 疲労蓄積: ボリューム20%減/休息追加/睡眠・栄養見直し
- 怪我: 該当部位中止/受診/再設計
- 目標達成: 再設計/次サイクル

### 📋 開始前チェック
[ ]最大重量把握 [ ]器具利用可 [ ]時間確保 [ ]栄養・睡眠準備 [ ]怪我なし [ ]モチベ高
→全OK: 開始!

### 🎯 12週後へ
達成:[3つ]
大切: 着実に/記録継続/身体の声
継続は力。12週後の成長を楽しみに!

【禁止】非現実目標、過度負荷、{available_time}分超過、{limitations}無視、回復軽視"""

        try:
            response = self.client.models.generate_content(
                model="gemini-2.0-flash-lite",
                contents=prompt
            )
            return response.text
        except Exception as e:
            raise RuntimeError(f"AI生成エラー: {str(e)}")