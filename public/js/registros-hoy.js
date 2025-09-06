// 📦 Script para cargar registros de hoy y generar PDF empresarial
async function cargarRegistrosHoy() {
  try {
    const res = await fetch('/api/registros/hoy');
    const registros = await res.json();

    if (!Array.isArray(registros) || registros.length === 0) {
      document.getElementById('contenedor-registros').innerHTML =
        '<div class="alert alert-warning">No hay registros hoy.</div>';
      return;
    }

    // 👇 Aquí llamas a tu renderizado genérico
    renderizarRegistros(registros, "de hoy");
  } catch (err) {
    console.error("❌ Error al cargar registros de hoy:", err);
    document.getElementById('contenedor-registros').innerHTML =
      '<div class="alert alert-danger">Error al cargar registros de hoy.</div>';
  }
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
    rol: document.getElementById('edit-rol').value,
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
        const { comision } = calcularComision(r.rol, manoObra);
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
    const { comision } = calcularComision(r.rol, manoObra);
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

const roles = {
  "Jefe": { porcentaje: 1.0, color: "red", empleados: ["Kike"] },
  "Técnico": { porcentaje: 0.7, color: "blue", empleados: ["Fabrizio"] },
  "Auxiliar": { porcentaje: 0.5, color: "green", empleados: ["Jose"] },
  "Ayudante": { porcentaje: 0.3, color: "purple", empleados: [] },
  "Practicante": { porcentaje: 0.2, color: "orange", empleados: [] }
};
// 📝 Renderizar lista de roles en la interfaz
function mostrarRoles() {
  const ul = document.getElementById("lista-roles");
  if (!ul) return;
  ul.innerHTML = "";

  Object.entries(roles).forEach(([rol, data]) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span style="color:${data.color}; font-weight:bold;">${rol}</span> 
      (${(data.porcentaje * 100)}%) → 
      <span>${data.empleados.length > 0 ? data.empleados.join(", ") : "Sin asignar"}</span>
    `;
    ul.appendChild(li);
  });
}

mostrarRoles();
const form = document.getElementById('form-registro');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  // Construimos FormData desde el form (asegúrate que el select 'rol' esté dentro del form)
  const fd = new FormData(form);

  // Métodos de pago seleccionados (ya tenías esto)
  const pagosSeleccionados = Array.from(document.querySelectorAll('.metodo-pago:checked'))
    .map(chk => chk.value);
  fd.set('metodo_pago', pagosSeleccionados.join(', ')); // reemplaza/añade campo

  // Forzamos que exista el rol (por si el select está fuera o falla)
  const rolFromForm = fd.get('rol') || (document.getElementById('selectRol') && document.getElementById('selectRol').value) || '';
  fd.set('rol', rolFromForm);

  // Convertir a objeto y normalizar números
  const data = Object.fromEntries(fd.entries());
  data.costo = parseFloat(data.costo) || 0;
  data.costo_mano_obra = parseFloat(data.costo_mano_obra) || 0;
  data.ganancia_repuesto = parseFloat(data.ganancia_repuesto) || 0;

  // DEBUG: ver payload antes de enviar
  console.log('payload a enviar:', data);

  try {
    const res = await fetch('/api/registro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (res.ok) {
      alert('✅ Registro guardado');
      form.reset();
      // volver a poner fecha actual
      document.getElementById('fecha').value = new Date().toISOString().split('T')[0];
    } else {
      const text = await res.text();
      console.error('Error servidor:', text);
      alert('❌ Error al guardar registro: ' + text);
    }
  } catch (err) {
    console.error('❌ Error de red:', err);
    alert('❌ Error de conexión');
  }
});
function calcularComision(rol, manoObra) {
  const porcentajes = {
    "Jefe": 1.0,
    "Técnico": 0.7,
    "Auxiliar": 0.5,
    "Ayudante": 0.3,
    "Practicante": 0.2
  };
  const porcentaje = porcentajes[rol] || 0;
  const comision = manoObra * porcentaje;
  return { comision };
}

cargarRegistrosHoy();
