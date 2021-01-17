import { format, parse } from 'date-fns';

function parseTime(timeString) {
  return parse(timeString, 'HH:mm', new Date())
}

function formatTime(date) {
  return format(date, 'HH:mm')
}

export class TimeSlot {
  constructor({ id, name, startTime, endTime, limitCoefficient }) {
    this.id               = id;
    this.name             = name;
    this.startTime        = startTime;
    this.endTime          = endTime;
    this.limitCoefficient = limitCoefficient;
  }

  static fromJSON({ id, name, start_time, end_time, limit_coefficient }) {
    return new this({
      id, name,
      startTime: parseTime(start_time),
      endTime:   parseTime(end_time),
      limitCoefficient: limit_coefficient,
    })
  }

  toJSON() {
    return {
      name:              this.name,
      start_time:        this.formattedStartTime,
      end_time:          this.formattedEndTime,
      limit_coefficient: this.limitCoefficient
    };
  }

  get formattedStartTime() { return formatTime(this.startTime) }
  get formattedEndTime()   { return formatTime(this.endTime) }
}
