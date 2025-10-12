const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();

// Enable CORS for all routes
app.use(cors({
  origin: 'http://localhost:3000'
}));
const port = process.env.PORT || 3001;

// Middleware to parse JSON bodies
app.use(express.json());

// PostgreSQL connection pool
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Function to create the tasks table if it doesn't exist
const createTable = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        priority VARCHAR(255),
        status TEXT NOT NULL
      )
    `);
    console.log('Table "tasks" is ready.');

    // Seed the database
    const res = await client.query('SELECT * FROM tasks');
    if (res.rowCount === 0) {
      await client.query(`
        INSERT INTO tasks (title, priority, status) VALUES
        ('UI für Kanban-Board erstellen', 'Hoch', 'in_progress'),
        ('API-Endpunkt für Tasks hinzufügen', 'Mittel', 'in_progress'),
        ('Projekt initialisieren', 'Hoch', 'done'),
        ('Datenbank-Schema entwerfen', 'Niedrig', 'done'),
        ('Authentifizierung implementieren', 'Mittel', 'later');
      `);
      console.log('Database seeded');
    }
  } catch (err) {
    console.error('Error creating or seeding table', err.stack);
  } finally {
    client.release();
  }
};

app.get('/', (req, res) => {
  res.send('Hello from the backend!');
});

// Get all tasks
app.get('/api/tasks', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM tasks ORDER BY id ASC');
    res.json(result.rows);
    client.release();
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Create a new task
app.post('/api/tasks', async (req, res) => {
  const { title, description, priority, status } = req.body;
  try {
    const client = await pool.connect();
    const result = await client.query(
      'INSERT INTO tasks (title, description, priority, status) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, description, priority, status]
    );
    res.status(201).json(result.rows[0]);
    client.release();
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Start the server after ensuring the table is created
app.listen(port, async () => {
  await createTable();
  console.log(`Backend listening at http://localhost:${port}`);
});