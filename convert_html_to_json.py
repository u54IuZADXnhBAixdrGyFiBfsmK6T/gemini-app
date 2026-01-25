import os
import json
import re
from pathlib import Path
from bs4 import BeautifulSoup
from typing import Dict, List, Any

class LifestyleContentExtractor:
    """LifestyleページのHTMLコンテンツをJSONに抽出するツール"""
    
    def __init__(self, templates_dir: str = "templates", json_dir: str = "static/json/lifestyle"):
        self.templates_dir = Path(templates_dir)
        self.json_dir = Path(json_dir)
        self.json_dir.mkdir(parents=True, exist_ok=True)
        
    def extract_lifestyle_content(self, html_file: Path) -> Dict[str, Any]:
        """HTMLファイルからコンテンツを抽出"""
        with open(html_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        soup = BeautifulSoup(content, 'html.parser')
        
        data = {
            "page_id": html_file.stem.replace('lifestyle_', ''),
            "title": self._extract_title(soup),
            "hero": self._extract_hero(soup),
            "toc": self._extract_toc(soup),
            "sections": self._extract_sections(soup),
            "references": self._extract_references(soup),
            "navigation": self._extract_navigation(soup)
        }
        
        return data
    
    def _extract_title(self, soup: BeautifulSoup) -> str:
        """タイトルブロックから抽出"""
        content = str(soup)
        match = re.search(r'{%\s*block\s+title\s*%}(.+?){%\s*endblock\s*%}', content)
        if match:
            return match.group(1).strip()
        return ""
    
    def _extract_hero(self, soup: BeautifulSoup) -> Dict[str, str]:
        """ヒーローセクションから抽出"""
        hero = soup.find('div', class_='detail-hero')
        if not hero:
            return {}
        
        return {
            "title": hero.find('h1').get_text(strip=True) if hero.find('h1') else "",
            "subtitle": hero.find('p', class_='subtitle').get_text(strip=True) if hero.find('p', class_='subtitle') else ""
        }
    
    def _extract_toc(self, soup: BeautifulSoup) -> Dict[str, List[Dict[str, str]]]:
        """目次セクションから抽出"""
        toc_div = soup.find('div', class_='toc')
        if not toc_div:
            return {}
        
        toc_title = toc_div.find('h2').get_text(strip=True) if toc_div.find('h2') else ""
        items = []
        
        for li in toc_div.find_all('li'):
            link = li.find('a')
            if link:
                items.append({
                    "href": link.get('href', ''),
                    "text": link.get_text(strip=True)
                })
        
        return {
            "title": toc_title,
            "items": items
        }
    
    def _extract_sections(self, soup: BeautifulSoup) -> List[Dict[str, Any]]:
        """コンテンツセクションから抽出"""
        sections = []
        
        for section in soup.find_all('section', class_='content-section'):
            section_id = section.get('id', '')
            section_data = {
                "id": section_id,
                "title": "",
                "content": []
            }
            
            # タイトル
            h2 = section.find('h2')
            if h2:
                section_data["title"] = h2.get_text(strip=True)
            
            # コンテンツ要素を順番に抽出
            for elem in section.find_all(['p', 'h3', 'h4', 'ul', 'ol', 'div'], recursive=False):
                content_item = self._extract_element(elem)
                if content_item:
                    section_data["content"].append(content_item)
            
            sections.append(section_data)
        
        return sections
    
    def _extract_element(self, elem) -> Dict[str, Any]:
        """個別要素を抽出"""
        tag_name = elem.name
        
        # 段落
        if tag_name == 'p':
            return {
                "type": "paragraph",
                "text": self._get_html_content(elem)
            }
        
        # 見出し
        if tag_name in ['h3', 'h4', 'h5']:
            return {
                "type": "heading",
                "level": tag_name,
                "text": elem.get_text(strip=True)
            }
        
        # リスト
        if tag_name in ['ul', 'ol']:
            return {
                "type": "list",
                "ordered": tag_name == 'ol',
                "items": [self._get_html_content(li) for li in elem.find_all('li', recursive=False)]
            }
        
        # 特殊ボックス
        if tag_name == 'div':
            classes = elem.get('class', [])
            
            if 'info-box' in classes or 'warning-box' in classes or 'success-box' in classes:
                return self._extract_box(elem, classes)
            
            if 'stats-grid' in classes:
                return self._extract_stats_grid(elem)
            
            if 'interactive-tool' in classes:
                return self._extract_interactive_tool(elem)
            
            # スタイル付きdivの抽出
            if elem.get('style'):
                return self._extract_styled_div(elem)
        
        return None
    
    def _extract_box(self, elem, classes: List[str]) -> Dict[str, Any]:
        """info-box, warning-box, success-boxの抽出"""
        box_type = next((c for c in classes if c.endswith('-box')), 'info-box')
        
        h4 = elem.find('h4')
        title = h4.get_text(strip=True) if h4 else ""
        
        # h4以外のコンテンツを抽出
        content_parts = []
        for child in elem.children:
            if child.name and child.name != 'h4':
                if child.name in ['p', 'ul', 'ol']:
                    content_parts.append(self._extract_element(child))
        
        return {
            "type": "box",
            "box_type": box_type.replace('-box', ''),
            "title": title,
            "content": content_parts
        }
    
    def _extract_stats_grid(self, elem) -> Dict[str, Any]:
        """stats-gridの抽出"""
        cards = []
        for card in elem.find_all('div', class_='stat-card'):
            number = card.find('div', class_='stat-number')
            label = card.find('div', class_='stat-label')
            cards.append({
                "number": number.get_text(strip=True) if number else "",
                "label": label.get_text(strip=True) if label else ""
            })
        
        return {
            "type": "stats_grid",
            "cards": cards
        }
    
    def _extract_interactive_tool(self, elem) -> Dict[str, Any]:
        """インタラクティブツールの抽出（構造のみ、JSは保持）"""
        return {
            "type": "interactive_tool",
            "id": elem.get('id', ''),
            "note": "このツールのHTMLはテンプレート内に残します（JS連携のため）"
        }
    
    def _extract_styled_div(self, elem) -> Dict[str, Any]:
        """スタイル付きdivの抽出（テーブルなど）"""
        # テーブルの検出
        table = elem.find('table')
        if table:
            return self._extract_table(table, elem.get('style', ''))
        
        # その他のスタイル付きコンテンツ
        content_items = []
        for child in elem.children:
            if child.name:
                item = self._extract_element(child)
                if item:
                    content_items.append(item)
        
        return {
            "type": "styled_div",
            "style": elem.get('style', ''),
            "content": content_items
        }
    
    def _extract_table(self, table, parent_style: str = "") -> Dict[str, Any]:
        """テーブルの抽出"""
        headers = []
        rows = []
        
        thead = table.find('thead')
        if thead:
            header_row = thead.find('tr')
            if header_row:
                headers = [th.get_text(strip=True) for th in header_row.find_all(['th', 'td'])]
        
        tbody = table.find('tbody') or table
        for tr in tbody.find_all('tr'):
            if tr.parent.name == 'thead':
                continue
            row = [td.get_text(strip=True) for td in tr.find_all(['td', 'th'])]
            rows.append(row)
        
        return {
            "type": "table",
            "parent_style": parent_style,
            "headers": headers,
            "rows": rows,
            "table_style": table.get('style', '')
        }
    
    def _extract_references(self, soup: BeautifulSoup) -> Dict[str, Any]:
        """参考文献セクションの抽出"""
        ref_section = soup.find('section', id='references')
        if not ref_section:
            return {}
        
        title = ref_section.find('h2')
        references = []
        
        ol = ref_section.find('ol')
        if ol:
            for li in ol.find_all('li', recursive=False):
                references.append(self._get_html_content(li))
        
        return {
            "title": title.get_text(strip=True) if title else "",
            "items": references
        }
    
    def _extract_navigation(self, soup: BeautifulSoup) -> Dict[str, Any]:
        """ナビゲーションボタンの抽出"""
        nav_div = soup.find('div', class_='detail-navigation')
        if not nav_div:
            return {}
        
        buttons = []
        for a in nav_div.find_all('a', class_='nav-button'):
            buttons.append({
                "href": a.get('href', ''),
                "text": a.get_text(strip=True)
            })
        
        return {"buttons": buttons}
    
    def _get_html_content(self, elem) -> str:
        """HTML要素の内容を取得（<strong>などのタグを保持）"""
        if not elem:
            return ""
        
        # 内部HTMLを取得
        html = str(elem)
        
        # 外側のタグを除去
        html = re.sub(r'^<[^>]+>', '', html)
        html = re.sub(r'</[^>]+>$', '', html)
        
        return html.strip()
    
    def create_simplified_html(self, original_file: Path, json_data: Dict[str, Any]) -> str:
        """簡潔化されたHTMLテンプレートを生成"""
        page_id = json_data['page_id']
        
        template = f'''{{% extends "base.html" %}}

{{% block title %}}{json_data.get('title', 'Lifestyle')}{{% endblock %}}

{{% block head %}}
<link rel="stylesheet" href="{{{{ url_for('static', filename='css/lifestyle.css') }}}}">
{{% endblock %}}

{{% block content %}}
<div class="lifestyle-detail" id="lifestyle-{page_id}">
    <!-- コンテンツはJavaScriptで動的に読み込まれます -->
    <div id="content-loading">
        <p>Loading...</p>
    </div>
</div>
{{% endblock %}}

{{% block scripts %}}
<script type="module">
    import {{ renderLifestyleContent }} from '{{{{ url_for('static', filename='js/shared/lifestyle_renderer.js') }}}}';
    
    // JSONデータを読み込んでレンダリング
    fetch('{{{{ url_for('static', filename='json/lifestyle/{page_id}.json') }}}}')
        .then(response => response.json())
        .then(data => {{
            renderLifestyleContent(data, 'lifestyle-{page_id}');
        }})
        .catch(error => {{
            console.error('コンテンツの読み込みに失敗しました:', error);
            document.getElementById('content-loading').innerHTML = 
                '<p style="color: red;">コンテンツの読み込みに失敗しました。</p>';
        }});
</script>
<script type="module" src="{{{{ url_for('static', filename='js/pages/lifestyle.js') }}}}"></script>
{{% endblock %}}
'''
        return template
    
    def process_file(self, html_filename: str, create_backup: bool = True):
        """単一ファイルを処理"""
        html_file = self.templates_dir / html_filename
        
        if not html_file.exists():
            print(f"❌ ファイルが見つかりません: {html_file}")
            return False
        
        print(f"\n{'='*60}")
        print(f"📄 処理中: {html_filename}")
        print(f"{'='*60}")
        
        # バックアップ作成
        if create_backup:
            backup_file = html_file.with_suffix('.html.backup')
            import shutil
            shutil.copy2(html_file, backup_file)
            print(f"✅ バックアップ作成: {backup_file.name}")
        
        # JSONに抽出
        try:
            json_data = self.extract_lifestyle_content(html_file)
            page_id = json_data['page_id']
            
            # JSON保存
            json_file = self.json_dir / f"{page_id}.json"
            with open(json_file, 'w', encoding='utf-8') as f:
                json.dump(json_data, f, ensure_ascii=False, indent=2)
            print(f"✅ JSON生成: {json_file}")
            
            # 簡潔化されたHTML生成
            new_html = self.create_simplified_html(html_file, json_data)
            new_html_file = html_file.with_suffix('.new.html')
            
            with open(new_html_file, 'w', encoding='utf-8') as f:
                f.write(new_html)
            print(f"✅ 新HTML生成: {new_html_file.name}")
            print(f"\n💡 確認後、以下のコマンドで置き換えてください:")
            print(f"   mv {new_html_file} {html_file}")
            
            return True
            
        except Exception as e:
            print(f"❌ エラーが発生しました: {str(e)}")
            import traceback
            traceback.print_exc()
            return False


def interactive_mode():
    """対話型モード"""
    print("\n" + "="*60)
    print("Lifestyle HTMLからJSONへの変換ツール（対話型）")
    print("="*60)
    
    extractor = LifestyleContentExtractor(
        templates_dir="templates",
        json_dir="static/json/lifestyle"
    )
    
    lifestyle_files = [
        'lifestyle_drinking.html',
        'lifestyle_hydration.html',
        'lifestyle_sleep.html',
        'lifestyle_stress.html',
        'lifestyle_recovery.html',
        'lifestyle_smoking.html',
        'lifestyle_mental_health.html'
    ]
    
    while True:
        print("\n" + "-"*60)
        print("変換可能なファイル:")
        print("-"*60)
        for i, filename in enumerate(lifestyle_files, 1):
            print(f"{i}. {filename}")
        print("0. 終了")
        print("-"*60)
        
        try:
            choice = input("\n変換するファイルの番号を選択してください (0-{}): ".format(len(lifestyle_files)))
            choice = int(choice)
            
            if choice == 0:
                print("\n終了します。")
                break
            
            if 1 <= choice <= len(lifestyle_files):
                selected_file = lifestyle_files[choice - 1]
                
                # 確認
                confirm = input(f"\n'{selected_file}' を変換しますか? (y/n): ").lower()
                if confirm == 'y':
                    success = extractor.process_file(selected_file, create_backup=True)
                    
                    if success:
                        print("\n✅ 変換が完了しました！")
                        
                        # 続けるか確認
                        continue_choice = input("\n別のファイルも変換しますか? (y/n): ").lower()
                        if continue_choice != 'y':
                            print("\n終了します。")
                            break
                    else:
                        print("\n❌ 変換に失敗しました。")
                else:
                    print("\nキャンセルしました。")
            else:
                print("\n❌ 無効な番号です。")
                
        except ValueError:
            print("\n❌ 数字を入力してください。")
        except KeyboardInterrupt:
            print("\n\n中断されました。")
            break
    
    print("\n" + "="*60)
    print("ご利用ありがとうございました。")
    print("="*60)


if __name__ == "__main__":
    interactive_mode()