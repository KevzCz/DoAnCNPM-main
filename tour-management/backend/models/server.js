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
  port: 3306,
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the MySQL database.');
});

const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];

    jwt.verify(token, 'your_jwt_secret', (err, decoded) => {
      if (err) {
        return res.sendStatus(403);
      }

      // Fetch user details from the database
      db.query(
        'SELECT name, birth_date, gender FROM users WHERE user_id = ?',
        [decoded.userId],
        (err, results) => {
          if (err || results.length === 0) {
            return res.sendStatus(403);
          }

          req.user = {
            userId: decoded.userId,
            name: results[0].name,
            birth_date: results[0].birth_date,
            gender: results[0].gender,
          };
          next();
        }
      );
    });
  } else {
    res.sendStatus(401);
  }
};


// Register endpoint
app.post('/register', async (req, res) => {
  const { phone_number, name, gender, birth_date, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    db.query('INSERT INTO users (user_id, phone_number, name, gender, birth_date, password) VALUES (UUID(), ?, ?, ?, ?, ?)', 
    [phone_number, name, gender, birth_date, hashedPassword], (err, result) => {
      if (err) {
        return res.status(500).send('Error registering user');
      }
      res.status(201).send('User registered');
    });
  } catch (err) {
    res.status(500).send('Server error during registration');
  }
});

// Login endpoint
app.post('/login', (req, res) => {
  const { phone_number, password } = req.body;

  db.query('SELECT user_id, phone_number, password, role FROM users WHERE phone_number = ?', [phone_number], async (err, results) => {
    if (err) {
      return res.status(500).send('Error logging in');
    }

    if (results.length === 0) {
      return res.status(400).send('User not found');
    }

    const user = results[0];

    try {
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(400).send('Invalid password');
      }

      const token = jwt.sign({ userId: user.user_id, role: user.role }, 'your_jwt_secret');
      res.status(200).json({ token, user });
    } catch (err) {
      res.status(500).send('Server error during login');
    }
  });
});

// Fetch user profile endpoint
app.get('/user/profile', authenticateJWT, (req, res) => {
  const userId = req.user.userId;

  db.query('SELECT user_id, phone_number, name, gender, birth_date, role FROM users WHERE user_id = ?', [userId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching user profile' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(results[0]);
  });
});

