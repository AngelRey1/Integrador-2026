import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { NbToastrService } from '@nebular/theme';

interface ConfirmationToken {
  email: string;
  paymentIntentId: string;
  reservaId?: string;
  entrenadorId?: string;
  createdAt: any;
  expiresAt: Date;
  used: boolean;
}

@Component({
  selector: 'ngx-confirm',
  templateUrl: './confirm.component.html',
  styleUrls: ['./confirm.component.scss']
})
export class ConfirmComponent implements OnInit {
  loading = true;
  tokenValid = false;
  tokenData: ConfirmationToken | null = null;
  
  // Formulario de registro
  showRegisterForm = false;
  registerForm = {
    nombre: '',
    apellido: '',
    password: '',
    confirmPassword: ''
  };
  registering = false;

  // Usuario ya existe
  userExists = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private firestore: AngularFirestore,
    private afAuth: AngularFireAuth,
    private toastr: NbToastrService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      if (token) {
        this.validateToken(token);
      } else {
        this.loading = false;
        this.toastr.danger('Token no proporcionado', 'Error');
      }
    });
  }

  async validateToken(token: string): Promise<void> {
    try {
      const tokenDoc = await this.firestore.collection('confirmation_tokens').doc(token).get().toPromise();
      
      if (!tokenDoc || !tokenDoc.exists) {
        this.loading = false;
        this.tokenValid = false;
        this.toastr.danger('Token inválido o expirado', 'Error');
        return;
      }

      const data = tokenDoc.data() as ConfirmationToken;
      
      // Verificar si el token ya fue usado
      if (data.used) {
        this.loading = false;
        this.tokenValid = false;
        this.toastr.warning('Este enlace ya fue utilizado', 'Token usado');
        return;
      }

      // Verificar si expiró
      const expiresAt = data.expiresAt instanceof Date ? data.expiresAt : (data.expiresAt as any).toDate();
      if (new Date() > expiresAt) {
        this.loading = false;
        this.tokenValid = false;
        this.toastr.danger('Este enlace ha expirado', 'Expirado');
        return;
      }

      this.tokenData = data;
      this.tokenValid = true;

      // Verificar si el usuario ya existe
      await this.checkUserExists(data.email);
      
      this.loading = false;
    } catch (error) {
      console.error('Error validando token:', error);
      this.loading = false;
      this.tokenValid = false;
      this.toastr.danger('Error al validar el token', 'Error');
    }
  }

  async checkUserExists(email: string): Promise<void> {
    try {
      // Buscar en la colección users por email
      const usersSnapshot = await this.firestore.collection('users', ref => 
        ref.where('email', '==', email).limit(1)
      ).get().toPromise();

      if (usersSnapshot && !usersSnapshot.empty) {
        this.userExists = true;
      } else {
        this.userExists = false;
        this.showRegisterForm = true;
      }
    } catch (error) {
      console.error('Error verificando usuario:', error);
      this.showRegisterForm = true;
    }
  }

  async loginExistingUser(): Promise<void> {
    // Redirigir al login con el email pre-llenado
    this.router.navigate(['/auth/login'], { 
      queryParams: { email: this.tokenData?.email }
    });
  }

  async register(): Promise<void> {
    if (this.registering) return;

    // Validaciones
    if (!this.registerForm.nombre || !this.registerForm.apellido) {
      this.toastr.warning('Por favor completa todos los campos', 'Campos requeridos');
      return;
    }

    if (this.registerForm.password.length < 6) {
      this.toastr.warning('La contraseña debe tener al menos 6 caracteres', 'Contraseña débil');
      return;
    }

    if (this.registerForm.password !== this.registerForm.confirmPassword) {
      this.toastr.warning('Las contraseñas no coinciden', 'Error');
      return;
    }

    this.registering = true;

    try {
      // Crear usuario en Firebase Auth
      const userCredential = await this.afAuth.createUserWithEmailAndPassword(
        this.tokenData!.email,
        this.registerForm.password
      );

      if (userCredential.user) {
        // Crear documento de usuario en Firestore
        await this.firestore.collection('users').doc(userCredential.user.uid).set({
          email: this.tokenData!.email,
          nombre: this.registerForm.nombre,
          apellidoPaterno: this.registerForm.apellido,
          tipo: 'cliente',
          activo: true,
          fechaRegistro: new Date(),
          paymentVerified: true, // Verificado por pago
          paymentIntentId: this.tokenData?.paymentIntentId
        });

        // Marcar token como usado
        const token = this.route.snapshot.queryParams['token'];
        await this.firestore.collection('confirmation_tokens').doc(token).update({
          used: true,
          usedAt: new Date(),
          userId: userCredential.user.uid
        });

        this.toastr.success('¡Cuenta creada exitosamente!', 'Bienvenido');
        
        // Redirigir al dashboard del cliente
        this.router.navigate(['/pages/cliente/dashboard']);
      }
    } catch (error: any) {
      console.error('Error al registrar:', error);
      
      if (error.code === 'auth/email-already-in-use') {
        this.toastr.warning('Ya existe una cuenta con este email. Inicia sesión.', 'Usuario existente');
        this.userExists = true;
        this.showRegisterForm = false;
      } else {
        this.toastr.danger(error.message || 'Error al crear la cuenta', 'Error');
      }
    } finally {
      this.registering = false;
    }
  }

  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
}
