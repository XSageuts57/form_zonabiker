const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// 🚀 Ruta para registrar nuevo ingreso
app.post('/api/registro', async (req, res) => {
  const {
    marca, modelo, cilindrada, kilometraje, cliente, telefono,
    empleado, fecha, hora, costo, costo_mano_obra,
    metodo_pago, servicios, placa, repuesto, ganancia_repuesto
  } = req.body;


const costoMO = parseFloat(costo_mano_obra) || 0;   // fuerza número
const costoTotal = parseFloat(costo) || 0;
const gananciaRepuesto = parseFloat(ganancia_repuesto) || 0;

const comision = empleado?.toLowerCase() !== 'kike' ? (costoMO * 0.5) : 0;
const gananciaKike = costoMO - comision;

const metodoPagoVal = metodo_pago && metodo_pago !== 'null' ? metodo_pago : null;


  const query = `
    INSERT INTO registros 
    (marca, modelo, cilindrada, kilometraje, cliente, telefono, empleado, fecha, hora, 
     costo, costo_mano_obra, comision, ganancia_kike, metodo_pago, servicios, placa, repuesto, ganancia_repuesto)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  try {
    await db.query(query, [
      marca, modelo, cilindrada, kilometraje, cliente, telefono, empleado,
      fecha, hora, costo, costo_mano_obra,
      comision, gananciaKike, metodo_pago, servicios, placa, repuesto,
      ganancia_repuesto || 0
    ]);
    res.send('✅ Registro guardado correctamente');
  } catch (err) {
    console.error('❌ Error al insertar registro:', err);
    res.status(500).send('Error al guardar');
  }
});

// 📋 Ruta para obtener todos los registros
app.get('/api/registros', async (req, res) => {
  const { desde, hasta } = req.query;

  let query = 'SELECT * FROM registros';
  const params = [];

  if (desde && hasta) {
    query += ' WHERE fecha BETWEEN ? AND ?';
    params.push(desde, hasta);
  }

  query += ' ORDER BY fecha DESC, hora DESC';

  try {
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('❌ Error al obtener registros:', err);
    res.status(500).send('Error');
  }
});


// 📅 Ruta para obtener registros de hoy
app.get('/api/registros/hoy', async (req, res) => {
  const query = `SELECT * FROM registros WHERE fecha = CURDATE() ORDER BY hora DESC`;
  try {
    const [rows] = await db.query(query);
    res.json(rows);
  } catch (err) {
    console.error('❌ Error al obtener registros de hoy:', err);
    res.status(500).send('Error');
  }
});

// 🧾 Servir vistas HTML
app.get('/registros-hoy', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'registros-hoy.html'));
});

app.get('/registros-todos', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'registros-todos.html'));
});

// 🗑 Eliminar registro
app.delete('/api/registro/:id', async (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM registros WHERE id = ?';

  try {
    const [result] = await db.query(query, [id]);
    if (result.affectedRows === 0) return res.status(404).send('Registro no encontrado');
    res.send('✅ Registro eliminado');
  } catch (err) {
    console.error('❌ Error al eliminar registro:', err);
    res.status(500).send('Error al eliminar');
  }
});

// ✏️ Editar TODOS los campos del registro
app.put('/api/registro/:id', async (req, res) => {
  const { id } = req.params;
  const {
    servicios, marca, modelo, cilindrada, kilometraje,
    cliente, telefono, empleado, fecha, hora,
    costo, costo_mano_obra, metodo_pago,
    placa, repuesto, ganancia_repuesto
  } = req.body;

  // 🔒 Sanitizar valores numéricos
  const costoTotal = parseFloat(costo) || 0;
  const costoMO = parseFloat(costo_mano_obra) || 0;
  const gananciaRepuesto = parseFloat(ganancia_repuesto) || 0;

  // 🔒 Calcular comisiones
  const comision = empleado?.toLowerCase() !== 'kike' ? (costoMO * 0.5) : 0;
  const gananciaKike = costoMO - comision;

  // 🔒 Asegurar metodo_pago correcto (NULL si no hay)
  const metodoPagoVal = metodo_pago && metodo_pago !== 'null' ? metodo_pago : null;

  const query = `
    UPDATE registros SET
      servicios = ?, marca = ?, modelo = ?, cilindrada = ?, kilometraje = ?,
      cliente = ?, telefono = ?, empleado = ?, fecha = ?, hora = ?,
      costo = ?, costo_mano_obra = ?, metodo_pago = ?, comision = ?, ganancia_kike = ?,
      placa = ?, repuesto = ?, ganancia_repuesto = ?
    WHERE id = ?
  `;

  try {
    const [result] = await db.query(query, [
      servicios, marca, modelo, cilindrada, kilometraje,
      cliente, telefono, empleado, fecha, hora,
      costoTotal, costoMO, metodoPagoVal, comision, gananciaKike,
      placa, repuesto, gananciaRepuesto,
      id
    ]);
    if (result.affectedRows === 0) return res.status(404).send('Registro no encontrado');
    res.send('✅ Registro actualizado');
  } catch (err) {
    console.error('❌ Error al actualizar registro:', err);
    res.status(500).send('Error al actualizar');
  }
});


// 🔊 Escuchar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
