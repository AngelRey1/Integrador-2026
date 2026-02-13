import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthFirebaseService } from '../../@core/services/auth-firebase.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'ngx-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  form: FormGroup;
  loading = false;
  errorMessage = '';
  successMessage = '';
  private requestedRole: string = 'CLIENTE'; // Por defecto cliente
  isClienteRegistro: boolean = true; // Por defecto registro de cliente

  constructor(
    private fb: FormBuilder,
    private authFirebase: AuthFirebaseService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      terminos: [false, Validators.requiredTrue]
    }, { validators: this.passwordsMatch });
  }

  ngOnInit() {
    // Leer el rol del query param
    this.route.queryParams.subscribe(params => {
      this.requestedRole = params['rol'] || 'CLIENTE';
      this.isClienteRegistro = (this.requestedRole !== 'ENTRENADOR');
    });
  }

  passwordsMatch(group: FormGroup) {
    const p = group.get('password')?.value;
    const c = group.get('confirmPassword')?.value;
    return p === c ? null : { mismatch: true };
  }

  async submit() {
    if (this.form.invalid) {
      Object.keys(this.form.controls).forEach(key => {
        this.form.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const { nombre, apellido, email, password } = this.form.value;
    const rol = this.requestedRole; // Usar el rol del query param

    const result = await this.authFirebase.register({
      nombre,
      apellido,
      email,
      password,
      rol
    });

    this.loading = false;

    if (result.success) {
      this.successMessage = result.message;
      
      // Redirigir según el rol
      setTimeout(() => {
        if (rol === 'ENTRENADOR') {
          // Entrenadores requieren aprobación
          this.router.navigate(['/auth/login'], {
            queryParams: { email, pending: true, rol: 'ENTRENADOR' }
          });
        } else {
          // Clientes pueden entrar directo
          this.router.navigate(['/auth/login'], {
            queryParams: { email, registered: true, rol: 'CLIENTE' }
          });
        }
      }, 3000);
    } else {
      this.errorMessage = result.message;
    }
  }
}

