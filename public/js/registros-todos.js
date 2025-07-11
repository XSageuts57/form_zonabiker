async function cargarRegistrosTodos(fechaDesde = null, fechaHasta = null) {
  const res = await fetch('/api/registros');
  const registros = await res.json();
  const contenedor = document.getElementById('contenedor-registros');

  // Filtrar por fechas si se proporcionan
  let registrosFiltrados = registros.filter(r => {
    const fecha = new Date(r.fecha);
    const desde = fechaDesde ? new Date(fechaDesde) : null;
    const hasta = fechaHasta ? new Date(fechaHasta) : null;

    if (desde && fecha < desde) return false;
    if (hasta && fecha > hasta) return false;
    return true;
  });

  // Ordenar por fecha y hora (descendente)
  registrosFiltrados.sort((a, b) => {
    const fechaA = new Date(`${a.fecha}T${a.hora}`);
    const fechaB = new Date(`${b.fecha}T${b.hora}`);
    return fechaB - fechaA;
  });
  // Filtro en vivo por texto en buscador
const terminoBusqueda = document.getElementById('buscador-registros')?.value?.toLowerCase().trim() ?? '';
if (terminoBusqueda) {
  registrosFiltrados = registrosFiltrados.filter(r => {
    const fecha = new Date(r.fecha).toLocaleDateString('es-PE');
    return (
      r.cliente.toLowerCase().includes(terminoBusqueda) ||
      r.empleado.toLowerCase().includes(terminoBusqueda) ||
      `${r.marca} ${r.modelo}`.toLowerCase().includes(terminoBusqueda) ||
      (r.placa ?? '').toLowerCase().includes(terminoBusqueda) ||
      fecha.includes(terminoBusqueda)
    );
  });
}


  if (registrosFiltrados.length === 0) {
    contenedor.innerHTML = '<div class="alert alert-warning">No hay registros disponibles.</div>';
    return;
  }

  const tablaHTML = document.createElement('div');
  tablaHTML.id = 'tabla-pdf';
tablaHTML.style.overflowX = 'unset';
tablaHTML.style.padding = '10px 0';

  let resumenTexto = `📋 *Resumen de todos los registros*\n🧼 Total de motos registradas: ${registrosFiltrados.length}\n\n`;

  let tabla = `
    <div id="tabla-pdf" style="overflow-x:auto; padding: 10px;">
      <table class="table table-bordered table-hover" style="
          min-width: 1400px;  /* O el valor que necesites según tus columnas */
          width: 100%;
        border-collapse: collapse;
        font-size: 14px;
        text-align: center;
        border: 1px solid #dee2e6;
        background-color: white;
        box-shadow: 0 0 10px rgba(0,0,0,0.1);
      ">
        <thead style="background-color: #212529; color: white;">
          <tr>
            <th style="padding: 12px;">✅</th>
            <th style="padding: 12px;">Fecha</th>
            <th style="padding: 12px;">Hora</th>
            <th style="padding: 12px;">Cliente</th>
            <th style="padding: 12px;">Moto</th>
            <th style="padding: 12px;">Empleado</th>
            <th style="padding: 12px;">Placa</th>
            <th style="padding: 12px;">Servicios</th>
            <th style="padding: 12px;">Pago</th>
            <th style="padding: 12px;">Costo</th>
            <th style="padding: 12px;">Costo Repuesto</th>
            <th style="padding: 12px;">Mano Obra</th>
            <th style="padding: 12px;">Comisión</th>
            <th style="padding: 12px;">Utilidad (Ganancia ZonaBiker)</th>
            <th style="padding: 12px;">Repuesto</th>
            <th style="padding: 12px;">Acciones</th>

          </tr>
        </thead>
        <tbody>
  `;

  const resumenPorDia = {};

registrosFiltrados.forEach(r => {
  const fechaFormateada = new Date(r.fecha).toLocaleDateString('es-PE');

  // === Cálculos correctos ===
  const costoTotal     = parseFloat(r.costo)            || 0;
  const costoRepuesto  = parseFloat(r.ganancia_repuesto) || 0;   //  <-- este campo existe en BD
  const manoObra       = costoTotal - costoRepuesto;
  const isKike         = (r.empleado || '').toLowerCase() === 'kike';
  const comision       = isKike ? 0 : manoObra * 0.5;
  const utilidad       = isKike ? manoObra : manoObra * 0.5;

  // === Fila de la tabla ===
tabla += `
<tr>
  <td>
    <input type="checkbox" 
    class="chk-wsp" 
    data-id="${r.id}"
    data-text="${encodeURIComponent(`🛵 *${r.marca} ${r.modelo}*
📅 ${fechaFormateada} ⏰ ${r.hora}
👤 Cliente: ${r.cliente}
👨‍🔧 Empleado: ${r.empleado}
🔢 Placa: ${r.placa || 'Sin placa'}
🛠 Servicios: ${r.servicios || 'Ninguno'}
💳 Pago: ${r.metodo_pago ?? 'N/A'}
💰 Costo Total: S/${costoTotal.toFixed(2)}
🔧 Costo Repuesto: S/${costoRepuesto.toFixed(2)}
🛠 Mano Obra: S/${manoObra.toFixed(2)}
🧾 Comisión: S/${comision.toFixed(2)}
🏁 Utilidad ZonaBiker: S/${utilidad.toFixed(2)}
🧩 Repuesto: ${r.repuesto ?? '-'}`)}">
  </td>
  <td>${fechaFormateada}</td>

    <td>${r.hora}</td>
    <td>${r.cliente}</td>
    <td>${r.marca} ${r.modelo}</td>
    <td>${r.empleado}</td>
    <td>${r.placa || '-'}</td>
    <td>${r.servicios || '-'}</td>
    <td>${r.metodo_pago ?? 'N/A'}</td>
    <td>S/${costoTotal.toFixed(2)}</td>
    <td>S/${costoRepuesto.toFixed(2)}</td>
    <td>S/${manoObra.toFixed(2)}</td>
    <td>S/${comision.toFixed(2)}</td>
    <td>S/${utilidad.toFixed(2)}</td>
    <td>${r.repuesto ?? '-'}</td>
    <td>
      <button class="btn btn-warning btn-sm me-2" onclick="editarRegistro(${r.id})">✏️</button>
      <button class="btn btn-danger btn-sm"  onclick="eliminarRegistro(${r.id})">🗑️</button>
    </td>
  </tr>`;

  // === Texto para WhatsApp ===
  resumenTexto += `🛵 *${r.marca} ${r.modelo}*
📅 ${fechaFormateada} ⏰ ${r.hora}
👤 Cliente: ${r.cliente}
👨‍🔧 Empleado: ${r.empleado}
🔢 Placa: ${r.placa || 'Sin placa'}
🛠 Servicios: ${r.servicios || 'Ninguno'}
💳 Pago: ${r.metodo_pago ?? 'N/A'}
💰 Costo Total: S/${costoTotal.toFixed(2)}
🔧 Costo Repuesto: S/${costoRepuesto.toFixed(2)}
🛠 Mano Obra: S/${manoObra.toFixed(2)}
🧾 Comisión: S/${comision.toFixed(2)}
🏁 Utilidad ZonaBiker: S/${utilidad.toFixed(2)}
🧩 Repuesto: ${r.repuesto ?? '-'}
────────────────────\n`;

  /* -------- Resumen por día y empleado -------- */
  const fecha = fechaFormateada;
  const empleado = r.empleado || 'Sin nombre';

  if (!resumenPorDia[fecha]) resumenPorDia[fecha] = { total: 0, cantidad: 0, empleados: {} };
  resumenPorDia[fecha].total += costoTotal;
  resumenPorDia[fecha].cantidad += 1;

  if (!resumenPorDia[fecha].empleados[empleado]) {
    resumenPorDia[fecha].empleados[empleado] = { cantidad: 0, costos: 0, comision: 0 };
  }

  resumenPorDia[fecha].empleados[empleado].cantidad += 1;
  resumenPorDia[fecha].empleados[empleado].costos   += costoTotal;
  resumenPorDia[fecha].empleados[empleado].comision += comision;
});


  tabla += '</tbody></table>';
  tablaHTML.innerHTML = tabla;

  // RESUMEN POR DÍA Y EMPLEADO
    let tablaResumen = `
      <h5 style="margin-top:30px;">📊 Resumen por Día y Empleado</h5>
      <table class="table table-bordered" style="width: 100%; margin-top: 10px; font-size: 13px;" id="tabla-resumen">
        <thead style="background-color:#343a40; color: white;">
          <tr>
            <th>Fecha</th>
            <th>Empleado</th>
            <th>Motos</th>
            <th>Total bruto</th>
            <th>Comisión</th>
            <th>Ganancia Zona Biker</th>
          </tr>
        </thead>
        <tbody>
    `;

    Object.entries(resumenPorDia).forEach(([fecha, data]) => {
      Object.entries(data.empleados).forEach(([nombre, emp]) => {
        const porcentaje = nombre.toLowerCase() === 'kike' ? 100 : 50;
        const comision = emp.comision;
        const totalBruto = emp.costos;

        const rowId = `fila-${fecha}-${nombre}`.replace(/\s/g, '');

        tablaResumen += `
          <tr class="fila-resumen" data-empleado="${nombre}" data-fecha="${fecha}" style="cursor:pointer;" id="${rowId}">
            <td>${fecha}</td>
            <td>${nombre}</td>
            <td>${emp.cantidad}</td>
            <td>S/${totalBruto.toFixed(2)}</td>
            <td>S/${comision.toFixed(2)} (${porcentaje}%)</td>
            <td>S/${comision.toFixed(2)}</td>
          </tr>
        `;
      });
    });

tablaResumen += '</tbody></table>';
tablaHTML.innerHTML += tablaResumen;

contenedor.innerHTML = '';
document.getElementById('check-todos').checked = false;

contenedor.appendChild(tablaHTML);

// 🔁 Ahora que ya están en el DOM, se pueden asignar los eventos
document.querySelectorAll('.fila-resumen').forEach(fila => {
  fila.addEventListener('click', () => {
    const empleado = fila.dataset.empleado;
    const fecha = fila.dataset.fecha;
    const detalles = registrosFiltrados.filter(r =>
      r.empleado === empleado && new Date(r.fecha).toLocaleDateString('es-PE') === fecha
    );

    let tarjetas = `<h6 class="mt-4">🛵 Motos atendidas por <b>${empleado}</b> el <b>${fecha}</b>:</h6>`;

    detalles.forEach(r => {
      tarjetas += `
        <div class="card mb-2 shadow-sm">
          <div class="card-body">
            <h6 class="card-title">${r.marca} ${r.modelo} (${r.placa || 'Sin placa'})</h6>
            <p class="card-text">
              ⏰ ${r.hora}<br>
              👤 Cliente: ${r.cliente}<br>
              🛠 Servicios: ${r.servicios || 'Ninguno'}<br>
              💰 Costo: S/${parseFloat(r.costo).toFixed(2)}<br>
              💳 Pago: ${r.metodo_pago ?? 'N/A'}
            </p>
          </div>
        </div>
      `;
    });

    document.getElementById('detalle-empleado').innerHTML = tarjetas;
    document.getElementById('detalle-empleado').scrollIntoView({ behavior: 'smooth' });
  });
});




  contenedor.innerHTML = '';
  contenedor.appendChild(tablaHTML);

  // WhatsApp
  document.getElementById('btn-wsp').href = `https://wa.me/?text=${encodeURIComponent(resumenTexto)}`;

  // PDF
document.getElementById('btn-pdf').addEventListener('click', () => {
  const originalContents = document.body.innerHTML;
  const contenido = document.getElementById('tabla-pdf').innerHTML;

  const printWindow = window.open('', '', 'width=1000,height=700');
  printWindow.document.write(`
    <html>
      <head>
        <title>Vista previa - Registros</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" />
        <style>
          body { font-size: 12px; padding: 20px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #dee2e6; padding: 5px; text-align: center; }
          thead { background-color: #212529; color: white; }
        </style>
      </head>
      <body>${contenido}</body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print(); // Abre el cuadro de impresión (como Ctrl + P)
});

}


async function eliminarRegistro(id) {
  if (!confirm('¿Seguro que deseas eliminar este registro?')) return;
  const res = await fetch(`/api/registro/${id}`, { method: 'DELETE' });
  if (res.ok) {
    alert('✅ Registro eliminado');
    cargarRegistrosTodos();
  } else {
    alert('❌ Error al eliminar');
  }
}

async function editarRegistro(id) {
  const registros = await fetch('/api/registros').then(r => r.json());
  const registro = registros.find(x => x.id === id);
  if (!registro) return alert('❌ Registro no encontrado');

  const servicios = prompt('🛠 Servicios realizados:', registro.servicios);
  const marca = prompt('🏍️ Marca:', registro.marca);
  const modelo = prompt('📘 Modelo:', registro.modelo);
  const cilindrada = prompt('⚙️ Cilindrada:', registro.cilindrada);
  const kilometraje = prompt('🧭 Kilometraje:', registro.kilometraje);
  const cliente = prompt('👤 Cliente:', registro.cliente);
  const empleado = prompt('👨‍🔧 Empleado:', registro.empleado);
  const placa = prompt('🔢 Placa:', registro.placa);
  const fecha = prompt('📅 Fecha (YYYY-MM-DD):', registro.fecha.slice(0,10));
  const hora = prompt('⏰ Hora (HH:mm):', registro.hora);
  const costo = prompt('💰 Costo:', registro.costo);
  const metodo_pago = prompt('💳 Método de pago:', registro.metodo_pago);

  const body = {
    marca, modelo, cilindrada, kilometraje, placa,
    cliente, empleado, fecha, hora,
    costo: parseFloat(costo) || 0,
    metodo_pago, servicios
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


function filtrarPorFechas() {
  const desde = document.getElementById('filtro-desde').value;
  const hasta = document.getElementById('filtro-hasta').value;
  cargarRegistrosTodos(desde, hasta);
}
// WhatsApp (envío personalizado por checks)
document.getElementById('btn-wsp').addEventListener('click', (e) => {
  const seleccionados = document.querySelectorAll('.chk-wsp:checked');
  if (seleccionados.length === 0) {
    alert('❗ Por favor selecciona al menos un registro para compartir.');
    e.preventDefault();
    return;
  }

  let texto = '📋 *Resumen seleccionado de registros*\n\n';
  seleccionados.forEach(chk => {
    texto += decodeURIComponent(chk.dataset.text) + '\n';
  });

  document.getElementById('btn-wsp').href = `https://wa.me/?text=${encodeURIComponent(texto)}`;
});
// Escuchar el evento input del buscador para filtrar automáticamente
document.getElementById('buscador-registros').addEventListener('input', () => {
  const desde = document.getElementById('filtro-desde').value;
  const hasta = document.getElementById('filtro-hasta').value;
  cargarRegistrosTodos(desde, hasta);
});
/* ===== BOTÓN “ELIMINAR REGISTROS SELECCIONADOS” ===== */
document.getElementById('btn-eliminar').addEventListener('click', async () => {
  // 1️⃣ Obtener todos los checks marcados
  const checks = [...document.querySelectorAll('.chk-wsp:checked')];

  if (checks.length === 0) {
    alert('❗ Selecciona al menos un registro para eliminar.');
    return;
  }

  if (!confirm(`¿Seguro que quieres eliminar ${checks.length} registro(s)?`)) return;

  // 2️⃣ Recorrerlos y llamar al endpoint DELETE por cada id
  for (const chk of checks) {
    const id = chk.dataset.id;
    try {
      const res = await fetch(`/api/registro/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
    } catch {
      alert(`❌ Ocurrió un error eliminando el registro #${id}.`);
      return; // abortamos si algo falla
    }
  }

  alert('✅ Registros eliminados');
  // 3️⃣ Recargar la tabla
  const desde = document.getElementById('filtro-desde').value;
  const hasta = document.getElementById('filtro-hasta').value;
  cargarRegistrosTodos(desde, hasta);
});
// 🧩 Check "Seleccionar todos"
document.getElementById('check-todos').addEventListener('change', (e) => {
  const isChecked = e.target.checked;
  document.querySelectorAll('.chk-wsp').forEach(chk => chk.checked = isChecked);
});

cargarRegistrosTodos();
