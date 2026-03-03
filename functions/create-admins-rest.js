/**
 * Script para crear 5 administradores en Firebase usando REST API
 * Ejecutar con: node create-admins-rest.js
 */

const https = require('https');
const http = require('http');

// Configuración de Firebase
const FIREBASE_API_KEY = 'AIzaSyBv0bJnFxUGbuz5NUYuuruP35AhNK_O3ko';
const PROJECT_ID = 'sportconecta-6d1ce';

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

function makeRequest(hostname, path, method, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    const options = {
      hostname,
      port: 443,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function createUserWithEmailPassword(email, password, displayName) {
  const response = await makeRequest(
    'identitytoolkit.googleapis.com',
    `/v1/accounts:signUp?key=${FIREBASE_API_KEY}`,
    'POST',
    {
      email,
      password,
      displayName,
      returnSecureToken: true
    }
  );

  if (response.status === 200) {
    return { success: true, uid: response.data.localId, idToken: response.data.idToken };
  } else if (response.data.error?.message === 'EMAIL_EXISTS') {
    // Usuario ya existe, iniciar sesión para obtener uid
    const loginResponse = await makeRequest(
      'identitytoolkit.googleapis.com',
      `/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`,
      'POST',
      { email, password, returnSecureToken: true }
    );
    
    if (loginResponse.status === 200) {
      return { success: true, uid: loginResponse.data.localId, idToken: loginResponse.data.idToken, existed: true };
    }
    return { success: false, error: 'Usuario existe pero no se pudo autenticar' };
  }
  
  return { success: false, error: response.data.error?.message || 'Error desconocido' };
}

async function createAdminDocument(uid, adminData, idToken) {
  const docPath = `projects/${PROJECT_ID}/databases/(default)/documents/admins/${uid}`;
  
  const response = await makeRequest(
    'firestore.googleapis.com',
    `/v1/${docPath}?key=${FIREBASE_API_KEY}`,
    'PATCH',
    {
      fields: {
        email: { stringValue: adminData.email },
        nombre: { stringValue: adminData.nombre },
        role: { stringValue: adminData.role },
        active: { booleanValue: true },
        createdAt: { timestampValue: new Date().toISOString() }
      }
    }
  );

  return response.status === 200;
}

async function createAdmin(adminData) {
  try {
    console.log(`\n📝 Procesando: ${adminData.email}`);
    
    // Crear usuario en Firebase Auth
    const userResult = await createUserWithEmailPassword(
      adminData.email, 
      adminData.password,
      adminData.nombre
    );
    
    if (!userResult.success) {
      console.log(`   ❌ Error creando usuario: ${userResult.error}`);
      return { success: false, email: adminData.email, error: userResult.error };
    }
    
    if (userResult.existed) {
      console.log(`   ⚠️  Usuario ya existía (UID: ${userResult.uid})`);
    } else {
      console.log(`   ✅ Usuario creado (UID: ${userResult.uid})`);
    }
    
    // Crear documento admin en Firestore
    const docCreated = await createAdminDocument(userResult.uid, adminData, userResult.idToken);
    
    if (docCreated) {
      console.log(`   ✅ Documento admin creado en Firestore`);
    } else {
      console.log(`   ⚠️  No se pudo crear documento (posible problema de permisos)`);
    }
    
    return { success: true, email: adminData.email, uid: userResult.uid };
    
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return { success: false, email: adminData.email, error: error.message };
  }
}

async function main() {
  console.log('\n🚀 ═══════════════════════════════════════════════════');
  console.log('   CREANDO ADMINISTRADORES EN FIREBASE');
  console.log('═══════════════════════════════════════════════════════\n');

  const results = [];
  
  for (const adminData of admins) {
    const result = await createAdmin(adminData);
    results.push(result);
  }

  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  console.log('\n═══════════════════════════════════════════════════════');
  console.log('                     📊 RESUMEN');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`   ✅ Exitosos: ${successful.length}`);
  console.log(`   ❌ Fallidos: ${failed.length}`);
  
  if (successful.length > 0) {
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('              📋 CREDENCIALES DE ACCESO');
    console.log('═══════════════════════════════════════════════════════');
    admins.forEach(a => {
      if (successful.find(s => s.email === a.email)) {
        console.log(`\n   📧 Email:    ${a.email}`);
        console.log(`   🔑 Password: ${a.password}`);
        console.log(`   👤 Rol:      ${a.role}`);
      }
    });
  }

  console.log('\n═══════════════════════════════════════════════════════');
  console.log('                    ✨ COMPLETADO');
  console.log('═══════════════════════════════════════════════════════\n');
  
  console.log('Ahora puedes acceder al panel admin con cualquiera de');
  console.log('estas credenciales en: http://localhost:4201\n');
}

main().catch(console.error);
