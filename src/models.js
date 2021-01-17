import { format, parse } from 'date-fns';

function parseTime(timeString) {
  return parse(timeString, 'HH:mm', new Date())
}

function formatTime(date) {
  return format(date, 'HH:mm')
}

export class ExamType {
  constructor({ id, description }) {
    this.id          = id;
    this.description = description;
  }

  static fromJSON({ id, description }) {
    return new this({ id, description });
  }

  toJSON() {
    return { id: this.id, description: this.description };
  }
}

export class TimeSlot {
  constructor({ id, name, startTime, endTime, limitCoefficient, examTypes }) {
    this.id               = id;
    this.name             = name;
    this.startTime        = startTime;
    this.endTime          = endTime;
    this.limitCoefficient = limitCoefficient;
    this.examTypes        = examTypes;
  }

  static fromJSON({ id, name, start_time, end_time, limit_coefficient, exam_types }) {
    return new this({
      id, name,
      startTime: parseTime(start_time),
      endTime:   parseTime(end_time),
      limitCoefficient: limit_coefficient,
      examTypes: exam_types && exam_types.map((etJSON) => ExamType.fromJSON(etJSON)) || null,
    })
  }

  toJSON() {
    let json = {
      name:              this.name,
      start_time:        this.formattedStartTime,
      end_time:          this.formattedEndTime,
      limit_coefficient: this.limitCoefficient,
    };

    if (this.examTypes) {
      json.exam_types = this.examTypes.map((examType) => examType.toJSON());
    }

    return json;
  }

  get formattedStartTime() { return formatTime(this.startTime) }
  get formattedEndTime()   { return formatTime(this.endTime) }
}
