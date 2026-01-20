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

  if (!first_name || !last_name || !email || !phone_number || !address_1 || !postcode) {
    return res.status(400).json({ error: "Missing required customer fields." });
  }

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

app.get("/event-types", (req, res) => {
  const querySql = 'SELECT id, event_type FROM Event_Type ORDER BY event_type';

  db.all(querySql, (err, rows) => {
    if (err) {
      console.error("Fetch failed:", err.message);
      return res.status(500).json({ error: "Failed to fetch event types." });
    }

    return res.json(rows);
  });
});

app.get("/events", (req, res) => {
  const { eventTypeId } = req.query;

  if (!eventTypeId) {
    return res.status(400).json({ error: "eventTypeId is required." });
  }

  const querySql = `
    SELECT
      Event.id,
      Event.event_name,
      Event.event_date,
      Event.event_time,
      Event.price,
      Location.address AS location
    FROM Event
    JOIN Location ON Location.id = Event.location_id
    WHERE Event.event_type_id = ?
    ORDER BY Event.event_date, Event.event_time
  `;

  db.all(querySql, [eventTypeId], (err, rows) => {
    if (err) {
      console.error("Fetch failed:", err.message);
      return res.status(500).json({ error: "Failed to fetch events." });
    }

    return res.json(rows);
  });
});

app.post("/orders", (req, res) => {
  const { customer_id, event_id, quantity } = req.body;
  const parsedQuantity = Number.parseInt(quantity, 10);

  if (!customer_id || !event_id || !parsedQuantity || parsedQuantity <= 0) {
    return res.status(400).json({ error: "Missing or invalid order details." });
  }

  const orderDate = new Date().toISOString().slice(0, 19).replace("T", " ");
  const insertSql = `
    INSERT INTO "Order"
      (customer_id, event_id, order_date, quantity)
    VALUES
      (?, ?, ?, ?)
  `;

  db.run(insertSql, [customer_id, event_id, orderDate, parsedQuantity], function onInsert(err) {
    if (err) {
      console.error("Insert failed:", err.message);
      return res.status(500).json({ error: "Failed to save order.", details: err.message });
    }

    const orderId = this.lastID;
    const summarySql = `
      SELECT
        "Order".id AS order_id,
        "Order".order_date,
        "Order".quantity,
        Customer.id AS customer_id,
        Customer.first_name,
        Customer.last_name,
        Customer.email,
        Event.id AS event_id,
        Event.event_name,
        Event.event_date,
        Event.event_time,
        Event.price,
        Event_Type.event_type,
        Location.address AS location
      FROM "Order"
      JOIN Customer ON Customer.id = "Order".customer_id
      JOIN Event ON Event.id = "Order".event_id
      JOIN Event_Type ON Event_Type.id = Event.event_type_id
      JOIN Location ON Location.id = Event.location_id
      WHERE "Order".id = ?
    `;

    db.get(summarySql, [orderId], (summaryErr, row) => {
      if (summaryErr) {
        console.error("Summary fetch failed:", summaryErr.message);
        return res.status(500).json({ error: "Failed to fetch order summary." });
      }

      const total = Number(row.price) * Number(row.quantity);
      return res.status(201).json({
        success: true,
        summary: {
          order_id: row.order_id,
          order_date: row.order_date,
          quantity: row.quantity,
          total,
          customer: {
            id: row.customer_id,
            first_name: row.first_name,
            last_name: row.last_name,
            email: row.email,
          },
          event: {
            id: row.event_id,
            name: row.event_name,
            date: row.event_date,
            time: row.event_time,
            price: row.price,
            type: row.event_type,
            location: row.location,
          },
        },
      });
    });
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
