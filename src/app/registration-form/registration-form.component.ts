
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-registration-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './registration-form.component.html',
  styleUrls: ['./registration-form.component.css']
})
export class RegistrationFormComponent implements OnInit, OnDestroy {
  form: FormGroup;

  private bc: BroadcastChannel | null = null;
  private localStorageKey = 'TabSyncX_registrationForm';

  constructor() {
    this.form = new FormGroup({
      name: new FormControl(''),
      email: new FormControl(''),
      password: new FormControl(''),
    });
  }

  ngOnInit(): void {
    // Load from localStorage
    const saved = localStorage.getItem(this.localStorageKey);
    if (saved) {
      this.form.setValue(JSON.parse(saved));
    }

    // Setup BroadcastChannel
    if ('BroadcastChannel' in window) {
      this.bc = new BroadcastChannel('TabSyncX_channel');

      this.bc.onmessage = (ev) => {
        if (ev.data?.type === 'form-update') {
          const current = this.form.value;
          const incoming = ev.data.payload;
          if (JSON.stringify(current) !== JSON.stringify(incoming)) {
            this.form.setValue(incoming, { emitEvent: false });
          }
        }
      };
    }

    // Form changes
    this.form.valueChanges.subscribe(value => {
      localStorage.setItem(this.localStorageKey, JSON.stringify(value));
      if (this.bc) {
        this.bc.postMessage({ type: 'form-update', payload: value });
      }
    });

    // Fallback localStorage sync
    window.addEventListener('storage', this.storageEventListener);
  }

  storageEventListener = (event: StorageEvent) => {
    if (event.key === this.localStorageKey && event.newValue) {
      const newData = JSON.parse(event.newValue);
      if (JSON.stringify(this.form.value) !== JSON.stringify(newData)) {
        this.form.setValue(newData, { emitEvent: false });
      }
    }
  };

  onSubmit(): void {
    alert('Registration Submitted:\n' + JSON.stringify(this.form.value, null, 2));
  }

  ngOnDestroy(): void {
    if (this.bc) {
      this.bc.close();
    }
    window.removeEventListener('storage', this.storageEventListener);
  }
}
