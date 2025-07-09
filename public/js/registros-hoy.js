// 📦 Script para cargar registros de hoy y generar PDF empresarial
async function cargarRegistrosHoy() {
  const res = await fetch('/api/registros/hoy');
  const registros = await res.json();
  const contenedor = document.getElementById('contenedor-registros');

  if (registros.length === 0) {
    contenedor.innerHTML = '<div class="alert alert-warning">No hay registros hoy.</div>';
    return;
  }

  const fechaHoy = new Date().toLocaleDateString('es-PE');
  let resumenTexto = `📋 *Resumen de lavados - ${fechaHoy}*\n🧼 Motos atendidas: ${registros.length}\n\n`;

  let tabla = `
    <div id="tabla-pdf" style="overflow-x:auto; padding: 10px;">
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

  const empleados = {};
let totalGananciaKike = 0;
let totalGananciaRepuesto = 0;

registros.forEach(r => {
  const fechaFormateada = new Date(r.fecha).toLocaleDateString('es-PE');

  const empleado = r.empleado || 'Sin nombre';
  const costo = parseFloat(r.costo) || 0;
  const gananciaRepuesto = parseFloat(r.ganancia_repuesto) || 0;

  // Calcular mano de obra
  const manoObra = costo - gananciaRepuesto;
  const mitadManoObra = manoObra * 0.5;

  let comisionEmpleado = 0;
  let gananciaKike = 0;

  if (empleado.toLowerCase() === 'kike') {
    gananciaKike = manoObra; // se lleva todo si es él
  } else {
    comisionEmpleado = mitadManoObra;
    gananciaKike = mitadManoObra;
  }

  totalGananciaKike += gananciaKike;
  totalGananciaRepuesto += gananciaRepuesto;

if (!empleados[empleado]) {
  empleados[empleado] = {
    cantidad: 0,
    comision: 0,
    costos: [],
    manoObraTotal: 0,
    utilidad: 0
  };
}
empleados[empleado].cantidad++;
empleados[empleado].costos.push(costo);
empleados[empleado].manoObraTotal += manoObra;
empleados[empleado].comision += comisionEmpleado;
empleados[empleado].utilidad += gananciaKike;


  resumenTexto += `🛵 *${r.marca} ${r.modelo}*\n📅 ${fechaFormateada} ⏰ ${r.hora}\n👤 Cliente: ${r.cliente}\n🔢 Placa: ${r.placa || 'No registrada'}\n👨‍🔧 Empleado: ${r.empleado}\n🛠 Servicios: ${r.servicios || 'Ninguno'}\n🔧 Repuestos: ${r.repuesto || 'Ninguno'}\n💳 Pago: ${r.metodo_pago ?? 'N/A'}\n💰 Costo: S/${costo.toFixed(2)}\n🧾 Comisión: S/${parseFloat(r.comision).toFixed(2)}\n👑 Ganancia Kike: S/${gananciaKike.toFixed(2)}\n📦 Ganancia Repuesto: S/${r.ganancia_repuesto || '0.00'}\n🛠 Mano Obra: S/${manoObra.toFixed(2)}\n────────────────────\n`;

  tabla += `
    <tr>
      <td style="padding: 10px;">${fechaFormateada}</td>
      <td style="padding: 10px;">${r.hora}</td>
      <td style="padding: 10px;">${r.cliente}</td>
      <td style="padding: 10px;">${r.marca} ${r.modelo}</td>
      <td style="padding: 10px;">${r.empleado}</td>
      <td style="padding: 10px;">${r.placa || '-'}</td>
      <td style="padding: 10px;">${r.servicios || '-'}</td>
      <td style="padding: 10px;">${r.metodo_pago ?? 'N/A'}</td>
      <td style="padding: 10px;">S/${costo.toFixed(2)}</td>
      <td style="padding: 10px;">S/${gananciaRepuesto.toFixed(2)}</td>
      <td style="padding: 10px;">S/${manoObra.toFixed(2)}</td>
      <td style="padding: 10px;">S/${comisionEmpleado.toFixed(2)}</td>
      <td style="padding: 10px;">S/${gananciaKike.toFixed(2)}</td>
      <td style="padding: 10px;">${r.repuesto || '-'}</td>
      <td style="padding: 10px;">
        <button class="btn btn-warning btn-sm me-2" onclick="editarRegistro(${r.id})">✏️</button>
        <button class="btn btn-danger btn-sm" onclick="eliminarRegistro(${r.id})">🗑️</button>
      </td>
    </tr>
  `;

});

  tabla += '</tbody></table>';

  // Tabla resumen empresarial horizontal para el PDF
  tabla += `
    <h5 class="mt-4 mb-2">📊 Resumen por trabajador (PDF)</h5>
<table class="table table-bordered">
  <thead class="table-dark">
    <tr>
      <th>Empleado</th>
      <th>Motos Atendidas</th>
      <th>Costos</th>
      <th>Total Bruto</th>
      <th>Comisión</th>
      <th>Mano de Obra</th>
      <th>Utilidad (ZonaBiker)</th>
    </tr>
  </thead>
  <tbody>`;

Object.entries(empleados).forEach(([nombre, data]) => {
  const totalBruto = data.costos.reduce((a, b) => a + b, 0);
  const porcentaje = nombre.toLowerCase() === 'kike' ? 100 : 50;

tabla += `
  <tr style="cursor: pointer;" onclick="mostrarDetallesEmpleado('${nombre}', '${fechaHoy}')">
    <td>${nombre}</td>
    <td>${data.cantidad}</td>
    <td>${data.costos.map((c, i) => `${i + 1}° S/${c.toFixed(2)}`).join(', ')}</td>
    <td>S/${totalBruto.toFixed(2)}</td>
    <td>(${porcentaje}%) S/${data.comision.toFixed(2)}</td>
    <td>🔨 S/${data.manoObraTotal.toFixed(2)}</td>
    <td>👑 S/${data.utilidad.toFixed(2)}</td>
  </tr>`;


});


  tabla += '</tbody></table></div>';
  tabla += '<div id="detalles-empleado" class="mt-4"></div>';

  const resumenGanancias = `
  <div class="alert alert-success d-flex justify-content-between align-items-center p-3 mb-3 shadow-sm rounded" style="font-size: 16px;">
    <div>
      👑 <strong>Ganancia ZonaBiker hoy:</strong> <span style="font-size: 18px;">S/${totalGananciaKike.toFixed(2)}</span>
    </div>
    <div>
      📦 <strong>Ganancia Repuestos:</strong> <span style="font-size: 18px; color: #0d6efd;">S/${totalGananciaRepuesto.toFixed(2)}</span>
    </div>
  </div>
`;

tabla = resumenGanancias + tabla;

  contenedor.innerHTML = tabla;

  // PDF botón
  document.getElementById('btn-pdf').addEventListener('click', () => {
    const contenido = document.getElementById('tabla-pdf');
    const opt = {
      margin: [0.3, 0.3, 0.3, 0.3],
      filename: `registros-hoy-${new Date().toISOString().slice(0, 10)}.pdf`,
      image: { type: 'jpeg', quality: 1 },
      html2canvas: { scale: 4 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' }
    };
    html2pdf().set(opt).from(contenido).save();
  });

  // WhatsApp
  document.getElementById('btn-wsp').href =
    `https://wa.me/?text=${encodeURIComponent(resumenTexto)}`;
}

