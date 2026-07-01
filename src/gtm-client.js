import { google } from 'googleapis';
import { OAuth2Auth } from './oauth2-auth.js';

/**
 * Google Tag Manager API クライアント
 */
export class GTMClient {
  constructor() {
    this.oauth2Auth = null;
    this.tagmanager = null;
    this.initializeAuth();
  }

  /**
   * 認証を初期化
   */
  initializeAuth() {
    try {
      this.oauth2Auth = new OAuth2Auth();
      this.tagmanager = google.tagmanager({
        version: 'v2',
        auth: this.oauth2Auth.getClient()
      });
    } catch (error) {
      // OAuth2認証の初期化に失敗した場合、エラーをスロー
      throw error;
    }
  }

  /**
   * 認証を確認し、必要に応じて更新
   */
  async ensureAuth() {
    if (!this.oauth2Auth.isAuthenticated()) {
      throw new Error('認証が必要です。authenticate ツールを使用して認証してください。');
    }
    await this.oauth2Auth.ensureValidToken();
  }

  /**
   * アカウント一覧を取得
   */
  async listAccounts() {
    await this.ensureAuth();
    const response = await this.tagmanager.accounts.list();
    return response.data.account || [];
  }

  /**
   * アカウントを取得
   * @param {string} accountId - アカウントID
   */
  async getAccount(accountId) {
    await this.ensureAuth();
    const response = await this.tagmanager.accounts.get({
      path: `accounts/${accountId}`
    });
    return response.data;
  }

  /**
   * アカウントを更新
   * @param {string} accountId - アカウントID
   * @param {Object} accountData - アカウントデータ（nameなど）
   */
  async updateAccount(accountId, accountData) {
    await this.ensureAuth();
    const response = await this.tagmanager.accounts.update({
      path: `accounts/${accountId}`,
      requestBody: accountData
    });
    return response.data;
  }

  /**
   * コンテナ一覧を取得
   * @param {string} accountId - アカウントID
   */
  async listContainers(accountId) {
    await this.ensureAuth();
    const response = await this.tagmanager.accounts.containers.list({
      parent: `accounts/${accountId}`
    });
    return response.data.container || [];
  }

  /**
   * コンテナを取得
   * @param {string} accountId - アカウントID
   * @param {string} containerId - コンテナID
   */
  async getContainer(accountId, containerId) {
    await this.ensureAuth();
    const response = await this.tagmanager.accounts.containers.get({
      path: `accounts/${accountId}/containers/${containerId}`
    });
    return response.data;
  }

  /**
   * コンテナを作成
   * @param {string} accountId - アカウントID
   * @param {Object} containerData - コンテナデータ
   */
  async createContainer(accountId, containerData) {
    await this.ensureAuth();
    const response = await this.tagmanager.accounts.containers.create({
      parent: `accounts/${accountId}`,
      requestBody: containerData
    });
    return response.data;
  }

  /**
   * コンテナを更新
   * @param {string} accountId - アカウントID
   * @param {string} containerId - コンテナID
   * @param {Object} containerData - コンテナデータ
   */
  async updateContainer(accountId, containerId, containerData) {
    await this.ensureAuth();
    const response = await this.tagmanager.accounts.containers.update({
      path: `accounts/${accountId}/containers/${containerId}`,
      requestBody: containerData
    });
    return response.data;
  }

  /**
   * コンテナを削除
   * @param {string} accountId - アカウントID
   * @param {string} containerId - コンテナID
   */
  async deleteContainer(accountId, containerId) {
    await this.ensureAuth();
    await this.tagmanager.accounts.containers.delete({
      path: `accounts/${accountId}/containers/${containerId}`
    });
    return { success: true };
  }

  /**
   * ワークスペース一覧を取得
   * @param {string} accountId - アカウントID
   * @param {string} containerId - コンテナID
   */
  async listWorkspaces(accountId, containerId) {
    await this.ensureAuth();
    const response = await this.tagmanager.accounts.containers.workspaces.list({
      parent: `accounts/${accountId}/containers/${containerId}`
    });
    return response.data.workspace || [];
  }

