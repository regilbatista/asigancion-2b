const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('apap.db');

// Ruta al archivo de texto generado por Unapec
const archivo = fs.readFileSync('../unapec/nomina_generada.txt', 'utf-8');

// Divide el archivo por líneas
const lineas = archivo.trim().split('\n');

let insertados = 0;

db.serialize(() => {
  lineas.forEach((linea, index) => {
    if (linea.startsWith('D')) {
      const cedula = linea.substring(1, 11).trim();
      const moneda = linea.substring(11, 14).trim();
      const cuenta = linea.substring(14, 34).trim();
      const monto = parseInt(linea.substring(34, 42).trim(), 10);
      const concepto = linea.substring(42, 62).trim();

      db.run(
        `INSERT INTO pagos_recibidos (cedula, moneda, cuenta, monto, concepto)
         VALUES (?, ?, ?, ?, ?)`,
        [cedula, moneda, cuenta, monto, concepto],
        (err) => {
          if (err) {
            console.error(`❌ Error en línea ${index + 1}:`, err.message);
          } else {
            insertados++;
          }
        }
      );
    }
  });

  // Espera a que terminen los inserts antes de cerrar
  setTimeout(() => {
    console.log(`✅ ${insertados} pagos insertados correctamente en la BD del banco.`);
    db.close();
  }, 1000);
});
