const express = require('express');
require('dotenv').config();
const { Pool } = require('pg');
const cors = require('cors');
const authRouter = require('./auth');
const { authenticateToken, authenticateManager, authenticateAdmin } = require('./middleware');

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
    // Add a check constraint for the roles
    await client.query(`
        ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
    `);
    await client.query(`
        ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('employee', 'manager', 'admin'));
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

// Admin endpoint to get all users
app.get('/api/admin/users', authenticateToken, authenticateAdmin, async (req, res) => {
  let client;
  try {
    console.log('Attempting to get all users (admin)');
    client = await pool.connect();
    const result = await client.query('SELECT id, email, role FROM users ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching users (admin):', err);
    res.status(500).json({ message: 'Internal Server Error' });
  } finally {
    if (client) {
      client.release();
    }
  }
});

// Admin endpoint to update a user's role
app.put('/api/admin/users/:id/role', authenticateToken, authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!role) {
    return res.status(400).json({ message: 'Role is required' });
  }

  // Optional: Add validation to ensure the role is one of the allowed values
  if (!['employee', 'manager', 'admin'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role specified' });
  }

  let client;
  try {
    client = await pool.connect();
    const result = await client.query(
      'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, email, role',
      [role, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    // Catch potential check constraint violation
    if (err.code === '23514') { // check_violation
        return res.status(400).json({ message: 'Invalid role specified' });
    }
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  } finally {
    if (client) {
      client.release();
    }
  }
});

// Get all users (manager only)
app.get('/api/users', authenticateToken, authenticateManager, async (req, res) => {
  let client;
  try {
    client = await pool.connect();
    // Exclude password_hash from the result
    const result = await client.query('SELECT id, email, role FROM users ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  } finally {
    if (client) {
      client.release();
    }
  }
});

app.get('/api/tasks', authenticateToken, authenticateManager, async (req, res) => {
  let client;
  try {
    client = await pool.connect();
    const result = await client.query('SELECT * FROM tasks ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  } finally {
    if (client) {
      client.release();
    }
  }
});

// Get all tasks for the logged-in user
app.get('/api/tasks/my-tasks', authenticateToken, async (req, res) => {
  let client;
  try {
    const { userId, role } = req.user;
    client = await pool.connect();
    let result;
    if (role === 'manager' || role === 'admin') {
      // Managers and admins get all tasks
      result = await client.query('SELECT * FROM tasks ORDER BY id ASC');
    } else {
      // Employees get tasks assigned to them
      result = await client.query('SELECT * FROM tasks WHERE "assigneeId" = $1 ORDER BY id ASC', [userId]);
    }
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  } finally {
    if (client) {
      client.release();
    }
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

  let client;
  try {
    client = await pool.connect();
    const result = await client.query(
      'INSERT INTO tasks (title, description, priority, status, "creatorId", "assigneeId") VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [title, description, priority, status, creatorId, assigneeId]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    // Foreign key constraint error
    if (err.code === '23503') {
        return res.status(404).json({ message: 'Assignee user not found.' });
    }
    res.status(500).json({ message: 'Internal Server Error' });
  } finally {
    if (client) {
      client.release();
    }
  }
});

// Update an existing task belonging to the logged-in user
app.put('/api/tasks/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { userId, role } = req.user;
  const { title, description, priority, status, assigneeId } = req.body;

  let client;
  try {
    client = await pool.connect();

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
  } catch (err) {
    console.error(err);
    // Foreign key constraint error
    if (err.code === '23503') {
        return res.status(404).json({ message: 'Assignee user not found.' });
    }
    res.status(500).json({ message: 'Internal Server Error' });
  } finally {
    if (client) {
      client.release();
    }
  }
});

// Delete a task belonging to the logged-in user
app.delete('/api/tasks/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { userId, role } = req.user;
    let client;
    try {
        client = await pool.connect();

        let result;
        // Managers can delete any task, otherwise only the creator can delete
        if (role === 'manager') {
            result = await client.query('DELETE FROM tasks WHERE id = $1', [id]);
        } else {
            result = await client.query('DELETE FROM tasks WHERE id = $1 AND "creatorId" = $2', [id, userId]);
        }

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Task not found or you do not have permission to delete it' });
        }

        res.status(204).send(); // No Content
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    } finally {
        if (client) {
            client.release();
        }
    }
});

// Start the server after ensuring the table is created
app.listen(port, async () => {
  await createTable();
  console.log(`Backend listening at http://localhost:${port}`);
});
