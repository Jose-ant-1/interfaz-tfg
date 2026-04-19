import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegistroComponent } from './components/registro/registro';
import { authGuard } from './guards/auth.guard';
import { Catalogo } from './components/catalogo/catalogo';
import { DetalleProductoPredis } from './components/prod.pred.detalle/prod.pred.detalle';
import { CarritoComponent } from './components/carrito/carrito';
import { PedidosListaComponent } from './components/pedido-lista-component/pedido-lista-component';
import { UsuarioListaComponent } from './components/usuario-lista/usuario-lista';
import { EditProdPredis } from './components/edit-prod-predis/edit-prod-predis';
import { EditUsuarioComponent } from './components/edit-usuario/edit-usuario';
import { MisPedidosComponent } from './components/mis-pedidos/mis-pedidos';
import { AdminMaterialesComponent } from './components/materiales/materiales';
import {AdminTecnologiasComponent} from './components/tecnologias/tecnologias';

export const routes: Routes = [
  // --- RUTAS ABIERTAS (Públicas) ---
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },
  { path: 'productos', component: Catalogo },
  { path: 'productos/:id', component: DetalleProductoPredis },
  { path: 'carrito', component: CarritoComponent },

  // Aquí está la clave: El usuario normal ve los materiales aquí
  { path: 'materiales', component: AdminMaterialesComponent },

  // --- RUTAS DE USUARIO LOGUEADO (Cualquier rol) ---
  { path: 'mis-pedidos', component: MisPedidosComponent, canActivate: [authGuard] },

  // --- RUTAS DE ADMINISTRACIÓN (Protegidas) ---
  // Idealmente aquí usarías un adminGuard en lugar de authGuard
  { path: 'pedidos', component: PedidosListaComponent, canActivate: [authGuard] },
  { path: 'admin/usuarios', component: UsuarioListaComponent, canActivate: [authGuard] },
  { path: 'admin/usuarios/:id/editar', component: EditUsuarioComponent, canActivate: [authGuard] },
  { path: 'admin/usuarios/nuevo', component: EditUsuarioComponent, canActivate: [authGuard] },

  // Gestión de productos
  { path: 'productos/nuevo', component: EditProdPredis, canActivate: [authGuard] },
  { path: 'productos/:id/editar', component: EditProdPredis, canActivate: [authGuard] },

  // Gestión de tecnologías
  { path: 'admin/tecnologias', component: AdminTecnologiasComponent },

  // Gestión de materiales/tecnologías (si decides separar la edición de la vista,
  // pero por ahora usamos el mismo componente)
  { path: 'admin/materiales', component: AdminMaterialesComponent, canActivate: [authGuard] },

  // --- REDIRECCIONES Y FALLBACKS ---
  { path: '', redirectTo: 'productos', pathMatch: 'full' },
  { path: '**', redirectTo: 'productos' }
];
