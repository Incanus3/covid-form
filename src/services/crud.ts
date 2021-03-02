import _                          from 'lodash';
import { History, LocationState } from 'history';

import      { AsyncResult                                  } from 'src/utils/results';
import      { Auth, RequestOptions, RequestArgs            } from 'src/auth';
import      { Setting, ExamType, TimeSlot                  } from 'src/models';
import type { JSONData, JSONSerializable, JSONDeserializer } from 'src/models';

abstract class CRUDService<Model extends JSONSerializable> {
  protected auth:    Auth;
  protected history: History<LocationState>;

  abstract model:    JSONDeserializer;
  abstract dataKey:  string;
  abstract basePath: string;
  assocFields:       string[] = [];

  constructor(auth: Auth, history: History<LocationState>) {
    this.auth    = auth;
    this.history = history;
  }

  async loadAll({ withAssocs }: { withAssocs?: string } = {}): Promise<AsyncResult<Model[], any>> {
    const options: RequestOptions = {};

    if (withAssocs) {
      options.params = { 'with[]': withAssocs };
    }

    return (
      await this.request('GET', this.basePath, options)
    ).transformSuccess(async (data) => {
      return data[this.dataKey].map((tsJSON: JSONData) => this.model.fromJSON(tsJSON))
    })
  }

  async create(entity: Model): Promise<AsyncResult<Model, any>> {
    return (
      await this.request('POST', this.basePath, { data: this.serializeEntity(entity) })
    ).transformSuccess(async (tsJSON: JSONData) => this.model.fromJSON(tsJSON) as Model);
  }

  async update(id: number | string, entity: Model): Promise<AsyncResult<Model, any>> {
    return (
      await this.request('PUT', `${this.basePath}/${id}`, { data: this.serializeEntity(entity) })
    ).transformSuccess(async (tsJSON: JSONData) => this.model.fromJSON(tsJSON) as Model);
  }

  async delete(id: number | string): Promise<AsyncResult<null, any>> {
    return (
      await this.request('DELETE', `${this.basePath}/${id}`)
    ).transformSuccess(async () => null);
  }

  protected async request(...args: RequestArgs): Promise<AsyncResult<any, any>> {
    return (
      await this.auth.authenticatedRequestWithLogoutWhenSessionExpired(this.history, ...args)
    ).chain(AsyncResult.fromResponse)
  }

  protected serializeEntity(entity: Model): JSONData {
    const data = entity.toJSON();

    for (const field of this.assocFields) {
      if (field in data) {
        data[field] = _.map(data[field], 'id');
      }
    }

    return data;
  }
}

export class ExamTypeCRUDService extends CRUDService<ExamType> {
  model       = ExamType;
  dataKey     = 'exam_types';
  basePath    = '/admin/crud/exam_types';
  assocFields = ['time_slots'];
}

export class TimeSlotCRUDService extends CRUDService<TimeSlot> {
  model       = TimeSlot;
  dataKey     = 'time_slots';
  basePath    = '/admin/crud/time_slots';
  assocFields = ['exam_types'];
}

export class SettingCRUDService extends CRUDService<Setting> {
  model       = Setting;
  dataKey     = 'settings';
  basePath    = '/admin/crud/settings';
}
