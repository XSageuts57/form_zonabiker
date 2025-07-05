const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// 🧠 Registro automático de nueva marca y modelo (opcional)
async function registrarMarcaYModelo(marca, modelo, cilindrada, db) {
  // Aquí podrías guardar en una tabla `motos` para autocompletar luego si deseas.
  // Por ahora es simbólico, no guarda nada realmente, pero evita errores.
  return true;
}

// 🚀 Ruta para registrar nuevo ingreso
app.post('/api/registro', async (req, res) => {
  const {
    marca, modelo, cilindrada, kilometraje,
    cliente, empleado, fecha, hora, costo, metodo_pago
  } = req.body;

  const comision = empleado.toLowerCase() !== 'kike' ? costo * 0.5 : 0;
  const gananciaKike = costo - comision;

  try {
    await registrarMarcaYModelo(marca, modelo, cilindrada, db);

    const query = `
      INSERT INTO registros 
      (marca, modelo, cilindrada, kilometraje, cliente, empleado, fecha, hora, costo, comision, ganancia_kike, metodo_pago)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(query, [
      marca, modelo, cilindrada, kilometraje,
      cliente, empleado, fecha, hora, costo,
      comision, gananciaKike, metodo_pago
    ], (err) => {
      if (err) {
        console.error('❌ Error al insertar registro:', err);
        return res.status(500).send('Error al guardar');
      }
      res.send('✅ Registro guardado correctamente');
    });

  } catch (error) {
    console.error('❌ Error al registrar marca/modelo:', error);
    res.status(500).send('Error interno');
  }
});

// 📋 Ruta para obtener todos los registros
app.get('/api/registros', (req, res) => {
  const query = 'SELECT * FROM registros ORDER BY fecha DESC, hora DESC';
  db.query(query, (err, rows) => {
    if (err) {
      console.error('❌ Error al obtener registros:', err);
      return res.status(500).send('Error');
    }
    res.json(rows);
  });
});

// 📅 Ruta para obtener registros de hoy
app.get('/api/registros/hoy', (req, res) => {
  const query = `SELECT * FROM registros WHERE fecha = CURDATE() ORDER BY hora DESC`;
  db.query(query, (err, rows) => {
    if (err) {
      console.error('❌ Error al obtener registros de hoy:', err);
      return res.status(500).send('Error');
    }
    res.json(rows);
  });
});

// 🧾 Servir vistas HTML profesionales
app.get('/registros-hoy', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'registros-hoy.html'));
});

app.get('/registros-todos', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'registros-todos.html'));
});

// 🔊 Escuchar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});

// 🗑 Eliminar
async function eliminarRegistro(id) {
  if (!confirm('¿Seguro que deseas eliminar este registro?')) return;
  const res = await fetch(`/api/registro/${id}`, { method: 'DELETE' });
  if (res.ok) {
    alert('✅ Registro eliminado');
    cargarRegistrosTodos(); // Recarga la vista
  } else {
    alert('❌ Error al eliminar');
  }
}

// ✏️ Editar (ejemplo básico con prompt, luego puedes usar modal bonito)
async function editarRegistro(id) {
  const registro = await fetch(`/api/registros`).then(r => r.json()).then(r => r.find(x => x.id === id));
  if (!registro) return alert('❌ Registro no encontrado');

  const nuevoCosto = prompt('Nuevo costo:', registro.costo || '');
  const nuevoPago = prompt('Nuevo método de pago:', registro.metodo_pago || '');

  const body = {
    ...registro,
    costo: parseFloat(nuevoCosto) || null,
    metodo_pago: nuevoPago || null
  };

  const res = await fetch(`/api/registro/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (res.ok) {
    alert('✅ Registro actualizado');
    cargarRegistrosTodos();
  } else {
    alert('❌ Error al actualizar');
  }
}
