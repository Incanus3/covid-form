import { getResponseData } from './fetch';

export class Result {
  constructor(data) {
    this.data = data;
  }

  transform(transformer) {
    return new this.constructor(transformer(this.data))
  }

  transformFailure(transformer) {
    if (this.isSuccess) { return this }

    return this.transform(transformer)
  }

  onSuccess(successHandler) {
    if (this.isSuccess) {
      successHandler(this.data);
    }

    return this;
  }

  onFailure(failureHandler) {
    if (this.isFailure) {
      failureHandler(this.data);
    }

    return this;
  }
}

export class AsyncResult extends Result {
  static async fromResponse(response) {
    const constructor = response.ok ? Success : Failure;

    return new constructor(await getResponseData(response));
  }

  async transform(transformer) {
    return new this.constructor(await transformer(this.data))
  }

  async transformFailure(transformer) {
    if (this.isSuccess) { return this }

    return await this.transform(transformer)
  }

  async onSuccess(successHandler) {
    if (this.isSuccess) {
      await successHandler(this.data);
    }

    return this;
  }

  async onFailure(failureHandler) {
    if (this.isFailure) {
      await failureHandler(this.data);
    }

    return this;
  }
}

export class Success extends Result {
  isSuccess = true;
  isFailure = false;
}

export class Failure extends Result {
  isSuccess = false;
  isFailure = true;
}

export class AsyncSuccess extends AsyncResult {
  isSuccess = true;
  isFailure = false;
}

export class AsyncFailure extends AsyncResult {
  isSuccess = false;
  isFailure = true;
}
