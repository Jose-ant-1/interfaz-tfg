import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { RegistroComponent } from './components/usuario/registro/registro';
import { authGuard } from './guards/auth.guard';
import { Catalogo } from './components/produc-predisenyado/catalogo/catalogo';
import { DetalleProductoPredis } from './components/produc-predisenyado/prod.pred.detalle/prod.pred.detalle';
import { CarritoComponent } from './components/carrito/carrito';
import { PedidosListaComponent } from './components/pedidos/pedido-lista/pedido-lista';
import { UsuarioListaComponent } from './components/usuario/usuario-lista/usuario-lista';
import { EditProdPredis } from './components/produc-predisenyado/edit-prod-predis/edit-prod-predis';
import { EditUsuarioComponent } from './components/usuario/edit-usuario/edit-usuario';
import { MisPedidosComponent } from './components/pedidos/mis-pedidos/mis-pedidos';
import { AdminMaterialesComponent } from './components/materiales/materiales';
import { AdminTecnologiasComponent } from './components/tecnologias/tecnologias';
import { CrearProdPredis } from './components/produc-predisenyado/crear-prod-predis/crear-prod-predis';
import { PedidoPersonalizadoComponent } from './components/solicitud-personalizada/solicitud-personalizada';
import { DetallePedidoComponent } from './components/pedidos/detalle-pedido/detalle-pedido';
import { PagoComponent } from './components/pago/pago';
import { MiPerfilComponent } from './components/usuario/mi-perfil/mi-perfil';
import { QuienesSomosComponent } from './components/quienes-somos/quienes-somos';

export const routes: Routes = [
  // --- RUTAS ABIERTAS (Públicas) ---
  { path: 'login', component: Login },
  { path: 'registro', component: RegistroComponent },
  { path: 'productos', component: Catalogo },
  { path: 'carrito', component: CarritoComponent },
  { path: 'quienes-somos', component: QuienesSomosComponent, title: 'Quiénes Somos | Tu Tienda' },
  { path: 'materiales', component: AdminMaterialesComponent },
  { path: 'tecnologias', component: AdminTecnologiasComponent },

  // --- RUTAS DE USUARIO LOGUEADO (Cualquier rol) ---
  { path: 'mis-pedidos', component: MisPedidosComponent, canActivate: [authGuard] },

  // --- RUTAS DE ADMINISTRACIÓN (Protegidas) ---
  // Idealmente aquí usarías un adminGuard en lugar de authGuard
  { path: 'pedidos', component: PedidosListaComponent, canActivate: [authGuard] },
  { path: 'admin/usuarios', component: UsuarioListaComponent, canActivate: [authGuard] },
  { path: 'admin/usuarios/:id/editar', component: EditUsuarioComponent, canActivate: [authGuard] },
  { path: 'admin/usuarios/nuevo', component: EditUsuarioComponent, canActivate: [authGuard] },

  // Pedidos personalizados
  {
    path: 'pedido-personalizado',
    component: PedidoPersonalizadoComponent,
    canActivate: [authGuard],
  },
  { path: 'pedidos/:id', component: DetallePedidoComponent },

  // Gestión de productos
  { path: 'productos/nuevo', component: CrearProdPredis, canActivate: [authGuard] }, // 1º LA ESPECÍFICA
  { path: 'productos/:id/editar', component: EditProdPredis, canActivate: [authGuard] }, // 2º LA DINÁMICA
  { path: 'productos/:id', component: DetalleProductoPredis },

  // Pago
  { path: 'pago', component: PagoComponent, canActivate: [authGuard] },
  { path: 'pago/:id', component: PagoComponent, canActivate: [authGuard] }, // Nueva ruta para personalizados

  // Mi perfil
  { path: 'mi-perfil', component: MiPerfilComponent, canActivate: [authGuard] },

  // --- REDIRECCIONES Y FALLBACKS ---
  { path: '', redirectTo: 'productos', pathMatch: 'full' },
  { path: '**', redirectTo: 'productos' },
];
