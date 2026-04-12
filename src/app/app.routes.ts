import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import {authGuard} from './guards/auth.guard';
import {Catalogo} from './components/catalogo/catalogo';
import {DetalleProductoPredis} from './components/prod.pred.detalle/prod.pred.detalle';
import {PedidosListaComponent} from './components/pedido-lista-component/pedido-lista-component';
import {UsuarioListaComponent} from './components/usuario-lista/usuario-lista';
import {EditProdPredis} from './components/edit-prod-predis/edit-prod-predis';
import {EditUsuarioComponent} from './components/edit-usuario/edit-usuario';
import {CarritoComponent} from './components/carrito/carrito';
import {RegistroComponent} from './components/registro/registro';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
   { path: 'registro', component: RegistroComponent }, // Asegúrate de crear esta ruta cuando tengas el componente

  // Rutas protegidas (Requieren Login)
  { path: 'pedidos', component: PedidosListaComponent, canActivate: [authGuard] },
  { path: 'admin/usuarios', component: UsuarioListaComponent, canActivate: [authGuard] },
  { path: 'admin/usuarios/:id/editar', component: EditUsuarioComponent, canActivate: [authGuard] },
  { path: 'admin/usuarios/nuevo', component: EditUsuarioComponent, canActivate: [authGuard] },

  // Gestión de productos (Solo Admin)
  { path: 'productos/nuevo', component: EditProdPredis, canActivate: [authGuard] },
  { path: 'productos/:id/editar', component: EditProdPredis, canActivate: [authGuard] },

  // RUTAS PÚBLICAS (Quitamos el authGuard)
  { path: 'productos', component: Catalogo },
  { path: 'productos/:id', component: DetalleProductoPredis },
  { path: 'carrito', component: CarritoComponent },

  { path: '', redirectTo: 'productos', pathMatch: 'full' },
  { path: '**', redirectTo: 'productos' },
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },
];