  /**
   * ワークスペースを取得
   * @param {string} accountId - アカウントID
   * @param {string} containerId - コンテナID
   * @param {string} workspaceId - ワークスペースID
   */
  async getWorkspace(accountId, containerId, workspaceId) {
    await this.ensureAuth();
    const response = await this.tagmanager.accounts.containers.workspaces.get({
      path: `accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}`
    });
    return response.data;
  }

  /**
   * ワークスペースを作成
   * @param {string} accountId - アカウントID
   * @param {string} containerId - コンテナID
   * @param {Object} workspaceData - ワークスペースデータ
   */
  async createWorkspace(accountId, containerId, workspaceData) {
    await this.ensureAuth();
    const response = await this.tagmanager.accounts.containers.workspaces.create({
      parent: `accounts/${accountId}/containers/${containerId}`,
      requestBody: workspaceData
    });
    return response.data;
  }

  /**
   * ワークスペースを更新
   * @param {string} accountId - アカウントID
   * @param {string} containerId - コンテナID
   * @param {string} workspaceId - ワークスペースID
   * @param {Object} workspaceData - ワークスペースデータ
   */
  async updateWorkspace(accountId, containerId, workspaceId, workspaceData) {
    await this.ensureAuth();
    const response = await this.tagmanager.accounts.containers.workspaces.update({
      path: `accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}`,
      requestBody: workspaceData
    });
    return response.data;
  }

  /**
   * ワークスペースを削除
   * @param {string} accountId - アカウントID
   * @param {string} containerId - コンテナID
   * @param {string} workspaceId - ワークスペースID
   */
  async deleteWorkspace(accountId, containerId, workspaceId) {
    await this.ensureAuth();
    await this.tagmanager.accounts.containers.workspaces.delete({
      path: `accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}`
    });
    return { success: true };
  }

  /**
   * ワークスペースを同期
   * @param {string} accountId - アカウントID
   * @param {string} containerId - コンテナID
   * @param {string} workspaceId - ワークスペースID
   */
  async syncWorkspace(accountId, containerId, workspaceId) {
    await this.ensureAuth();
    const response = await this.tagmanager.accounts.containers.workspaces.sync({
      path: `accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}`
    });
    return response.data;
  }

  /**
   * ワークスペースのステータスを取得（変更・コンフリクト）
   * ベースバージョンからの変更エンティティとマージコンフリクトを返す。承認レビュー時の参考に利用可能。
   * @param {string} accountId - アカウントID
   * @param {string} containerId - コンテナID
   * @param {string} workspaceId - ワークスペースID
   * @returns {Promise<{workspaceChange: Array, mergeConflict: Array}>}
   */
  async getWorkspaceStatus(accountId, containerId, workspaceId) {
    await this.ensureAuth();
    const path = `accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}`;
    const response = await this.tagmanager.accounts.containers.workspaces.getStatus({
      path
    });
    return response.data || { workspaceChange: [], mergeConflict: [] };
  }

