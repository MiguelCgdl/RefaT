const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey123';

app.use(cors());
app.use(express.json());

// --- SEED DE USUARIO ADMIN ---
const seedAdmin = async () => {
  const adminExists = await prisma.usuario.findUnique({ where: { email: 'admin@taller.com' } });
  if (!adminExists) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await prisma.usuario.create({
      data: {
        nombre: 'Administrador Principal',
        email: 'admin@taller.com',
        password: hashedPassword,
        rol: 'ADMIN'
      }
    });
    console.log('Usuario administrador por defecto creado: admin@taller.com / admin123');
  }
};
seedAdmin();

// --- AUTH MIDDLEWARE ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// --- ROUTES: AUTH ---
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.usuario.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).json({ error: 'Contraseña incorrecta' });

    const token = jwt.sign({ id: user.id, rol: user.rol }, JWT_SECRET, { expiresIn: '8h' });
    res.json({ token, user: { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol } });
  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// --- ROUTES: API PROTEGIDAS ---

// 1. Clientes
app.get('/api/clientes', authenticateToken, async (req, res) => {
  const clientes = await prisma.cliente.findMany({ include: { vehiculos: true } });
  res.json(clientes);
});

app.post('/api/clientes', authenticateToken, async (req, res) => {
  const { nombre, email, telefono } = req.body;
  try {
    const cliente = await prisma.cliente.create({
      data: { nombre, email, telefono }
    });
    res.status(201).json(cliente);
  } catch (error) {
    res.status(400).json({ error: 'Error al crear cliente' });
  }
});

app.put('/api/clientes/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { nombre, email, telefono } = req.body;
  try {
    const cliente = await prisma.cliente.update({
      where: { id: parseInt(id) },
      data: { nombre, email, telefono }
    });
    res.json(cliente);
  } catch (error) {
    res.status(400).json({ error: 'Error al actualizar cliente' });
  }
});

// 2. Vehiculos
app.get('/api/vehiculos', authenticateToken, async (req, res) => {
  const vehiculos = await prisma.vehiculo.findMany({ include: { cliente: true, ordenes: true } });
  res.json(vehiculos);
});

app.post('/api/vehiculos', authenticateToken, async (req, res) => {
  const { placas, marca, modelo, anio, color, motor, kilometraje, clienteId } = req.body;
  try {
    const vehiculo = await prisma.vehiculo.create({
      data: { 
        placas, marca, modelo, anio: parseInt(anio), 
        color, motor, kilometraje: parseInt(kilometraje) || null,
        clienteId: parseInt(clienteId) 
      }
    });
    res.status(201).json(vehiculo);
  } catch (error) {
    res.status(400).json({ error: 'Error al registrar vehículo' });
  }
});

app.put('/api/vehiculos/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { placas, marca, modelo, anio, color, motor, kilometraje } = req.body;
  try {
    const vehiculo = await prisma.vehiculo.update({
      where: { id: parseInt(id) },
      data: { 
        placas, marca, modelo, anio: parseInt(anio), 
        color, motor, kilometraje: kilometraje ? parseInt(kilometraje) : null
      }
    });
    res.json(vehiculo);
  } catch (error) {
    res.status(400).json({ error: 'Error al actualizar vehículo' });
  }
});

// 2.1 Historial Vehículo Específico
app.get('/api/vehiculos/:id/historial', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const vehiculo = await prisma.vehiculo.findUnique({
      where: { id: parseInt(id) },
      include: {
        cliente: true,
        ordenes: {
          orderBy: { createdAt: 'desc' },
          include: { refacciones: { include: { refaccion: true } } }
        }
      }
    });
    res.json(vehiculo);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener historial' });
  }
});

// 3. Inventario (Refacciones)
app.get('/api/refacciones', authenticateToken, async (req, res) => {
  const refacciones = await prisma.refaccion.findMany();
  res.json(refacciones);
});

app.post('/api/refacciones', authenticateToken, async (req, res) => {
  const { nombre, descripcion, precio, stock, marca, numeroParte } = req.body;
  try {
    const refaccion = await prisma.refaccion.create({
      data: { 
        nombre, descripcion, 
        precio: parseFloat(precio), 
        stock: parseInt(stock),
        marca, numeroParte
      }
    });
    res.status(201).json(refaccion);
  } catch (error) {
    res.status(400).json({ error: 'Error al agregar refacción' });
  }
});

