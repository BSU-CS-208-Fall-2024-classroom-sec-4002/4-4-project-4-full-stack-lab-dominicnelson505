import express from 'express';
import bodyParser from 'body-parser';
import sqlite3Module from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

// Use `fileURLToPath` to get the path to the current file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sqlite3 = sqlite3Module.verbose();
const db = new sqlite3.Database(':memory:');

// Create the todo table
db.run(`CREATE TABLE todo (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task TEXT NOT NULL
)`);

const app = express();
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, '../views')); // Updated path for views directory
app.use(express.static(path.join(__dirname, '../public'))); // Updated path for static files
app.use(bodyParser.urlencoded({ extended: true }));

// Get route to display tasks
app.get('/', (req, res) => {
  const local = { tasks: [] };
  db.each('SELECT id, task FROM todo', (err, row) => {
    if (err) {
      console.error(err.message);
    } else {
      local.tasks.push({ id: row.id, task: row.task });
    }
  }, (err, numRows) => {
    if (!err) {
      res.render('index', local);
    } else {
      console.error(err.message);
    }
  });
});

// Add task route
app.post('/add', (req, res) => {
  const stmt = db.prepare('INSERT INTO todo (task) VALUES (?)');
  stmt.run(req.body.todo, (err) => {
    if (err) console.error(err.message);
  });
  stmt.finalize();
  res.redirect('/');
});

// Delete task route
app.post('/delete', (req, res) => {
  const stmt = db.prepare('DELETE FROM todo WHERE id = ?');
  stmt.run(req.body.id, (err) => {
    if (err) console.error(err.message);
  });
  stmt.finalize();
  res.redirect('/');
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`);
});
