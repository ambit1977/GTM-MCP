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
   * バージョンを作成（公開）
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
   * OAuth2認証オブジェクトを取得
   */
  getOAuth2Auth() {
    return this.oauth2Auth;
  }
}

