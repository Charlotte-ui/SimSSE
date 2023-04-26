import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NodeDialogComponent } from '../../plastron/editeur/editeur-graphe-nodal/node-dialog/node-dialog.component';
import { Modele } from '../../core/models/modele';
import { ModeleResolver } from '../modele.resolver';

@Component({
  selector: 'app-modele-dialog',
  templateUrl: './modele-dialog.component.html',
  styleUrls: ['./modele-dialog.component.less']
})
export class ModeleDialogComponent {
  form: FormGroup;
  modele!:Modele;
  edition!:boolean;
  titre!:string;
  message!:string;
  alltags!:string[];

    constructor(private fb: FormBuilder,public dialogRef: MatDialogRef<ModeleDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: [Modele,string,string[],boolean] ) {}

        ngOnInit() {
      this.modele = this.data[0];
      this.message=this.data[1]
      this.alltags=this.data[2]
      this.edition = this.data[3]
      this.titre = this.edition?"Modifier le modele "+this.modele.titre:"Créer un nouveau modèle"
      
      this.form = this.fb.group(this.wrapArray(this.modele));

    }

      

    onNoClick(): void {
      this.dialogRef.close();
    }

    save() {
      this.dialogRef.close(this.form.value);
    }

    delete() {
      this.dialogRef.close("delete");
    }

    
    wrapArray(object){
    let clone = []
    Object.keys(object).forEach(key => {

      if (Array.isArray(object[key])) clone[key] = [structuredClone(object[key])];
      else clone[key] = structuredClone(object[key]);
      
    });

    return clone

  }


}
