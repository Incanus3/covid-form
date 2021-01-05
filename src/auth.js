import React from 'react';

import { jsonRequest } from 'src/backend';

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

    this.load();
  }

  load() {
    const authInfo = this.storage.read() || {};

    this.accessToken  = authInfo.accessToken  || null;
    this.refreshToken = authInfo.refreshToken || null;
  }

  save() {
    const authInfo = { accessToken: this.accessToken, refreshToken: this.refreshToken };

    this.storage.write(authInfo);
  }

  get isLoggedIn() { return !!this.accessToken; }

  async logIn(login, password) {
    const { response, body } = await jsonRequest(
      'post', '/auth/login', { data: { login , password } }
    );

    if (response.ok) {
      this.accessToken  = body.access_token;
      this.refreshToken = body.refresh_token;

      this.save();
    }

    return response.ok;
  }

  logOut() {
    this.accessToken  = null;
    this.refreshToken = null;

    this.save();
  }
}

export const AuthContext = React.createContext();