app.put('/api/refacciones/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, precio, stock, marca, numeroParte } = req.body;
  try {
    const refaccion = await prisma.refaccion.update({
      where: { id: parseInt(id) },
      data: { 
        nombre, descripcion, 
        precio: parseFloat(precio), 
        stock: parseInt(stock),
        marca, numeroParte
      }
    });
    res.json(refaccion);
  } catch (error) {
    res.status(400).json({ error: 'Error al actualizar refacción' });
  }
});

// 4. Ordenes y Presupuestos
app.get('/api/ordenes', authenticateToken, async (req, res) => {
  const ordenes = await prisma.orden.findMany({
    include: {
      cliente: true,
      vehiculo: true,
      refacciones: { include: { refaccion: true } }
    },
    orderBy: { createdAt: 'desc' }
  });
  res.json(ordenes);
});

app.post('/api/ordenes', authenticateToken, async (req, res) => {
  const { clienteId, vehiculoId, descripcion, problemasReportados, costoManoObra, refacciones } = req.body;
  
  try {
    let totalRefacciones = 0;
    if (refacciones && refacciones.length > 0) {
      totalRefacciones = refacciones.reduce((acc, curr) => acc + (curr.precioUnidad * curr.cantidad), 0);
    }
    const total = parseFloat(costoManoObra) + totalRefacciones;

    const orden = await prisma.orden.create({
      data: {
        clienteId: parseInt(clienteId),
        vehiculoId: parseInt(vehiculoId),
        descripcion,
        problemasReportados,
        costoManoObra: parseFloat(costoManoObra),
        total,
        refacciones: {
          create: refacciones ? refacciones.map(r => ({
            refaccionId: parseInt(r.id),
            cantidad: parseInt(r.cantidad),
            precioUnidad: parseFloat(r.precioUnidad)
          })) : []
        }
      },
      include: { cliente: true, vehiculo: true, refacciones: true }
    });
    res.status(201).json(orden);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Error al crear la orden' });
  }
});

app.put('/api/ordenes/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { descripcion, problemasReportados, costoManoObra, estado } = req.body;
  
  try {
    const dataToUpdate = { descripcion, problemasReportados };
    if (costoManoObra !== undefined && costoManoObra !== '') {
      dataToUpdate.costoManoObra = parseFloat(costoManoObra);
      const orden = await prisma.orden.findUnique({ where: { id: parseInt(id) }, include: { refacciones: true } });
      const totalRefacciones = orden.refacciones.reduce((acc, curr) => acc + (curr.precioUnidad * curr.cantidad), 0);
      dataToUpdate.total = dataToUpdate.costoManoObra + totalRefacciones;
    }
    if (estado) dataToUpdate.estado = estado;

    const orden = await prisma.orden.update({
      where: { id: parseInt(id) },
      data: dataToUpdate
    });
    res.json(orden);
  } catch (error) {
    res.status(400).json({ error: 'Error al actualizar la orden' });
  }
});

// 5. Enviar Presupuesto (Simulación WhatsApp/Email)
app.post('/api/ordenes/:id/enviar-presupuesto', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const orden = await prisma.orden.findUnique({
      where: { id: parseInt(id) },
      include: { cliente: true, vehiculo: true }
    });
    
    if (!orden) return res.status(404).json({ error: 'Orden no encontrada' });

    // Simulamos envío
    const updatedOrden = await prisma.orden.update({
      where: { id: parseInt(id) },
      data: { estado: 'ENVIADO' }
    });

    res.json({ message: 'Presupuesto enviado exitosamente', orden: updatedOrden });
  } catch (error) {
    res.status(500).json({ error: 'Error al enviar presupuesto' });
  }
});

// 6. Autorizar Presupuesto (Webhook / Cliente) - PÚBLICO
app.post('/api/ordenes/:id/autorizar', async (req, res) => {
  const { id } = req.params;
  try {
    const orden = await prisma.orden.update({
      where: { id: parseInt(id) },
      data: { estado: 'AUTORIZADO' }
    });
    res.json({ message: 'Presupuesto autorizado', orden });
  } catch (error) {
    res.status(400).json({ error: 'Error al autorizar' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor ERP backend corriendo en el puerto ${PORT}`);
});
