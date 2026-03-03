/**
 * Script para crear 5 administradores en Firebase
 * Ejecutar con: node create-admins.js
 */

const admin = require('firebase-admin');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

// Cargar credenciales desde firebase-tools
async function getFirebaseToken() {
  try {
    // Usar el token de Firebase CLI
    const configPath = require('path').join(require('os').homedir(), '.config/configstore/firebase-tools.json');
    const fs = require('fs');
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      return config.tokens?.refresh_token;
    }
  } catch (e) {
    console.log('No se encontró token de Firebase CLI');
  }
  return null;
}

// Inicializar con credenciales de emulador o usando gcloud
const serviceAccount = process.env.GOOGLE_APPLICATION_CREDENTIALS;

if (serviceAccount) {
  admin.initializeApp({
    credential: admin.credential.cert(require(serviceAccount)),
    projectId: 'sportconecta-6d1ce'
  });
} else {
  // Intentar con Application Default Credentials via gcloud
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: 'sportconecta-6d1ce'
  });
}

const auth = admin.auth();
const db = admin.firestore();

// Lista de administradores a crear
const admins = [
  {
    email: 'admin@sportconnecta.com',
    password: 'Admin123!',
    nombre: 'Administrador Principal',
    role: 'SUPER_ADMIN'
  },
  {
    email: 'admin2@sportconnecta.com',
    password: 'Admin123!',
    nombre: 'Administrador Secundario',
    role: 'ADMIN'
  },
  {
    email: 'soporte@sportconnecta.com',
    password: 'Soporte123!',
    nombre: 'Soporte Técnico',
    role: 'ADMIN'
  },
  {
    email: 'moderador@sportconnecta.com',
    password: 'Moderador123!',
    nombre: 'Moderador de Contenido',
    role: 'MODERATOR'
  },
  {
    email: 'finanzas@sportconnecta.com',
    password: 'Finanzas123!',
    nombre: 'Administrador Finanzas',
    role: 'ADMIN'
  }
];

async function createAdmin(adminData) {
  try {
    // Verificar si el usuario ya existe
    let user;
    try {
      user = await auth.getUserByEmail(adminData.email);
      console.log(`⚠️  Usuario ${adminData.email} ya existe (UID: ${user.uid})`);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        // Crear usuario en Firebase Auth
        user = await auth.createUser({
          email: adminData.email,
          password: adminData.password,
          displayName: adminData.nombre,
          emailVerified: true
        });
        console.log(`✅ Usuario creado: ${adminData.email} (UID: ${user.uid})`);
      } else {
        throw error;
      }
    }

    // Crear/actualizar documento en colección admins
    await db.collection('admins').doc(user.uid).set({
      email: adminData.email,
      nombre: adminData.nombre,
      role: adminData.role,
      active: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    console.log(`✅ Admin registrado en Firestore: ${adminData.email}`);
    return { success: true, email: adminData.email, uid: user.uid };

  } catch (error) {
    console.error(`❌ Error con ${adminData.email}:`, error.message);
    return { success: false, email: adminData.email, error: error.message };
  }
}

async function main() {
  console.log('\n🚀 Creando administradores en Firebase...\n');
  console.log('=' .repeat(50));

  const results = [];
  
  for (const adminData of admins) {
    const result = await createAdmin(adminData);
    results.push(result);
    console.log('-'.repeat(50));
  }

  console.log('\n📊 RESUMEN:');
  console.log('='.repeat(50));
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`✅ Exitosos: ${successful.length}`);
  console.log(`❌ Fallidos: ${failed.length}`);
  
  if (successful.length > 0) {
    console.log('\n📋 CREDENCIALES DE ACCESO:');
    console.log('='.repeat(50));
    admins.forEach(a => {
      if (successful.find(s => s.email === a.email)) {
        console.log(`Email: ${a.email}`);
        console.log(`Password: ${a.password}`);
        console.log(`Rol: ${a.role}`);
        console.log('-'.repeat(30));
      }
    });
  }

  console.log('\n✨ Proceso completado!\n');
  process.exit(0);
}

main().catch(error => {
  console.error('Error fatal:', error);
  process.exit(1);
});
