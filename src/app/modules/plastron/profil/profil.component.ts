import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Profil } from '../../../models/vertex/profil';
import { ProfilService } from '../../../services/profil.service';
import { ApiService } from '../../../services/api.service';

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
      this._profil = value;
      this.form = this.fb.group(value);

      this.form.get('age').valueChanges.subscribe((newAge: number) => {
        this.save(newAge);
      });
    }
  }

  @Output() newChange = new EventEmitter<boolean>();

  constructor(
    private fb: FormBuilder,
    public profilService: ProfilService,
    public apiService: ApiService
  ) {}

  ngOnInit(): void {}

  // TODO emit change plutot que d'enregister sur place ?
  save(newAge: number) {
    this.profilService.updateProfil(this.form.value);
    console.log('newAge ' + newAge);
    //this.apiService.updateProprertyOfVertex(value.id,"age",newAge.toString())
  //  this.apiService.updateDocument(this.profil.id, this.profil, 'Profil');
  }
}
