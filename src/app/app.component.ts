import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AppComponent implements OnInit {
  constructor(private fb: FormBuilder) {}
  ngOnInit(): void {
    console.log(this.form);
  }
  form = this.fb.group({
    startDate: new Date().getTime(),
  });
  minDate = '2023-06-15T13:30:00.00';
  maxDate = '2023-06-17';
  minTime = '13:30';
  maxTime = '15:00';
}
