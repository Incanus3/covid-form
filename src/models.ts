import { format, parse } from 'date-fns';

function parseTime(timeString: string) {
  return parse(timeString, 'HH:mm', new Date())
}

function formatTime(date: Date) {
  return format(date, 'HH:mm')
}

export interface JSONSerializable {
  toJSON(): JSONData;
}

export interface JSONDeserializer {
  fromJSON(data: JSONData): Entity;
}

export type Entity   = Record<string, any> & JSONSerializable;
export type JSONData = Record<string, any>;
type EntityFields    = Record<string, any>;

export class Setting implements JSONSerializable {
  key: string;
  value: any;

  constructor({ key, value }: EntityFields) {
    this.key   = key;
    this.value = value;
  }

  static fromJSON({ key, value }: JSONData): Setting {
    return new this({ key, value });
  }

  toJSON(): JSONData {
    return { key: this.key, value: this.value };
  }
}

export class ExamType implements JSONSerializable {
  id?:         number;
  description: string;

  constructor({ id, description }: EntityFields) {
    this.id          = id;
    this.description = description;
  }

  static fromJSON({ id, description }: JSONData): ExamType {
    return new this({ id, description });
  }

  toJSON(): JSONData {
    return { id: this.id, description: this.description };
  }
}

export class TimeSlot implements JSONSerializable {
  id?:              number;
  name:             string;
  startTime:        Date;
  endTime:          Date;
  limitCoefficient: number;
  examTypes:        ExamType[];

  constructor({ id, name, startTime, endTime, limitCoefficient, examTypes }: EntityFields = {}) {
    this.id               = id;
    this.name             = name;
    this.startTime        = startTime;
    this.endTime          = endTime;
    this.limitCoefficient = limitCoefficient;
    this.examTypes        = examTypes;
  }

  static fromJSON(
    { id, name, start_time, end_time, limit_coefficient, exam_types }: JSONData
  ): TimeSlot {
    return new this({
      id, name,
      startTime: parseTime(start_time),
      endTime:   parseTime(end_time),
      limitCoefficient: limit_coefficient,
      examTypes: (
        exam_types && exam_types.map((etJSON: JSONData) => ExamType.fromJSON(etJSON)) || null
      ),
    })
  }

  toJSON(): JSONData {
    const json: JSONData = {
      name:              this.name,
      start_time:        this.formattedStartTime,
      end_time:          this.formattedEndTime,
      limit_coefficient: this.limitCoefficient,
    };

    if (this.examTypes) {
      json.exam_types = this.examTypes.map((examType: ExamType) => examType.toJSON());
    }

    return json;
  }

  get formattedStartTime(): string { return formatTime(this.startTime); }
  get formattedEndTime():   string { return formatTime(this.endTime);   }
}
