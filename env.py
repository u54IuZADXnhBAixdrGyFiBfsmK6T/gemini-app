import os
import getpass
import re
from pathlib import Path


def read_env_example(filepath='.env.example'):
    """Read .env.example file"""
    if not os.path.exists(filepath):
        raise FileNotFoundError(f"{filepath} が見つかりません")
    
    with open(filepath, 'r', encoding='utf-8') as f:
        return f.read()


def parse_env_content(content):
    """Parse environment file content and identify API key placeholders"""
    lines = content.split('\n')
    parsed_lines = []
    api_keys_to_replace = []
    
    for i, line in enumerate(lines):
        stripped = line.strip()
        # Skip empty lines and comment
        if not stripped or stripped.startswith('#'):
            parsed_lines.append((i, line, None))
            continue
        
        # Match KEY="value" or KEY=value pattern
        match = re.match(r'([A-Z_]+)\s*=\s*["\']?(.+?)["\']?\s*$', line)
        if match:
            key, value = match.groups()
            # Check if it's an API key placeholder
            if 'API_KEY' in key or 'api key' in value.lower() or 'your_' in value.lower():
                parsed_lines.append((i, line, key))
                api_keys_to_replace.append(key)
            else:
                parsed_lines.append((i, line, None))
        else:
            parsed_lines.append((i, line, None))
    
    return parsed_lines, api_keys_to_replace


def get_api_key_input(key_name):
    """Get API key from user with masked input"""
    print(f"\n'{key_name}' の値を入力してください")
    api_key = getpass.getpass(f"{key_name} (入力は表示されません): ")
    
    if not api_key.strip():
        print("空の値が入力されました")
        return None
    
    return api_key


def create_env_file(parsed_lines, api_key_values, output_filepath='.env'):
    """Create .env file with replaced API keys"""
    new_lines = []
    
    for line_num, original_line, key_to_replace in parsed_lines:
        if key_to_replace and key_to_replace in api_key_values:
            # Replace the value
            new_value = api_key_values[key_to_replace]
            new_line = f'{key_to_replace}="{new_value}"'
            new_lines.append(new_line)
        else:
            new_lines.append(original_line)
    
    content = '\n'.join(new_lines)
    
    with open(output_filepath, 'w', encoding='utf-8') as f:
        f.write(content)


def main():
    print("=" * 50)
    print(".env ファイル作成ツール")
    print("=" * 50)
    
    # Check if .env already exists
    if os.path.exists('.env'):
        print("\n.env ファイルが既に存在します")
        response = input("上書きしますか？ (y/N): ").strip().lower()
        if response != 'y':
            print("処理を中止しました")
            return
    
    try:
        # Read .env.example
        print("\n.env.example を読み込んでいます")
        content = read_env_example()
        
        # Parse content
        parsed_lines, api_keys = parse_env_content(content)
        
        if not api_keys:
            print("\nAPIキーのプレースホルダーが見つかりませんでした")
            print("そのまま .env ファイルを作成しますか？ (y/N): ", end='')
            response = input().strip().lower()
            if response != 'y':
                print("処理を中止しました")
                return
            api_key_values = {}
        else:
            print(f"\n{len(api_keys)}個のAPIキーが見つかりました: {', '.join(api_keys)}")
            
            # Get API key values from user
            api_key_values = {}
            for key in api_keys:
                value = get_api_key_input(key)
                if value:
                    api_key_values[key] = value
                else:
                    print(f"{key} はスキップされます（元の値が使用されます）")
        
        # Create .env file
        print("\n💾 .env ファイルを作成しています...")
        create_env_file(parsed_lines, api_key_values)
        
        print("\n.env ファイルが正常に作成されました！")
        print(f"場所: {os.path.abspath('.env')}")
        
    except FileNotFoundError as e:
        print(f"\n❌ エラー: {e}")
    except Exception as e:
        print(f"\n❌ 予期しないエラーが発生しました: {e}")


if __name__ == "__main__":
    main()