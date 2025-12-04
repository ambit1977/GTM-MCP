/**
 * Google Tag Manager の一般的なタグ、トリガー、変数のテンプレート
 */

/**
 * タグタイプのテンプレート
 */
export const TagTemplates = {
  // GA4設定タグ
  ga4Config: (measurementId) => ({
    type: 'googtag',
    parameter: [
      {
        type: 'template',
        key: 'tagId',
        value: measurementId
      }
    ]
  }),

  // GA4イベントタグ
  ga4Event: (eventName, measurementIdOverride = null) => {
    const params = [
      {
        type: 'template',
        key: 'eventName',
        value: eventName
      },
      {
        type: 'boolean',
        key: 'sendEcommerceData',
        value: 'false'
      }
    ];
    if (measurementIdOverride) {
      params.push({
        type: 'template',
        key: 'measurementIdOverride',
        value: measurementIdOverride
      });
    }
    return {
      type: 'gaawe',
      parameter: params
    };
  },

  // Google広告コンバージョントラッキング
  googleAdsConversion: (conversionId, conversionLabel, conversionValue = null) => {
    const params = [
      {
        type: 'boolean',
        key: 'enableNewCustomerReporting',
        value: 'false'
      },
      {
        type: 'boolean',
        key: 'enableConversionLinker',
        value: 'true'
      },
      {
        type: 'template',
        key: 'conversionId',
        value: conversionId
      },
      {
        type: 'template',
        key: 'conversionLabel',
        value: conversionLabel
      },
      {
        type: 'boolean',
        key: 'enableProductReporting',
        value: 'false'
      },
      {
        type: 'boolean',
        key: 'enableShippingData',
        value: 'false'
      },
      {
        type: 'boolean',
        key: 'rdp',
        value: 'false'
      }
    ];
    if (conversionValue !== null) {
      params.push({
        type: 'template',
        key: 'conversionValue',
        value: String(conversionValue)
      });
    }
    return {
      type: 'awct',
      parameter: params
    };
  },

  // カスタムHTMLタグ
  customHTML: (html, supportDocumentWrite = false) => ({
    type: 'html',
    parameter: [
      {
        type: 'template',
        key: 'html',
        value: html
      },
      {
        type: 'boolean',
        key: 'supportDocumentWrite',
        value: String(supportDocumentWrite)
      }
    ]
  }),

  // カスタム画像タグ（ピクセルトラッキング）
  customImage: (imageUrl) => ({
    type: 'img',
    parameter: [
      {
        type: 'template',
        key: 'url',
        value: imageUrl
      }
    ]
  }),

  // Facebookピクセル
  facebookPixel: (pixelId, eventName = null) => {
    const params = [
      {
        type: 'template',
        key: 'pixelId',
        value: pixelId
      }
    ];
    if (eventName) {
      params.push({
        type: 'template',
        key: 'eventName',
        value: eventName
      });
    }
    return {
      type: 'fbq',
      parameter: params
    };
  }
};

/**
 * トリガータイプのテンプレート
 */