  /**
   * 承認レビュー用にワークスペースの変更サマリと参考情報をまとめて取得する
   * getWorkspaceStatus + ワークスペース情報を組み合わせ、レビューに必要な情報を構造化して返す。
   * @param {string} accountId - アカウントID
   * @param {string} containerId - コンテナID
   * @param {string} workspaceId - ワークスペースID
   * @returns {Promise<Object>} レビュー用サマリ（workspace, status, changeSummary, mergeConflicts, reviewNotes）
   */
  async getWorkspaceReviewInfo(accountId, containerId, workspaceId) {
    await this.ensureAuth();
    const [workspace, status] = await Promise.all([
      this.getWorkspace(accountId, containerId, workspaceId),
      this.getWorkspaceStatus(accountId, containerId, workspaceId)
    ]);

    const workspaceChange = status.workspaceChange || [];
    const mergeConflict = status.mergeConflict || [];

    const changeSummary = { tags: [], triggers: [], variables: [], builtInVariables: [], folders: [], total: workspaceChange.length };
    const byPath = (pathStr) => {
      if (!pathStr || typeof pathStr !== 'string') return null;
      const parts = pathStr.split('/');
      const idx = parts.indexOf('tags');
      if (idx !== -1 && parts[idx + 1]) return { type: 'tags', id: parts[idx + 1] };
      const tidx = parts.indexOf('triggers');
      if (tidx !== -1 && parts[tidx + 1]) return { type: 'triggers', id: parts[tidx + 1] };
      const vidx = parts.indexOf('variables');
      if (vidx !== -1 && parts[vidx + 1]) return { type: 'variables', id: parts[vidx + 1] };
      const bidx = parts.indexOf('built_in_variables');
      if (bidx !== -1) return { type: 'builtInVariables' };
      const fidx = parts.indexOf('folders');
      if (fidx !== -1 && parts[fidx + 1]) return { type: 'folders', id: parts[fidx + 1] };
      return null;
    };

    for (const entity of workspaceChange) {
      const path = entity.path || entity.name || '';
      const parsed = byPath(path);
      if (parsed) {
        const id = parsed.id || '';
        const name = entity.name || entity.displayName || (parsed.type === 'builtInVariables' ? 'Built-in variables' : id || path);
        const item = { path, id, name: typeof name === 'string' ? name : (id || path) };
        if (parsed.type === 'tags') changeSummary.tags.push(item);
        else if (parsed.type === 'triggers') changeSummary.triggers.push(item);
        else if (parsed.type === 'variables') changeSummary.variables.push(item);
        else if (parsed.type === 'builtInVariables') changeSummary.builtInVariables.push(item);
        else if (parsed.type === 'folders') changeSummary.folders.push(item);
      }
    }

    const reviewNotes = [];
    if (mergeConflict.length > 0) {
      reviewNotes.push(`マージコンフリクトが ${mergeConflict.length} 件あります。公開前に解決が必要です。`);
    }
    if (changeSummary.total === 0 && mergeConflict.length === 0) {
      reviewNotes.push('ベースバージョンからの変更は検出されていません。');
    } else {
      const parts = [];
      if (changeSummary.tags.length) parts.push(`タグ ${changeSummary.tags.length}`);
      if (changeSummary.triggers.length) parts.push(`トリガー ${changeSummary.triggers.length}`);
      if (changeSummary.variables.length) parts.push(`変数 ${changeSummary.variables.length}`);
      if (changeSummary.folders.length) parts.push(`フォルダ ${changeSummary.folders.length}`);
      if (changeSummary.builtInVariables.length) parts.push('組み込み変数');
      if (parts.length) reviewNotes.push(`変更対象: ${parts.join(', ')}`);
    }

    return {
      workspace: {
        workspaceId: workspace.workspaceId,
        name: workspace.name,
        description: workspace.description || ''
      },
      status: {
        workspaceChange: status.workspaceChange,
        mergeConflict: status.mergeConflict
      },
      changeSummary: {
        ...changeSummary,
        hasChanges: changeSummary.total > 0,
        hasMergeConflicts: mergeConflict.length > 0
      },
      mergeConflicts: mergeConflict,
      reviewNotes
    };
  }

  /**
   * ワークスペースのコンフリクトを解決
   * @param {string} accountId - アカウントID
   * @param {string} containerId - コンテナID
   * @param {string} workspaceId - ワークスペースID
   * @param {Object} conflictData - コンフリクト解決データ
   */
  async resolveConflict(accountId, containerId, workspaceId, conflictData) {
    await this.ensureAuth();
    const response = await this.tagmanager.accounts.containers.workspaces.resolve_conflict({
      path: `accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}`,
      requestBody: conflictData
    });
    return response.data;
  }

