const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'tourdulich',
    port: 3306
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the MySQL database.');
});

// Register endpoint
app.post('/register', async (req, res) => {
    const { phone_number, name, gender, birth_date, password } = req.body;
    console.log('Registration request:', req.body);

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('Hashed Password:', hashedPassword);
        db.query('INSERT INTO users (user_id, phone_number, name, gender, birth_date, password) VALUES (UUID(), ?, ?, ?, ?, ?)', 
        [phone_number, name, gender, birth_date, hashedPassword], (err, result) => {
            if (err) {
                console.error('Error inserting user:', err);
                return res.status(500).send('Error registering user');
            }
            res.status(201).send('User registered');
        });
    } catch (err) {
        console.error('Error during hashing or database operation:', err);
        res.status(500).send('Server error during registration');
    }
});

app.post('/login', (req, res) => {
    const { phone_number, password } = req.body;
    console.log('Login request:', req.body);

    db.query('SELECT user_id, phone_number, password, role FROM users WHERE phone_number = ?', [phone_number], async (err, results) => {
        if (err) {
            console.error('Error fetching user:', err);
            return res.status(500).send('Error logging in');
        }

        if (results.length === 0) {
            console.log('User not found:', phone_number);
            return res.status(400).send('User not found');
        }

        const user = results[0];
        console.log('User found:', user);

        try {
            const isPasswordValid = await bcrypt.compare(password, user.password);
            console.log('Password is valid:', isPasswordValid);
            if (!isPasswordValid) {
                console.log('Invalid password for user:', phone_number);
                return res.status(400).send('Invalid password');
            }

            const token = jwt.sign({ userId: user.user_id, role: user.role }, 'your_jwt_secret');
            res.status(200).json({ token, user });
        } catch (err) {
            console.error('Error during password comparison:', err);
            res.status(500).send('Server error during login');
        }
    });
});

// Create tour endpoint
app.post('/tours', (req, res) => {
    const { name, description, start_date, end_date, active_days, price, max_seats, image_url, status } = req.body;

    const query = `INSERT INTO tours (tour_id, name, description, start_date, end_date, active_days, price, max_seats, image_url, status)
                   VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.query(query, [name, description, start_date, end_date, active_days, price, max_seats, image_url, status], (err, result) => {
        if (err) {
            console.error('Error creating tour:', err);
            return res.status(500).send('Error creating tour');
        }
        res.status(201).send('Tour created');
    });
});

// Fetch tours endpoint
app.get('/tours', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;
    const offset = (page - 1) * limit;

    db.query(
        'SELECT tour_id, name, image_url, price, max_seats, (SELECT AVG(rating) FROM reviews WHERE reviews.tour_id = tours.tour_id) as avg_rating, (SELECT COUNT(*) FROM reviews WHERE reviews.tour_id = tours.tour_id) as reviews FROM tours ORDER BY name LIMIT ? OFFSET ?',
        [limit, offset],
        (err, results) => {
            if (err) {
                console.error('Error fetching tours:', err);
                return res.status(500).send('Error fetching tours');
            }
            db.query('SELECT COUNT(*) AS total FROM tours', (err, countResult) => {
                if (err) {
                    console.error('Error counting tours:', err);
                    return res.status(500).send('Error counting tours');
                }
                const total = countResult[0].total;
                res.status(200).json({ tours: results, total });
            });
        }
    );
});

// Add category endpoint    
app.post('/categories', (req, res) => {
    const { name } = req.body;
    db.query('INSERT INTO categories (category_id, name) VALUES (UUID(), ?)', [name], (err, result) => {
        if (err) {
            console.error('Error adding category:', err);
            return res.status(500).send('Error adding category');
        }
        res.status(201).send('Category added');
    });
});

// Fetch categories endpoint
app.get('/categories', (req, res) => {
    db.query('SELECT category_id, name FROM categories', (err, results) => {
        if (err) {
            console.error('Error fetching categories:', err);
            return res.status(500).send('Error fetching categories');
        }
        res.status(200).json({ categories: results });
    });
});

// Fetch user profile endpoint
app.get('/user/profile', (req, res) => {
    const { phone_number } = req.query;

    db.query('SELECT phone_number, name, gender, birth_date, role FROM users WHERE phone_number = ?', [phone_number], (err, results) => {
        if (err) {
            console.error('Error fetching user profile:', err);
            return res.status(500).json({ message: 'Error fetching user profile' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(results[0]);
    });
});

// Update user profile endpoint
app.put('/user/update', (req, res) => {
    const { phone_number, name, gender, birth_date } = req.body;
    const query = 'UPDATE users SET name = ?, gender = ?, birth_date = ? WHERE phone_number = ?';
    db.query(query, [name, gender, birth_date, phone_number], (err, result) => {
        if (err) {
            console.error('Error updating user:', err);
            return res.status(500).json({ message: 'Error updating user' });
        }
        res.status(200).json({ message: 'Profile updated successfully' });
    });
});

// Add schedule endpoint
app.post('/schedules', (req, res) => {
    const { tour_id, day_number, activity_description, start_time, end_time } = req.body;
    const query = 'INSERT INTO tour_itinerary (itinerary_id, tour_id, day_number, activity_description, start_time, end_time) VALUES (UUID(), ?, ?, ?, ?, ?)';
    db.query(query, [tour_id, day_number, activity_description, start_time, end_time], (err, result) => {
        if (err) {
            console.error('Error adding schedule:', err);
            return res.status(500).send('Error adding schedule');
        }
        res.status(201).send('Schedule added');
    });
});

// Fetch schedules endpoint
app.get('/schedules', (req, res) => {
    db.query('SELECT itinerary_id, tour_id, day_number, activity_description, start_time, end_time FROM tour_itinerary', (err, results) => {
        if (err) {
            console.error('Error fetching schedules:', err);
            return res.status(500).send('Error fetching schedules');
        }
        res.status(200).json({ schedules: results });
    });
});

// Add location endpoint    
app.post('/locations', (req, res) => {
    const { name } = req.body;
    db.query('INSERT INTO locations (location_id, name) VALUES (UUID(), ?)', [name], (err, result) => {
        if (err) {
            console.error('Error adding location:', err);
            return res.status(500).send('Error adding location');
        }
        res.status(201).send('Location added');
    });
});

// Fetch locations endpoint
app.get('/locations', (req, res) => {
    db.query('SELECT location_id, name FROM locations', (err, results) => {
        if (err) {
            console.error('Error fetching locations:', err);
            return res.status(500).send('Error fetching locations');
        }
        res.status(200).json({ locations: results });
    });
});

// Add tour to category endpoint
app.post('/tour-categories', (req, res) => {
    const { tour_id, category_id } = req.body;
    const query = 'INSERT INTO tour_categories (tour_id, category_id) VALUES (?, ?)';
    db.query(query, [tour_id, category_id], (err, result) => {
        if (err) {
            console.error('Error adding tour to category:', err);
            return res.status(500).send('Error adding tour to category');
        }
        res.status(201).send('Tour added to category');
    });
});

// Add tour to location endpoint
app.post('/tour-locations', (req, res) => {
    const { tour_id, location_id } = req.body;
    const query = 'INSERT INTO tour_locations (tour_id, location_id) VALUES (?, ?)';
    db.query(query, [tour_id, location_id], (err, result) => {
        if (err) {
            console.error('Error adding tour to location:', err);
            return res.status(500).send('Error adding tour to location');
        }
        res.status(201).send('Tour added to location');
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
