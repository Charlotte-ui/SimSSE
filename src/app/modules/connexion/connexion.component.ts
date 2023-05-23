import { Component, OnInit } from '@angular/core';
import { FirebaseService } from '../../services/firebase.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthenticationService } from '../../services/authentication.service';

@Component({
  selector: 'app-connexion',
  templateUrl: './connexion.component.html',
  styleUrls: ['./connexion.component.less'],
})
export class ConnexionComponent implements OnInit {
  rows = [1, 2, 3, 4,5];
  cols = [1, 2, 3, 4];

  error: boolean = false;

  loginFormGroup = this.form.group({
    pseudo: ['', [Validators.required]],
    password: ['', Validators.required],
  });

  constructor(
    private form: FormBuilder,
    public firebaseService: FirebaseService,
    public authentificationService: AuthenticationService,
    private router: Router
  ) {}

  ngOnInit(): void {}

  onSubmit() {
    const pseudo = this.loginFormGroup.get('pseudo')?.value as string;
    const password = this.loginFormGroup.get('password')?.value as string;

    console.log('connexion with :' + pseudo + ', ' + password);

    // root simsse
    this.authentificationService.login(pseudo, password).subscribe(
      (response: any) => {
        console.log('response ', response);
        this.router.navigate(['/accueil']);
      },
      (error) => {
        this.error = true;
        console.log('error ', error);
      }
    );
  }
}
