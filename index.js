import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// now load .env properly
dotenv.config();

console.log("🧪 TEST_KEY:", process.env.TEST_KEY);
console.log("🔑 JWT_SECRET:", process.env.JWT_SECRET);
const app = express();
app.use(express.urlencoded({ extended: true })); // ✅ required for form data
app.use(cors());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

const db = mysql.createPool({
  host: 'localhost',   // or 127.0.0.1
  port: 3306,          // default MySQL port
  user: 'root',        // default XAMPP MySQL user
  password: '',        // default empty password in XAMPP (change if you set one)
  database: 'rgoc-erp',  
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});


// 🔐 Login route
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  const [users] = await db.execute('SELECT * FROM users WHERE username = ? AND password = ?', [username, password]);

  if (users.length > 0) {
    const user = users[0];
    const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '10h' });
    res.json({ token, user }); // send user info too
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

// Middleware to protect routes
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Token missing' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
}

// 🔐 Protected users route
app.get('/api/users', verifyToken, async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM users');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// 🔐 Update guest password route
app.post('/api/guest-password', async (req, res) => {
  const { newPassword } = req.body;

  if (!newPassword) {
    return res.status(400).json({ error: 'Password is required' });
  }

  try {
    await db.execute('UPDATE users SET password = ? WHERE username = ?', [newPassword, 'guest']);
    res.json({ message: 'Guest password updated ✅' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update guest password' });
  }
});

// 🔐 Update terms access route
app.post('/api/update-terms', async (req, res) => {
  const { newPassword } = req.body;
  const { username } = req.body;

  if (!newPassword) {
    return res.status(400).json({ error: 'Password is required' });
  }

  try {
    await db.execute('UPDATE users SET access_level = ? WHERE username = ?', [newPassword, username]);
    res.json({ message: 'Access Level updated ✅' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update guest password' });
  }
});

// ✅ Route to fetch confirmed bookings only
app.get('/api/bookings/confirmed', async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM bookings WHERE status = 'confirmed'");
    res.json(rows);
  } catch (err) {
    console.error('Error fetching confirmed bookings:', err);
    res.status(500).json({ error: 'Failed to fetch confirmed bookings 😓' });
  }
});

// ✅ Route to fetch leads only
app.get('/api/bookings/leads', async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM bookings WHERE status = 'no'");
    res.json(rows);
  } catch (err) {
    console.error('Error fetching confirmed bookings:', err);
    res.status(500).json({ error: 'Failed to fetch confirmed bookings 😓' });
  }
});

// ✅ Route to fetch all data
app.get('/api/bookings/all', async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM bookings");
    res.json(rows);
  } catch (err) {
    console.error('Error fetching data:', err);
    res.status(500).json({ error: 'Failed to fetch data 😓' });
  }
});

// 📝 Add new booking route
app.post('/api/bookings/addGDTTBookings', async (req, res) => {
  const {
    customer_id,
    booking_id,
    booking_date,
    name,
    contact,
    type,
    group,
    persons,
    package_price,
    infants,
    infant_price,
    total_price,
    bank,
    cash,
    received,
    pending,
    requirement,
    refrence,
    source,
    status
  } = req.body;

  // 🛡️ Validate required fields
  if (!customer_id || !booking_id || !booking_date || !name || !contact) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const sql = `
      INSERT INTO bookings (
        customer_id, booking_id, booking_date, name, contact, type, \`group\`, persons, package_price,
        infants, infant_price, total_price, bank, cash, received, pending, requirement,
        refrence, source, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      customer_id, booking_id, booking_date, name, contact, type, group, persons,
      package_price, infants, infant_price, total_price, bank, cash, received,
      pending, requirement, refrence, source, status
    ];

    await db.execute(sql, values);
    res.json({ message: 'Booking added successfully ✅' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add booking ❌' });
  }
});

// EDIT COMPLETE DETAILS
app.post('/api/bookings/edit', async (req, res) => {
  try {
    const {
      customer_id,
      booking_id,
      booking_date,
      name,
      contact,
      type,
      group,
      persons,
      package_price,
      infants,
      infant_price,
      total_price,
      bank,
      cash,
      received,
      pending,
      requirement,
      refrence,
      source
    } = req.body;

    const query = `
      UPDATE bookings SET
        customer_id = ?, booking_date = ?, name = ?, contact = ?, type = ?, 
        \`group\` = ?, persons = ?, package_price = ?, infants = ?, infant_price = ?, 
        total_price = ?, bank = ?, cash = ?, received = ?, pending = ?, 
        requirement = ?, refrence = ?, source = ?
      WHERE booking_id = ?
    `;

    const values = [
      customer_id, booking_date, name, contact, type,
      group, persons, package_price, infants, infant_price,
      total_price, bank, cash, received, pending,
      requirement, refrence, source, booking_id
    ];

    await db.execute(query, values);
    res.send('Booking updated successfully ✅');
  } catch (err) {
    console.error('Error updating booking:', err);
    res.status(500).json({ error: 'Failed to update booking 😓' });
  }
});

