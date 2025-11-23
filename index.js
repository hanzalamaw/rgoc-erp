import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import pdf from 'html-pdf';
import nodemailer from "nodemailer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
// console.log("🧪 TEST_KEY:", process.env.TEST_KEY);
// console.log("🔑 JWT_SECRET:", process.env.JWT_SECRET);
const app = express();
app.use(express.urlencoded({ extended: true })); 
app.use(cors());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

const db = mysql.createPool({
  host: 'localhost',   
  port: 3306,         
  user: 'root',      
  password: '',       
  database: 'rgoc-erp',  
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});


// LOGIN ROUTE
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  const [users] = await db.execute('SELECT * FROM users WHERE username = ? AND password = ?', [username, password]);

  if (users.length > 0) {
    const user = users[0];
    const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '10h' });
    res.json({ token, user });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

// MIDDLEWARE TO VERIFY JWT
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

// PROTECTED ROUTE TO FETCH ALL USERS
app.get('/api/users', verifyToken, async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM users');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// UPDATE GUEST PASSWORD ROUTE
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

// UPDATE TERMS ACCESS ROUTE
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

// ROUTE TO FETCH CONFIRMED BOOKINGS ONLY
app.get('/api/bookings/confirmed', async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM bookings WHERE status = 'confirmed'");
    res.json(rows);
  } catch (err) {
    console.error('Error fetching confirmed bookings:', err);
    res.status(500).json({ error: 'Failed to fetch confirmed bookings 😓' });
  }
});

// ROUTE TO FETCH LEADS ONLY
app.get('/api/bookings/leads', async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM bookings WHERE status = 'no'");
    res.json(rows);
  } catch (err) {
    console.error('Error fetching leads:', err);
    res.status(500).json({ error: 'Failed to fetch leads 😓' });
  }
});

// ROUTE TO FETCH CANCELLED BOOKINGS ONLY
app.get('/api/bookings/cancelled', async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM bookings WHERE status = 'cancelled'");
    res.json(rows);
  } catch (err) {
    console.error('Error fetching cancelled bookings:', err);
    res.status(500).json({ error: 'Failed to fetch cancelled bookings 😓' });
  }
});

// ROUTE TO FETCH ALL DATA
app.get('/api/bookings/all', async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM bookings");
    res.json(rows);
  } catch (err) {
    console.error('Error fetching data:', err);
    res.status(500).json({ error: 'Failed to fetch data 😓' });
  }
});

// ADD NEW BOOKING ROUTE
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

// EDIT TRANSACTIONS
app.post('/api/bookings/editTransactions', async (req, res) => {
  try {
    const {
      booking_id,
      bank,
      cash,
      received,
      pending
    } = req.body;

    if (!booking_id) {
      return res.status(400).json({ error: 'booking_id is required' });
    }

    const query = `
      UPDATE bookings SET
        bank = ?, cash = ?, received = ?, pending = ?
      WHERE booking_id = ?
    `;

    const values = [
      bank,
      cash,
      received,
      pending,
      booking_id
    ];

    await db.execute(query, values);
    res.send('Transaction updated successfully ✅');
  } catch (err) {
    console.error('Error updating Transaction:', err);
    res.status(500).json({ error: 'Failed to update booking 😓' });
  }
});


// DELETE BOOKINGS ROUTE
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

// UPDATE BOOKING STATUS ROUTE
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

// FETCH PROFILE DATA BASED ON customer_id
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

