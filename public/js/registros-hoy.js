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
            <th style="padding: 12px;">Pago</th>
            <th style="padding: 12px;">Costo</th>
            <th style="padding: 12px;">Comisión</th>
            <th style="padding: 12px;">Ganancia Kike</th>
          </tr>
        </thead>
        <tbody>
  `;

  const empleados = {};

  registros.forEach(r => {
    const fechaFormateada = new Date(r.fecha).toLocaleDateString('es-PE');

    tabla += `
      <tr>
        <td style="padding: 10px;">${fechaFormateada}</td>
        <td style="padding: 10px;">${r.hora}</td>
        <td style="padding: 10px;">${r.cliente}</td>
        <td style="padding: 10px;">${r.marca} ${r.modelo}</td>
        <td style="padding: 10px;">${r.empleado}</td>
        <td style="padding: 10px;">${r.metodo_pago ?? 'N/A'}</td>
        <td style="padding: 10px;">S/${parseFloat(r.costo).toFixed(2)}</td>
        <td style="padding: 10px;">S/${parseFloat(r.comision).toFixed(2)}</td>
        <td style="padding: 10px;">S/${parseFloat(r.ganancia_kike).toFixed(2)}</td>
      </tr>
    `;

    resumenTexto += `🛵 *${r.marca} ${r.modelo}*\n📅 ${fechaFormateada} ⏰ ${r.hora}\n👤 Cliente: ${r.cliente}\n👨‍🔧 Empleado: ${r.empleado}\n💳 Pago: ${r.metodo_pago ?? 'N/A'}\n💰 Costo: S/${parseFloat(r.costo).toFixed(2)}\n🧾 Comisión: S/${parseFloat(r.comision).toFixed(2)}\n👑 Ganancia Kike: S/${parseFloat(r.ganancia_kike).toFixed(2)}\n────────────────────\n`;

    const empleado = r.empleado || 'Sin nombre';
    if (!empleados[empleado]) empleados[empleado] = { cantidad: 0, comision: 0, costos: [] };
    empleados[empleado].cantidad++;
    empleados[empleado].costos.push(parseFloat(r.costo));
    empleados[empleado].comision += (empleado.toLowerCase() === 'kike') ? parseFloat(r.costo) : parseFloat(r.costo) * 0.5;
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
        </tr>
      </thead>
      <tbody>`;

  Object.entries(empleados).forEach(([nombre, data]) => {
    const totalBruto = data.costos.reduce((a, b) => a + b, 0);
    const porcentaje = nombre.toLowerCase() === 'kike' ? 100 : 50;

    tabla += `
      <tr>
        <td>${nombre}</td>
        <td>${data.cantidad}</td>
        <td>${data.costos.map((c, i) => `${i + 1}° S/${c.toFixed(2)}`).join(', ')}</td>
        <td>S/${totalBruto.toFixed(2)}</td>
        <td>(${porcentaje}%) S/${data.comision.toFixed(2)}</td>
      </tr>`;
  });

  tabla += '</tbody></table></div>';
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

cargarRegistrosHoy();
