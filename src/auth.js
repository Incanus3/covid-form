import React from 'react';

import { request          } from 'src/backend';
import { Success, Failure } from 'src/utils/results';

class JSONStorage {
  constructor(storage) { this.storage = storage }

  read     = () => this.storage.data && JSON.parse(this.storage.data)
  write    = (data) => this.storage.data = JSON.stringify(data)
  clear    = () => delete this.storage.data
  isFilled = () => !!this.storage.data
  isEmpty  = () => !this.isFilled()
}

export class AuthError extends Error {}

export class SessionExpiredError extends AuthError {}

export class SessionExpiredFailure extends Failure {}

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

  logOut(history, { redirectTo = '/admin/login', message = null } = {}) {
    this.accessToken  = null;
    this.refreshToken = null;

    this._save();

    if (history) {
      const location = { pathname: redirectTo };

      if (message) { location.state = message }

      history.push(location);
    }
  }

  async authenticatedRequest(...args) {
    return this._withRefresh(() => this._authenticatedRequest(...args));
  }

  async authenticatedRequestWithLogoutWhenSessionExpired(history, ...args) {
    try {
      return new Success(await this.authenticatedRequest(...args));
    } catch (error) {
      if (error instanceof SessionExpiredError) {
        this.logOut(history, { message: SESSION_EXPIRED });

        return new SessionExpiredFailure();
      } else {
        throw error;
      }
    }
  }

  async isExpiredAccessTokenResponse(response) {
    const body = await response.clone().json();

    return response.status === 401 && body.error === "expired JWT access token";
  }

  async isInvalidRefreshTokenResponse(response) {
    const body = await response.clone().json();

    return response.status === 401 && body.error === "invalid JWT refresh token";
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
    options.headers = options.headers || {};
    options.headers.Authorization = this.accessToken;

    return request(method, path, options);
  }

  async _withRefresh(requestingFunction) {
    const response = await requestingFunction();

    if (response.ok || !await this.isExpiredAccessTokenResponse(response)) {
      return response;
    }

    const refreshResponse = await this.refresh();

    if (!refreshResponse.ok) {
      throw new SessionExpiredError();
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
}

export const AuthContext = React.createContext();

class AuthMessage {
  constructor(message, severity) {
    this.message  = message;
    this.severity = severity;
  }
}

export const SESSION_EXPIRED = new AuthMessage(
  'Platnost Vašeho přihlášení vypršela, přihlaste se prosím znovu.', 'warning'
)
