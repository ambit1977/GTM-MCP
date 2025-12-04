#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { GTMClient } from './gtm-client.js';

/**
 * Google Tag Manager MCP サーバー
 */
class GTMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'gtm-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.gtmClient = new GTMClient();
    this.setupHandlers();
  }

  setupHandlers() {
    // ツール一覧を取得
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'get_auth_url',
          description: 'OAuth2認証URLを取得します。このURLにアクセスして認証を完了してください。',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'authenticate',
          description: '認証コードを使用して認証を完了します。get_auth_urlで取得したURLにアクセスし、リダイレクト先のURLから認証コードを取得して使用してください。',
          inputSchema: {
            type: 'object',
            properties: {
              code: {
                type: 'string',
                description: 'OAuth2認証コード（リダイレクト先のURLの「code=」の後の値）',
              },
            },
            required: ['code'],
          },
        },
        {
          name: 'check_auth_status',
          description: '現在の認証状態を確認します',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'reset_auth',
          description: '保存された認証情報をリセットします',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'list_accounts',
          description: 'Google Tag Managerのアカウント一覧を取得します',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'list_containers',
          description: '指定されたアカウントのコンテナ一覧を取得します',
          inputSchema: {
            type: 'object',
            properties: {
              accountId: {
                type: 'string',
                description: 'アカウントID',
              },
            },
            required: ['accountId'],
          },
        },
        {
          name: 'get_container',
          description: '指定されたコンテナの詳細を取得します',
          inputSchema: {
            type: 'object',
            properties: {
              accountId: {
                type: 'string',
                description: 'アカウントID',
              },
              containerId: {
                type: 'string',
                description: 'コンテナID',
              },
            },
            required: ['accountId', 'containerId'],
          },
        },
        {
          name: 'create_container',
          description: '新しいコンテナを作成します',
          inputSchema: {
            type: 'object',
            properties: {
              accountId: {
                type: 'string',
                description: 'アカウントID',
              },
              name: {
                type: 'string',
                description: 'コンテナ名',
              },
              usageContext: {
                type: 'array',
                items: {
                  type: 'string',
                  enum: ['web', 'android', 'ios', 'amp'],
                },
                description: '使用コンテキスト（例: ["web"]）',
              },
            },
            required: ['accountId', 'name', 'usageContext'],
          },
        },
        {
          name: 'list_workspaces',
          description: '指定されたコンテナのワークスペース一覧を取得します',
          inputSchema: {
            type: 'object',
            properties: {
              accountId: {
                type: 'string',
                description: 'アカウントID',
              },
              containerId: {
                type: 'string',
                description: 'コンテナID',
              },
            },
            required: ['accountId', 'containerId'],
          },
        },
        {
          name: 'get_workspace',
          description: '指定されたワークスペースの詳細を取得します',
          inputSchema: {
            type: 'object',
            properties: {
              accountId: {
                type: 'string',
                description: 'アカウントID',
              },
              containerId: {
                type: 'string',
                description: 'コンテナID',
              },
              workspaceId: {
                type: 'string',
                description: 'ワークスペースID',
              },
            },
            required: ['accountId', 'containerId', 'workspaceId'],
          },
        },
        {
          name: 'list_tags',
          description: '指定されたワークスペースのタグ一覧を取得します',
          inputSchema: {
            type: 'object',
            properties: {
              accountId: {
                type: 'string',
                description: 'アカウントID',
              },
              containerId: {
                type: 'string',
                description: 'コンテナID',
              },
              workspaceId: {
                type: 'string',
                description: 'ワークスペースID',
              },
            },
            required: ['accountId', 'containerId', 'workspaceId'],
          },
        },
        {
          name: 'create_tag',
          description: '新しいタグを作成します',
          inputSchema: {
            type: 'object',
            properties: {
              accountId: {
                type: 'string',
                description: 'アカウントID',
              },
              containerId: {
                type: 'string',
                description: 'コンテナID',
              },
              workspaceId: {
                type: 'string',
                description: 'ワークスペースID',
              },
              name: {
                type: 'string',
                description: 'タグ名',
              },
              type: {
                type: 'string',
                description: 'タグタイプ（例: "googtag"=GA4設定, "gaawe"=GA4イベント, "awct"=Google広告コンバージョン, "html"=カスタムHTML, "img"=カスタム画像, "fbq"=Facebookピクセル, "ua"=Universal Analyticsなど）',
              },
              parameter: {
                type: 'array',
                description: 'タグのパラメータ配列',
                items: {
                  type: 'object',
                  properties: {
                    type: {
                      type: 'string',
                      description: 'パラメータタイプ',
                    },
                    key: {
                      type: 'string',
                      description: 'パラメータキー',
                    },
                    value: {
                      type: 'string',
                      description: 'パラメータ値',
                    },
                  },
                },
              },
              firingTriggerId: {
                type: 'array',
                items: {
                  type: 'string',
                },
                description: '発火トリガーIDの配列',
              },
            },
            required: ['accountId', 'containerId', 'workspaceId', 'name', 'type'],
          },
        },
        {
          name: 'update_tag',
          description: '既存のタグを更新します',
          inputSchema: {
            type: 'object',
            properties: {
              accountId: {
                type: 'string',
                description: 'アカウントID',
              },
              containerId: {
                type: 'string',
                description: 'コンテナID',
              },
              workspaceId: {
                type: 'string',
                description: 'ワークスペースID',
              },
              tagId: {
                type: 'string',
                description: 'タグID',
              },
              name: {
                type: 'string',
                description: 'タグ名',
              },
              type: {
                type: 'string',
                description: 'タグタイプ',
              },
              parameter: {
                type: 'array',
                description: 'タグのパラメータ配列',
              },
              firingTriggerId: {
                type: 'array',
                items: {
                  type: 'string',
                },
                description: '発火トリガーIDの配列',
              },
            },
            required: ['accountId', 'containerId', 'workspaceId', 'tagId'],
          },
        },
        {
          name: 'delete_tag',
          description: 'タグを削除します',
          inputSchema: {
            type: 'object',
            properties: {
              accountId: {
                type: 'string',
                description: 'アカウントID',
              },
              containerId: {
                type: 'string',
                description: 'コンテナID',
              },
              workspaceId: {
                type: 'string',
                description: 'ワークスペースID',
              },
              tagId: {
                type: 'string',
                description: 'タグID',
              },
            },
            required: ['accountId', 'containerId', 'workspaceId', 'tagId'],
          },
        },
        {
          name: 'list_triggers',
          description: '指定されたワークスペースのトリガー一覧を取得します',
          inputSchema: {
            type: 'object',
            properties: {
              accountId: {
                type: 'string',
                description: 'アカウントID',
              },
              containerId: {
                type: 'string',
                description: 'コンテナID',
              },
              workspaceId: {
                type: 'string',
                description: 'ワークスペースID',
              },
            },
            required: ['accountId', 'containerId', 'workspaceId'],
          },
        },
        {
          name: 'create_trigger',
          description: '新しいトリガーを作成します',
          inputSchema: {
            type: 'object',
            properties: {
              accountId: {
                type: 'string',
                description: 'アカウントID',
              },
              containerId: {
                type: 'string',
                description: 'コンテナID',
              },
              workspaceId: {
                type: 'string',
                description: 'ワークスペースID',
              },
              name: {
                type: 'string',
                description: 'トリガー名',
              },
              type: {
                type: 'string',
                description: 'トリガータイプ（例: "PAGEVIEW", "CLICK", "CUSTOM_EVENT", "linkClick"など）',
              },
              customEventFilter: {
                type: 'array',
                description: 'カスタムイベントフィルタ（CUSTOM_EVENTタイプ用）',
              },
              filter: {
                type: 'array',
                description: 'フィルタ（linkClick、clickなどのタイプ用）',
              },
              autoEventFilter: {
                type: 'array',
                description: '自動イベントフィルタ（linkClickタイプ用）',
              },
              waitForTags: {
                type: 'boolean',
                description: 'タグの待機を有効化（linkClickタイプ用）',
              },
              checkValidation: {
                type: 'boolean',
                description: 'バリデーションチェック（linkClickタイプ用）',
              },
              waitForTagsTimeout: {
                type: 'number',
                description: 'タグ待機タイムアウト（ミリ秒、linkClickタイプ用）',
              },
              // formSubmission用
              formId: {
                type: 'string',
                description: 'フォームID（formSubmissionタイプ用）',
              },
              formClasses: {
                type: 'string',
                description: 'フォームクラス（formSubmissionタイプ用）',
              },
              // scrollDepth用
              verticalThreshold: {
                type: 'number',
                description: '垂直スクロール閾値（パーセント、scrollDepthタイプ用）',
              },
              horizontalThreshold: {
                type: 'number',
                description: '水平スクロール閾値（パーセント、scrollDepthタイプ用）',
              },
              // elementVisibility用
              selector: {
                type: 'string',
                description: 'CSSセレクタ（elementVisibilityタイプ用）',
              },
              visiblePercentageThreshold: {
                type: 'number',
                description: '表示割合閾値（パーセント、elementVisibilityタイプ用）',
              },
              continuousTimeMinMilliseconds: {
                type: 'number',
                description: '連続表示時間（ミリ秒、elementVisibilityタイプ用）',
              },
              // youtubeVideo用
              videoId: {
                type: 'string',
                description: 'YouTube動画ID（youtubeVideoタイプ用）',
              },
              enableTriggerOnVideoStart: {
                type: 'boolean',
                description: '動画開始時に発火（youtubeVideoタイプ用）',
              },
              enableTriggerOnVideoProgress: {
                type: 'boolean',
                description: '動画再生中に発火（youtubeVideoタイプ用）',
              },
              enableTriggerOnVideoComplete: {
                type: 'boolean',
                description: '動画完了時に発火（youtubeVideoタイプ用）',
              },
              enableTriggerOnVideoPause: {
                type: 'boolean',
                description: '動画一時停止時に発火（youtubeVideoタイプ用）',
              },
              enableTriggerOnVideoSeek: {
                type: 'boolean',
                description: '動画シーク時に発火（youtubeVideoタイプ用）',
              },
              // timer用
              interval: {
                type: 'number',
                description: 'インターバル（ミリ秒、timerタイプ用）',
              },
              limit: {
                type: 'number',
                description: '発火回数の上限（timerタイプ用）',
              },
              startTimerOn: {
                type: 'string',
                description: 'タイマー開始タイミング（timerタイプ用、例: "windowLoad", "domReady"）',
              },
            },
            required: ['accountId', 'containerId', 'workspaceId', 'name', 'type'],
          },
        },
        {
          name: 'list_variables',
          description: '指定されたワークスペースの変数一覧を取得します',
          inputSchema: {
            type: 'object',
            properties: {
              accountId: {
                type: 'string',
                description: 'アカウントID',
              },
              containerId: {
                type: 'string',
                description: 'コンテナID',
              },
              workspaceId: {
                type: 'string',
                description: 'ワークスペースID',
              },
            },
            required: ['accountId', 'containerId', 'workspaceId'],
          },
        },
        {
          name: 'create_variable',
          description: '新しい変数を作成します',
          inputSchema: {
            type: 'object',
            properties: {
              accountId: {
                type: 'string',
                description: 'アカウントID',
              },
              containerId: {
                type: 'string',
                description: 'コンテナID',
              },
              workspaceId: {
                type: 'string',
                description: 'ワークスペースID',
              },
              name: {
                type: 'string',
                description: '変数名',
              },
              type: {
                type: 'string',
                description: '変数タイプ（例: "c"=定数, "v"=データレイヤー, "j"=JavaScript, "d"=DOM要素, "k"=Cookie, "u"=URL, "ae"=自動イベント, "b"=組み込み変数など）',
              },
              parameter: {
                type: 'array',
                description: '変数のパラメータ配列。タイプに応じて必要なパラメータを設定してください。',
              },
            },
            required: ['accountId', 'containerId', 'workspaceId', 'name', 'type'],
          },
        },
        {
          name: 'create_version',
          description: 'ワークスペースの変更をバージョンとして作成（公開準備）します',
          inputSchema: {
            type: 'object',
            properties: {
              accountId: {
                type: 'string',
                description: 'アカウントID',
              },
              containerId: {
                type: 'string',
                description: 'コンテナID',
              },
              workspaceId: {
                type: 'string',
                description: 'ワークスペースID',
              },
              name: {
                type: 'string',
                description: 'バージョン名（オプション）',
              },
              notes: {
                type: 'string',
                description: 'バージョンノート（オプション）',
              },
            },
            required: ['accountId', 'containerId', 'workspaceId'],
          },
        },
      ],
    }));

    // ツール呼び出しを処理
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'get_auth_url': {
            const oauth2Auth = this.gtmClient.getOAuth2Auth();
            const authUrl = oauth2Auth.getAuthUrl();
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({
                    authUrl: authUrl,
                    instructions: 'このURLにアクセスして認証を完了してください。認証後、リダイレクト先のURLから「code=」の後の認証コードをコピーし、authenticateツールで使用してください。'
                  }, null, 2),
                },
              ],
            };
          }

          case 'authenticate': {
            const oauth2Auth = this.gtmClient.getOAuth2Auth();
            const result = await oauth2Auth.authenticateWithCode(args.code);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2),
                },
              ],
            };
          }

          case 'check_auth_status': {
            const oauth2Auth = this.gtmClient.getOAuth2Auth();
            const isAuthenticated = oauth2Auth.isAuthenticated();
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({
                    authenticated: isAuthenticated,
                    message: isAuthenticated ? '認証済みです' : '未認証です。get_auth_urlツールで認証URLを取得してください。'
                  }, null, 2),
                },
              ],
            };
          }

          case 'reset_auth': {
            const oauth2Auth = this.gtmClient.getOAuth2Auth();
            const result = await oauth2Auth.resetAuth();
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2),
                },
              ],
            };
          }

          case 'list_accounts':
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(await this.gtmClient.listAccounts(), null, 2),
                },
              ],
            };

          case 'list_containers':
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(
                    await this.gtmClient.listContainers(args.accountId),
                    null,
                    2
                  ),
                },
              ],
            };

          case 'get_container':
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(
                    await this.gtmClient.getContainer(args.accountId, args.containerId),
                    null,
                    2
                  ),
                },
              ],
            };

          case 'create_container':
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(
                    await this.gtmClient.createContainer(args.accountId, {
                      name: args.name,
                      usageContext: args.usageContext,
                    }),
                    null,
                    2
                  ),
                },
              ],
            };

          case 'list_workspaces':
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(
                    await this.gtmClient.listWorkspaces(args.accountId, args.containerId),
                    null,
                    2
                  ),
                },
              ],
            };

          case 'get_workspace':
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(
                    await this.gtmClient.getWorkspace(
                      args.accountId,
                      args.containerId,
                      args.workspaceId
                    ),
                    null,
                    2
                  ),
                },
              ],
            };

          case 'list_tags':
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(
                    await this.gtmClient.listTags(
                      args.accountId,
                      args.containerId,
                      args.workspaceId
                    ),
                    null,
                    2
                  ),
                },
              ],
            };

          case 'create_tag':
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(
                    await this.gtmClient.createTag(
                      args.accountId,
                      args.containerId,
                      args.workspaceId,
                      {
                        name: args.name,
                        type: args.type,
                        parameter: args.parameter || [],
                        firingTriggerId: args.firingTriggerId || [],
                      }
                    ),
                    null,
                    2
                  ),
                },
              ],
            };

          case 'update_tag':
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(
                    await this.gtmClient.updateTag(
                      args.accountId,
                      args.containerId,
                      args.workspaceId,
                      args.tagId,
                      {
                        name: args.name,
                        type: args.type,
                        parameter: args.parameter,
                        firingTriggerId: args.firingTriggerId,
                      }
                    ),
                    null,
                    2
                  ),
                },
              ],
            };

          case 'delete_tag':
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(
                    await this.gtmClient.deleteTag(
                      args.accountId,
                      args.containerId,
                      args.workspaceId,
                      args.tagId
                    ),
                    null,
                    2
                  ),
                },
              ],
            };

          case 'list_triggers':
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(
                    await this.gtmClient.listTriggers(
                      args.accountId,
                      args.containerId,
                      args.workspaceId
                    ),
                    null,
                    2
                  ),
                },
              ],
            };

          case 'create_trigger': {
            const triggerData = {
              name: args.name,
              type: args.type,
            };

            // カスタムイベントフィルタ（CUSTOM_EVENTタイプ用）
            if (args.customEventFilter) {
              triggerData.customEventFilter = args.customEventFilter;
            }

            // フィルタ（linkClick、clickなどのタイプ用）
            if (args.filter) {
              triggerData.filter = args.filter;
            }

            // 自動イベントフィルタ（linkClickタイプ用）
            if (args.autoEventFilter) {
              triggerData.autoEventFilter = args.autoEventFilter;
            }

            // タグ待機設定（linkClickタイプ用）
            if (args.waitForTags !== undefined) {
              triggerData.waitForTags = {
                type: 'boolean',
                value: args.waitForTags
              };
            }

            // バリデーションチェック（linkClickタイプ用）
            if (args.checkValidation !== undefined) {
              triggerData.checkValidation = {
                type: 'boolean',
                value: args.checkValidation
              };
            }

            // タグ待機タイムアウト（linkClickタイプ用）
            if (args.waitForTagsTimeout !== undefined) {
              triggerData.waitForTagsTimeout = {
                type: 'template',
                value: String(args.waitForTagsTimeout)
              };
            }

            // formSubmission用
            if (args.type === 'formSubmission') {
              triggerData.filter = [];
              if (args.formId) {
                triggerData.filter.push({
                  type: 'contains',
                  parameter: [
                    {
                      type: 'template',
                      key: 'arg0',
                      value: '{{Form ID}}'
                    },
                    {
                      type: 'template',
                      key: 'arg1',
                      value: args.formId
                    }
                  ]
                });
              }
              if (args.formClasses) {
                triggerData.filter.push({
                  type: 'contains',
                  parameter: [
                    {
                      type: 'template',
                      key: 'arg0',
                      value: '{{Form Classes}}'
                    },
                    {
                      type: 'template',
                      key: 'arg1',
                      value: args.formClasses
                    }
                  ]
                });
              }
            }

            // scrollDepth用
            if (args.type === 'scrollDepth') {
              triggerData.parameter = [
                {
                  type: 'template',
                  key: 'verticalThresholdUnits',
                  value: 'PERCENT'
                },
                {
                  type: 'template',
                  key: 'verticalThreshold',
                  value: String(args.verticalThreshold || 25)
                }
              ];
              if (args.horizontalThreshold !== undefined) {
                triggerData.parameter.push(
                  {
                    type: 'template',
                    key: 'horizontalThresholdUnits',
                    value: 'PERCENT'
                  },
                  {
                    type: 'template',
                    key: 'horizontalThreshold',
                    value: String(args.horizontalThreshold)
                  }
                );
              }
            }

            // elementVisibility用
            if (args.type === 'visible' || args.type === 'elementVisibility') {
              triggerData.type = 'visible';
              triggerData.parameter = [
                {
                  type: 'template',
                  key: 'selector',
                  value: args.selector || ''
                },
                {
                  type: 'template',
                  key: 'visiblePercentageThreshold',
                  value: String(args.visiblePercentageThreshold || 50)
                },
                {
                  type: 'template',
                  key: 'continuousTimeMinMilliseconds',
                  value: String(args.continuousTimeMinMilliseconds || 0)
                }
              ];
            }

            // youtubeVideo用
            if (args.type === 'youtubeVideo') {
              triggerData.parameter = [
                {
                  type: 'template',
                  key: 'enableTriggerOnVideoStart',
                  value: String(args.enableTriggerOnVideoStart || false)
                },
                {
                  type: 'template',
                  key: 'enableTriggerOnVideoProgress',
                  value: String(args.enableTriggerOnVideoProgress || false)
                },
                {
                  type: 'template',
                  key: 'enableTriggerOnVideoComplete',
                  value: String(args.enableTriggerOnVideoComplete || false)
                },
                {
                  type: 'template',
                  key: 'enableTriggerOnVideoPause',
                  value: String(args.enableTriggerOnVideoPause || false)
                },
                {
                  type: 'template',
                  key: 'enableTriggerOnVideoSeek',
                  value: String(args.enableTriggerOnVideoSeek || false)
                }
              ];
              if (args.videoId) {
                triggerData.filter = [
                  {
                    type: 'equals',
                    parameter: [
                      {
                        type: 'template',
                        key: 'arg0',
                        value: '{{Video ID}}'
                      },
                      {
                        type: 'template',
                        key: 'arg1',
                        value: args.videoId
                      }
                    ]
                  }
                ];
              }
            }

            // timer用
            if (args.type === 'timer') {
              triggerData.parameter = [
                {
                  type: 'template',
                  key: 'interval',
                  value: String(args.interval || 1000)
                },
                {
                  type: 'template',
                  key: 'limit',
                  value: String(args.limit || 1)
                },
                {
                  type: 'template',
                  key: 'startTimerOn',
                  value: args.startTimerOn || 'windowLoad'
                }
              ];
            }

            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(
                    await this.gtmClient.createTrigger(
                      args.accountId,
                      args.containerId,
                      args.workspaceId,
                      triggerData
                    ),
                    null,
                    2
                  ),
                },
              ],
            };
          }

          case 'list_variables':
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(
                    await this.gtmClient.listVariables(
                      args.accountId,
                      args.containerId,
                      args.workspaceId
                    ),
                    null,
                    2
                  ),
                },
              ],
            };

          case 'create_variable':
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(
                    await this.gtmClient.createVariable(
                      args.accountId,
                      args.containerId,
                      args.workspaceId,
                      {
                        name: args.name,
                        type: args.type,
                        parameter: args.parameter || [],
                      }
                    ),
                    null,
                    2
                  ),
                },
              ],
            };

          case 'create_version':
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(
                    await this.gtmClient.createVersion(
                      args.accountId,
                      args.containerId,
                      args.workspaceId,
                      {
                        name: args.name,
                        notes: args.notes,
                      }
                    ),
                    null,
                    2
                  ),
                },
              ],
            };

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}\n${error.stack || ''}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Google Tag Manager MCP Server running on stdio');
  }
}

const server = new GTMCPServer();
server.run().catch(console.error);

