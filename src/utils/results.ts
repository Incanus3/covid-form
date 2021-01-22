import { getResponseData } from './fetch';

type ResultConstructor<SDT, FDT> = {
  new (data: any): Result<SDT, FDT>;
}

type AsyncResultConstructor<SDT, FDT> = {
  new (data: any): AsyncResult<SDT, FDT>;
}

class ResultBase<SDT, FDT> {
  isSuccess = false;
  isFailure = false;
  successData: SDT | null;
  failureData: FDT | null;

  protected constructor(successData: SDT, failureData: FDT) {
    this.successData = successData;
    this.failureData = failureData;
  }

  // this is here only because CovidForm expects it, get rid of it after updating CovidForm
  // component
  get data(): SDT | FDT | null {
    if (this.isSuccess) {
      return this.successData;
    } else {
      return this.failureData;
    }
  }
}

export class Result<SDT, FDT> extends ResultBase<SDT, FDT> {
  transformFailure<FDT2>(transformer: (data: FDT) => FDT2): Result<SDT, FDT2> {
    if (this.isSuccess) {
      return new (this.constructor as ResultConstructor<SDT, FDT2>)(this.successData);
    } else {
      return new (this.constructor as ResultConstructor<SDT, FDT2>)(transformer(this.failureData as FDT));
    }
  }

  onSuccess(successHandler: (data: SDT) => void): Result<SDT, FDT> {
    if (this.isSuccess) {
      successHandler(this.successData as SDT);
    }

    return this;
  }

  onFailure(failureHandler: (data: FDT) => void): Result<SDT, FDT> {
    if (this.isFailure) {
      failureHandler(this.failureData as FDT);
    }

    return this;
  }

  chain<SDT2, FDT2>(transformer: (data: SDT) => Result<SDT2, FDT2>): Result<SDT | SDT2, FDT | FDT2> {
    if (this.isSuccess) {
      return transformer(this.successData as SDT);
    } else {
      return this;
    }
  }
}

export class AsyncResult<SDT, FDT> extends ResultBase<SDT, FDT> {
  static async fromResponse(response: Response): Promise<AsyncResult<any, any>> {
    const constructor = response.ok ? AsyncSuccess : AsyncFailure;

    return new (constructor as AsyncResultConstructor<any, any>)(await getResponseData(response));
  }

  async transformFailure<FDT2>(transformer: (data: FDT) => Promise<FDT2>): Promise<AsyncResult<SDT, FDT2>> {
    if (this.isSuccess) {
      return new (this.constructor as AsyncResultConstructor<SDT, FDT2>)(this.successData);
    } else {
      return new (this.constructor as AsyncResultConstructor<SDT, FDT2>)(await transformer(this.failureData as FDT));
    }
  }

  async onSuccess(successHandler: (data: SDT) => Promise<void>): Promise<AsyncResult<SDT, FDT>> {
    if (this.isSuccess) {
      await successHandler(this.successData as SDT);
    }

    return this;
  }

  async onFailure(failureHandler: (data: FDT) => Promise<void>): Promise<AsyncResult<SDT, FDT>> {
    if (this.isFailure) {
      await failureHandler(this.failureData as FDT);
    }

    return this;
  }

  async chain<SDT2, FDT2>(transformer: (data: SDT) => Promise<AsyncResult<SDT2, FDT2>>): Promise<AsyncResult<SDT | SDT2, FDT | FDT2>> {
    if (this.isSuccess) {
      return await transformer(this.successData as SDT);
    } else {
      return this;
    }
  }
}

export class Success<SDT> extends Result<SDT, any> {
  isSuccess = true;
  isFailure = false;

  constructor(successData: SDT) {
    super(successData, null);
  }
}

export class Failure<FDT> extends Result<any, FDT> {
  isSuccess = false;
  isFailure = true;

  constructor(failureData: FDT) {
    super(null, failureData);
  }
}

export class AsyncSuccess<SDT> extends AsyncResult<SDT, any> {
  isSuccess = true;
  isFailure = false;

  constructor(successData: SDT) {
    super(successData, null);
  }
}

export class AsyncFailure<FDT> extends AsyncResult<any, FDT> {
  isSuccess = false;
  isFailure = true;

  constructor(failureData: FDT) {
    super(null, failureData);
  }
}
