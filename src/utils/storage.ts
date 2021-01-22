type StoredData = Record<string, any>;

export interface DataStorage {
  read():           any;
  write(data: any): void;
  clear():          void;
  isEmpty():        boolean;
  isFilled():       boolean;
}

export class JSONStorage implements DataStorage {
  storage: Storage;

  constructor(storage: Storage) { this.storage = storage }

  read     = ():                 any     => this.storage.data && JSON.parse(this.storage.data);
  write    = (data: StoredData): void    => { this.storage.data = JSON.stringify(data) };
  clear    = ():                 void    => { delete this.storage.data };
  isFilled = ():                 boolean => !!this.storage.data;
  isEmpty  = ():                 boolean => !this.isFilled();
}