  /**
   * クイックプレビューを取得
   * @param {string} accountId - アカウントID
   * @param {string} containerId - コンテナID
   * @param {string} workspaceId - ワークスペースID
   */
  async quickPreview(accountId, containerId, workspaceId) {
    await this.ensureAuth();
    const response = await this.tagmanager.accounts.containers.workspaces.quick_preview({
      path: `accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}`
    });
    return response.data;
  }

  /**
   * タグ一覧を取得
   * @param {string} accountId - アカウントID
   * @param {string} containerId - コンテナID
   * @param {string} workspaceId - ワークスペースID
   */
  async listTags(accountId, containerId, workspaceId) {
    await this.ensureAuth();
    const response = await this.tagmanager.accounts.containers.workspaces.tags.list({
      parent: `accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}`
    });
    return response.data.tag || [];
  }

  /**
   * タグを取得
   * @param {string} accountId - アカウントID
   * @param {string} containerId - コンテナID
   * @param {string} workspaceId - ワークスペースID
   * @param {string} tagId - タグID
   */
  async getTag(accountId, containerId, workspaceId, tagId) {
    await this.ensureAuth();
    const response = await this.tagmanager.accounts.containers.workspaces.tags.get({
      path: `accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}/tags/${tagId}`
    });
    return response.data;
  }

  /**
   * タグを作成
   * @param {string} accountId - アカウントID
   * @param {string} containerId - コンテナID
   * @param {string} workspaceId - ワークスペースID
   * @param {Object} tagData - タグデータ
   */
  async createTag(accountId, containerId, workspaceId, tagData) {
    await this.ensureAuth();
    const response = await this.tagmanager.accounts.containers.workspaces.tags.create({
      parent: `accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}`,
      requestBody: tagData
    });
    return response.data;
  }

  /**
   * タグを更新
   * @param {string} accountId - アカウントID
   * @param {string} containerId - コンテナID
   * @param {string} workspaceId - ワークスペースID
   * @param {string} tagId - タグID
   * @param {Object} tagData - タグデータ
   */
  async updateTag(accountId, containerId, workspaceId, tagId, tagData) {
    await this.ensureAuth();
    const response = await this.tagmanager.accounts.containers.workspaces.tags.update({
      path: `accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}/tags/${tagId}`,
      requestBody: tagData
    });
    return response.data;
  }

  /**
   * タグを削除
   * @param {string} accountId - アカウントID
   * @param {string} containerId - コンテナID
   * @param {string} workspaceId - ワークスペースID
   * @param {string} tagId - タグID
   */
  async deleteTag(accountId, containerId, workspaceId, tagId) {
    await this.ensureAuth();
    await this.tagmanager.accounts.containers.workspaces.tags.delete({
      path: `accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}/tags/${tagId}`
    });
    return { success: true };
  }

  /**
   * トリガー一覧を取得
   * @param {string} accountId - アカウントID
   * @param {string} containerId - コンテナID
   * @param {string} workspaceId - ワークスペースID
   */
  async listTriggers(accountId, containerId, workspaceId) {
    await this.ensureAuth();
    const response = await this.tagmanager.accounts.containers.workspaces.triggers.list({
      parent: `accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}`
    });
    return response.data.trigger || [];
  }

  /**
   * トリガーを作成
   * @param {string} accountId - アカウントID
   * @param {string} containerId - コンテナID
   * @param {string} workspaceId - ワークスペースID
   * @param {Object} triggerData - トリガーデータ
   */
  async createTrigger(accountId, containerId, workspaceId, triggerData) {
    await this.ensureAuth();
    const response = await this.tagmanager.accounts.containers.workspaces.triggers.create({
      parent: `accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}`,
      requestBody: triggerData
    });
    return response.data;
  }

  /**
   * トリガーを取得
   * @param {string} accountId - アカウントID
   * @param {string} containerId - コンテナID
   * @param {string} workspaceId - ワークスペースID
   * @param {string} triggerId - トリガーID
   */
  async getTrigger(accountId, containerId, workspaceId, triggerId) {
    await this.ensureAuth();
    const response = await this.tagmanager.accounts.containers.workspaces.triggers.get({
      path: `accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}/triggers/${triggerId}`
    });
    return response.data;
  }

