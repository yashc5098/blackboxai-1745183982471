const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

const app = express();
const PORT = 3000;

// Initialize SQLite database
const db = new sqlite3.Database('./yashtravels.db', (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to SQLite database');
  }
});

// Create tables if not exist
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    checkin TEXT,
    checkout TEXT,
    adults INTEGER,
    children INTEGER
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT,
    message TEXT
  )`);
});

app.use(cors({
  origin: 'http://localhost:8000',
  credentials: true,
}));
app.use(bodyParser.json());
app.use(session({
  secret: 'yashtravelssecret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // For development only, set true with HTTPS
}));

// Serve static frontend files
app.use(express.static(path.join(__dirname)));

// Signup endpoint
app.post('/api/auth/signup', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password required' });
  }
  db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }
    if (row) {
      return res.status(409).json({ message: 'User already exists' });
    }
    bcrypt.hash(password, 10, (err, hash) => {
      if (err) {
        return res.status(500).json({ message: 'Error hashing password' });
      }
      db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hash], function(err) {
        if (err) {
          return res.status(500).json({ message: 'Database error' });
        }
        req.session.user = { username };
        res.json({ message: 'Signup successful', user: { username } });
      });
    });
  });
});

// Login endpoint
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    bcrypt.compare(password, user.password, (err, result) => {
      if (err || !result) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      req.session.user = { username };
      res.json({ message: 'Login successful', user: { username } });
    });
  });
});

// Logout endpoint
app.post('/api/auth/logout', (req, res) => {
  req.session.destroy();
  res.json({ message: 'Logout successful' });
});

// Get current user
app.get('/api/auth/user', (req, res) => {
  if (req.session.user) {
    res.json({ user: req.session.user });
  } else {
    res.status(401).json({ message: 'Not logged in' });
  }
});

// Booking endpoint
app.post('/api/bookings', (req, res) => {
  const { checkin, checkout, adults, children } = req.body;
  db.run('INSERT INTO bookings (checkin, checkout, adults, children) VALUES (?, ?, ?, ?)', [checkin, checkout, adults, children], function(err) {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }
    res.json({ message: 'Booking received', bookingId: this.lastID });
  });
});

// Contact endpoint
app.post('/api/contact', (req, res) => {
  const { name, email, message } = req.body;
  db.run('INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)', [name, email, message], function(err) {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }
    res.json({ message: 'Contact message received', contactId: this.lastID });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
