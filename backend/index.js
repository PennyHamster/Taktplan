const express = require('express');
require('dotenv').config();
const { Pool } = require('pg');
const cors = require('cors');
const authRouter = require('./auth');
const { authenticateToken, authenticateManager } = require('./middleware');

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

// Function to create the tables if they don't exist
const createTable = async () => {
  const client = await pool.connect();
  try {
    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL
      )
    `);
    // Add the role column if it doesn't exist, to avoid breaking existing installations
    await client.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'employee'
    `);
    console.log('Table "users" is ready.');

    // Create tasks table with a foreign key to users
    await client.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        priority VARCHAR(255),
        status TEXT NOT NULL,
        "creatorId" INTEGER REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    // Add the assigneeId column if it doesn't exist, to avoid breaking existing installations
    await client.query(`
      ALTER TABLE tasks ADD COLUMN IF NOT EXISTS "assigneeId" INTEGER REFERENCES users(id) ON DELETE CASCADE
    `);
    console.log('Table "tasks" is ready.');

  } catch (err) {
    console.error('Error creating tables', err.stack);
  } finally {
    client.release();
  }
};

app.use('/api/auth', authRouter);

app.get('/', (req, res) => {
  res.send('Hello from the backend!');
});

// Get all users (manager only)
app.get('/api/users', authenticateToken, authenticateManager, async (req, res) => {
  try {
    const client = await pool.connect();
    // Exclude password_hash from the result
    const result = await client.query('SELECT id, email, role FROM users ORDER BY id ASC');
    res.json(result.rows);
    client.release();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Get all tasks for the logged-in user
app.get('/api/tasks', authenticateToken, async (req, res) => {
  try {
    const { userId, role } = req.user;
    const client = await pool.connect();
    let result;
    if (role === 'manager') {
      // Managers get all tasks
      result = await client.query('SELECT * FROM tasks ORDER BY id ASC');
    } else {
      // Employees get tasks assigned to them
      result = await client.query('SELECT * FROM tasks WHERE "assigneeId" = $1 ORDER BY id ASC', [userId]);
    }
    res.json(result.rows);
    client.release();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Create a new task for the logged-in user
app.post('/api/tasks', authenticateToken, async (req, res) => {
  const { title, description, priority, status = 'in_progress', assigneeId } = req.body;
  const { userId: creatorId } = req.user; // Renaming for clarity

  // The assigneeId is required when creating a task
  if (!assigneeId) {
    return res.status(400).json({ message: 'assigneeId is required' });
  }

  try {
    const client = await pool.connect();
    const result = await client.query(
      'INSERT INTO tasks (title, description, priority, status, "creatorId", "assigneeId") VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [title, description, priority, status, creatorId, assigneeId]
    );
    res.status(201).json(result.rows[0]);
    client.release();
  } catch (err) {
    console.error(err);
    // Foreign key constraint error
    if (err.code === '23503') {
        return res.status(404).json({ message: 'Assignee user not found.' });
    }
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Update an existing task belonging to the logged-in user
app.put('/api/tasks/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { userId, role } = req.user;
  const { title, description, priority, status, assigneeId } = req.body;

  try {
    const client = await pool.connect();

    // Build the update query dynamically
    const updateFields = [];
    const values = [];
    let paramCount = 1;

    if (title !== undefined) {
      updateFields.push(`title = $${paramCount++}`);
      values.push(title);
    }
    if (description !== undefined) {
      updateFields.push(`description = $${paramCount++}`);
      values.push(description);
    }
    if (priority !== undefined) {
      updateFields.push(`priority = $${paramCount++}`);
      values.push(priority);
    }
    if (status !== undefined) {
      updateFields.push(`status = $${paramCount++}`);
      values.push(status);
    }
    if (assigneeId !== undefined) {
      updateFields.push(`"assigneeId" = $${paramCount++}`);
      values.push(assigneeId);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    values.push(id);

    let updateQuery;
    // Managers can update any task, otherwise only the creator or assignee can update
    if (role === 'manager') {
        updateQuery = `UPDATE tasks SET ${updateFields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    } else {
        values.push(userId);
        updateQuery = `UPDATE tasks SET ${updateFields.join(', ')} WHERE id = $${paramCount++} AND ("creatorId" = $${paramCount} OR "assigneeId" = $${paramCount}) RETURNING *`;
    }

    const result = await client.query(updateQuery, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found or you do not have permission to update it' });
    }

    res.json(result.rows[0]);
    client.release();
  } catch (err) {
    console.error(err);
    // Foreign key constraint error
    if (err.code === '23503') {
        return res.status(404).json({ message: 'Assignee user not found.' });
    }
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Delete a task belonging to the logged-in user
app.delete('/api/tasks/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { userId, role } = req.user;
    try {
        const client = await pool.connect();

        let result;
        // Managers can delete any task, otherwise only the creator can delete
        if (role === 'manager') {
            result = await client.query('DELETE FROM tasks WHERE id = $1', [id]);
        } else {
            result = await client.query('DELETE FROM tasks WHERE id = $1 AND "creatorId" = $2', [id, userId]);
        }

        if (result.rowCount === 0) {
            client.release();
            return res.status(404).json({ message: 'Task not found or you do not have permission to delete it' });
        }

        client.release();
        res.status(204).send(); // No Content
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Start the server after ensuring the table is created
app.listen(port, async () => {
  await createTable();
  console.log(`Backend listening at http://localhost:${port}`);
});