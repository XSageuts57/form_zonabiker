// 📦 Script para cargar registros de hoy y generar PDF empresarial
async function cargarRegistrosHoy() {
  document.getElementById('fechaInicio').value = '';
  document.getElementById('fechaFin').value = '';
  const res = await fetch('/api/registros/hoy');
  const registros = await res.json();
  const contenedor = document.getElementById('contenedor-registros');

  if (!Array.isArray(registros) || registros.length === 0) {
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
            <th>Fecha</th>
            <th>Hora</th>
            <th>Cliente</th>
            <th>Teléfono</th>
            <th>Moto</th>
            <th>Cilindrada</th>
            <th>Kilometraje</th>
            <th>Empleado</th>
            <th>Placa</th>
            <th>Servicios</th>
            <th>Método Pago</th>
            <th>Pago</th>
            <th>Costo Repuesto</th>
            <th>Mano Obra</th>
            <th>Comisión</th>
            <th>Repuesto</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
  `;

  const empleados = {};
  let totalGananciaKike = 0;
  let totalGananciaRepuesto = 0;
  let totalPago = 0;

  registros.forEach(r => {
    const fechaFormateada = new Date(r.fecha).toLocaleDateString('es-PE');
    const empleado = r.empleado || 'Sin nombre';

    // <-- CORRECCIÓN: leer las columnas correctas desde la BD
    const pago = parseFloat(r.costo) || 0;                           // lo que paga el cliente
    const costoRepuesto = parseFloat(r.ganancia_repuesto) || 0;      // **Costo de Repuesto** (valor que ingresas en el formulario)
    const manoObra = parseFloat(r.costo_mano_obra) || 0;            // **Costo Mano de Obra** (valor ingresado)
    // si en BD ya guardas la comision, úsala; sino calculamos 50% de manoObra para no romper nada
    const comisionEmpleado = (typeof r.comision !== 'undefined' && r.comision !== null)
                            ? parseFloat(r.comision) 
                            : (empleado.toLowerCase() === 'kike' ? 0 : (manoObra * 0.5));
    const gananciaKike = (typeof r.ganancia_kike !== 'undefined' && r.ganancia_kike !== null)
                         ? parseFloat(r.ganancia_kike)
                         : (empleado.toLowerCase() === 'kike' ? manoObra : manoObra * 0.5);

    totalGananciaKike += gananciaKike;
    totalGananciaRepuesto += costoRepuesto;
    totalPago += pago;

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
    empleados[empleado].costos.push(pago); // total bruto por empleado → usamos el pago
    empleados[empleado].manoObraTotal += manoObra;
    empleados[empleado].comision += comisionEmpleado;
    empleados[empleado].utilidad += gananciaKike;

    // resumen para WhatsApp
    resumenTexto += `🛵 *${r.marca} ${r.modelo}*\n📅 ${fechaFormateada} ⏰ ${r.hora}\n👤 Cliente: ${r.cliente}\n🔢 Placa: ${r.placa || 'No registrada'}\n👨‍🔧 Empleado: ${r.empleado}\n🛠 Servicios: ${r.servicios || 'Ninguno'}\n🔧 Repuestos: ${r.repuesto || 'Ninguno'}\n💳 Pago: S/${pago.toFixed(2)}\n📦 Costo Repuesto: S/${costoRepuesto.toFixed(2)}\n🔨 Mano Obra: S/${manoObra.toFixed(2)}\n🧾 Comisión: S/${comisionEmpleado.toFixed(2)}\n👑 Ganancia Kike: S/${gananciaKike.toFixed(2)}\n────────────────────\n`;


    tabla += `
      <tr>
        <td>${fechaFormateada}</td>
        <td>${r.hora}</td>
        <td>${r.cliente}</td>
        <td>${r.telefono || '-'}</td>
        <td>${r.marca} ${r.modelo}</td>
        <td>${r.cilindrada || '-'}</td>
        <td>${r.kilometraje || '-'}</td>
        <td>${r.empleado}</td>
        <td>${r.placa || '-'}</td>
        <td>${r.servicios || '-'}</td>
        <td>${r.metodo_pago ?? 'N/A'}</td>
        <td>S/${pago.toFixed(2)}</td>                 <!-- Pago -->
        <td>S/${costoRepuesto.toFixed(2)}</td>        <!-- Costo Repuesto (de ganancia_repuesto) -->
        <td>S/${manoObra.toFixed(2)}</td>             <!-- Mano Obra (costo_mano_obra) -->
        <td>S/${comisionEmpleado.toFixed(2)}</td>     <!-- Comisión (50% manoObra o valor guardado) -->
        <td>${r.repuesto || '-'}</td>                 <!-- Repuesto (texto) -->
        <td>
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
      </tr>`;
  });


  tabla += '</tbody></table></div>';
  tabla += '<div id="detalles-empleado" class="mt-4"></div>';

const resumenGanancias = `
  <div class="alert alert-success d-flex justify-content-between align-items-center p-3 mb-3 shadow-sm rounded" style="font-size: 16px;">
    <div>
      👑 <strong>Total Ventas Zona Biker:</strong> <span style="font-size: 18px;">S/${totalPago.toFixed(2)}</span>
    </div>
    <div>
      📦 <strong>Venta de Respuestos:</strong> <span style="font-size: 18px; color: #0d6efd;">S/${totalGananciaRepuesto.toFixed(2)}</span>
    </div>
  </div>
`;


  contenedor.innerHTML = resumenGanancias + tabla;

  // PDF botón (evitar añadir múltiples listeners: remueve antes)
  const btnPdf = document.getElementById('btn-pdf');
  if (btnPdf) {
    btnPdf.replaceWith(btnPdf.cloneNode(true)); // limpia listeners previos
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
  }


  // WhatsApp
  const btnWsp = document.getElementById('btn-wsp');
  if (btnWsp) btnWsp.href = `https://wa.me/?text=${encodeURIComponent(resumenTexto)}`;
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
  try {
    const registros = await fetch('/api/registros').then(r => r.json());
    const r = registros.find(x => x.id === id);
    if (!r) return alert('❌ Registro no encontrado');

    // precargar datos en inputs del modal
    document.getElementById('edit-id').value = r.id;
    document.getElementById('edit-fecha').value = r.fecha?.split('T')[0] || '';
    document.getElementById('edit-hora').value = r.hora || '';
    document.getElementById('edit-cliente').value = r.cliente || '';
    document.getElementById('edit-telefono').value = r.telefono || '';
    document.getElementById('edit-marca').value = r.marca || '';
    document.getElementById('edit-modelo').value = r.modelo || '';
    document.getElementById('edit-cilindrada').value = r.cilindrada || '';
    document.getElementById('edit-kilometraje').value = r.kilometraje || '';
    document.getElementById('edit-placa').value = r.placa || '';
    document.getElementById('edit-empleado').value = r.empleado || '';
    document.getElementById('edit-servicios').value = r.servicios || '';
    document.getElementById('edit-metodo-pago').value = r.metodo_pago || '';
    document.getElementById('edit-costo').value = r.costo || 0;
    document.getElementById('edit-costo-mano-obra').value = r.costo_mano_obra || 0;
    document.getElementById('edit-comision').value = r.comision || 0;
    document.getElementById('edit-repuesto').value = r.repuesto || '';
    document.getElementById('edit-ganancia-repuesto').value = r.ganancia_repuesto || 0;

    // mostrar modal
    const modal = new bootstrap.Modal(document.getElementById('modalEditar'));
    modal.show();
  } catch (err) {
    console.error("❌ Error al precargar registro:", err);
    alert("Error al cargar el registro para editar");
  }
}


async function guardarEdicion() {
  const id = document.getElementById('edit-id').value;

  const body = {
    fecha: document.getElementById('edit-fecha').value,
    hora: document.getElementById('edit-hora').value,
    cliente: document.getElementById('edit-cliente').value,
    telefono: document.getElementById('edit-telefono').value,
    marca: document.getElementById('edit-marca').value,
    modelo: document.getElementById('edit-modelo').value,
    cilindrada: document.getElementById('edit-cilindrada').value,
    kilometraje: document.getElementById('edit-kilometraje').value,
    placa: document.getElementById('edit-placa').value,
    empleado: document.getElementById('edit-empleado').value,
    servicios: document.getElementById('edit-servicios').value,
    metodo_pago: document.getElementById('edit-metodo-pago').value,
    costo: parseFloat(document.getElementById('edit-costo').value) || 0,
    costo_mano_obra: parseFloat(document.getElementById('edit-costo-mano-obra').value) || 0,
    comision: parseFloat(document.getElementById('edit-comision').value) || 0,
    repuesto: document.getElementById('edit-repuesto').value,
    ganancia_repuesto: parseFloat(document.getElementById('edit-ganancia-repuesto').value) || 0
  };

  const res = await fetch(`/api/registro/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (res.ok) {
    alert('✅ Registro actualizado');
    bootstrap.Modal.getInstance(document.getElementById('modalEditar')).hide();
    cargarRegistrosHoy();
  } else {
    const error = await res.text();
    alert('❌ Error al actualizar: ' + error);
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

      let totalManoObra = 0;
      let totalComision = 0;
      let html = `
        <div class="card shadow border border-dark">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h5 class="card-title mb-1">🧰 Motos atendidas por <strong>${nombre}</strong> el ${fecha}</h5>
              </div>
              <button class="btn btn-sm btn-outline-danger" onclick="cerrarDetallesEmpleado()">✖️ Cerrar</button>
            </div>
            <ul class="list-group list-group-flush">`;

      filtrados.forEach(r => {
        const pago = parseFloat(r.costo) || 0;
        const costoRepuesto = parseFloat(r.ganancia_repuesto) || 0;
        const manoObra = parseFloat(r.costo_mano_obra) || 0;
        const comision = (typeof r.comision !== 'undefined' && r.comision !== null)
                        ? parseFloat(r.comision)
                        : (r.empleado.toLowerCase() === 'kike' ? 0 : manoObra * 0.5);

        totalManoObra += manoObra;
        totalComision += comision;

        html += `
          <li class="list-group-item">
            🛵 <strong>${r.marca} ${r.modelo}</strong><br>
            📅 ${new Date(r.fecha).toLocaleDateString('es-PE')} ⏰ ${r.hora}<br>
            👤 Cliente: ${r.cliente} | 🔢 Placa: ${r.placa || '-'}<br>
            🛠 Servicios: ${r.servicios || '-'} | 🔧 Repuesto: ${r.repuesto || '-'}<br>
            💳 Pago: S/${pago.toFixed(2)} | 📦 Costo Repuesto: S/${costoRepuesto.toFixed(2)}<br>
            🔨 Mano de Obra: S/${manoObra.toFixed(2)} | 🧾 Comisión: S/${comision.toFixed(2)}
          </li>`;
      });

      html += `</ul></div></div>`;
      const detalles = document.getElementById('detalles-empleado');
      detalles.innerHTML = html;
      detalles.style.display = 'block';
      detalles.scrollIntoView({ behavior: 'smooth' });
    });
}

function cerrarDetallesEmpleado() {
  const detalles = document.getElementById('detalles-empleado');
  if (!detalles) return;
  detalles.innerHTML = '';
  detalles.style.display = 'none';
}

function mostrarDetallesEmpleadoFiltrado(nombre, registrosFiltrados) {
  if (!registrosFiltrados || registrosFiltrados.length === 0) return;

  const filtrados = registrosFiltrados.filter(r => r.empleado === nombre);

  if (filtrados.length === 0) return;

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
            <h5 class="card-title mb-1">🧰 Motos atendidas por <strong>${nombre}</strong></h5>
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
        📅 ${new Date(r.fecha).toLocaleDateString('es-PE')} ⏰ ${r.hora}<br>
        👤 Cliente: ${r.cliente} | 🔢 Placa: ${r.placa || '-'}<br>
        🛠 Servicios: ${r.servicios || '-'} | 🔧 Repuesto: ${r.repuesto || '-'}<br>
        💰 Costo: S/${costo.toFixed(2)} | 💳 Pago: ${r.metodo_pago ?? 'N/A'}<br>
        📦 Ganancia Repuesto: S/${gananciaRepuesto.toFixed(2)}<br>
        🔨 Mano de Obra: S/${manoObra.toFixed(2)} | 🧾 Comisión: S/${comision.toFixed(2)}
      </li>`;
  });

  html += `</ul></div></div>`;

  const detalles = document.getElementById('detalles-empleado');
  detalles.innerHTML = html;
  detalles.style.display = 'block';
  detalles.scrollIntoView({ behavior: 'smooth' });
}


cargarRegistrosHoy();
