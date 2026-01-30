# 🔥 Configuración de Firebase

## 📋 Pasos para Configurar Firebase

### 1. Crear un Proyecto en Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Haz clic en "Agregar proyecto" o "Add project"
3. Ingresa el nombre del proyecto (ej: "sportconnect")
4. Sigue los pasos del asistente
5. **NO** habilites Google Analytics por ahora (opcional)

### 2. Obtener las Credenciales de Firebase

1. En la consola de Firebase, ve a **Configuración del proyecto** (ícono de engranaje)
2. Desplázate hacia abajo hasta "Tus aplicaciones"
3. Haz clic en el ícono de **Web** (`</>`)
4. Registra tu app con un nombre (ej: "SportConnect Web")
5. **Copia las credenciales** que aparecen

### 3. Configurar las Credenciales en el Proyecto

Edita los archivos de environment con tus credenciales:

**`src/environments/environment.ts`** (Desarrollo):
```typescript
firebase: {
  apiKey: 'TU_API_KEY_AQUI',
  authDomain: 'tu-proyecto.firebaseapp.com',
  projectId: 'tu-proyecto-id',
  storageBucket: 'tu-proyecto.appspot.com',
  messagingSenderId: '123456789',
  appId: '1:123456789:web:abcdef'
}
```

**`src/environments/environment.prod.ts`** (Producción):
```typescript
// Usa las mismas credenciales o crea un proyecto separado para producción
```

### 4. Configurar Firestore Database

1. En Firebase Console, ve a **Firestore Database**
2. Haz clic en "Crear base de datos"
3. Elige modo de inicio:
   - **Modo de prueba** (para desarrollo - permite lectura/escritura por 30 días)
   - **Modo de producción** (requiere reglas de seguridad)
4. Selecciona una ubicación (elige la más cercana a tus usuarios)
5. Haz clic en "Habilitar"

### 5. Configurar Reglas de Seguridad (Importante)

En Firestore Database, ve a la pestaña **Reglas** y configura:

**Para desarrollo (temporal):**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.time < timestamp.date(2025, 12, 31);
    }
  }
}
```

**Para producción (más seguro):**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Solo usuarios autenticados pueden leer/escribir
    match /entrenadores/{entrenadorId} {
      allow read: if true; // Todos pueden leer
      allow write: if request.auth != null; // Solo autenticados pueden escribir
    }
    
    match /reservas/{reservaId} {
      allow read, write: if request.auth != null;
    }
    
    match /usuarios/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 6. Configurar Authentication (Opcional pero Recomendado)

1. En Firebase Console, ve a **Authentication**
2. Haz clic en "Comenzar"
3. Habilita los métodos de autenticación que necesites:
   - **Correo electrónico/Contraseña** (recomendado)
   - **Google** (opcional)
   - **Facebook** (opcional)

## 🚀 Uso del Servicio Firebase

### Ejemplo: Obtener Entrenadores

```typescript
import { EntrenadoresFirebaseService } from '@core/services/entrenadores-firebase.service';

constructor(private entrenadoresService: EntrenadoresFirebaseService) {}

ngOnInit() {
  // Obtener todos los entrenadores
  this.entrenadoresService.getAllEntrenadores().subscribe(entrenadores => {
    console.log('Entrenadores:', entrenadores);
  });
  
  // Obtener entrenadores por deporte
  this.entrenadoresService.getEntrenadoresByDeporte('Fútbol').subscribe(entrenadores => {
    console.log('Entrenadores de fútbol:', entrenadores);
  });
}
```

### Ejemplo: Crear un Entrenador

```typescript
const nuevoEntrenador = {
  nombre: 'Juan Pérez',
  deporte: 'Fútbol',
  precio: 500,
  estrellas: 5,
  foto: 'https://...',
  descripcion: 'Entrenador profesional...'
};

