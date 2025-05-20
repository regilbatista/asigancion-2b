const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('apap.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS pagos_recibidos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cedula TEXT,
    moneda TEXT,
    cuenta TEXT,
    monto INTEGER,
    concepto TEXT
  )`);
});

db.close();