// Create tour endpoint
app.post('/tours', (req, res) => {
  const { name, description, start_date, end_date, active_days, price, max_seats, image_url, status } = req.body;

  const query = `INSERT INTO tours (tour_id, name, description, start_date, end_date, active_days, price, max_seats, seats_remaining, image_url, status)
                 VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  db.query(query, [name, description, start_date, end_date, active_days, price, max_seats, max_seats, image_url, status], (err, result) => {
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
    `SELECT tour_id, name, image_url, price, max_seats, seats_remaining,
            (SELECT AVG(rating) FROM reviews WHERE reviews.tour_id = tours.tour_id) as avg_rating, 
            (SELECT COUNT(*) FROM reviews WHERE reviews.tour_id = tours.tour_id) as review_count 
     FROM tours 
     ORDER BY name LIMIT ? OFFSET ?`,
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

// Fetch tour by ID endpoint
app.get('/tours/:id', (req, res) => {
    const { id } = req.params;
  
    db.query('SELECT * FROM tours WHERE tour_id = ?', [id], (err, tourResults) => {
      if (err) {
        console.error('Error fetching tour:', err);
        return res.status(500).send('Error fetching tour');
      }
  
      if (tourResults.length === 0) {
        return res.status(404).send('Tour not found');
      }
  
      db.query('SELECT * FROM reviews WHERE tour_id = ?', [id], (err, reviewResults) => {
        if (err) {
          console.error('Error fetching reviews:', err);
          return res.status(500).send('Error fetching reviews');
        }
  
        const tour = tourResults[0];
        tour.reviews = reviewResults;
        res.status(200).json(tour);
      });
    });
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

// Update user profile endpoint
app.put('/user/update', authenticateJWT, (req, res) => {
  const userId = req.user.userId;
  const { name, gender, birth_date } = req.body;
  const query = 'UPDATE users SET name = ?, gender = ?, birth_date = ? WHERE user_id = ?';
  db.query(query, [name, gender, birth_date, userId], (err, result) => {
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

// Create or update review endpoint
app.post('/reviews', authenticateJWT, (req, res) => {
  const { tour_id, rating } = req.body;
  const userId = req.user.userId;
  const review_date = new Date().toISOString().split('T')[0];
  const query = `INSERT INTO reviews (review_id, user_id, tour_id, rating, review_date)
                 VALUES (UUID(), ?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE rating = ?, review_date = ?`;

  db.query(query, [userId, tour_id, rating, review_date, rating, review_date], (err, result) => {
    if (err) {
      console.error('Error creating or updating review:', err);
      return res.status(500).send('Error creating or updating review');
    }
    res.status(201).send('Review created or updated');
  });
});

// Booking endpoint
app.post('/book', authenticateJWT, (req, res) => {
  const { tour_id, bookAt, guestSize, passengers } = req.body;
  const userId = req.user.userId;
  const userName = req.user.name;
  const userBirthDate = req.user.birth_date;
  const userGender = req.user.gender;

  if (!userName || !userBirthDate || !userGender) {
    console.error('Missing user details:', { userName, userBirthDate, userGender });
    return res.status(400).send('User details are incomplete.');
  }

  const bookingId = `BK${Math.random().toString().slice(2, 5)}`;

  // Start a transaction
  db.beginTransaction((err) => {
    if (err) {
      console.error('Error starting transaction:', err);
      return res.status(500).send('Server error: Error starting transaction');
    }

    // Insert booking
    db.query(
      'INSERT INTO bookings (booking_id, user_id, tour_id, booking_date, seats, status) VALUES (?, ?, ?, ?, ?, ?)',
      [bookingId, userId, tour_id, bookAt, guestSize + 1, 'Đặt'],
      (err, result) => {
        if (err) {
          return db.rollback(() => {
            console.error('Error inserting booking:', err);
            res.status(500).send('Server error: Error inserting booking');
          });
        }

        // Prepare passenger details, including the user
        const passengerDetails = [
          [
            `PG${Math.random().toString().slice(2, 5)}`,
            bookingId,
            userName,
            userBirthDate,
            userGender,
          ],
          ...passengers.map((passenger) => [
            `PG${Math.random().toString().slice(2, 5)}`,
            bookingId,
            passenger.name,
            passenger.birth_date,
            passenger.gender,
          ])
        ];

        if (passengerDetails.length > 0) {
          const placeholders = passengerDetails.map(() => '(?, ?, ?, ?, ?)').join(', ');
          const flattenedDetails = passengerDetails.flat();

          // Insert booking details
          db.query(
            `INSERT INTO booking_detail (passenger_id, booking_id, name, birth_date, gender) VALUES ${placeholders}`,
            flattenedDetails,
            (err, result) => {
              if (err) {
                return db.rollback(() => {
                  console.error('Error inserting booking details:', err);
                  res.status(500).send('Server error: Error inserting booking details');
                });
              }

              // Commit transaction
              db.commit((err) => {
                if (err) {
                  return db.rollback(() => {
                    console.error('Error committing transaction:', err);
                    res.status(500).send('Server error: Error committing transaction');
                  });
                }

                res.status(201).json({ message: 'Booking successful', booking_id: bookingId });
              });
            }
          );
        } else {
          // If no passengers, commit the transaction
          db.commit((err) => {
            if (err) {
              return db.rollback(() => {
                console.error('Error committing transaction:', err);
                res.status(500).send('Server error: Error committing transaction');
              });
            }

            res.status(201).json({ message: 'Booking successful', booking_id: bookingId });
          });
        }
      }
    );
  });
});
app.post('/payments', authenticateJWT, (req, res) => {
  const { booking_id, payment_method } = req.body;
  const payment_date = new Date().toISOString().split('T')[0];
  const paymentId = `PM${Math.random().toString().slice(2, 5)}`;

  // Fetch tour price and seats from the booking
  db.query(
    `SELECT t.price, b.seats 
     FROM bookings b
     JOIN tours t ON b.tour_id = t.tour_id
     WHERE b.booking_id = ?`, 
    [booking_id],
    (err, results) => {
      if (err) {
        console.error('Error fetching booking details:', err);
        return res.status(500).send('Error fetching booking details');
      }
      if (results.length === 0) {
        return res.status(404).send('Booking not found');
      }

      const { price, seats } = results[0];
      const amount = price * seats + 10;

      db.query(
        'INSERT INTO payments (payment_id, booking_id, amount, payment_date, status, payment_method) VALUES (?, ?, ?, ?, ?, ?)', 
        [paymentId, booking_id, amount, payment_date, 'Chờ thanh toán', payment_method], 
        (err, result) => {
          if (err) {
            console.error('Error processing payment:', err);
            return res.status(500).send('Error processing payment');
          }
          res.status(201).send('Payment initiated');
        }
      );
    }
  );
});
// Fetch booking details by booking ID
app.get('/bookings/:bookingId', authenticateJWT, (req, res) => {
  const { bookingId } = req.params;

  db.query(
    `SELECT b.booking_id, b.seats, t.price, t.name AS tour_name, t.description AS tour_description, t.start_date, t.end_date
     FROM bookings b
     JOIN tours t ON b.tour_id = t.tour_id
     WHERE b.booking_id = ?`, 
    [bookingId],
    (err, results) => {
      if (err) {
        console.error('Error fetching booking details:', err);
        return res.status(500).send('Error fetching booking details');
      }
      if (results.length === 0) {
        return res.status(404).send('Booking not found');
      }

      res.status(200).json(results[0]);
    }
  );
});
 
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