  /**
   * トリガーを更新
   * @param {string} accountId - アカウントID
   * @param {string} containerId - コンテナID
   * @param {string} workspaceId - ワークスペースID
   * @param {string} triggerId - トリガーID
   * @param {Object} triggerData - トリガーデータ
   */
  async updateTrigger(accountId, containerId, workspaceId, triggerId, triggerData) {
    await this.ensureAuth();
    const response = await this.tagmanager.accounts.containers.workspaces.triggers.update({
      path: `accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}/triggers/${triggerId}`,
      requestBody: triggerData
    });
    return response.data;
  }

  /**
   * トリガーを削除
   * @param {string} accountId - アカウントID
   * @param {string} containerId - コンテナID
   * @param {string} workspaceId - ワークスペースID
   * @param {string} triggerId - トリガーID
   */
  async deleteTrigger(accountId, containerId, workspaceId, triggerId) {
    await this.ensureAuth();
    await this.tagmanager.accounts.containers.workspaces.triggers.delete({
      path: `accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}/triggers/${triggerId}`
    });
    return { success: true };
  }

  /**
   * 変数一覧を取得
   * @param {string} accountId - アカウントID
   * @param {string} containerId - コンテナID
   * @param {string} workspaceId - ワークスペースID
   */
  async listVariables(accountId, containerId, workspaceId) {
    await this.ensureAuth();
    const response = await this.tagmanager.accounts.containers.workspaces.variables.list({
      parent: `accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}`
    });
    return response.data.variable || [];
  }

  /**
   * 変数を取得
   * @param {string} accountId - アカウントID
   * @param {string} containerId - コンテナID
   * @param {string} workspaceId - ワークスペースID
   * @param {string} variableId - 変数ID
   */
  async getVariable(accountId, containerId, workspaceId, variableId) {
    await this.ensureAuth();
    const response = await this.tagmanager.accounts.containers.workspaces.variables.get({
      path: `accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}/variables/${variableId}`
    });
    return response.data;
  }

  /**
   * 変数を作成
   * @param {string} accountId - アカウントID
   * @param {string} containerId - コンテナID
   * @param {string} workspaceId - ワークスペースID
   * @param {Object} variableData - 変数データ
   */
  async createVariable(accountId, containerId, workspaceId, variableData) {
    await this.ensureAuth();
    const response = await this.tagmanager.accounts.containers.workspaces.variables.create({
      parent: `accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}`,
      requestBody: variableData
    });
    return response.data;
  }

  /**
   * 変数を更新
   * @param {string} accountId - アカウントID
   * @param {string} containerId - コンテナID
   * @param {string} workspaceId - ワークスペースID
   * @param {string} variableId - 変数ID
   * @param {Object} variableData - 変数データ
   */
  async updateVariable(accountId, containerId, workspaceId, variableId, variableData) {
    await this.ensureAuth();
    const response = await this.tagmanager.accounts.containers.workspaces.variables.update({
      path: `accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}/variables/${variableId}`,
      requestBody: variableData
    });
    return response.data;
  }

  /**
   * 変数を削除
   * @param {string} accountId - アカウントID
   * @param {string} containerId - コンテナID
   * @param {string} workspaceId - ワークスペースID
   * @param {string} variableId - 変数ID
   */
  async deleteVariable(accountId, containerId, workspaceId, variableId) {
    await this.ensureAuth();
    await this.tagmanager.accounts.containers.workspaces.variables.delete({
      path: `accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}/variables/${variableId}`
    });
    return { success: true };
  }

  /**
   * バージョンを作成（公開準備）
   * @param {string} accountId - アカウントID
   * @param {string} containerId - コンテナID
   * @param {string} workspaceId - ワークスペースID
   * @param {Object} versionData - バージョンデータ
   */
  async createVersion(accountId, containerId, workspaceId, versionData = {}) {
    await this.ensureAuth();
    const response = await this.tagmanager.accounts.containers.workspaces.create_version({
      path: `accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}`,
      requestBody: versionData
    });
    return response.data;
  }

