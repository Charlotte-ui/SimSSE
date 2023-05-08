import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Modele } from '../../core/models/vertex/modele';
import { ModeleResolver } from '../modele.resolver';
import { Tag } from '../../core/models/vertex/tag';

@Component({
  selector: 'app-modele-dialog',
  templateUrl: './modele-dialog.component.html',
  styleUrls: ['./modele-dialog.component.less']
})
export class ModeleDialogComponent {
  form: FormGroup;
  modele!:Modele;
  edition!:boolean;
  title!:string;
  message!:string;
  alltags!:Tag[];

    constructor(private fb: FormBuilder,public dialogRef: MatDialogRef<ModeleDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: [Modele,string,Tag[],boolean] ) {}

        ngOnInit() {
      this.modele = this.data[0];
      this.message=this.data[1]
      this.alltags=this.data[2]
      this.edition = this.data[3]
      this.title = this.edition?"Modifier le modele "+this.modele.title:"Créer un nouveau modèle"
      
      this.form = this.fb.group(this.wrapArray(this.modele));

    }

      

    onNoClick(): void {
      this.dialogRef.close();
    }

    save() {
      this.dialogRef.close(this.form.value);
    }

    delete() {
      this.dialogRef.close({delete:true,id:this.modele.id});
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
