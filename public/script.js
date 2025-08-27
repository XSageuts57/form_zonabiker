// =========================
// 🏍️ Base de datos local de motos (Marca > Modelo > Cilindrada)
// =========================
const motoData = {
  Yamaha: { 
    "YZF-R1": "998cc", "YZF-R6": "599cc", "YZF-R3": "321cc", "MT-07": "689cc", 
    "MT-09": "847cc", "MT-10": "998cc", "FZ-25": "249cc", "FZ-15": "149cc",
    "XMAX 300": "292cc", "NMAX 155": "155cc", "Ténéré 700": "689cc", "WR155R": "155cc"
  },
  Honda: { 
    "CBR1000RR": "999cc", "CBR600RR": "599cc", "CBR500R": "471cc", "CBR300R": "286cc",
    "CB1000R": "998cc", "CB650R": "649cc", "CB300R": "286cc", "CB190R": "184cc",
    "XR150L": "149cc", "CRF250L": "249cc", "CRF450L": "449cc", "Africa Twin": "1084cc",
    "Gold Wing": "1833cc", "PCX150": "149cc", "SH150i": "149cc", "Rebel 300": "286cc",
    "Rebel 500": "471cc", "CRF1100L": "1084cc"
  },
  Suzuki: { 
    "GSX-R1000": "999cc", "GSX-R750": "750cc", "GSX-R600": "599cc", "GSX-R150": "147cc",
    "GSX-S1000": "999cc", "GSX-S750": "749cc", "V-Strom 1050": "1037cc", "V-Strom 650": "645cc",
    "V-Strom 250": "248cc", "Burgman 200": "200cc", "Burgman 400": "400cc", "DR-Z400": "398cc",
    "DR200S": "199cc", "Hayabusa": "1340cc", "Katana": "999cc"
  },
  Kawasaki: { 
    "Ninja H2": "998cc", "Ninja ZX-10R": "998cc", "Ninja ZX-6R": "636cc", "Ninja 650": "649cc",
    "Ninja 400": "399cc", "Ninja 300": "296cc", "Ninja 250": "249cc", "Z1000": "1043cc",
    "Z900": "948cc", "Z650": "649cc", "Z400": "399cc", "Versys 1000": "1043cc",
    "Versys 650": "649cc", "Versys 300": "296cc", "KLR650": "652cc", "Vulcan S": "649cc",
    "W800": "773cc", "KLX150": "144cc"
  },
  KTM: { 
    "Duke 125": "125cc", "Duke 200": "199cc", "Duke 250": "248cc", "Duke 390": "373cc",
    "Duke 790": "799cc", "Duke 890": "889cc", "Duke 1290": "1301cc", "RC 125": "125cc",
    "RC 200": "199cc", "RC 390": "373cc", "Adventure 390": "373cc", "Adventure 790": "799cc",
    "Adventure 1290": "1301cc", "Super Duke R": "1301cc", "690 SMC R": "693cc"
  },
  Ducati: { 
    "Panigale V4": "1103cc", "Panigale V2": "955cc", "Monster 797": "803cc", "Monster 821": "821cc",
    "Monster 1200": "1198cc", "Multistrada 950": "937cc", "Multistrada 1260": "1262cc",
    "Scrambler 800": "803cc", "Scrambler 1100": "1079cc", "Diavel 1260": "1262cc",
    "Streetfighter V4": "1103cc", "SuperSport 950": "937cc", "Hypermotard 950": "937cc"
  },
  BMW: { 
    "S1000RR": "999cc", "S1000R": "999cc", "S1000XR": "999cc", "R1250GS": "1254cc",
    "F850GS": "853cc", "F750GS": "853cc", "G310R": "313cc", "G310GS": "313cc",
    "R18": "1802cc", "R1250RT": "1254cc", "K1600GT": "1649cc", "C400X": "350cc",
    "C650GT": "647cc"
  },
  "Harley-Davidson": { 
    "Iron 883": "883cc", "Street 750": "749cc", "Street Bob": "1746cc", "Fat Bob": "1746cc",
    "Softail Standard": "1746cc", "Heritage Classic": "1746cc", "Road King": "1746cc",
    "Street Glide": "1746cc", "Road Glide": "1746cc", "Sportster S": "1252cc",
    "Pan America 1250": "1252cc", "LiveWire": "Electric"
  },
  Aprilia: {
    "RSV4": "1099cc", "Tuono V4": "1077cc", "RS 660": "659cc", "Tuono 660": "659cc",
    "Shiver 900": "896cc", "Dorsoduro 900": "896cc", "SXR 160": "160cc", "SR 160": "160cc"
  },
  Triumph: {
    "Street Triple RS": "765cc", "Speed Triple": "1160cc", "Daytona 675": "675cc",
    "Bonneville T120": "1200cc", "Bonneville T100": "900cc", "Scrambler 1200": "1200cc",
    "Tiger 900": "888cc", "Tiger 1200": "1215cc", "Rocket 3": "2458cc", "Trident 660": "660cc"
  },
  "Royal Enfield": {
    "Classic 350": "349cc", "Interceptor 650": "648cc", "Continental GT 650": "648cc",
    "Himalayan": "411cc", "Meteor 350": "349cc"
  },
  Bajaj: {
    "Pulsar NS200": "199cc", "Pulsar RS200": "199cc", "Dominar 400": "373cc",
    "Pulsar 150": "149cc", "Pulsar 125": "124cc", "Avenger 220": "220cc"
  },
  TVS: {
    "Apache RTR 160": "159cc", "Apache RR310": "312cc", "Raider 125": "124cc",
    "NTorq 125": "124cc"
  },
  Hero: {
    "Xtreme 160R": "163cc", "XPulse 200": "199cc", "Splendor Plus": "97cc",
    "Passion Pro": "110cc", "Hunk 150R": "149cc"
  },
  Benelli: {
    "TNT 300": "300cc", "TNT 600": "600cc", "Leoncino 500": "500cc",
    "TRK 502": "500cc", "Imperiale 400": "374cc"
  },
  "MV Agusta": {
    "F3 800": "798cc", "Brutale 800": "798cc", "Dragster 800": "798cc",
    "Turismo Veloce 800": "798cc", "Superveloce 800": "798cc"
  },
  CFMoto: {
    "300NK": "292cc", "650NK": "649cc", "650MT": "649cc", "700CL-X": "693cc",
    "800MT": "799cc"
  },
  "Indian Motorcycle": {
    "Scout": "1133cc", "Chief": "1811cc", "Chieftain": "1811cc", "Roadmaster": "1811cc",
    "FTR 1200": "1203cc"
  },
  "Moto Guzzi": {
    "V7": "744cc", "V9": "853cc", "V85 TT": "853cc", "California 1400": "1380cc"
  },
  Husqvarna: {
    "Svartpilen 401": "373cc", "Vitpilen 401": "373cc", "Svartpilen 701": "693cc",
    "Vitpilen 701": "693cc", "Norden 901": "889cc"
  }
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

  // 📌 juntar métodos de pago seleccionados
  const pagosSeleccionados = Array.from(document.querySelectorAll('.metodo-pago:checked'))
    .map(chk => chk.value);

  data.metodo_pago = pagosSeleccionados.join(', '); // ejemplo: "Yape, Efectivo"

  data.costo = parseFloat(data.costo);
  data.costo_mano_obra = parseFloat(data.costo_mano_obra) || 0;
  data.ganancia_repuesto = parseFloat(data.ganancia_repuesto) || 0; 
  data.servicios = form.servicios.value.trim();
  data.repuesto = form.repuesto.value.trim();


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
Ganancia Repuestos: S/${r.ganancia_repuesto || '0.00'}
Método de pago: ${r.metodo_pago}
Servicios: ${r.servicios}
Placa:  ${r.placa}`;


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
              👑 Ganancia Kike: S/${r.ganancia_kike}<br>
              📦 Ganancia Repuestos: S/${r.ganancia_repuesto || '0.00'}<br>
              🛠 Servicios: ${r.servicios}<br>
              📛 Placa: ${r.placa}<br>
              📞 Teléfono: ${r.telefono || '-'}<br>
              💵 Costo Mano de Obra: S/${r.costo_mano_obra || '0.00'}<br>
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