async function eliminarRegistro(id) {
  if (!confirm('¿Seguro que deseas eliminar este registro?')) return;
  const res = await fetch(`/api/registro/${id}`, { method: 'DELETE' });
  if (res.ok) {
    alert('✅ Registro eliminado');
    cargarRegistrosHoy();
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
  const fecha = prompt('📅 Fecha (YYYY-MM-DD):', registro.fecha.slice(0, 10));
  const hora = prompt('⏰ Hora (HH:mm):', registro.hora);
  const costo = prompt('💰 Costo:', registro.costo);
  const metodo_pago = prompt('💳 Método de pago:', registro.metodo_pago);
    const repuesto = prompt('🔧 Repuesto:', registro.repuesto);
    const ganancia_repuesto = prompt('📦 Ganancia Repuesto:', registro.ganancia_repuesto);


  const body = {
    servicios, marca, modelo, cilindrada, kilometraje,
    cliente, empleado, fecha, hora,
    costo: parseFloat(costo) || 0,
    metodo_pago,  placa, repuesto, 
  ganancia_repuesto: parseFloat(ganancia_repuesto) || 0
  };

  console.log('➡️ Enviando body a backend:', body);


  const res = await fetch(`/api/registro/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (res.ok) {
    alert('✅ Registro actualizado');
    cargarRegistrosHoy();
  } else {
    alert('❌ Error al actualizar');
  }
}
function mostrarDetallesEmpleado(nombre, fecha) {
  fetch('/api/registros')
    .then(res => res.json())
    .then(registros => {
      const filtrados = registros.filter(r => {
        const fechaR = new Date(r.fecha).toLocaleDateString('es-PE');
        return r.empleado === nombre && fechaR === fecha;
      });

      if (filtrados.length === 0) return;

      // Calcular totales
      let totalManoObra = 0;
      let totalComision = 0;

      filtrados.forEach(r => {
        const costo = parseFloat(r.costo) || 0;
        const gananciaRepuesto = parseFloat(r.ganancia_repuesto) || 0;
        const manoObra = costo - gananciaRepuesto;
        const comision = (r.empleado.toLowerCase() === 'kike') ? 0 : manoObra * 0.5;
        totalManoObra += manoObra;
        totalComision += comision;
      });

      let html = `
        <div class="card shadow border border-dark">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h5 class="card-title mb-1">🧰 Motos atendidas por <strong>${nombre}</strong> el ${fecha}</h5>
                <p class="mb-0 text-muted">
                  🧼 Total: ${filtrados.length} | 
                  🔨 Mano de Obra: <strong>S/${totalManoObra.toFixed(2)}</strong> | 
                  🧾 Comisión: <strong>S/${totalComision.toFixed(2)}</strong>
                </p>
              </div>
              <button class="btn btn-sm btn-outline-danger" onclick="cerrarDetallesEmpleado()">✖️ Cerrar</button>
            </div>
            <ul class="list-group list-group-flush">`;

      filtrados.forEach(r => {
        const costo = parseFloat(r.costo) || 0;
        const gananciaRepuesto = parseFloat(r.ganancia_repuesto) || 0;
        const manoObra = costo - gananciaRepuesto;
        const comision = (r.empleado.toLowerCase() === 'kike') ? 0 : manoObra * 0.5;

        html += `
          <li class="list-group-item">
            🛵 <strong>${r.marca} ${r.modelo}</strong><br>
            📅 ${fecha} ⏰ ${r.hora}<br>
            👤 Cliente: ${r.cliente} | 🔢 Placa: ${r.placa || '-'}<br>
            🛠 Servicios: ${r.servicios || '-'} | 🔧 Repuesto: ${r.repuesto || '-'}<br>
            💰 Costo: S/${costo.toFixed(2)} | 💳 Pago: ${r.metodo_pago ?? 'N/A'}<br>
            📦 Ganancia Repuesto: S/${gananciaRepuesto.toFixed(2)}<br>
            🔨 Mano de Obra: S/${manoObra.toFixed(2)} | 🧾 Comisión: S/${comision.toFixed(2)}
          </li>`;
      });

      html += `
            </ul>
          </div>
        </div>`;

      const detalles = document.getElementById('detalles-empleado');
      detalles.innerHTML = html;
      detalles.style.display = 'block';
      detalles.scrollIntoView({ behavior: 'smooth' });
    });
}

cargarRegistrosHoy();

