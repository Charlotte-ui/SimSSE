import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Profil } from '../../core/models/profil';
import { ProfilService } from '../../core/services/profil.service';

@Component({
  selector: 'app-profil',
  templateUrl: './profil.component.html',
  styleUrls: ['./profil.component.less'],
})
export class ProfilComponent implements OnInit {
  form: FormGroup;

  _profil!: Profil;
  get profil(): Profil {
    return this._profil;
  }
  @Input() set profil(value: Profil) {
    if (value) {
      console.log(value);
      this._profil = value;
      this.form = this.fb.group(value);
    }
  }

  @Output() newChange = new EventEmitter<boolean>();

  constructor(private fb: FormBuilder, public profilService: ProfilService) {}

  ngOnInit(): void {}

  save() {
    this.profilService.updateProfil(this.form.value);

    // TODO emit change plutot que d'enregister sur place
  }
}
