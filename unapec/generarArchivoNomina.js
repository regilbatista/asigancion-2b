const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./unapec.db');

// Función para formatear campos con longitud fija
function fixedWidth(value, length, align = 'left', padChar = ' ') {
  value = value.toString();
  if (value.length > length) return value.slice(0, length);
  return align === 'left'
    ? value.padEnd(length, padChar)
    : value.padStart(length, padChar);
}

function generarArchivo() {
  db.all('SELECT * FROM empleados', (err, empleados) => {
    if (err) {
      console.error('❌ Error al leer la base de datos:', err);
      return;
    }

    const rnc = '130001234'; // Código ficticio DGII
    const nombreEmpresa = 'UNAPEC';
    const totalPagar = empleados.reduce((acc, e) => acc + e.monto, 0);
    const fecha = new Date();
    const fechaPago = `${String(fecha.getDate()).padStart(2, '0')}/${String(fecha.getMonth() + 1).padStart(2, '0')}/${fecha.getFullYear()}`;

    // ENCABEZADO (E)
    const encabezado =
      fixedWidth('E', 1) +
      fixedWidth(rnc, 9, 'right', '0') +
      fixedWidth(nombreEmpresa, 30, 'left', ' ') +
      fixedWidth(totalPagar.toFixed(2).replace('.', ''), 12, 'right', '0') +
      fixedWidth(fechaPago, 10, 'left', ' ');

    // DETALLES (D)
    const detalles = empleados.map(emp =>
      fixedWidth('D', 1) +
      fixedWidth(emp.cedula.replace(/-/g, ''), 10, 'right', '0') +
      fixedWidth(emp.moneda || 'DOP', 3, 'left', ' ') +
      fixedWidth(emp.cuenta, 20, 'right', '0') +
      fixedWidth(parseInt(emp.monto).toString().padStart(8, '0'), 8, 'right', '0') +
      fixedWidth(emp.concepto || 'QUINCENA', 20, 'left', ' ')
    );

    // SUMARIO (S)
    const totalRegistros = 1 + detalles.length + 1; // encabezado + detalles + sumario
    const sumario =
      fixedWidth('S', 1) +
      fixedWidth(totalRegistros.toString(), 9, 'right', '0');

    // UNIR TODO
    const contenido = [encabezado, ...detalles, sumario].join('\n');

    // GUARDAR ARCHIVO
    fs.writeFileSync('nomina_generada.txt', contenido);
    console.log('✅ Archivo nomina_generada.txt creado correctamente.');
  });
}

generarArchivo();
