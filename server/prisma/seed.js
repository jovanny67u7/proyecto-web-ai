require('dotenv').config();
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedRoles() {
  const roles = ['Administrador', 'Editor', 'Usuario'];
  for (const nombre of roles) {
    await prisma.rol.upsert({ where: { nombre }, update: {}, create: { nombre } });
  }
  console.log('Roles creados: Administrador, Editor, Usuario');
}

async function seedAdmin() {
  const email = 'jovanny@asidesimple.ai';
  const rolAdmin = await prisma.rol.findUnique({ where: { nombre: 'Administrador' } });

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

async function seedClientes() {
  const clientes = ['Cliente 1', 'Cliente 2', 'Cliente 3', 'Cliente 4'];
  for (const nombreEmpresa of clientes) {
    const existente = await prisma.clienteConfianza.findFirst({ where: { nombreEmpresa } });
    if (!existente) {
      await prisma.clienteConfianza.create({
        data: { nombreEmpresa, logoUrl: null, websiteUrl: null },
      });
    }
  }
  console.log('Clientes de confianza de ejemplo sembrados.');
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