// FETCH BOOKINGS BASED ON booking_id 
app.get('/api/loans/fetchBookings', async (req, res) => {
  try {
    const { booking_id } = req.query;

    if (!booking_id) {
      return res.status(400).json({ error: 'booking_id is required' });
    }

    const [rows] = await db.execute(
      "SELECT * FROM bookings WHERE booking_id = ?",
      [booking_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json(rows[0]); 
  } catch (err) {
    console.error('Error fetching booking:', err);
    res.status(500).json({ error: 'Failed to fetch booking 😓' });
  }
});

/****** ADD LOAN ROUTE ******/ 

// Check if booking exists
app.get('/api/check-booking/:bookingId', async (req, res) => {
  const { bookingId } = req.params;
  const decodedBookingId = decodeURIComponent(bookingId); // Decode the booking ID

  try {
    const booking = await db.query('SELECT * FROM bookings WHERE booking_id = ?', [decodedBookingId]);

    if (booking.length === 0) {
      return res.json({ status: 'notfound', message: 'Booking ID not found' });
    }

    res.json({ status: 'success', data: booking[0] });
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.json({ status: 'error', message: 'Internal Server Error' });
  }
});

// Update bookings table with loan info
app.put('/api/update-booking', async (req, res) => {
  const { booking_id, loan, total_loan } = req.body;
  const decodedBookingId = decodeURIComponent(booking_id);

  console.log('Updating booking with ID:', decodedBookingId);
  console.log('New Loan Info:', { loan, total_loan });

  try {
    // Perform the update query
    const result = await db.query(
      'UPDATE bookings SET loan = ?, total_loan = ? WHERE booking_id = ?',
      [loan, total_loan, decodedBookingId]
    );

    // Log the result to check how many rows were affected
    console.log('Update result:', result);

    // Even if no rows were changed, consider the update a success
    if (result.affectedRows >= 0) {
      return res.json({
        status: 'success',
        message: 'Booking update successful (query executed)',
      });
    }

    // In case of no rows affected, return success anyway
    res.json({
      status: 'success',
      message: 'Booking already up to date (no changes were made)',
    });
    
  } catch (error) {
    console.error('Error updating booking:', error);
    res.json({ status: 'error', message: 'Internal Server Error' });
  }
});

// Get updated booking info
app.get('/api/get-booking-details/:bookingId', async (req, res) => {
  const { bookingId } = req.params;
  const decodedBookingId = decodeURIComponent(bookingId); // Decode the booking ID

  try {
    const booking = await db.query('SELECT * FROM bookings WHERE booking_id = ?', [decodedBookingId]);

    if (booking.length === 0) {
      return res.json({ status: 'notfound', message: 'Booking ID not found' });
    }

    res.json({ status: 'success', data: booking[0] });
  } catch (error) {
    console.error('Error fetching updated booking:', error);
    res.json({ status: 'error', message: 'Internal Server Error' });
  }
});

// Add Loan in loans table
/* working version
app.post('/api/add-loan', async (req, res) => {
  const {
    booking_id,
    customer_id,
    name,
    contact,
    booking_date,
    type,
    persons,
    package_price,
    infants,
    infant_price,
    total_price,
    pending,
    total_loan,
    received_loan,
    loan_status,
  } = req.body;

  const decodedBookingId = decodeURIComponent(booking_id);
  console.log('Decoded booking_id in add-loan:', decodedBookingId);  // Log the decoded booking_id

  try {
    const result = await db.query(
      'INSERT INTO loans (booking_id, customer_id, name, contact, booking_date, type, persons, package_price, infants, infant_price, total_price, pending, total_loan, received_loan, loan_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [decodedBookingId, customer_id, name, contact, booking_date, type, persons, package_price, infants, infant_price, total_price, pending, total_loan, received_loan, loan_status]
    );

    console.log('Loan insertion result:', result);  // Log the query result

    if (result.affectedRows > 0) {
      return res.json({ status: 'success', message: 'Loan added successfully' });
    }

    res.json({ status: 'error', message: 'Loan addition failed' });
  } catch (error) {
    console.error('Error during loan insertion:', error);  // Log the full error
    res.json({ status: 'error', message: error.message || 'Internal Server Error' });
  }
}); */


app.post('/api/add-loan', async (req, res) => {
  const {
    booking_id,
    customer_id,
    name,
    contact,
    booking_date,
    type,
    persons,
    package_price,
    infants,
    infant_price,
    total_price,
    pending,
    total_loan,
    received_loan,
    loan_status,
    group,
    bank,
    cash,
    received,
    requirement,
    refrence,   
    source,
    status,
    banned,
    loan
  } = req.body;

  const decodedBookingId = decodeURIComponent(booking_id);
  console.log('Decoded booking_id in add-loan:', decodedBookingId);

  // Log values to double check before inserting
  console.log('Values to insert:', [
    decodedBookingId,
    customer_id,
    name,
    contact,
    booking_date,
    type,
    persons,
    package_price,
    infants,
    infant_price,
    total_price,
    pending,
    total_loan,
    received_loan,
    loan_status,
    group,
    bank,
    cash,
    received,
    requirement,
    refrence,
    source,
    status,
    banned,
    loan
  ]);

  try {
    const result = await db.query(
      `INSERT INTO loans (
        booking_id,
        customer_id,
        name,
        contact,
        booking_date,
        type,
        persons,
        package_price,
        infants,
        infant_price,
        total_price,
        pending,
        total_loan,
        received_loan,
        loan_status,
        \`group\`,
        bank,
        cash,
        received,
        requirement,
        refrence,
        source,
        status,
        banned,
        loan
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        decodedBookingId,
        customer_id,
        name,
        contact,
        booking_date,
        type,
        persons,
        package_price,
        infants,
        infant_price,
        total_price,
        pending,
        total_loan,
        received_loan,
        loan_status,
        group,
        bank,
        cash,
        received,
        requirement,
        refrence,
        source,
        status,
        banned,
        loan
      ]
    );

    console.log('Loan insertion result:', result);


    return res.json({ status: 'success', message: 'Loan added successfully' });

  } catch (error) {
    console.error('Error during loan insertion:', error);
    res.json({ status: 'error', message: error.message || 'Internal Server Error' });
  }
});

/****** END OF ADD LOAN ROUTE ******/

// ROUTE TO FETCH ACTIVE LOANS ONLY
app.get('/api/loans/active', async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM loans WHERE loan_status = 'active'");
    res.json(rows);
  } catch (err) {
    console.error('Error fetching active loans:', err);
    res.status(500).json({ error: 'Failed to fetch active loans 😓' });
  }
});

// ROUTE TO FETCH COMPLETED LOANS ONLY
app.get('/api/loans/completed', async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM loans WHERE loan_status = 'completed'");
    res.json(rows);
  } catch (err) {
    console.error('Error fetching completed loans:', err);
    res.status(500).json({ error: 'Failed to fetch completed loans 😓' });
  }
});

// ROUTE TO DELETE LOAN (path param; no body)
app.delete('/api/loans/:booking_id', async (req, res) => {
  const { booking_id } = req.params;

  if (!booking_id) {
    return res.status(400).json({ error: 'booking_id is required 😕' });
  }

  try {
    const [result] = await db.execute(
      'DELETE FROM loans WHERE booking_id = ?',
      [booking_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Loan not found 😕' });
    }

    res.json({ message: 'Loan deleted successfully ✅' });
  } catch (err) {
    console.error('Error deleting loan:', err);
    res.status(500).json({ error: 'Failed to delete loan 😓' });
  }
});

// helpers: get a dedicated connection for transactions
// assuming `db` is a mysql2 pool
const getConn = () => db.getConnection();

app.post('/api/loans/:booking_id/pay', async (req, res) => {
  const booking_id_param = req.params.booking_id;             // e.g. %23U-0005-SEP
  const booking_id = decodeURIComponent(booking_id_param);    // "#U-0005-SEP"
  let { cash = 0, bank = 0 } = req.body;

  cash = Number(cash) || 0;
  bank = Number(bank) || 0;

  if (cash < 0 || bank < 0) {
    return res.status(400).json({ error: 'Amounts must be ≥ 0' });
  }
  if (cash === 0 && bank === 0) {
    return res.status(400).json({ error: 'Enter cash or bank amount' });
  }

  const conn = await getConn();
  try {
    await conn.beginTransaction();

    // Fetch current booking + loan rows (FOR UPDATE to lock them)
    const [bookingRows] = await conn.execute(
      'SELECT booking_id, total_price, cash, bank, received, pending FROM bookings WHERE booking_id = ? FOR UPDATE',
      [booking_id]
    );
    if (bookingRows.length === 0) {
      await conn.rollback();
      return res.status(404).json({ error: 'Booking not found' });
    }
    const booking = bookingRows[0];

    const [loanRows] = await conn.execute(
      `SELECT booking_id, total_loan, cash AS loan_cash, bank AS loan_bank,
              received AS loan_received, pending AS loan_pending, received_loan, loan_status
       FROM loans WHERE booking_id = ? FOR UPDATE`,
      [booking_id]
    );
    if (loanRows.length === 0) {
      await conn.rollback();
      return res.status(404).json({ error: 'Loan not found' });
    }
    const loan = loanRows[0];

    // --- Compute new numbers (BOOKINGS) ---
    const newBookingCash = Number(booking.cash || 0) + cash;
    const newBookingBank = Number(booking.bank || 0) + bank;
    const newBookingReceived = newBookingCash + newBookingBank;
    const newBookingPending = Math.max(0, Number(booking.total_price || 0) - newBookingReceived);

    // --- Compute new numbers (LOANS) ---
    const newLoanCash = Number(loan.loan_cash || 0) + cash;
    const newLoanBank = Number(loan.loan_bank || 0) + bank;
    const newLoanReceived = newLoanCash + newLoanBank;               // mirrors loans.received (sum of cash+bank)
    const newReceivedLoan = Number(loan.received_loan || 0) + cash + bank; // separate tracker if you keep both
    const newLoanPending = Math.max(0, Number(booking.total_price || 0) - newBookingReceived);

    // Auto-complete loan when fully paid
    const newLoanStatus = newLoanPending === 0 ? 'completed' : (loan.loan_status || 'active');

    // 1) Update bookings
    await conn.execute(
      `UPDATE bookings
       SET cash = ?, bank = ?, received = ?, pending = ?
       WHERE booking_id = ?`,
      [newBookingCash, newBookingBank, newBookingReceived, newBookingPending, booking_id]
    );

    // 2) Update loans
    await conn.execute(
      `UPDATE loans
       SET cash = ?, bank = ?, received = ?, pending = ?, received_loan = ?, loan_status = ?
       WHERE booking_id = ?`,
      [newLoanCash, newLoanBank, newLoanReceived, newLoanPending, newReceivedLoan, newLoanStatus, booking_id]
    );

    // 3) Insert installments row (only the amounts entered now)
    await conn.execute(
      `INSERT INTO installments (booking_id, payment_date, total_amount_paid, cash, bank)
       VALUES (?, NOW(), ?, ?, ?)`,
      [booking_id, cash + bank, cash, bank]
    );

    await conn.commit();

    return res.json({
      message: 'Payment recorded ✅',
      booking: {
        cash: newBookingCash,
        bank: newBookingBank,
        received: newBookingReceived,
        pending: newBookingPending,
      },
      loan: {
        cash: newLoanCash,
        bank: newLoanBank,
        received: newLoanReceived,
        received_loan: newReceivedLoan,
        pending: newLoanPending,
        loan_status: newLoanStatus,
      }
    });
  } catch (err) {
    console.error('Payment error:', err);
    try { await conn.rollback(); } catch {}
    return res.status(500).json({ error: 'Failed to record payment' });
  } finally {
    conn.release();
  }
});


// ✅ GET ALL EXPENSES
app.get('/api/expenses', async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM expenses ORDER BY date DESC");
    res.json(rows);
  } catch (err) {
    console.error("Error fetching expenses:", err);
    res.status(500).json({ error: "Failed to fetch expenses 😓" });
  }
});

// ✅ ADD NEW EXPENSE
app.post('/api/expenses', async (req, res) => {
  try {
    const { date, from_bank, from_cash, total_amount, done_by, entered_by, description } = req.body;

    await db.execute(
      `INSERT INTO expenses (date, from_bank, from_cash, total_amount, done_by, entered_by, description)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [date, from_bank, from_cash, total_amount, done_by, entered_by, description]
    );

    res.json({ success: true, message: "Expense added ✅" });

  } catch (err) {
    console.error("Error adding expense:", err);
    res.status(500).json({ error: "Failed to add expense 😓" });
  }
});

// ✅ UPDATE EXPENSE
app.put('/api/expenses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { date, from_bank, from_cash, total_amount, done_by, entered_by, description } = req.body;

    await db.execute(
      `UPDATE expenses
       SET date=?, from_bank=?, from_cash=?, total_amount=?, done_by=?, entered_by=?, description=?
       WHERE id=?`,
      [date, from_bank, from_cash, total_amount, done_by, entered_by, description, id]
    );

    res.json({ success: true, message: "Expense updated ✨" });

  } catch (err) {
    console.error("Error updating expense:", err);
    res.status(500).json({ error: "Failed to update expense 😓" });
  }
});

