# Google Tag Manager MCP Server

Google Tag Managerを操作するためのMCP（Model Context Protocol）サーバーです。Macローカル環境で動作します。

## 機能

このMCPサーバーは以下のGoogle Tag Manager操作を提供します：

- **アカウント管理**: アカウント一覧の取得
- **コンテナ管理**: コンテナの一覧取得、詳細取得、作成
- **ワークスペース管理**: ワークスペースの一覧取得、詳細取得
- **タグ管理**: タグの一覧取得、作成、更新、削除
- **トリガー管理**: トリガーの一覧取得、作成
- **変数管理**: 変数の一覧取得、作成
- **バージョン管理**: バージョンの作成（公開準備）

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. Google Cloud OAuth2認証情報の設定

Google Tag Manager APIを使用するには、OAuth2認証情報が必要です。

1. [Google Cloud Console](https://console.cloud.google.com/)でプロジェクトを作成
2. **APIとサービス > 認証情報** に移動
3. **認証情報を作成 > OAuth クライアント ID** を選択
4. アプリケーションの種類で **デスクトップアプリ** を選択
5. 名前を入力して作成
6. **クライアントID** と **クライアントシークレット** をコピー
7. **APIとサービス > ライブラリ** で **Tag Manager API** を有効化

### 3. 環境変数の設定

`.env`ファイルを作成し、OAuth2認証情報を設定します：

```bash
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/oauth2callback
```

**注意**: `GOOGLE_REDIRECT_URI`は、Google Cloud ConsoleのOAuth2認証情報設定で「承認済みのリダイレクト URI」に追加する必要があります。

### 4. 初回認証

MCPサーバーを起動後、以下の手順で認証を行います：

1. `get_auth_url`ツールを使用して認証URLを取得
2. ブラウザで認証URLにアクセス
3. Googleアカウントでログインし、権限を承認
4. リダイレクト先のURLから認証コードを取得（`code=`の後の値）
5. `authenticate`ツールに認証コードを渡して認証を完了

認証情報は `~/.gtm-mcp-token.json` に保存され、次回以降は自動的に使用されます。

## 使用方法

### MCPクライアントとして設定

CursorなどのMCPクライアントで、このサーバーを設定します。

設定例（`~/.cursor/mcp.json` または適切な設定ファイル）：

```json
{
  "mcpServers": {
    "gtm": {
      "command": "node",
      "args": ["/Users/01035280/Documents/タグマネTテスト/GTM_MCP/src/index.js"],
      "env": {
        "GOOGLE_CLIENT_ID": "your-client-id.apps.googleusercontent.com",
        "GOOGLE_CLIENT_SECRET": "your-client-secret",
        "GOOGLE_REDIRECT_URI": "http://localhost:3000/oauth2callback"
      }
    }
  }
}
```

または、`.env`ファイルを使用する場合は、環境変数の設定を省略できます。

### 利用可能なツール

#### 認証操作
- `get_auth_url`: OAuth2認証URLを取得
- `authenticate`: 認証コードを使用して認証を完了
- `check_auth_status`: 現在の認証状態を確認
- `reset_auth`: 保存された認証情報をリセット

#### アカウント操作
- `list_accounts`: アカウント一覧を取得

#### コンテナ操作
- `list_containers`: コンテナ一覧を取得
- `get_container`: コンテナの詳細を取得
- `create_container`: 新しいコンテナを作成

#### ワークスペース操作
- `list_workspaces`: ワークスペース一覧を取得
- `get_workspace`: ワークスペースの詳細を取得

#### タグ操作
- `list_tags`: タグ一覧を取得
- `create_tag`: 新しいタグを作成
- `update_tag`: 既存のタグを更新
- `delete_tag`: タグを削除

#### トリガー操作
- `list_triggers`: トリガー一覧を取得
- `create_trigger`: 新しいトリガーを作成
  - サポートするトリガータイプ:
    - `PAGEVIEW`: ページビュートリガー
    - `CUSTOM_EVENT`: カスタムイベントトリガー（`customEventFilter`を使用）
    - `linkClick`: リンククリックトリガー（`filter`、`autoEventFilter`、`waitForTags`などを使用）
    - `click`: クリックトリガー（`filter`を使用）

#### 変数操作
- `list_variables`: 変数一覧を取得
- `create_variable`: 新しい変数を作成

#### バージョン操作
- `create_version`: ワークスペースの変更をバージョンとして作成

### 使用例

#### linkClickトリガーの作成

```json
{
  "name": "リンククリック - test_click9",
  "type": "linkClick",
  "filter": [
    {
      "type": "contains",
      "parameter": [
        {
          "type": "template",
          "key": "arg0",
          "value": "{{Click URL}}"
        },
        {
          "type": "template",
          "key": "arg1",
          "value": "test_click9"
        }
      ]
    }
  ],
  "autoEventFilter": [
    {
      "type": "contains",
      "parameter": [
        {
          "type": "template",
          "key": "arg0",
          "value": "{{Page URL}}"
        },
        {
          "type": "template",
          "key": "arg1",
          "value": "20251202cvtest/test1.html"
        }
      ]
    }
  ],
  "waitForTags": true,
  "checkValidation": false,
  "waitForTagsTimeout": 2000
}
```

## 開発

### 開発モードで実行

```bash
npm run dev
```

### 通常モードで実行

```bash
npm start
```

## 注意事項

- このサーバーは標準入出力（stdio）経由で通信します
- Google Tag Manager APIのレート制限に注意してください
- OAuth2認証情報（クライアントID、クライアントシークレット）は安全に管理してください
- 認証トークンは `~/.gtm-mcp-token.json` に保存されます（`.gitignore`に含まれています）
- リフレッシュトークンは自動的に使用され、アクセストークンが期限切れになる前に更新されます

## ライセンス

MIT

