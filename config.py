import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """アプリケーション全体の設定を管理するクラス"""
    
    GEMINI_MODEL = os.getenv('GEMINI_MODEL', 'gemini-1.5-flash')
    
    # その他の設定もここに追加可能
    # 例: GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
    # 例: TIPS_USE_AI = os.getenv('TIPS_USE_AI', 'false').lower() == 'true'
    
    @classmethod
    def get_model(cls):
        """使用するGeminiモデル名を取得"""
        return cls.GEMINI_MODEL