// ✅ DELETE EXPENSE
app.delete('/api/expenses/:id', async (req, res) => {
  try {
    await db.execute("DELETE FROM expenses WHERE id=?", [req.params.id]);
    res.json({ success: true, message: "Expense deleted 🗑️" });
  } catch (err) {
    console.error("Error deleting expense:", err);
    res.status(500).json({ error: "Failed to delete expense 😓" });
  }
});


// 💎 HELPER: build HTML for PDF
function buildQuoteHtml(data) {
    const {
        group,
        fullName,
        booking_id,
        contact,
        no_of_adults,
        no_of_infants,
        booking_date,
        trip_type,
        packages,
        inclusions = [],
    } = data;

    const safePackages = Array.isArray(packages) ? packages : [];

    const packagesHtml =
        safePackages.length === 0
            ? `<p class="no-packages">No packages added.</p>`
            : safePackages
                  .map(
                      (pkg, index) => `
            <div class="package-card">
                <div class="package-header">
                    <div class="package-title">
                        <span class="package-badge">PACKAGE ${index + 1}</span>
                        <span class="package-days">${pkg.noOfDays || '-'} DAYS</span>
                    </div>
                    <div class="package-price-pill">
                        <div class="price-line">
                            <span class="label">Per Adult</span>
                            <span class="value">${pkg.pricePerAdult || '-'}</span>
                        </div>
                        <div class="price-line">
                            <span class="label">Per Infant</span>
                            <span class="value">${pkg.pricePerInfant || '-'}</span>
                        </div>
                    </div>
                </div>

                <div class="package-body">
                    <div class="package-details-grid">
                        <div class="detail">
                            <div class="detail-label">Makkah Hotel</div>
                            <div class="detail-value">${pkg.makkahHotel || '-'}</div>
                        </div>
                        <div class="detail">
                            <div class="detail-label">Madinah Hotel</div>
                            <div class="detail-value">${pkg.medinahHotel || '-'}</div>
                        </div>
                        <div class="detail">
                            <div class="detail-label">Total Package Price</div>
                            <div class="detail-value total">${pkg.totalPrice || '-'}</div>
                        </div>
                    </div>
                </div>

                <div class="package-footer">
                    <span class="tiny-note">* All prices are subject to change at the time of actual booking.</span>
                </div>
            </div>
        `
                  )
                  .join('');

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8" />
    <title>Quotation - ${group || 'Group'}</title>
    <style>
        /* =============== GLOBAL =============== */
        * {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            padding: 0;
            font-family: Arial, Helvetica, sans-serif;
            background: #ffffff;
        }

        .quote-wrapper {
            width: 100%;
            min-height: 100vh;
            padding: 24px 32px;
            margin: 0 auto;
            padding: 2px;
        }

        .quote-inner {
            background: #ffffff; /* white card */
            border-radius: 18px;
            padding: 24px 28px 18px 28px;
            position: relative;
            overflow: hidden;
        }

        /* subtle corner accents */
        .quote-inner::before,
        .quote-inner::after {
            content: "";
            position: absolute;
            border-radius: 999px;
            opacity: 0.12;
        }

        .quote-inner::before {
            width: 180px;
            height: 180px;
            background: #C89439; /* gold accent */
            top: -80px;
            right: -40px;
        }

        .quote-inner::after {
            width: 160px;
            height: 160px;
            background: #0C4D27; /* green accent */
            bottom: -90px;
            left: -30px;
        }

        /* =============== HEADER =============== */
        .header {
            position: relative;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 18px;
            z-index: 1;
        }

        .brand-block {
            max-width: 55%;
        }

        .brand-name {
            font-size: 26px;
            font-weight: 800;
            letter-spacing: 0.06em;
            text-transform: uppercase;
            color: #0C4D27; /* logo green */
        }

        .brand-subtitle {
            font-size: 15px;
            text-transform: uppercase;
            letter-spacing: 0.15em;
            color: #C89439; /* gold */
            margin-top: 2px;
        }

        .brand-meta {
            font-size: 14px;
            color: #6b7280;
            margin-top: 6px;
            line-height: 1.4;
        }

        .quote-title-block {
            text-align: right;
        }

        .quote-label {
            font-size: 15px;
            letter-spacing: 0.18em;
            text-transform: uppercase;
            color: #9ca3af;
        }

        .quote-main-title {
            font-size: 28px;
            font-weight: 800;
            color: #0C4D27; /* green heading */
            margin: 4px 0 4px 0;
        }

        .quote-tagline {
            font-size: 14px;
            color: #6b7280;
        }

        .quote-meta {
            margin-top: 8px;
            padding: 6px 10px;
            border-radius: 999px;
            font-size: 13px;
            color: #0f172a;
            background: linear-gradient(90deg, #FFF7E6, #F4E3B0); /* soft gold gradient */
            display: inline-block;
        }

        /* =============== DIVIDER =============== */
        .divider {
            height: 1px;
            width: 100%;
            background: linear-gradient(to right, transparent, #F4E3B0, transparent); /* gold line */
            margin: 12px 0 14px 0;
        }

        /* =============== INFO GRID =============== */
        .info-grid {
            display: table;
            width: 100%;
            margin-bottom: 14px;
            z-index: 1;
            position: relative;
        }

        .info-column {
            display: table-cell;
            vertical-align: top;
            width: 50%;
            padding-right: 10px;
        }

        .info-column.right {
            padding-right: 0;
            padding-left: 10px;
            border-left: 1px dashed #e5e7eb;
        }

        .info-heading {
            font-size: 15px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.12em;
            color: #0C4D27; /* green section title */
            margin-bottom: 4px;
        }

        .info-item {
            font-size: 14px;
            margin-bottom: 4px;
        }

        .info-label {
            font-weight: 600;
            color: #4b5563;
        }

        .info-value {
            margin-left: 4px;
            color: #111827;
        }

        /* =============== HIGHLIGHT STRIP =============== */
        .highlight-strip {
            margin-bottom: 16px;
            border-radius: 12px;
            background: linear-gradient(90deg, #0C4D27, #C89439, #F4E3B0); /* green to gold */
            padding: 1px;
        }

        .highlight-inner {
            border-radius: 11px;
            background: #ffffff;
            padding: 8px 10px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 13px;
        }

        .highlight-left {
            color: #0f172a;
        }

        .highlight-title {
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.12em;
            color: #0C4D27;
        }

        .highlight-sub {
            color: #6b7280;
            margin-top: 2px;
        }

        .highlight-right {
            text-align: right;
            color: #1e293b;
        }

        .highlight-pill {
            padding: 4px 8px;
            border-radius: 999px;
            background: #0C4D27; /* green pill */
            color: #ffffff;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.14em;
            display: inline-block;
            font-size: 12px;
            margin-bottom: 2px;
        }

        .highlight-note {
            font-size: 12px;
            color: #6b7280;
        }

        /* =============== PACKAGES SECTION =============== */
        .packages-section-heading {
            font-size: 15px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.14em;
            color: #0C4D27;
            margin-bottom: 6px;
        }

        .packages-note {
            font-size: 13px;
            color: #9ca3af;
            margin-bottom: 8px;
        }

        .packages-container {
            margin-bottom: 12px;
        }

        .no-packages {
            font-size: 14px;
            color: #6b7280;
            padding: 8px;
            border-radius: 10px;
            background: #f3f4f6;
        }

        .package-card {
            border-radius: 14px;
            padding: 10px 12px;
            margin-bottom: 8px;
            background: linear-gradient(135deg, #FFF7E6 0%, #ffffff 40%, #FDF3D7 100%); /* warm gold-ish card */
            border: 1px solid rgba(200, 148, 57, 0.4); /* gold border */
            box-shadow:
                0 8px 16px rgba(15, 23, 42, 0.08),
                inset 0 0 0 0.5px rgba(248, 250, 252, 0.8);
        }

        .package-header {
            display: table;
            width: 100%;
            margin-bottom: 6px;
        }

        .package-title {
            display: table-cell;
            vertical-align: top;
        }

        .package-badge {
            display: inline-block;
            padding: 3px 7px;
            border-radius: 999px;
            font-size: 13px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.14em;
            color: #0C4D27;
            background: #F4E3B0; /* light gold */
        }

        .package-days {
            display: inline-block;
            margin-left: 6px;
            font-size: 13px;
            color: #0C4D27;
            font-weight: 600;
        }

        .package-price-pill {
            display: table-cell;
            vertical-align: middle;
            text-align: right;
            padding-left: 6px;
        }

        .price-line {
            font-size: 13px;
            padding: 2px 0;
        }

        .price-line .label {
            color: #6b7280;
            margin-right: 4px;
        }

        .price-line .value {
            font-weight: 700;
            color: #111827;
        }

        .package-body {
            font-size: 13px;
        }

        .package-details-grid {
            display: table;
            width: 100%;
        }

        .detail {
            display: table-cell;
            vertical-align: top;
            padding-right: 8px;
        }

        .detail:last-child {
            padding-right: 0;
        }

        .detail-label {
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.12em;
            color: #6b7280;
            margin-bottom: 2px;
        }

        .detail-value {
            font-size: 13px;
            font-weight: 600;
            color: #0f172a;
        }

        .detail-value.total {
            color: #0C4D27; /* green highlight for totals */
        }

        .package-footer {
            margin-top: 4px;
            font-size: 11px;
            color: #9ca3af;
        }

        .tiny-note {
            font-style: italic;
        }

        /* =============== TERMS & FOOTER =============== */
        .terms-section {
            border-radius: 12px;
            border: 1px dashed #e5e7eb;
            padding: 8px 10px;
            font-size: 12px;
            color: #4b5563;
            margin-bottom: 10px;
            background: #ffffff;
        }

        .terms-title {
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.14em;
            font-size: 13px;
            color: #0C4D27;
            margin-bottom: 4px;
        }

        .terms-list {
            margin: 0;
            padding-left: 12px;
        }

        .terms-list li {
            margin-bottom: 2px;
        }

        .footer-row {
            font-size: 12px;
            color: #9ca3af;
            display: table;
            width: 100%;
            margin-top: 4px;
        }

        .footer-cell {
            display: table-cell;
            vertical-align: middle;
            width: 50%;
        }

        .footer-cell.right {
            text-align: right;
        }

        .footer-brand {
            font-weight: 600;
            color: #0C4D27; /* green brand line */
        }

        .footer-contact-line {
            margin-top: 2px;
            color: #6b7280;
        }
    </style>
</head>
<body>
    <div class="page">
        <div class="quote-wrapper">
            <div class="quote-inner">
                <!-- HEADER -->
                <div class="header">
                    <div class="brand-block">
                        <div class="brand-name">GREEN DOME TRAVEL & TOURS</div>
                        <div class="brand-subtitle">UMRAH • HAJJ • ZIYARAT • TOURS</div>
                        <div class="brand-meta">
                            Karachi, Pakistan<br />
                            info@greendometravel.com | +92-XXX-XXXXXXX
                        </div>
                    </div>

                    <div class="quote-title-block">
                        <div class="quote-label">Official Quotation</div>
                        <div class="quote-main-title">UMRAH QUOTE</div>
                        <div class="quote-tagline">Tailored for your group: <strong>${group || '-'}</strong></div>
                        <div class="quote-meta">
                            REF: <strong>${booking_id || '-'}</strong> &nbsp;•&nbsp;
                            DATE: <strong>${booking_date || '-'}</strong>
                        </div>
                    </div>
                </div>

                <div class="divider"></div>

                <!-- INFO GRID -->
                <div class="info-grid">
                    <div class="info-column">
                        <div class="info-heading">Lead Pilgrim</div>
                        <div class="info-item">
                            <span class="info-label">Name:</span>
                            <span class="info-value">${fullName || '-'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Contact:</span>
                            <span class="info-value">${contact || '-'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Group Name:</span>
                            <span class="info-value">${group || '-'}</span>
                        </div>
                    </div>

                    <div class="info-column right">
                        <div class="info-heading">Travel Details</div>
                        <div class="info-item">
                            <span class="info-label">Trip Type:</span>
                            <span class="info-value">${trip_type || '-'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Adults:</span>
                            <span class="info-value">${no_of_adults || '-'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Infants:</span>
                            <span class="info-value">${no_of_infants || '-'}</span>
                        </div>
                    </div>
                </div>

                <!-- HIGHLIGHT STRIP -->
                <div class="highlight-strip">
                    <div class="highlight-inner">
                        <div class="highlight-left">
                            <div class="highlight-title">Custom-curated Umrah experience</div>
                            <div class="highlight-sub">
                                This quotation is based on your selected travel dates, star category and rooming preferences.
                            </div>
                        </div>
                        <div class="highlight-right">
                            <div class="highlight-pill">Quotation Preview</div>
                            <div class="highlight-note">
                                Final price will be reconfirmed at time of booking due to airline & hotel dynamics.
                            </div>
                        </div>
                    </div>
                </div>

                <!-- PACKAGES -->
                <div class="packages-section-heading">Package Breakdown</div>
                <div class="packages-note">
                    Below are the package options carefully crafted for your group. You may choose one or request
                    a revised combination of hotels, nights or inclusions.
                </div>

                <div class="packages-container">
                    ${packagesHtml}
                </div>

                <!-- TERMS -->
                <div class="terms-section">
                    <div class="terms-title">Important Notes & Terms</div>
                    <ul class="terms-list">
                        <li>Rates are subject to availability at the time of confirmation and may change without prior notice.</li>
                        <li>Visa approval is at the sole discretion of the concerned authorities.</li>
                        <li>Airline fares, taxes and surcharges vary daily; exact amount will be confirmed on issuance.</li>
                        <li>Any additional nights, room upgrades or change of airlines will impact the total cost.</li>
                        <li>All payments are to be made in advance as per the agreed schedule shared at booking time.</li>
                    </ul>
                </div>

                <!-- FOOTER -->
                <div class="footer-row">
                    <div class="footer-cell">
                        <div class="footer-brand">Prepared by: Green Dome Travel & Tours</div>
                        <div class="footer-contact-line">
                            For confirmations & questions, please contact your dedicated consultant.
                        </div>
                    </div>
                    <div class="footer-cell right">
                        <div>May Allah accept your intentions and grant you a blessed journey.</div>
                        <div>— Team Green Dome</div>
                    </div>
                </div>

            </div>
        </div>
    </div>
</body>
</html>
    `;
}

// ============== ROUTE ==============
app.post('/api/generate-pdf', (req, res) => {
    try {
        const {
            group,
            fullName,
            booking_id,
            contact,
            no_of_adults,
            no_of_infants,
            booking_date,
            trip_type,
            packages,
        } = req.body;

        // You can keep / relax validation as you wish
        if (
            !group ||
            !fullName ||
            !booking_id ||
            !contact ||
            !no_of_adults ||
            !no_of_infants ||
            !booking_date ||
            !trip_type
        ) {
            return res.status(400).send('Missing required fields for quotation');
        }

        // Extract selected inclusions (checkboxes)
        const inclusions = [];

        if (req.body.food) inclusions.push("Food");
        if (req.body.medical) inclusions.push("Medical Insurance");
        if (req.body.hotel) inclusions.push("Accommodation");
        if (req.body.visa) inclusions.push("VISA");
        if (req.body.ticket) inclusions.push("Ticket");
        if (req.body.zyarat) inclusions.push("Zyarat");
        if (req.body.transport) inclusions.push("Inter-City Transport");
        if (req.body.merchandise) inclusions.push("Merchandise");


        const htmlContent = buildQuoteHtml({
            group,
            fullName,
            booking_id,
            contact,
            no_of_adults,
            no_of_infants,
            booking_date,
            trip_type,
            packages,
            inclusions,
        });

        const pdfOptions = {
            format: 'A4',
            border: {
                top: '6mm',
                right: '6mm',
                bottom: '6mm',
                left: '6mm',
            },
        };

        pdf.create(htmlContent, pdfOptions).toBuffer((err, buffer) => {
            if (err) {
                console.error('Error generating PDF:', err);
                return res.status(500).send('Error generating PDF');
            }

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename=umrah-quote.pdf');
            res.send(buffer);
        });
    } catch (err) {
        console.error('Unexpected error in /api/generate-pdf:', err);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/api/send-email', async (req, res) => {
  const { to, subject, message, html } = req.body;

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text: message || "",   // optional
      html: html || "",      // <-- use HTML template here
    });

    res.json({ success: true, msg: "Email sent ✅" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, msg: "Failed to send email 😓" });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});