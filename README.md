# Google Tag Manager MCP Server

Google Tag Managerを操作するためのMCP（Model Context Protocol）サーバーです。Macローカル環境で動作します。

## 機能

このMCPサーバーは以下のGoogle Tag Manager操作を提供します：

- **アカウント管理**: アカウント一覧の取得、詳細取得、更新
- **ユーザー権限管理**: ユーザー権限の一覧取得、詳細取得、作成、更新、削除（tagmanager.manage.usersスコープ必要、要再認証）
- **コンテナ管理**: コンテナの一覧取得、詳細取得、作成、更新、削除
- **ワークスペース管理**: ワークスペースの一覧取得、詳細取得、ステータス取得、承認レビュー用サマリ取得、作成、更新、削除、同期、クイックプレビュー
- **タグ管理**: タグの一覧取得、詳細取得、作成、更新、削除
- **トリガー管理**: トリガーの一覧取得、詳細取得、作成、更新、削除
- **変数管理**: 変数の一覧取得、詳細取得、作成、更新、削除
- **バージョン管理**: バージョンの一覧取得、詳細取得、作成（公開準備）、公開

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

**注意**: アカウント管理機能（`update_account`）を使用するには、OAuth2認証情報の設定で以下のスコープを追加する必要があります：
- `https://www.googleapis.com/auth/tagmanager.manage.accounts`

このスコープは、MCPサーバーの実装に既に含まれていますが、Google Cloud ConsoleでOAuth2認証情報を作成する際に、これらのスコープが有効になっていることを確認してください。

### 3. 環境変数の設定

`.env`ファイルを作成し、OAuth2認証情報を設定します：

```bash
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/oauth2callback
```

**注意**: `GOOGLE_REDIRECT_URI`は、Google Cloud ConsoleのOAuth2認証情報設定で「承認済みのリダイレクト URI」に追加する必要があります。

### 4. 初回認証・再認証

**おすすめ（手間なし）**: プロジェクトのルートで次を実行し、開いたブラウザでGoogleにログインして権限を承認するだけです。コールバック用の一時サーバーが code を受け取り、トークン保存まで自動で行います。

```bash
node auth.js
# または
npm run auth
```

認証情報は `~/.gtm-mcp-token.json` に保存され、次回以降は自動的に使用されます。

**ユーザー権限管理を使う場合**: ユーザー権限の作成・更新には `tagmanager.manage.users` スコープが必要です。既存のトークンに含まれていない場合は、上記の `node auth.js`（または `npm run auth`）を実行して再認証すれば、新しいスコープ付きのトークンが取得できます。事前に `reset_auth` でトークンを消してから実行してもかまいません。

**手動で行う場合**: MCPの `get_auth_url` でURLを取得 → ブラウザで認証 → リダイレクト先の `code=` の値をコピー → `authenticate` に渡す、または `node test-auth.js "認証コード"` を実行。

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

### MCPサーバーの再起動

MCPサーバーを再起動する方法は以下の通りです：

1. **Cursorを再起動する**（最も確実な方法）
   - Cursorを完全に終了（`Cmd + Q`）してから再起動

2. **MCP設定ファイルを編集して保存する**
   - `~/.cursor/mcp.json` を開き、コメントやスペースを追加・削除して保存
   - Cursorが設定変更を検知してMCPサーバーを再起動することがあります

3. **コマンドパレットから再起動する**（Cursorのバージョンによる）
   - `Cmd + Shift + P`（Mac）または `Ctrl + Shift + P`（Windows/Linux）でコマンドパレットを開く
   - 「MCP」や「reload」などのキーワードで検索し、MCPサーバー再起動コマンドを実行

**注意**: 現在のCursorのバージョンでは、MCP設定ファイルの編集による再起動が最も簡単な方法です。

### 利用可能なツール

#### 認証操作
- `get_auth_url`: OAuth2認証URLを取得
- `authenticate`: 認証コードを使用して認証を完了
- `check_auth_status`: 現在の認証状態を確認
- `reset_auth`: 保存された認証情報をリセット

#### アカウント操作
- `list_accounts`: アカウント一覧を取得
- `get_account`: アカウントの詳細を取得
- `update_account`: アカウント情報を更新（名前など）

#### ユーザー権限操作（アカウント管理）
- `list_user_permissions`: アカウントのユーザー権限一覧を取得
- `get_user_permission`: 指定ユーザー権限の詳細を取得
- `create_user_permission`: アカウント・コンテナへのユーザーアクセスを作成（メール、アカウント権限: noAccess/user/admin、コンテナ権限: noAccess/read/edit/approve/publish）
- `update_user_permission`: ユーザー権限を更新
- `delete_user_permission`: ユーザー権限を削除（アクセス取り消し）

※ ユーザー権限の作成・更新には `tagmanager.manage.users` スコープが必要です。既存トークンでは再認証してください。

#### コンテナ操作
- `list_containers`: コンテナ一覧を取得
- `get_container`: コンテナの詳細を取得
- `create_container`: 新しいコンテナを作成
- `update_container`: コンテナ情報を更新
- `delete_container`: コンテナを削除

