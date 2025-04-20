const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');

const app = express();
const PORT = 3000;

// In-memory user store (for demo purposes)
const users = [];
const bookings = [];
const contacts = [];

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

// Signup endpoint
app.post('/api/auth/signup', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password required' });
  }
  const existingUser = users.find(u => u.username === username);
  if (existingUser) {
    return res.status(409).json({ message: 'User already exists' });
  }
  users.push({ username, password });
  req.session.user = { username };
  res.json({ message: 'Signup successful', user: { username } });
});

// Login endpoint
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  req.session.user = { username };
  res.json({ message: 'Login successful', user: { username } });
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
  const booking = req.body;
  bookings.push(booking);
  res.json({ message: 'Booking received', booking });
});

// Contact endpoint
app.post('/api/contact', (req, res) => {
  const contact = req.body;
  contacts.push(contact);
  res.json({ message: 'Contact message received', contact });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
