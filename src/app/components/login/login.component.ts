import { Component } from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {AuthService} from '../../service/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  imports: [
    FormsModule,
    RouterLink
  ],
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email = '';
  password = '';


  constructor(private router: Router, private authService: AuthService) {}

  onSubmit() {
    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.router.navigate(['/productos']); // Solo redirige si el login fue exitoso
      },
      error: (err) => console.error('Error en login', err)
    });
  }
}