//EDIT TRANSACTIONS
app.post('/api/bookings/editTransactions', async (req, res) => {
  try {
    const {
      booking_id,
      total_price,
      bank,
      cash,
      received,
      pending
    } = req.body;

    const query = `
      UPDATE bookings SET
        total_price = ?, bank = ?, cash = ?, received = ?, pending = ?
      WHERE booking_id = ?
    `;

    const values = [
      total_price, bank, cash, received, pending
    ];

    await db.execute(query, values);
    res.send('Transaction updated successfully ✅');
  } catch (err) {
    console.error('Error updating Transaction:', err);
    res.status(500).json({ error: 'Failed to update booking 😓' });
  }
});

app.post('/api/bookings/delete', async (req, res) => {
  try {
    const { booking_id } = req.body;

    await db.execute("DELETE FROM bookings WHERE booking_id = ?", [booking_id]);
    res.send('Booking deleted successfully 🗑️');
  } catch (err) {
    console.error('Error deleting booking:', err);
    res.status(500).json({ error: 'Failed to delete booking 😓' });
  }
});

app.post('/api/bookings/update-status', async (req, res) => {
  try {
    const { booking_id, status } = req.body;

    const query = `UPDATE bookings SET status = ? WHERE booking_id = ?`;
    const values = [status, booking_id];

    await db.execute(query, values);
    res.send('Booking status updated successfully ✅');
  } catch (err) {
    console.error('Error updating booking status:', err);
    res.status(500).json({ error: 'Failed to update status 😓' });
  }
});

app.get("/api/profile", async (req, res) => {
  try {
    const customerId = req.query.customer_id;

    if (!customerId) {
      return res.status(400).json({ error: "Invalid customer_id" });
    }

    const sql = `
      SELECT id, \`group\` AS grp, \`status\`, loan, booking_date, total_loan, type
      FROM bookings
      WHERE customer_id = ?
    `;

    const [results] = await db.execute(sql, [customerId]);

    if (!results || results.length === 0) {
      return res.status(404).json({ error: "No bookings found for this customer_id" });
    }

    const response = { Query: [], Booking: [], Loan: [] };

    results.forEach(row => {
      const group = row.grp || "";
      const status = String(row.status || "").trim().toLowerCase();
      const loan = String(row.loan || "").trim().toLowerCase();

      // Safe date formatting
      let date = null;
      if (row.booking_date) {
        if (row.booking_date instanceof Date) date = row.booking_date.toISOString().slice(0, 10);
        else date = String(row.booking_date);
      }

      const totalLoan = row.total_loan == null ? 0 : Number(row.total_loan);

      const baseObj = { id: row.id, group, type: row.type || "", date };
      const loanObj = { id: row.id, group, type: row.type || "", total_loan: totalLoan };

      if (status === "no") response.Query.push(baseObj);
      if (status === "confirmed") response.Booking.push(baseObj);
      if (loan === "yes") response.Loan.push(loanObj);
    });

    res.json(response);
  } catch (err) {
    console.error("DB error:", err);
    res.status(500).json({ error: "Database error" });
  }
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});