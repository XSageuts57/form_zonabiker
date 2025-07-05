async function cargarRegistrosTodos() {
  const res = await fetch('/api/registros');
  const registros = await res.json();
  const contenedor = document.getElementById('contenedor-registros');

  if (registros.length === 0) {
    contenedor.innerHTML = '<div class="alert alert-warning">No hay registros disponibles.</div>';
    return;
  }

  const tablaHTML = document.createElement('div');
  tablaHTML.id = 'tabla-pdf';
  tablaHTML.style.overflowX = 'auto';
  tablaHTML.style.padding = '10px';

  let resumenTexto = `📋 *Resumen de todos los registros*\n🧼 Total de motos registradas: ${registros.length}\n\n`;

  let tabla = `
    <table class="table table-bordered table-hover" style="
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
          <th>Fecha</th>
          <th>Hora</th>
          <th>Cliente</th>
          <th>Moto</th>
          <th>Empleado</th>
          <th>Pago</th>
          <th>Costo</th>
          <th>Comisión</th>
          <th>Ganancia Kike</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
  `;

  const resumenPorDia = {};

  registros.forEach(r => {
    const fechaFormateada = new Date(r.fecha).toLocaleDateString('es-PE');

    tabla += `
      <tr>
        <td>${fechaFormateada}</td>
        <td>${r.hora}</td>
        <td>${r.cliente}</td>
        <td>${r.marca} ${r.modelo}</td>
        <td>${r.empleado}</td>
        <td>${r.metodo_pago ?? 'N/A'}</td>
        <td>S/${parseFloat(r.costo).toFixed(2)}</td>
        <td>S/${parseFloat(r.comision).toFixed(2)}</td>
        <td>S/${parseFloat(r.ganancia_kike).toFixed(2)}</td>
            <td>
            <button class="btn btn-warning btn-sm me-2" onclick="editarRegistro(${r.id})">✏️</button>
            <button class="btn btn-danger btn-sm" onclick="eliminarRegistro(${r.id})">🗑️</button>
          </td>
      </tr>
    `;

    resumenTexto += `🛵 *${r.marca} ${r.modelo}*
📅 ${fechaFormateada} ⏰ ${r.hora}
👤 Cliente: ${r.cliente}
👨‍🔧 Empleado: ${r.empleado}
💳 Pago: ${r.metodo_pago ?? 'N/A'}
💰 Costo: S/${parseFloat(r.costo).toFixed(2)}
🧾 Comisión: S/${parseFloat(r.comision).toFixed(2)}
👑 Ganancia Kike: S/${parseFloat(r.ganancia_kike).toFixed(2)}
────────────────────\n`;

    // RESUMEN POR FECHA Y EMPLEADO
    const fecha = fechaFormateada;
    const empleado = r.empleado || 'Sin nombre';
    const costo = parseFloat(r.costo);

    if (!resumenPorDia[fecha]) resumenPorDia[fecha] = { total: 0, cantidad: 0, empleados: {} };
    resumenPorDia[fecha].total += costo;
    resumenPorDia[fecha].cantidad += 1;

    if (!resumenPorDia[fecha].empleados[empleado]) {
      resumenPorDia[fecha].empleados[empleado] = { cantidad: 0, costos: 0, comision: 0 };
    }

    resumenPorDia[fecha].empleados[empleado].cantidad += 1;
    resumenPorDia[fecha].empleados[empleado].costos += costo;
    resumenPorDia[fecha].empleados[empleado].comision += (empleado.toLowerCase() === 'kike') ? costo : costo * 0.5;
  });

  tabla += '</tbody></table>';
  tablaHTML.innerHTML = tabla;

  // RESUMEN POR DÍA Y EMPLEADO
  let tablaResumen = `
    <h5 style="margin-top:30px;">📊 Resumen por Día y Empleado</h5>
    <table class="table table-bordered" style="width: 100%; margin-top: 10px; font-size: 13px;">
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
  let gananciaZonaBiker = 0;

  Object.entries(data.empleados).forEach(([nombre, emp]) => {
    const porcentaje = nombre.toLowerCase() === 'kike' ? 100 : 50;
    const comision = emp.comision;
    const totalBruto = emp.costos;

    gananciaZonaBiker += comision; // ahora siempre se suma todo

    tablaResumen += `
      <tr>
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
  contenedor.appendChild(tablaHTML);

  // WhatsApp
  document.getElementById('btn-wsp').href = `https://wa.me/?text=${encodeURIComponent(resumenTexto)}`;

  // PDF
  document.getElementById('btn-pdf').addEventListener('click', () => {
    const contenido = document.getElementById('tabla-pdf');
    const opt = {
      margin: [0.3, 0.3, 0.3, 0.3],
      filename: `todos-los-registros-${new Date().toISOString().slice(0, 10)}.pdf`,
      image: { type: 'jpeg', quality: 1 },
      html2canvas: { scale: 4 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' }
    };
    html2pdf().set(opt).from(contenido).save();
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

  const marca = prompt('🏍️ Marca:', registro.marca);
  const modelo = prompt('📘 Modelo:', registro.modelo);
  const cilindrada = prompt('⚙️ Cilindrada:', registro.cilindrada);
  const kilometraje = prompt('🧭 Kilometraje:', registro.kilometraje);
  const cliente = prompt('👤 Cliente:', registro.cliente);
  const empleado = prompt('👨‍🔧 Empleado:', registro.empleado);
  const fecha = prompt('📅 Fecha (YYYY-MM-DD):', registro.fecha.slice(0,10));
  const hora = prompt('⏰ Hora (HH:mm):', registro.hora);
  const costo = prompt('💰 Costo:', registro.costo);
  const metodo_pago = prompt('💳 Método de pago:', registro.metodo_pago);

  const body = {
    marca, modelo, cilindrada, kilometraje,
    cliente, empleado, fecha, hora,
    costo: parseFloat(costo) || 0,
    metodo_pago
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


cargarRegistrosTodos();
