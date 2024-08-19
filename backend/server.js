const express = require('express');
const mysql = require('mysql2');
const csv = require('csv-parser');
const fs = require('fs');
const cors = require('cors'); // เพิ่มการ import cors
const app = express();
const port = 3001;

// ใช้งาน CORS middleware
app.use(cors());
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',

    database: 'population'
});

connection.connect(err => {
    if (err) throw err;
    console.log('Connected to MySQL');
});

// Endpoint to fetch population data
app.get('/population', (req, res) => {
    const countries = ['USA', 'Brazil', 'Canada', 'Mexico', 'Argentina'];
    const placeholders = countries.map(() => '?').join(',');
    const sql = `SELECT * FROM population_growth WHERE country IN (${placeholders})`;

    connection.query(sql, countries, (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

// Parse and insert CSV data into MySQL
fs.createReadStream('./population-and-demography.csv')
    .pipe(csv())
    .on('data', (row) => {
        const sql = 'INSERT INTO population_growth (year, country, population) VALUES (?, ?, ?)';
        connection.query(sql, [row.Year, row.Country, row.Population], (err, results) => {
            if (err) throw err;
        });
    })
    .on('end', () => {
        console.log('CSV file successfully processed');
    });

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
