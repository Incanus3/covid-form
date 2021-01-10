import React from 'react';

import { request } from 'src/backend';

class JSONStorage {
  constructor(storage) { this.storage = storage }

  read     = () => this.storage.data && JSON.parse(this.storage.data)
  write    = (data) => this.storage.data = JSON.stringify(data)
  clear    = () => delete this.storage.data
  isFilled = () => !!this.storage.data
  isEmpty  = () => !this.isFilled()
}

export class Auth {
  constructor() {
    this.storage = new JSONStorage(localStorage || {});

    this._load();
  }

  get isLoggedIn() { return !!this.accessToken; }

  async logIn(email, password) {
    return await this._handleTokenResult(await request(
      'post', '/auth/login', { data: { email , password } }
    ));
  }

  async refresh() {
    return await this._handleTokenResult(await this._authenticatedRequest(
      'post', '/auth/refresh_token', { data: { refresh_token: this.refreshToken } }
    ));
  }

  logOut() {
    this.accessToken  = null;
    this.refreshToken = null;

    this._save();
  }

  async authenticatedRequest(...args) {
    return this._withRefresh(() => this._authenticatedRequest(...args));
  }

  _load() {
    const authInfo = this.storage.read() || {};

    this.accessToken  = authInfo.accessToken  || null;
    this.refreshToken = authInfo.refreshToken || null;
  }

  _save() {
    const authInfo = { accessToken: this.accessToken, refreshToken: this.refreshToken };

    this.storage.write(authInfo);
  }

  _authenticatedRequest(method, path, options = {}) {
    options['headers'] = options['headers'] || {};
    options['headers']['Authorization'] = this.accessToken;

    return request(method, path, options);
  }

  async _withRefresh(requestingFunction) {
    const response = await requestingFunction();

    if (response.ok || !await this._isExpiredTokenResponse(response)) {
      return response;
    }

    const refreshResponse = await this.refresh();

    if (!refreshResponse.ok) {
      return refreshResponse;
    }

    return await requestingFunction();
  }

  async _handleTokenResult(response) {
    if (response.ok) {
      const body = await response.clone().json();

      this.accessToken  = body.access_token;
      this.refreshToken = body.refresh_token;

      this._save();
    }

    return response;
  }

  async _isExpiredTokenResponse(response) {
    const body = await response.clone().json();

    return response.status === 401 && body.error === "expired JWT access token";
  }
}

export const AuthContext = React.createContext();