#### ワークスペース操作
- `list_workspaces`: ワークスペース一覧を取得
- `get_workspace`: ワークスペースの詳細を取得
- `get_workspace_status`: ワークスペースのステータスを取得（ベースバージョンからの変更・マージコンフリクト）。承認レビュー前の確認に利用
- `get_workspace_review_info`: 承認レビュー用に変更サマリと参考情報をまとめて取得（変更対象の集計・コンフリクト有無・レビュー用メモ）
- `create_workspace`: 新しいワークスペースを作成
- `update_workspace`: ワークスペース情報を更新
- `delete_workspace`: ワークスペースを削除
- `sync_workspace`: ワークスペースを同期
- `quick_preview`: ワークスペースのクイックプレビューを取得

#### タグ操作
- `list_tags`: タグ一覧を取得
- `get_tag`: タグの詳細を取得
- `create_tag`: 新しいタグを作成
- `update_tag`: 既存のタグを更新（すべてのパラメータを更新可能）
- `delete_tag`: タグを削除
  - サポートする主要なタグタイプ:
    - `googtag`: GA4設定タグ
    - `gaawe`: GA4イベントタグ
    - `awct`: Google広告コンバージョントラッキング
    - `html`: カスタムHTMLタグ
    - `img`: カスタム画像タグ（ピクセルトラッキング）
    - `fbq`: Facebookピクセル
    - `ua`: Universal Analytics（旧GA）

#### トリガー操作
- `list_triggers`: トリガー一覧を取得
- `get_trigger`: トリガーの詳細を取得
- `create_trigger`: 新しいトリガーを作成
- `update_trigger`: 既存のトリガーを更新（filter、autoEventFilter、waitForTagsなどのすべての設定を更新可能）
- `delete_trigger`: トリガーを削除
  - サポートするトリガータイプ:
    - `pageview`: ページビュートリガー
    - `customEvent`: カスタムイベントトリガー（`customEventFilter`を使用）
    - `linkClick`: リンククリックトリガー（`filter`、`autoEventFilter`、`waitForTags`などを使用）
    - `click`: クリックトリガー（`filter`を使用）
    - `formSubmission`: フォーム送信トリガー（`formId`、`formClasses`を使用）
    - `scrollDepth`: スクロール深度トリガー（`verticalThreshold`、`horizontalThreshold`を使用）
    - `visible` / `elementVisibility`: 要素の表示トリガー（`selector`、`visiblePercentageThreshold`を使用）
    - `youtubeVideo`: YouTube動画トリガー（`videoId`、各種`enableTriggerOnVideo*`を使用）
    - `timer`: タイマートリガー（`interval`、`limit`、`startTimerOn`を使用）

#### 変数操作
- `list_variables`: 変数一覧を取得
- `get_variable`: 変数の詳細を取得
- `create_variable`: 新しい変数を作成
- `update_variable`: 既存の変数を更新
- `delete_variable`: 変数を削除
  - サポートする変数タイプ:
    - `c`: 定数変数
    - `v`: データレイヤー変数
    - `j`: JavaScript変数
    - `d`: DOM要素変数
    - `k`: 1st Party Cookie変数
    - `u`: URL変数
    - `ae`: 自動イベント変数
    - `b`: 組み込み変数

#### バージョン操作
- `create_version`: ワークスペースの変更をバージョンとして作成（公開準備）
- `list_versions`: コンテナのバージョン一覧を取得
- `get_version`: バージョンの詳細を取得
- `publish_version`: バージョンを公開

#### 承認レビュー用の情報取得（ワークスペースの変更状況）
承認依頼を受けた際に、承認者が「現在のワークスペースのアップデートに問題がないか」を判断するための情報を取得できます。GTM API には承認キューを取得する専用 API はありませんが、以下のツールでレビューに必要な参考情報をまとめて取得できます。

- **`get_workspace_status`**: GTM API の `workspaces.getStatus` を呼び出し、ベースバージョンからの**変更エンティティ一覧**（`workspaceChange`）と**マージコンフリクト**（`mergeConflict`）をそのまま返します。
- **`get_workspace_review_info`**: 上記に加え、ワークスペース名・説明、変更対象の**集計**（タグ／トリガー／変数／フォルダ等の件数）、コンフリクトの有無、**レビュー用メモ**（`reviewNotes`）を構造化して返します。承認判断のサマリとしてそのまま利用しやすくなっています。

使用例（承認レビュー前の確認）:
1. `list_workspaces` で対象コンテナのワークスペース一覧を取得
2. 承認依頼の対象ワークスペース ID を指定して `get_workspace_review_info` を実行
3. 返却された `changeSummary` と `reviewNotes` を確認し、必要に応じて `get_workspace_status` で生の変更一覧を確認
4. マージコンフリクトがある場合は公開前に解消が必要であることが `reviewNotes` に含まれる

### 使用例

#### 主要なタグタイプの作成

##### GA4設定タグ
```json
{
  "name": "GA4設定",
  "type": "googtag",
  "parameter": [
    {
      "type": "template",
      "key": "tagId",
      "value": "G-XXXXXXXXXX"
    }
  ],
  "firingTriggerId": ["2147479573"]
}
```

