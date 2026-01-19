const path = require("path");
const express = require("express");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const port = process.env.PORT || 3000;

const dbPath = path.join(__dirname, "..", "EventTicket.db");
console.log("DB FILE:", dbPath);
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Failed to connect to SQLite database:", err.message);
  } else {
    console.log("Connected to SQLite database.");
  }
});

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const frontendPath = path.join(__dirname, "..", "frontend");
app.use(express.static(frontendPath));


app.post("/submit", (req, res) => {
  const {
    first_name,
    last_name,
    email,
    phone_number,
    address_1,
    address_2,
    address_3,
    postcode,
  } = req.body;

  const insertSql = `
    INSERT INTO Customer
      (first_name, last_name, email, phone_number, address_1, address_2, address_3, postcode)
    VALUES
      (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const params = [
    first_name,
    last_name,
    email,
    phone_number,
    address_1,
    address_2 || null,
    address_3 || null,
    postcode,
  ];

  db.run(insertSql, params, function onInsert(err) {
    if (err) {
      console.error("Insert failed:", err.message);
      return res.status(500).json({ error: "Failed to save customer.", details: err.message });
    }
    

    return res.status(201).json({ success: true, id: this.lastID });
  });
});

app.get("/customers", (req, res) => {
  const querySql = "SELECT * FROM Customer ORDER BY id DESC";

  db.all(querySql, (err, rows) => {
    if (err) {
      console.error("Fetch failed:", err.message);
      return res.status(500).json({ error: "Failed to fetch customers." });
    }

    return res.json(rows);
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

process.on("SIGINT", () => {
  db.close(() => {
    process.exit(0);
  });
});
