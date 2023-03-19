import { Component, OnInit } from '@angular/core';
import { FirebaseService } from '../services/firebase.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-connexion',
  templateUrl: './connexion.component.html',
  styleUrls: ['./connexion.component.less']
})
export class ConnexionComponent implements OnInit {


  loginFormGroup = this.form.group({
    pseudo: ['', [Validators.required]],
    password: ['', Validators.required],
  });


  constructor(private router: Router,private form: FormBuilder,public firebaseService: FirebaseService) { }

  ngOnInit(): void {
  }


  onSubmit() {

    const pseudo = this.loginFormGroup.get('pseudo')?.value as string;
    const password = this.loginFormGroup.get('password')?.value as string;
        

    this.firebaseService.connexion(pseudo,password).then((success) => {
      console.log("succes");
      this.router.navigate(['/accueil']);
    })
    .catch((err) => {
      console.log("fail");
    })

  }
  

}
