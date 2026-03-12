import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import {authGuard} from './guards/auth.guard';
import {Catalogo} from './components/catalogo/catalogo';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'productos', component: Catalogo, canActivate: [authGuard] }
];
