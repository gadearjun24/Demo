
// server.js
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(bodyParser.json());

// Connect to SQLite database
const db = new sqlite3.Database('./mydatabase.db', (err) => {
  if (err) {
    console.error('Error opening database ' + err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// Create a table if it doesn't exist
db.serialize(() => {
  // db.run("DROP TABLE users");
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL 
  )`, (err) => {
    if (err) {
      console.error('Error creating table: ' + err.message);
    } else {
      console.log('Table created or already exists.');
      // Manually insert 5 users
      insertUsers();
    }
  });
});

// Function to manually insert users
function insertUsers() {
  const users = [
    { name: 'Alice1', email: 'alic1e@example.com' },
    { name: 'Bob1', email: 'bob@e1xample.com' },
    { name: 'Charlie1', email: 'ch1arlie@example.com' },
    { name: 'David1', email: 'davi1d@example.com' },
    { name: 'Eve1', email: 'eve@e1xample.com' },
  ];

  const insert = db.prepare(`INSERT INTO users (name, email) VALUES (?, ?)`);
  
  users.forEach(user => {
    insert.run(user.name, user.email, function(err) {
      if (err) {
        console.error('Error inserting data: ' + err.message);
      } else {
        console.log(`Data inserted: ${user.name}`);
      }
    });
  });

  insert.finalize();
}

// Endpoint to get all users
app.get('/', (req, res) => {
  db.all(`SELECT * FROM users`, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Close the database connection gracefully when the server is stopped
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database: ' + err.message);
    } else {
      console.log('Database connection closed.');
    }
    process.exit(0);
  });
});
