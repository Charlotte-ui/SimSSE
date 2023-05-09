import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Profil } from '../../core/models/vertex/profil';
import { ProfilService } from '../../core/services/profil.service';
import { ApiService } from '../../core/services/api.service';

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

      this.form.get('age').valueChanges.subscribe((newAge:number) => {
        console.log("newAge "+newAge)
        //this.apiService.updateProprertyOfVertex(value.id,"age",newAge.toString())
        this.apiService.updateDocument(value.id,value,"Profil")
    })
    }
  }

  @Output() newChange = new EventEmitter<boolean>();

  constructor(private fb: FormBuilder, public profilService: ProfilService, public apiService:ApiService) {}

  ngOnInit(): void {}

  save() {
    this.profilService.updateProfil(this.form.value);

    // TODO emit change plutot que d'enregister sur place
  }
}
