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
// 🚀 Ruta para registrar nuevo ingreso
app.post('/api/registro', async (req, res) => {
  console.log('POST /api/registro - body recibido:', req.body); // ← línea nueva
  const {
    marca, modelo, cilindrada, kilometraje, cliente, telefono,
    empleado, rol, fecha, hora, costo, costo_mano_obra,
    metodo_pago, servicios, placa, repuesto, ganancia_repuesto
  } = req.body;

  const costoMO = parseFloat(costo_mano_obra) || 0;
  const costoTotal = parseFloat(costo) || 0;
  const gananciaRepuesto = parseFloat(ganancia_repuesto) || 0;

  // 👉 comisión por rol
  const { comision, gananciaKike } = calcularComision(rol, costoMO);

  const metodoPagoVal = metodo_pago && metodo_pago !== 'null' ? metodo_pago : null;

  const query = `
    INSERT INTO registros 
    (marca, modelo, cilindrada, kilometraje, cliente, telefono, empleado, rol, fecha, hora, 
     costo, costo_mano_obra, comision, ganancia_kike, metodo_pago, servicios, placa, repuesto, ganancia_repuesto)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  try {
    await db.query(query, [
      marca, modelo, cilindrada, kilometraje, cliente, telefono, empleado, rol,
      fecha, hora, costoTotal, costoMO, comision, gananciaKike,
      metodoPagoVal, servicios, placa, repuesto, gananciaRepuesto
    ]);
    res.send('✅ Registro guardado correctamente');
  } catch (err) {
    console.error('❌ Error al insertar registro:', err);
    res.status(500).send('Error al guardar');
  }
});

// 🧮 Función para calcular comisión según rol
function calcularComision(rol, costoMO) {
  let porcentaje = 0;

  switch (rol?.toLowerCase()) {
    case 'jefe':        // Kike
      porcentaje = 1.0;  // 100%
      break;
    case 'tecnico':     // Fabrizio
      porcentaje = 0.7;  // 70%
      break;
    case 'auxiliar':    // Jose
      porcentaje = 0.5;  // 50%
      break;
    case 'ayudante':    
      porcentaje = 0.3;  // 30%
      break;
    case 'practicante':
      porcentaje = 0.2;  // 20%
      break;
    default:
      porcentaje = 0;    // si no tiene rol
  }

  const comision = costoMO * porcentaje;
  const gananciaKike = costoMO - comision;  // lo que le queda a Kike

  return { comision, gananciaKike };
}


// 📋 Ruta para obtener todos los registros
// 📋 Ruta para obtener registros (hoy por default)
app.get('/api/registros', async (req, res) => {
  const { desde, hasta } = req.query;
  let query;
  const params = [];

  if (desde && hasta) {
    // Filtro por rango de fechas
    query = `
      SELECT * FROM registros
      WHERE fecha BETWEEN ? AND ?
      ORDER BY fecha DESC, hora DESC
    `;
    params.push(desde, hasta);
  } else {
    // ✅ Default → mostrar solo registros de hoy
    query = `
      SELECT * FROM registros
      WHERE DATE(fecha) = CURDATE()
      ORDER BY hora DESC
    `;
  }

  try {
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('❌ Error al obtener registros:', err);
    res.status(500).send('Error');
  }
});



// 📅 Registros de HOY
app.get('/api/registros/hoy', async (req, res) => {
  try {
    const hoy = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const query = `SELECT * FROM registros WHERE DATE(fecha) = ? ORDER BY hora DESC`;
    const [rows] = await db.query(query, [hoy]);
    res.json(rows);
  } catch (err) {
    console.error("❌ Error al obtener registros de hoy:", err);
    res.status(500).send("Error al obtener registros de hoy");
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
    cliente, telefono, empleado, rol, fecha, hora,
    costo, costo_mano_obra, metodo_pago,
    placa, repuesto, ganancia_repuesto
  } = req.body;

  const costoTotal = parseFloat(costo) || 0;
  const costoMO = parseFloat(costo_mano_obra) || 0;
  const gananciaRepuesto = parseFloat(ganancia_repuesto) || 0;

  // 👉 comisión por rol
  const { comision, gananciaKike } = calcularComision(rol, costoMO);

  const metodoPagoVal = metodo_pago && metodo_pago !== 'null' ? metodo_pago : null;

  const query = `
    UPDATE registros SET
      servicios = ?, marca = ?, modelo = ?, cilindrada = ?, kilometraje = ?,
      cliente = ?, telefono = ?, empleado = ?, rol = ?, fecha = ?, hora = ?,
      costo = ?, costo_mano_obra = ?, metodo_pago = ?, comision = ?, ganancia_kike = ?,
      placa = ?, repuesto = ?, ganancia_repuesto = ?
    WHERE id = ?
  `;

  try {
    const [result] = await db.query(query, [
      servicios, marca, modelo, cilindrada, kilometraje,
      cliente, telefono, empleado, rol, fecha, hora,
      costoTotal, costoMO, metodoPagoVal, comision, gananciaKike,
      placa, repuesto, gananciaRepuesto, id
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
