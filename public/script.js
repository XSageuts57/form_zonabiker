// =========================
// 🏍️ Base de datos local de motos (Marca > Modelo > Cilindrada)
// =========================
const motoData = {
  Yamaha: { "YZF-R3": "321cc", "MT-07": "689cc", "FZ-25": "249cc" },
  Honda: { "CBR500R": "471cc", "XR150L": "149cc", "CB190R": "184cc" },
  Suzuki: { "GSX-R150": "147cc", "V-Strom 650": "645cc", "Burgman 200": "200cc" },
  Kawasaki: { "Ninja 400": "399cc", "Z650": "649cc", "Versys 300": "296cc" },
  KTM: { "Duke 200": "199cc", "RC 390": "373cc" },
  Ducati: { "Monster 797": "803cc", "Panigale V2": "955cc" },
  BMW: { "G310R": "313cc", "F 850 GS": "853cc" },
  "Harley-Davidson": { "Iron 883": "883cc", "Street Glide": "1746cc" }
};

// =========================
// 🎯 Elementos del DOM
// =========================
const marcaInput = document.getElementById('marca');
const modeloInput = document.getElementById('modelo');
const cilindradaInput = document.getElementById('cilindrada');

const listaMarcas = document.getElementById('lista-marcas');
const listaModelos = document.getElementById('lista-modelos');
const listaCilindradas = document.getElementById('lista-cilindradas');

const form = document.getElementById('form-registro');
const contenedor = document.getElementById('contenedor-registros');
const seccion = document.getElementById('registros');
const titulo = document.getElementById('titulo-registros');

const btnHoy = document.getElementById('btn-hoy');
const btnTodos = document.getElementById('btn-todos');

// =========================
// 📆 Cargar fecha actual en campo "fecha"
// =========================
document.addEventListener('DOMContentLoaded', () => {
  const hoy = new Date().toISOString().split('T')[0];
  document.getElementById('fecha').value = hoy;
  cargarMarcas(); // también pobla marcas al cargar
});

// =========================
// 🔄 Poblar marcas en datalist
// =========================
function cargarMarcas() {
  listaMarcas.innerHTML = '';
  Object.keys(motoData).forEach(marca => {
    const option = document.createElement('option');
    option.value = marca;
    listaMarcas.appendChild(option);
  });
}

// =========================
// 🔄 Poblar modelos al elegir marca
// =========================
marcaInput.addEventListener('input', () => {
  const marca = marcaInput.value;
  listaModelos.innerHTML = '';
  listaCilindradas.innerHTML = '';
  modeloInput.value = '';
  cilindradaInput.value = '';

  if (motoData[marca]) {
    Object.keys(motoData[marca]).forEach(modelo => {
      const option = document.createElement('option');
      option.value = modelo;
      listaModelos.appendChild(option);
    });
  }
});

// =========================
// ⚙️ Autocompletar cilindrada al elegir modelo
// =========================
modeloInput.addEventListener('input', () => {
  const marca = marcaInput.value;
  const modelo = modeloInput.value;
  listaCilindradas.innerHTML = '';
  cilindradaInput.value = '';

  if (motoData[marca] && motoData[marca][modelo]) {
    const cc = motoData[marca][modelo];
    cilindradaInput.value = cc;

    const option = document.createElement('option');
    option.value = cc;
    listaCilindradas.appendChild(option);
  }
});

// =========================
// ✅ Enviar formulario
// =========================
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(form).entries());
  data.costo = parseFloat(data.costo);

  const res = await fetch('/api/registro', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  if (res.ok) {
    alert('✅ Registro guardado');
    form.reset();
    document.getElementById('fecha').value = new Date().toISOString().split('T')[0];
  } else {
    alert('❌ Error al guardar');
  }
});

// =========================
// 📅 Botones para ver registros
// =========================
btnHoy.addEventListener('click', () => mostrarRegistros('hoy'));
btnTodos.addEventListener('click', () => mostrarRegistros('todos'));

// =========================
// 📋 Mostrar registros
// =========================
async function mostrarRegistros(tipo) {
  const url = tipo === 'hoy' ? '/api/registros/hoy' : '/api/registros';
  const res = await fetch(url);
  const registros = await res.json();

  titulo.textContent = tipo === 'hoy' ? '📅 Registros de Hoy' : '📋 Todos los Registros';
  seccion.classList.remove('d-none');
  contenedor.innerHTML = '';

  if (registros.length === 0) {
    contenedor.innerHTML = `
      <div class="col-12">
        <div class="alert alert-warning">No hay registros.</div>
      </div>`;
    return;
  }

  registros.forEach(r => {
    const resumen = `
Cliente: ${r.cliente}
Moto: ${r.marca} ${r.modelo}
Costo: S/${r.costo}
Empleado: ${r.empleado}
Comisión: S/${r.comision}
Ganancia Kike: S/${r.ganancia_kike}
Método de pago: ${r.metodo_pago}`;

    contenedor.innerHTML += `
      <div class="col-md-6">
        <div class="card bg-light text-dark shadow">
          <div class="card-body">
            <h5 class="card-title">${r.marca} ${r.modelo}</h5>
            <p class="card-text">
              📆 ${r.fecha} ⏰ ${r.hora}<br>
              👤 Cliente: ${r.cliente}<br>
              👨‍🔧 Empleado: ${r.empleado}<br>
              💳 Pago: ${r.metodo_pago}<br>
              💰 Costo: S/${r.costo}<br>
              🧾 Comisión: S/${r.comision}<br>
              👑 Ganancia Kike: S/${r.ganancia_kike}
            </p>
            <a class="btn btn-success" href="https://wa.me/?text=${encodeURIComponent(resumen)}" target="_blank">📤 WhatsApp</a>
          </div>
        </div>
      </div>
    `;
  });
}

// Registrar marca y modelo si no existen
async function registrarMarcaYModelo(marca, modelo, cilindrada, db) {
  return new Promise((resolve, reject) => {
    // Insertar marca si no existe
    db.query('SELECT id FROM marcas WHERE nombre = ?', [marca], (err, rows) => {
      if (err) return reject(err);

      if (rows.length > 0) {
        const marcaId = rows[0].id;
        insertarModelo();
      } else {
        db.query('INSERT INTO marcas (nombre) VALUES (?)', [marca], (err, result) => {
          if (err) return reject(err);
          const marcaId = result.insertId;
          insertarModelo();
        });
      }

      function insertarModelo() {
        db.query(
          'SELECT id FROM modelos WHERE nombre = ? AND marca_id = (SELECT id FROM marcas WHERE nombre = ?)',
          [modelo, marca],
          (err, rows) => {
            if (err) return reject(err);
            if (rows.length > 0) return resolve(); // ya existe

            db.query(
              'INSERT INTO modelos (nombre, cilindrada, marca_id) VALUES (?, ?, (SELECT id FROM marcas WHERE nombre = ?))',
              [modelo, cilindrada, marca],
              (err) => {
                if (err) return reject(err);
                resolve();
              }
            );
          }
        );
      }
    });
  });
}