this.entrenadoresService.crearEntrenador(nuevoEntrenador)
  .then(docRef => {
    console.log('Entrenador creado con ID:', docRef.id);
  })
  .catch(error => {
    console.error('Error al crear:', error);
  });
```

### Ejemplo: Usar el Servicio Base de Firebase

```typescript
import { FirebaseService } from '@core/services/firebase.service';

constructor(private firebase: FirebaseService) {}

// Crear un documento
this.firebase.createDocument('reservas', {
  entrenadorId: '123',
  clienteId: '456',
  fecha: new Date(),
  estado: 'pendiente'
});

// Obtener una colección
this.firebase.getCollection('reservas').subscribe(reservas => {
  console.log('Reservas:', reservas);
});
```

## 📚 Estructura de Datos Recomendada

### Colección: `entrenadores`
```javascript
{
  id: "auto-generado",
  nombre: "Juan Pérez",
  deporte: "Fútbol",
  precio: 500,
  estrellas: 5,
  reviews: 120,
  foto: "https://...",
  descripcion: "...",
  verificado: true,
  fechaCreacion: Timestamp,
  fechaActualizacion: Timestamp
}
```

### Colección: `reservas`
```javascript
{
  id: "auto-generado",
  entrenadorId: "entrenador123",
  clienteId: "cliente456",
  fecha: Timestamp,
  hora: "10:00",
  duracion: 60,
  estado: "pendiente" | "confirmada" | "cancelada",
  precio: 500,
  fechaCreacion: Timestamp
}
```

### Colección: `usuarios`
```javascript
{
  id: "userId (mismo que auth.uid)",
  email: "usuario@example.com",
  nombre: "Nombre Usuario",
  tipo: "cliente" | "entrenador" | "admin",
  foto: "https://...",
  fechaCreacion: Timestamp
}
```

## 🔐 Autenticación con Firebase

### Registrar Usuario
```typescript
import { FirebaseService } from '@core/services/firebase.service';

constructor(private firebase: FirebaseService) {}

registrarUsuario(email: string, password: string) {
  this.firebase.signUp(email, password)
    .then(userCredential => {
      console.log('Usuario registrado:', userCredential.user);
      // Crear perfil en Firestore
      this.firebase.createDocument('usuarios', {
        id: userCredential.user.uid,
        email: email,
        fechaCreacion: new Date()
      });
    })
    .catch(error => {
      console.error('Error al registrar:', error);
    });
}
```

### Iniciar Sesión
```typescript
this.firebase.signIn(email, password)
  .then(userCredential => {
    console.log('Usuario autenticado:', userCredential.user);
  })
  .catch(error => {
    console.error('Error al iniciar sesión:', error);
  });
```

### Obtener Usuario Actual
```typescript
this.firebase.getCurrentUser().subscribe(user => {
  if (user) {
    console.log('Usuario actual:', user);
  } else {
    console.log('No hay usuario autenticado');
  }
});
```

## 📝 Notas Importantes

1. **Nunca commitees las credenciales reales** a Git
2. Usa variables de entorno o archivos `.env` para producción
3. Configura las reglas de seguridad adecuadamente
4. Firestore es NoSQL, no SQL - estructura tus datos como documentos
5. Los índices se crean automáticamente cuando los necesites

## 🆘 Solución de Problemas

### Error: "Firebase: Error (auth/network-request-failed)"
- Verifica tu conexión a internet
- Revisa que las credenciales sean correctas

### Error: "Missing or insufficient permissions"
- Revisa las reglas de seguridad de Firestore
- Asegúrate de que el usuario esté autenticado si las reglas lo requieren

### Error: "Collection not found"
- La colección se crea automáticamente al agregar el primer documento
- Verifica que estés usando el nombre correcto de la colección

## 📖 Recursos Adicionales

- [Documentación de AngularFire](https://github.com/angular/angularfire)
- [Documentación de Firestore](https://firebase.google.com/docs/firestore)
- [Documentación de Firebase Auth](https://firebase.google.com/docs/auth)


