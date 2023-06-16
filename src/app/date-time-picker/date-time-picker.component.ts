import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import { format } from 'date-fns';
import {
  AbstractControl,
  ControlValueAccessor,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
  Validator,
} from '@angular/forms';
import { forwardRef } from '@angular/core';
import { DateAdapter } from '@angular/material/core';

@Component({
  selector: 'app-date-time-picker',
  templateUrl: './date-time-picker.component.html',
  styleUrls: ['./date-time-picker.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DateTimePickerComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      multi: true,
      useExisting: DateTimePickerComponent,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class DateTimePickerComponent
  implements ControlValueAccessor, OnChanges, Validator
{
  dateVal: any;
  timeVal: any;
  timeZoneOffsetHour: number;
  controlIsValid: boolean = true;
  _hour: any;
  _minHour: any;
  _maxHour: any;
  _min: any;
  _minMinute: any;
  _maxMinute: any;
  _eMinDate: number;
  _eMaxDate: number;
  isDisabled: boolean = false;
  _value: any = new Date().getTime();
  onChange: any = () => {};
  onTouch: any = () => {};

  @Input() mode: 'time' | 'date' | 'both' = 'both';
  @Input() minDate: any;
  @Input() maxDate: any;
  @Input() minTime: string;
  @Input() maxTime: string;
  @Input() timePlaceHolder: string;
  @Input() datePlaceHolder: string;
  @Input() floatLabel: boolean;

  constructor(
    private _adapter: DateAdapter<any>,
    private cd: ChangeDetectorRef
  ) {
    this._adapter.setLocale('tr');
  }

  get hour(): number {
    return this._hour;
  }

  get minHour(): number {
    return this._minHour;
  }

  get maxHour(): number {
    return this._maxHour;
  }

  set hour(val: number) {
    this._hour = val % 24;
    this._hour = this.setTwoChar(this._hour);
    if (val < 0) this._hour = 23;
  }

  set minHour(val: number) {
    this._minHour = val % 24;
    this._minHour = this.setTwoChar(this._minHour);
    if (val < 0) this._minHour = 23;
  }

  set maxHour(val: number) {
    this._maxHour = val % 24;
    this._maxHour = this.setTwoChar(this._maxHour);
    if (val < 0) this._maxHour = 23;
  }

  get minute(): number {
    return this._min;
  }

  get minMinute(): number {
    return this._minMinute;
  }

  get maxMinute(): number {
    return this._maxMinute;
  }

  set minute(val: number) {
    if (val > 59) this.hour++;
    this._min = this.setTwoChar(val % 60);
    if (val < 0) (this._min = 59), this.hour--;
  }

  set minMinute(val: number) {
    this._minMinute = val % 60;
    this._minMinute = this.setTwoChar(this._minMinute);
    if (val < 0) this._minMinute = 59;
  }

  set maxMinute(val: number) {
    this._maxMinute = val % 60;
    this._maxMinute = this.setTwoChar(this._maxMinute);
    if (val < 0) this._maxMinute = 59;
  }

  set value(val: any) {
    this.onChange(val);
    this.onTouch(val);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.minDate && this.minDate) {
      if (!this.checkDateInputValue(this.minDate))
        console.error(
          'Invalid minDate Format, use yyyy-MM-dd , yyyy-MM-ddTHH:mm:ss'
        );
      if (this.minDate.includes('T')) this.minDate = new Date(this.minDate);
      else this.minDate = new Date(new Date(this.minDate).setHours(0));
      this._eMinDate = this.minDate.getTime();
    }

    if (changes.maxDate && this.maxDate) {
      if (!this.checkDateInputValue(this.maxDate))
        console.error(
          'Invalid maxDate Format, use yyyy-MM-dd , yyyy-MM-ddTHH:mm:ss'
        );
      if (this.maxDate.includes('T')) this.maxDate = new Date(this.maxDate);
      else {
        this.maxDate = new Date(new Date(this.maxDate).setHours(23, 30, 59));
      }
      this.maxDate = new Date(this.maxDate);
      this._eMaxDate = this.maxDate.getTime();
    }

    if (changes.minTime && this.minTime) {
      if (!this.checkTimeInputValue(this.minTime))
        console.error('Invalid minTime Format, use HH:mm , HH:mm:ss');
      this.minHour = this.getHourFromTimeString(this.minTime, false);
      this.minMinute = this.getMinuteFromTimeString(this.minTime);
    }

    if (changes.maxTime && this.maxTime) {
      if (!this.checkTimeInputValue(this.maxTime))
        console.error('Invalid maxTime Format, use HH:mm , HH:mm:ss');
      this.maxHour = this.getHourFromTimeString(this.maxTime, false);
      this.maxMinute = this.getMinuteFromTimeString(this.maxTime);
    }
  }

  validate(control: AbstractControl<any, any>): ValidationErrors {
    let value = control.value;
    if (this.mode == 'date' || this.mode == 'both') {
      if (this._eMaxDate && value > this._eMaxDate) {
        this.controlIsValid = false;
        return this.maxDateValidation();
      }

      if (this._eMinDate && value < this._eMinDate) {
        console.log(this._eMinDate);
        console.log(value);
        this.controlIsValid = false;
        return this.minDateValidation();
      }
      this.controlIsValid = true;
    }
  }

  maxDateValidation(): ValidationErrors {
    return {
      maxDate: 'Max Date is ' + format(this.maxDate, 'yyyy-MM-dd HH:mm'),
    };
  }

  minDateValidation(): ValidationErrors {
    return {
      minDate: 'Min Date is ' + format(this.minDate, 'yyyy-MM-dd HH:mm'),
    };
  }

  setTwoChar(val) {
    return val.toString().length == 2 ? val.toString() : '0' + val.toString();
  }

  onIncreasedHour() {
    this.hour++;
    this.checkMinMaxDateTime(this.hour, this.minute);
    this.timeVal = this.setTime(this.hour, this.minute);
    this.getTime();
  }

  onDecreaseHour() {
    this.hour--;
    this.checkMinMaxDateTime(this.hour, this.minute);
    this.timeVal = this.setTime(this.hour, this.minute);
    this.getTime();
  }

  onIncreasedMin() {
    this.minute++;
    this.checkMinMaxDateTime(this.hour, this.minute);
    this.timeVal = this.setTime(this.hour, this.minute);
    this.getTime();
  }

  onDecreaseMin() {
    this.minute--;
    this.checkMinMaxDateTime(this.hour, this.minute);
    this.timeVal = this.setTime(this.hour, this.minute);
    this.getTime();
  }

  setTime(hour, minute) {
    return hour.toString() + ':' + minute.toString();
  }

  checkMinMaxDateTime(hour, minute) {
    if (this.mode == 'time') {
      if (this.minHour && hour < this.minHour) {
        this.hour = this.minHour;
      }

      if (this.minHour && hour == this.minHour && minute < this.minMinute) {
        this.minute = this.minMinute;
      }

      if (this.maxHour && hour == this.maxHour && minute > this.maxMinute) {
        this.minute = this.maxMinute;
      }

      if (this.maxHour && hour > this.maxHour) {
        this.hour = this.maxHour;
      }
    } else if (this.mode == 'both') {
    }
  }

  writeValue(obj: any): void {
    this.timeZoneOffsetHour = obj
      ? Math.abs(new Date(obj).getTimezoneOffset()) / 60
      : Math.abs(new Date().getTimezoneOffset()) / 60;

    if (obj && obj != '') this._value = new Date(obj).toISOString();
    else this._value = new Date().toISOString();

    let date = this.getFormattedDateFromDateString(this._value);

    let time = this.getFormattedTimeFromDateString(this._value);

    this.dateVal = this._value ? new Date(date) : new Date();

    console.log(this.dateVal);

    this.hour = this.getHourFromTimeString(time, false);

    this.minute = this.getMinuteFromTimeString(time);

    this.timeVal = this.getFormattedTime(this.hour, this.minute);

    setTimeout(() => {
      this.getTime();
    });

    this.cd.detectChanges();
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  getTime() {
    this.timeVal = this.getFormattedTime(this.hour, this.minute);
    this.dateVal = this.getFormattedDate(this.dateVal);
    this._value = this.getFormattedDateTime(this.dateVal, this.timeVal);
    if (this.mode == 'time') {
      this.value = this.timeVal;
    } else {
      this.value = this._value;
    }
  }

  onChangedTime(event) {
    if (event.length == 5) {
      this.hour = this.getHourFromTimeString(event, false);
      this.minute = this.getMinuteFromTimeString(event);
      this.checkMinMaxDateTime(this.hour, this.minute);
      this.timeVal = event;
      this.getTime();
    }
  }

  onChangedDate(event) {
    this.dateVal = this.getFormattedDate(event);
    this.getTime();
  }

  getFormattedDate(date) {
    return format(new Date(date), 'yyyy-MM-dd');
  }

  getFormattedTime(hour, minute) {
    return hour + ':' + minute + ':00';
  }

  getFormattedDateTime(dateValue, timeValue) {
    return new Date(dateValue + 'T' + timeValue).getTime();
  }

  getFormattedDateFromDateString(date: string) {
    return date.split('T')[0];
  }

  getFormattedTimeFromDateString(date: string) {
    return date.split('T')[1];
  }

  getHourFromTimeString(time: string, addTimeZone: boolean) {
    return (
      parseInt(time.split(':')[0]) + (addTimeZone ? this.timeZoneOffsetHour : 0)
    );
  }

  getMinuteFromTimeString(time: string) {
    return parseInt(time.split(':')[1]);
  }

  checkDateInputValue(value) {
    return (
      this.dateRegex1.test(value) ||
      this.dateRegex2.test(value) ||
      this.dateRegex3.test(value)
    );
  }

  checkTimeInputValue(value) {
    return this.timeRegex1.test(value) || this.timeRegex2.test(value);
  }

  // 'yyyy-MM-ddTHH:mm:ss'
  dateRegex1 = new RegExp(
    /(^((\d{4}-(((0[13578]|[1][02])-(0[1-9]|[1-2]\d|3[01]))))|((\d{4}-(((0[469]|[1][1])-(0[1-9]|[1-2]\d|[3][0])))))|((\d{4}-(0[2]-(0[1-9]|[1-2]\d)))))T(([01]\d|2[0-3]):([0-5]\d):([0-5]\d)))/gm
  );

  // 'yyyy-MM-ddTHH:mm'
  dateRegex2 = new RegExp(
    /(^((\d{4}-(((0[13578]|[1][02])-(0[1-9]|[1-2]\d|3[01]))))|((\d{4}-(((0[469]|[1][1])-(0[1-9]|[1-2]\d|[3][0])))))|((\d{4}-(0[2]-(0[1-9]|[1-2]\d)))))T(([01]\d|2[0-3]):([0-5]\d)))/gm
  );

  // 'yyyy-MM-dd'
  dateRegex3 = new RegExp(/^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/);

  //HH:mm
  timeRegex1 = new RegExp(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/);

  //HH:mm:ss
  timeRegex2 = new RegExp(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/);
}
