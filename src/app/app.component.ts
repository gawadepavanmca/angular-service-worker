import { Component } from '@angular/core';
import { RegistrationFormComponent } from './registration-form/registration-form.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RegistrationFormComponent],
  template: `<app-registration-form></app-registration-form>`,
})
export class AppComponent {}
