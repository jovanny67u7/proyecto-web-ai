require('dotenv').config();
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Migra los roles de sus nombres originales en español (Administrador, Editor,
// Usuario) a los códigos definitivos ADMIN/EDITOR/USER. Actualiza en el mismo
// registro (misma id) en vez de crear uno nuevo, así los usuarios ya vinculados
// a ese rol vía UsuarioRol conservan el vínculo intacto. Si el registro
// anterior no existe (base de datos nueva), lo crea directamente con el
// código final.
async function seedRoles() {
  const migraciones = [
    { anterior: 'Administrador', nuevo: 'ADMIN' },
    { anterior: 'Editor', nuevo: 'EDITOR' },
    { anterior: 'Usuario', nuevo: 'USER' },
  ];

  for (const { anterior, nuevo } of migraciones) {
    const rolAnterior = await prisma.rol.findUnique({ where: { nombre: anterior } });
    if (rolAnterior) {
      await prisma.rol.update({ where: { id: rolAnterior.id }, data: { nombre: nuevo } });
    } else {
      await prisma.rol.upsert({ where: { nombre: nuevo }, update: {}, create: { nombre: nuevo } });
    }
  }
  console.log('Roles sincronizados: ADMIN, EDITOR, USER');
}

async function seedAdmin() {
  const email = 'jovanny@asidesimple.ai';
  const rolAdmin = await prisma.rol.findUnique({ where: { nombre: 'ADMIN' } });

  const existente = await prisma.usuario.findUnique({ where: { email } });
  if (existente) {
    console.log('Usuario administrador ya existía, se omite creación.');
    return;
  }

  const passwordHash = await bcrypt.hash('Jj69696433880', 10);
  await prisma.usuario.create({
    data: {
      nombre: 'Jovanny',
      email,
      password: passwordHash,
      roles: { create: [{ rolId: rolAdmin.id }] },
    },
  });
  console.log('Usuario administrador creado:', email);
}

async function seedCatalogo() {
  const categoriasData = [
    {
      nombre: 'Chatbots IA',
      producto: {
        nombre: 'Chatbot IA',
        descripcion: 'Asistente virtual entrenado con tu información para atender a tus clientes 24/7.',
        caracteristicas: JSON.stringify([
          'Respuestas en Instagram/Messenger',
          'Agenda en Google Calendar',
          'Envío de PDFs/Videos',
          'Integración con WhatsApp Business',
        ]),
        imagenUrl: null,
      },
    },
    {
      nombre: 'CRM Inteligente',
      producto: {
        nombre: 'CRM Inteligente',
        descripcion: 'Gestiona prospectos y clientes con seguimiento automatizado impulsado por IA.',
        caracteristicas: JSON.stringify([
          'Seguimiento automático de prospectos',
          'Reportes de ventas en tiempo real',
          'Integración con correo electrónico',
          'Recordatorios inteligentes',
        ]),
        imagenUrl: null,
      },
    },
    {
      nombre: 'Automatizaciones',
      producto: {
        nombre: 'Automatizaciones',
        descripcion: 'Elimina tareas repetitivas sin código, conectando tus herramientas favoritas.',
        caracteristicas: JSON.stringify([
          'Automatización de flujos de trabajo',
          'Conexión con Google Sheets',
          'Notificaciones automáticas',
          'Procesamiento de documentos',
        ]),
        imagenUrl: null,
      },
    },
  ];

  for (const { nombre, producto } of categoriasData) {
    const categoria = await prisma.categoria.upsert({
      where: { nombre },
      update: {},
      create: { nombre },
    });

    const productoExistente = await prisma.producto.findFirst({
      where: { nombre: producto.nombre, categoriaId: categoria.id },
    });

    if (!productoExistente) {
      await prisma.producto.create({
        data: { ...producto, categoriaId: categoria.id },
      });
    }
  }
  console.log('Categorías y productos de catálogo sembrados.');
}

// Clientes de confianza reales y permanentes. Los logos viven en
// server/uploads/ (committeados a git, a diferencia de los que se suben en
// vivo desde el panel — Render no persiste el disco entre deploys, así que
// cualquier logo subido por un admin en producción se pierde en el próximo
// deploy; estos 3 sobreviven porque están en el repo). El admin puede seguir
// agregando más clientes de prueba desde el panel con total normalidad.
async function seedClientes() {
  // Limpia los clientes de ejemplo genéricos que se sembraban antes.
  await prisma.clienteConfianza.deleteMany({
    where: { nombreEmpresa: { in: ['Cliente 1', 'Cliente 2', 'Cliente 3', 'Cliente 4'] } },
  });

  const clientesReales = [
    { nombreEmpresa: 'Entrevalles', logoUrl: '/uploads/entrevalles.png', websiteUrl: 'https://entrevalles.mx/' },
    { nombreEmpresa: 'Nowus', logoUrl: '/uploads/nowus.png', websiteUrl: 'https://nowus.com.mx/' },
    { nombreEmpresa: 'Cadlev', logoUrl: '/uploads/cadlev.png', websiteUrl: 'https://cadlev.com/' },
  ];

  for (const cliente of clientesReales) {
    const existente = await prisma.clienteConfianza.findFirst({ where: { nombreEmpresa: cliente.nombreEmpresa } });
    if (existente) {
      await prisma.clienteConfianza.update({ where: { id: existente.id }, data: cliente });
    } else {
      await prisma.clienteConfianza.create({ data: cliente });
    }
  }
  console.log('Clientes de confianza reales sembrados: Entrevalles, Nowus, Cadlev.');
}

async function main() {
  await seedRoles();
  await seedAdmin();
  await seedCatalogo();
  await seedClientes();
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