##### GA4イベントタグ
```json
{
  "name": "GA4 イベント",
  "type": "gaawe",
  "parameter": [
    {
      "type": "template",
      "key": "eventName",
      "value": "custom_event"
    },
    {
      "type": "boolean",
      "key": "sendEcommerceData",
      "value": "false"
    },
    {
      "type": "template",
      "key": "measurementIdOverride",
      "value": "G-XXXXXXXXXX"
    }
  ],
  "firingTriggerId": ["トリガーID"]
}
```

##### Google広告コンバージョントラッキング
```json
{
  "name": "Google広告コンバージョン",
  "type": "awct",
  "parameter": [
    {
      "type": "template",
      "key": "conversionId",
      "value": "1006772047"
    },
    {
      "type": "template",
      "key": "conversionLabel",
      "value": "0L_dCLyI84sBEM--iOAD"
    },
    {
      "type": "boolean",
      "key": "enableConversionLinker",
      "value": "true"
    }
  ],
  "firingTriggerId": ["トリガーID"]
}
```

#### 主要なトリガータイプの作成

##### linkClickトリガーの作成

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

##### linkClickトリガーの更新（filterとautoEventFilterを設定）

既存のトリガーにfilterとautoEventFilterを追加・更新する例：

```json
{
  "triggerId": "27",
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
  "waitForTagsTimeout": 2000
}
```

##### formSubmissionトリガーの作成
```json
{
  "name": "フォーム送信",
  "type": "formSubmission",
  "formId": "contact-form",
  "formClasses": "form-class"
}
```

##### scrollDepthトリガーの作成
```json
{
  "name": "スクロール深度 50%",
  "type": "scrollDepth",
  "verticalThreshold": 50,
  "horizontalThreshold": 75
}
```

##### elementVisibilityトリガーの作成
```json
{
  "name": "要素の表示",
  "type": "visible",
  "selector": "#important-element",
  "visiblePercentageThreshold": 50,
  "continuousTimeMinMilliseconds": 1000
}
```

##### youtubeVideoトリガーの作成
```json
{
  "name": "YouTube動画",
  "type": "youtubeVideo",
  "videoId": "dQw4w9WgXcQ",
  "enableTriggerOnVideoStart": true,
  "enableTriggerOnVideoComplete": true
}
```

#### 主要な変数タイプの作成

##### データレイヤー変数
```json
{
  "name": "データレイヤー変数",
  "type": "v",
  "parameter": [
    {
      "type": "template",
      "key": "dataLayerVersion",
      "value": "2"
    },
    {
      "type": "template",
      "key": "dataLayerVariable",
      "value": "event"
    }
  ]
}
```

##### JavaScript変数
```json
{
  "name": "JavaScript変数",
  "type": "j",
  "parameter": [
    {
      "type": "template",
      "key": "javascript",
      "value": "function() {\n  return document.title;\n}"
    }
  ]
}
```

##### DOM要素変数
```json
{
  "name": "DOM要素変数",
  "type": "d",
  "parameter": [
    {
      "type": "template",
      "key": "selector",
      "value": "#element-id"
    },
    {
      "type": "template",
      "key": "attributeName",
      "value": "data-value"
    }
  ]
}
```

##### Cookie変数
```json
{
  "name": "Cookie変数",
  "type": "k",
  "parameter": [
    {
      "type": "template",
      "key": "cookieName",
      "value": "session_id"
    }
  ]
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

### テストの実行

すべてのテストを実行（リグレッションテスト）:

```bash
npm test
```

個別のテストを実行:

```bash
npm run test:auth              # 認証テスト
npm run test:accounts           # アカウント一覧取得テスト
npm run test:gtm                # 基本GTMテスト
npm run test:details            # 詳細情報取得テスト
npm run test:trigger            # linkClickトリガー作成テスト
npm run test:filter             # filter/autoEventFilterテスト
npm run test:detailed-filters   # 詳細フィルタ設定テスト
```

テストファイルを直接実行することも可能です:

```bash
node run-all-tests.js           # すべてのテストを実行
node test-auth.js               # 認証テスト
node test-accounts.js            # アカウント一覧取得テスト
# ... など
```

### コンテナ確認ユーティリティ

公開ID（`GTM-XXXXXX`）からアカウントID・コンテナIDを調べる CLI です。権限付与や MCP 操作の前に対象コンテナを特定する際に利用できます。

```bash
node check-container.js GTM-M6KP89G
# または
npm run check-container -- GTM-M6KP89G
```

出力内容: アカウント情報、コンテナ概要・詳細、ワークスペース一覧、先頭ワークスペースのレビュー情報（`get_workspace_review_info` 相当）。

## 注意事項

- このサーバーは標準入出力（stdio）経由で通信します
- Google Tag Manager APIのレート制限に注意してください
- OAuth2認証情報（クライアントID、クライアントシークレット）は安全に管理してください
- 認証トークンは `~/.gtm-mcp-token.json` に保存されます（`.gitignore`に含まれています）
- リフレッシュトークンは自動的に使用され、アクセストークンが期限切れになる前に更新されます

## ライセンス

MIT

