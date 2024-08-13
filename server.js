const express = require('express');
const { Pool } = require('pg');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

// PostgreSQL connection
const pool = new Pool({
    user: 'stitch',
    host: 'localhost',
    database: 'inventory',
    password: 'password',
    port: 5432,
});

// Create table if not exists
const createTableQuery = `
    CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        quantity INT NOT NULL,
        price DECIMAL(10, 2) NOT NULL
    )
`;

pool.query(createTableQuery)
    .then(() => console.log('Table created successfully'))
    .catch(err => console.error('Error creating table', err));

// Add a new product
app.post('/api/products', (req, res) => {
    const { name, quantity, price } = req.body;
    const query = 'INSERT INTO products (name, quantity, price) VALUES ($1, $2, $3) RETURNING *';
    pool.query(query, [name, quantity, price])
        .then(result => res.json(result.rows[0]))
        .catch(err => {
            console.error('Error inserting product', err);
            res.status(500).json({ error: 'Error inserting product', details: err.message });
        });
});

// Get all products
app.get('/api/products', (req, res) => {
    const query = 'SELECT * FROM products';
    pool.query(query)
        .then(result => res.json(result.rows))
        .catch(err => {
            console.error('Error fetching products', err);
            res.status(500).json({ error: 'Error fetching products', details: err.message });
        });
});

// Update product
app.put('/api/products/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const { name, quantity, price } = req.body;
    console.log(`Updating product with id ${id}`, { name, quantity, price });
    const query = 'UPDATE products SET name = $1, quantity = $2, price = $3 WHERE id = $4 RETURNING *';
    pool.query(query, [name, quantity, price, id])
        .then(result => {
            if (result.rowCount === 0) {
                return res.status(404).json({ error: 'Product not found' });
            }
            res.json(result.rows[0]);
        })
        .catch(err => {
            console.error('Error updating product', err);
            res.status(500).json({ error: 'Error updating product', details: err.message });
        });
});

// Delete product
app.delete('/api/products/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const query = 'DELETE FROM products WHERE id = $1 RETURNING *';
    pool.query(query, [id])
        .then(result => {
            if (result.rowCount === 0) {
                return res.status(404).json({ error: 'Product not found' });
            }
            res.json({ message: 'Product deleted', id });
        })
        .catch(err => {
            console.error('Error deleting product', err);
            res.status(500).json({ error: 'Error deleting product', details: err.message });
        });
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