  /**
   * バージョン一覧を取得
   * @param {string} accountId - アカウントID
   * @param {string} containerId - コンテナID
   */
  async listVersions(accountId, containerId) {
    await this.ensureAuth();
    const response = await this.tagmanager.accounts.containers.versions.list({
      parent: `accounts/${accountId}/containers/${containerId}`
    });
    return response.data.containerVersion || [];
  }

  /**
   * バージョンを取得
   * @param {string} accountId - アカウントID
   * @param {string} containerId - コンテナID
   * @param {string} versionId - バージョンID
   */
  async getVersion(accountId, containerId, versionId) {
    await this.ensureAuth();
    const response = await this.tagmanager.accounts.containers.versions.get({
      path: `accounts/${accountId}/containers/${containerId}/versions/${versionId}`
    });
    return response.data;
  }

  /**
   * バージョンを公開
   * @param {string} accountId - アカウントID
   * @param {string} containerId - コンテナID
   * @param {string} versionId - バージョンID
   */
  async publishVersion(accountId, containerId, versionId) {
    await this.ensureAuth();
    const response = await this.tagmanager.accounts.containers.versions.publish({
      path: `accounts/${accountId}/containers/${containerId}/versions/${versionId}`
    });
    return response.data;
  }

  /**
   * アカウントのユーザー権限一覧を取得
   * @param {string} accountId - アカウントID
   */
  async listUserPermissions(accountId) {
    await this.ensureAuth();
    const response = await this.tagmanager.accounts.user_permissions.list({
      parent: `accounts/${accountId}`
    });
    return response.data.userPermission || [];
  }

  /**
   * ユーザー権限を取得
   * @param {string} accountId - アカウントID
   * @param {string} userPermissionId - ユーザー権限ID（pathの末尾部分）
   */
  async getUserPermission(accountId, userPermissionId) {
    await this.ensureAuth();
    const response = await this.tagmanager.accounts.user_permissions.get({
      path: `accounts/${accountId}/user_permissions/${userPermissionId}`
    });
    return response.data;
  }

  /**
   * ユーザー権限を作成
   * @param {string} accountId - アカウントID
   * @param {Object} body - emailAddress, accountAccess { permission }, containerAccess [ { containerId, permission } ]
   */
  async createUserPermission(accountId, body) {
    await this.ensureAuth();
    const response = await this.tagmanager.accounts.user_permissions.create({
      parent: `accounts/${accountId}`,
      requestBody: body
    });
    return response.data;
  }

  /**
   * ユーザー権限を更新
   * @param {string} accountId - アカウントID
   * @param {string} userPermissionId - ユーザー権限ID
   * @param {Object} body - 更新するフィールド（accountAccess, containerAccess など）
   */
  async updateUserPermission(accountId, userPermissionId, body) {
    await this.ensureAuth();
    const response = await this.tagmanager.accounts.user_permissions.update({
      path: `accounts/${accountId}/user_permissions/${userPermissionId}`,
      requestBody: body
    });
    return response.data;
  }

  /**
   * ユーザー権限を削除（アカウントからのアクセスを取り消し）
   * @param {string} accountId - アカウントID
   * @param {string} userPermissionId - ユーザー権限ID
   */
  async deleteUserPermission(accountId, userPermissionId) {
    await this.ensureAuth();
    await this.tagmanager.accounts.user_permissions.delete({
      path: `accounts/${accountId}/user_permissions/${userPermissionId}`
    });
    return { success: true };
  }

  /**
   * OAuth2認証オブジェクトを取得
   */
  getOAuth2Auth() {
    return this.oauth2Auth;
  }

  /**
   * Tag Manager APIクライアントを取得
   */
  getTagManager() {
    return this.tagmanager;
  }
}

