import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import {authGuard} from './guards/auth.guard';
import {Catalogo} from './components/catalogo/catalogo';
import {DetalleProductoPredis} from './components/prod.pred.detalle/prod.pred.detalle';
import {PedidosListaComponent} from './components/pedido-lista-component/pedido-lista-component';
import {UsuarioListaComponent} from './components/usuario-lista/usuario-lista';
import {EditProdPredis} from './components/edit-prod-predis/edit-prod-predis';
import {EditUsuarioComponent} from './components/edit-usuario/edit-usuario';

export const routes: Routes = [

  { path: 'login', component: LoginComponent },

  { path: 'pedidos', component: PedidosListaComponent, canActivate: [authGuard] },

  { path: 'admin/usuarios', component: UsuarioListaComponent, canActivate: [authGuard] },
  { path: 'admin/usuarios/:id/editar', component: EditUsuarioComponent, canActivate: [authGuard] },
  { path: 'admin/usuarios/nuevo', component: EditUsuarioComponent, canActivate: [authGuard] },

  { path: 'productos', component: Catalogo, canActivate:[authGuard] },
  { path: 'productos/nuevo', component: EditProdPredis, canActivate: [authGuard] },
  { path: 'productos/:id', component: DetalleProductoPredis, canActivate: [authGuard] },
  { path: 'productos/:id/editar', component: EditProdPredis, canActivate: [authGuard] },

  { path: '', redirectTo: '/login', pathMatch: 'full' }
];