export const TriggerTemplates = {
  // フォーム送信トリガー
  formSubmission: (formId = null, formClasses = null) => {
    const trigger = {
      type: 'formSubmission',
      filter: []
    };
    if (formId) {
      trigger.filter.push({
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
            value: formId
          }
        ]
      });
    }
    if (formClasses) {
      trigger.filter.push({
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
            value: formClasses
          }
        ]
      });
    }
    return trigger;
  },

  // スクロール深度トリガー
  scrollDepth: (verticalThreshold = 25, horizontalThreshold = null) => {
    const params = [
      {
        type: 'template',
        key: 'verticalThresholdUnits',
        value: 'PERCENT'
      },
      {
        type: 'template',
        key: 'verticalThreshold',
        value: String(verticalThreshold)
      }
    ];
    if (horizontalThreshold !== null) {
      params.push(
        {
          type: 'template',
          key: 'horizontalThresholdUnits',
          value: 'PERCENT'
        },
        {
          type: 'template',
          key: 'horizontalThreshold',
          value: String(horizontalThreshold)
        }
      );
    }
    return {
      type: 'scrollDepth',
      parameter: params
    };
  },

  // 要素の表示トリガー
  elementVisibility: (selector, visiblePercentageThreshold = 50, continuousTimeMinMilliseconds = 0) => ({
    type: 'visible',
    parameter: [
      {
        type: 'template',
        key: 'selector',
        value: selector
      },
      {
        type: 'template',
        key: 'visiblePercentageThreshold',
        value: String(visiblePercentageThreshold)
      },
      {
        type: 'template',
        key: 'continuousTimeMinMilliseconds',
        value: String(continuousTimeMinMilliseconds)
      }
    ]
  }),

  // YouTube動画トリガー
  youtubeVideo: (videoId = null, start = false, progress = false, complete = false, pause = false, seek = false) => {
    const conditions = [];
    if (start) conditions.push('start');
    if (progress) conditions.push('progress');
    if (complete) conditions.push('complete');
    if (pause) conditions.push('pause');
    if (seek) conditions.push('seek');

    const trigger = {
      type: 'youtubeVideo',
      parameter: [
        {
          type: 'template',
          key: 'enableTriggerOnVideoStart',
          value: String(start)
        },
        {
          type: 'template',
          key: 'enableTriggerOnVideoProgress',
          value: String(progress)
        },
        {
          type: 'template',
          key: 'enableTriggerOnVideoComplete',
          value: String(complete)
        },
        {
          type: 'template',
          key: 'enableTriggerOnVideoPause',
          value: String(pause)
        },
        {
          type: 'template',
          key: 'enableTriggerOnVideoSeek',
          value: String(seek)
        }
      ]
    };

    if (videoId) {
      trigger.filter = [
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
              value: videoId
            }
          ]
        }
      ];
    }

    return trigger;
  },

  // タイマートリガー
  timer: (interval = 1000, limit = 1, startTimerOn = 'windowLoad') => ({
    type: 'timer',
    parameter: [
      {
        type: 'template',
        key: 'interval',
        value: String(interval)
      },
      {
        type: 'template',
        key: 'limit',
        value: String(limit)
      },
      {
        type: 'template',
        key: 'startTimerOn',
        value: startTimerOn
      }
    ]
  })
};

/**
 * 変数タイプのテンプレート
 */
export const VariableTemplates = {
  // データレイヤー変数
  dataLayer: (dataLayerVariable, dataLayerVersion = 2) => ({
    type: 'v',
    parameter: [
      {
        type: 'template',
        key: 'dataLayerVersion',
        value: String(dataLayerVersion)
      },
      {
        type: 'template',
        key: 'dataLayerVariable',
        value: dataLayerVariable
      }
    ]
  }),

  // JavaScript変数
  javascript: (javascriptCode) => ({
    type: 'j',
    parameter: [
      {
        type: 'template',
        key: 'javascript',
        value: javascriptCode
      }
    ]
  }),

  // DOM要素変数
  domElement: (selector, attributeName = null) => {
    const params = [
      {
        type: 'template',
        key: 'selector',
        value: selector
      },
      {
        type: 'template',
        key: 'attributeName',
        value: attributeName || ''
      }
    ];
    return {
      type: 'd',
      parameter: params
    };
  },

  // 1st Party Cookie変数
  cookie: (cookieName) => ({
    type: 'k',
    parameter: [
      {
        type: 'template',
        key: 'cookieName',
        value: cookieName
      }
    ]
  }),

  // URL変数
  url: (componentType = 1, queryKey = '') => ({
    type: 'u',
    parameter: [
      {
        type: 'integer',
        key: 'componentType',
        value: componentType
      },
      {
        type: 'template',
        key: 'queryKey',
        value: queryKey
      }
    ]
  }),

  // 定数変数
  constant: (value) => ({
    type: 'c',
    parameter: [
      {
        type: 'template',
        key: 'value',
        value: value
      }
    ]
  }),

  // 自動イベント変数
  autoEvent: (variableType) => ({
    type: 'ae',
    parameter: [
      {
        type: 'template',
        key: 'variableType',
        value: variableType
      }
    ]
  }),

  // 組み込み変数（有効化のみ）
  builtIn: (variableType) => ({
    type: 'b',
    parameter: [
      {
        type: 'template',
        key: 'variableType',
        value: variableType
      }
    ]
  })
};

