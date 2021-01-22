import React       from 'react';
import { History } from 'history';

import { request, RequestOptions  } from 'src/backend';
import { Result, Success, Failure } from 'src/utils/results';
import { DataStorage, JSONStorage } from 'src/utils/storage';

export class AuthError extends Error {}
export class NotLoggedIn extends AuthError {}
export class SessionExpiredError extends AuthError {}

export class SessionExpiredFailure extends Failure<null> {
  constructor() {
    super(null);
  }
}

type RequestArgs = [string, string, RequestOptions?];

export class Auth {
  storage:      DataStorage;
  accessToken:  string | null = null;
  refreshToken: string | null = null;

  constructor() {
    this.storage = new JSONStorage(localStorage ?? {});

    this._load();
  }

  get isLoggedIn(): boolean { return !!this.accessToken; }

  async logIn(email: string, password: string): Promise<Response> {
    return await this._handleTokenResult(await request(
      'post', '/auth/login', { data: { email , password } }
    ));
  }

  async refresh(): Promise<Response> {
    return await this._handleTokenResult(await this._authenticatedRequest(
      'post', '/auth/refresh_token', { data: { refresh_token: this.refreshToken } }
    ));
  }

  logOut(
    history: History,
    { redirectTo = '/admin/login', message }: { redirectTo?: string, message?: AuthMessage } = {},
  ): void {
    this.accessToken  = null;
    this.refreshToken = null;

    this._save();

    if (history) {
      const location: History.LocationDescriptor = { pathname: redirectTo };

      if (message) { location.state = message }

      history.push(location);
    }
  }

  async authenticatedRequest(...args: RequestArgs): Promise<Response> {
    return await this._withRefresh(() => this._authenticatedRequest(...args));
  }

  async authenticatedRequestWithLogoutWhenSessionExpired(
    history: History, ...args: RequestArgs
  ): Promise<Result<Response, null>> {
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

  async isExpiredAccessTokenResponse(response: Response): Promise<boolean> {
    const body = await response.clone().json();

    return response.status === 401 && body.error === "expired JWT access token";
  }

  async isInvalidRefreshTokenResponse(response: Response): Promise<boolean> {
    const body = await response.clone().json();

    return response.status === 401 && body.error === "invalid JWT refresh token";
  }

  _load(): void {
    const authInfo = this.storage.read() ?? {};

    this.accessToken  = authInfo.accessToken  ?? null;
    this.refreshToken = authInfo.refreshToken ?? null;
  }

  _save(): void {
    const authInfo = { accessToken: this.accessToken, refreshToken: this.refreshToken };

    this.storage.write(authInfo);
  }

  _authenticatedRequest(
    method: string, path: string, options: RequestOptions = {}
  ): Promise<Response> {
    if (!this.accessToken) {
      throw new NotLoggedIn();
    }

    options.headers = options.headers ?? {};
    options.headers.Authorization = this.accessToken;

    return request(method, path, options);
  }

  async _withRefresh(requestingFunction: (...args: any) => Promise<Response>): Promise<Response> {
    const response = await requestingFunction();

    if (response.ok ?? !await this.isExpiredAccessTokenResponse(response)) {
      return response;
    }

    const refreshResponse = await this.refresh();

    if (!refreshResponse.ok) {
      throw new SessionExpiredError();
    }

    return await requestingFunction();
  }

  async _handleTokenResult(response: Response): Promise<Response> {
    if (response.ok) {
      const body = await response.clone().json();

      this.accessToken  = body.access_token;
      this.refreshToken = body.refresh_token;

      this._save();
    }

    return response;
  }
}

export const AuthContext = React.createContext(null);

class AuthMessage {
  message:  string;
  severity: string;

  constructor(message: string, severity: string) {
    this.message  = message;
    this.severity = severity;
  }
}

export const SESSION_EXPIRED = new AuthMessage(
  'Platnost Vašeho přihlášení vypršela, přihlaste se prosím znovu.', 'warning'
)
