import {Routes} from '@angular/router';
import {LoginComponent} from './components/login/login.component';
import {RegistroComponent} from './components/usuario/registro/registro';
import {authGuard} from './guards/auth.guard';
import {Catalogo} from './components/produc-predisenyado/catalogo/catalogo';
import {DetalleProductoPredis} from './components/produc-predisenyado/prod.pred.detalle/prod.pred.detalle';
import {CarritoComponent} from './components/carrito/carrito';
import {PedidosListaComponent} from './components/pedidos/pedido-lista-component/pedido-lista-component';
import {UsuarioListaComponent} from './components/usuario/usuario-lista/usuario-lista';
import {EditProdPredis} from './components/produc-predisenyado/edit-prod-predis/edit-prod-predis';
import {EditUsuarioComponent} from './components/usuario/edit-usuario/edit-usuario';
import {MisPedidosComponent} from './components/pedidos/mis-pedidos/mis-pedidos';
import {AdminMaterialesComponent} from './components/materiales/materiales';
import {AdminTecnologiasComponent} from './components/tecnologias/tecnologias';
import {CrearProdPredis} from './components/produc-predisenyado/crear-prod-predis/crear-prod-predis';
import {PedidoPersonalizadoComponent} from './components/solicitud-personalizada/solicitud-personalizada';

export const routes: Routes = [
  // --- RUTAS ABIERTAS (Públicas) ---
  {path: 'login', component: LoginComponent},
  {path: 'registro', component: RegistroComponent},
  {path: 'productos', component: Catalogo},
  {path: 'carrito', component: CarritoComponent},

  // Aquí está la clave: El usuario normal ve los materiales aquí
  {path: 'materiales', component: AdminMaterialesComponent},

  // --- RUTAS DE USUARIO LOGUEADO (Cualquier rol) ---
  {path: 'mis-pedidos', component: MisPedidosComponent, canActivate: [authGuard]},

  // --- RUTAS DE ADMINISTRACIÓN (Protegidas) ---
  // Idealmente aquí usarías un adminGuard en lugar de authGuard
  {path: 'pedidos', component: PedidosListaComponent, canActivate: [authGuard]},
  {path: 'admin/usuarios', component: UsuarioListaComponent, canActivate: [authGuard]},
  {path: 'admin/usuarios/:id/editar', component: EditUsuarioComponent, canActivate: [authGuard]},
  {path: 'admin/usuarios/nuevo', component: EditUsuarioComponent, canActivate: [authGuard]},

  // Pedidos personalizados
  // En app.routes.ts
  {path: 'pedido-personalizado', component: PedidoPersonalizadoComponent, canActivate: [authGuard]},


  // Gestión de productos
  {path: 'productos/nuevo', component: CrearProdPredis, canActivate: [authGuard]}, // 1º LA ESPECÍFICA
  {path: 'productos/:id/editar', component: EditProdPredis, canActivate: [authGuard]}, // 2º LA DINÁMICA
  {path: 'productos/:id', component: DetalleProductoPredis},

  // Gestión de tecnologías
  {path: 'tecnologias', component: AdminTecnologiasComponent},

  // --- REDIRECCIONES Y FALLBACKS ---
  {path: '', redirectTo: 'productos', pathMatch: 'full'},
  {path: '**', redirectTo: 'productos'}
];
