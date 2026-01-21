//Importing libraries to help build paths and access sql and express

const path = require("path");
const express = require("express");
const sqlite3 = require("sqlite3").verbose();

//creates server and chooses the port 
const app = express();
const port = process.env.PORT || 3000;

//builds database file path using current directory 
const dbPath = path.join(__dirname, "..", "EventTicket.db");
console.log("DB FILE:", dbPath);
//opens database file using the path created and creates connection object, sets up error messages if the database doesnt connect 
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Failed to connect to SQLite database:", err.message);
  } else {
    console.log("Connected to SQLite database.");
  }
});
//lets express read/parse url encoded and json information and put it in the request body 
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

//serves the frontend files ( the website) making them publically available so the http://localhost:3000/ can load it 
const frontendPath = path.join(__dirname, "..", "frontend");
app.use(express.static(frontendPath));

//ROUTES

//!Sending customer information to the database 
//e.g. fist_name becomes "Saoirse"
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

  //validates that all the fields are there and if not returns an error 
  if (!first_name || !last_name || !email || !phone_number || !address_1 || !postcode) {
    return res.status(400).json({ error: "Missing required customer fields." });
  }
//builds sql insert, uses ? as placeholders to prevent sql injection 
  const insertSql = `
    INSERT INTO Customer
      (first_name, last_name, email, phone_number, address_1, address_2, address_3, postcode)
    VALUES
      (?, ?, ?, ?, ?, ?, ?, ?)
  `;
//creates array of the values put into the website 
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
//runs the insert into the database using the variables that were just made 
  db.run(insertSql, params, function onInsert(err) {
    if (err) {
      console.error("Insert failed:", err.message);
      return res.status(500).json({ error: "Failed to save customer.", details: err.message });
    }
    return res.status(201).json({ success: true, id: this.lastID });
  });
});

//GET request for the event types 
//database runs a select query and returns all the rows as an array, and returns error if they cant get them
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

//Gets the events for the specific type of event selected 
app.get("/events", (req, res) => {
  const { eventTypeId } = req.query;

  //validation
  if (!eventTypeId) {
    return res.status(400).json({ error: "eventTypeId is required." });
  }

  //Joins events and locations to get the output for the events box
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
//executes 
  db.all(querySql, [eventTypeId], (err, rows) => {
    if (err) {
      console.error("Fetch failed:", err.message);
      return res.status(500).json({ error: "Failed to fetch events." });
    }

    return res.json(rows);
  });
});

//creates an order from the details from the request body and parses the quantity to int 
app.post("/orders", (req, res) => {
  const { customer_id, event_id, quantity } = req.body;
  const parsedQuantity = Number.parseInt(quantity, 10);
// validates the order fields 
  if (!customer_id || !event_id || !parsedQuantity || parsedQuantity <= 0) {
    return res.status(400).json({ error: "Missing or invalid order details." });
  }
//makes SQL timestamp
  const orderDate = new Date().toISOString().slice(0, 19).replace("T", " ");
// creates insert order. sql commad 
  const insertSql = `
    INSERT INTO "Order"
      (customer_id, event_id, order_date, quantity)
    VALUES
      (?, ?, ?, ?)
  `;
//runs the sql insert 
  db.run(insertSql, [customer_id, event_id, orderDate, parsedQuantity], function onInsert(err) {
    if (err) {
      console.error("Insert failed:", err.message);
      return res.status(500).json({ error: "Failed to save order.", details: err.message });
    }
//Creates a query for the full summary of the order 
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
//Returns a row 
    db.get(summarySql, [orderId], (summaryErr, row) => {
      if (summaryErr) {
        console.error("Summary fetch failed:", summaryErr.message);
        return res.status(500).json({ error: "Failed to fetch order summary." });
      }
//computes the total cost 
      const total = Number(row.price) * Number(row.quantity);
      //formats the response 
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

//returns the newest customer so that it can be edited if going back to edit customer info 
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

//listens for requests and strarts server 
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

//clean shutdown when server is stopped 
process.on("SIGINT", () => {
  db.close(() => {
    process.exit(0);
  });
});
