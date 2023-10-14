import * as SQLite from "expo-sqlite";

// Membuat atau membuka koneksi dengan database SQLite
const db = SQLite.openDatabase("keuangan.db", 2);

// Membuat tabel jika belum ada
const setupDatabase = () => {
  db.transaction((tx) => {
    tx.executeSql(
      "CREATE TABLE IF NOT EXISTS pengeluaran (id INTEGER PRIMARY KEY AUTOINCREMENT, nama TEXT, nominal TEXT, waktu TEXT);"
    );
  });
};

// Menambahkan item ke tabel
const addItem = (nama, nominal, tgl, callback) => {
  db.transaction((tx) => {
    tx.executeSql(
      "INSERT INTO pengeluaran (nama,nominal,waktu) VALUES (?,?,?)",
      [nama, nominal, tgl],
      (_, result) => {
        callback(result.insertId);
      }
    );
  });
};

// Mengambil semua item dari tabel
const getItems = (callback) => {
  db.transaction((tx) => {
    tx.executeSql("SELECT * FROM pengeluaran", [], (_, result) => {
      callback(result.rows._array);
    });
  });
};

export { setupDatabase, addItem, getItems };
