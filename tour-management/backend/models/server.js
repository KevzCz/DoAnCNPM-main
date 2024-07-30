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

      const token = jwt.sign({ userId: user.user_id, role: user.role, userName: user.userName }, 'your_jwt_secret');
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

const { v4: uuidv4 } = require('uuid');

// Create tour endpoint
app.post('/tours', (req, res) => {
  const { name, description, start_date, end_date, price, max_seats, image_url } = req.body;
  const tour_id = uuidv4();

  const query = `INSERT INTO tours (tour_id, name, description, start_date, end_date, price, max_seats, seats_remaining, image_url, status)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  db.query(query, [tour_id, name, description, start_date, end_date, price, max_seats, max_seats, image_url, 'Không hoạt động'], (err, result) => {
    if (err) {
      console.error('Error creating tour:', err);
      return res.status(500).send('Error creating tour');
    }
    res.status(201).json({ tour_id, message: 'Tour created' });
  });
});

// Fetch tours endpoint
app.get('/tours', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 8;
  const offset = (page - 1) * limit;
  const status = req.query.status;
  const hasItinerary = req.query.hasItinerary === 'true';

  let query = `SELECT t.tour_id, t.name, t.image_url, t.price, t.max_seats, t.seats_remaining, t.status, 
               (SELECT AVG(rating) FROM reviews WHERE reviews.tour_id = t.tour_id) as avg_rating, 
               (SELECT COUNT(*) FROM reviews WHERE reviews.tour_id = t.tour_id) as review_count,
               l.name AS location
               FROM tours t
               LEFT JOIN tour_locations tl ON t.tour_id = tl.tour_id
               LEFT JOIN locations l ON tl.location_id = l.location_id `;
  let countQuery = 'SELECT COUNT(*) AS total FROM tours t';
  let whereClause = '';

  if (status === 'active') {
    whereClause = "WHERE t.status IN ('Hoạt động', 'Hết chỗ') ";
  } else if (status === 'inactive') {
    whereClause = "WHERE t.status IN ('Kết thúc', 'Không hoạt động') ";
  }

  if (hasItinerary) {
    if (whereClause) {
      whereClause += "AND EXISTS (SELECT 1 FROM tour_itinerary ti WHERE ti.tour_id = t.tour_id) ";
    } else {
      whereClause = "WHERE EXISTS (SELECT 1 FROM tour_itinerary ti WHERE ti.tour_id = t.tour_id) ";
    }
  }

  query += whereClause + 'ORDER BY t.name LIMIT ? OFFSET ?';
  countQuery += ' ' + whereClause;

  db.query(query, [limit, offset], (err, results) => {
    if (err) {
      console.error('Error fetching tours:', err);
      return res.status(500).send('Error fetching tours');
    }

    // Fetch itineraries for the tours
    const tourIds = results.map(tour => tour.tour_id);
    if (tourIds.length > 0) {
      db.query(`SELECT * FROM tour_itinerary WHERE tour_id IN (?)`, [tourIds], (err, itineraries) => {
        if (err) {
          console.error('Error fetching itineraries:', err);
          return res.status(500).send('Error fetching itineraries');
        }

        // Map itineraries to their respective tours
        const toursWithItineraries = results.map(tour => {
          tour.itinerary = itineraries.filter(itinerary => itinerary.tour_id === tour.tour_id);
          return tour;
        });

        db.query(countQuery, (err, countResult) => {
          if (err) {
            console.error('Error counting tours:', err);
            return res.status(500).send('Error counting tours');
          }
          const total = countResult[0].total;
          res.status(200).json({ tours: toursWithItineraries, total });
        });
      });
    } else {
      db.query(countQuery, (err, countResult) => {
        if (err) {
          console.error('Error counting tours:', err);
          return res.status(500).send('Error counting tours');
        }
        const total = countResult[0].total;
        res.status(200).json({ tours: results, total });
      });
    }
  });
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

    const tour = tourResults[0];

    db.query('SELECT * FROM reviews WHERE tour_id = ?', [id], (err, reviewResults) => {
      if (err) {
        console.error('Error fetching reviews:', err);
        return res.status(500).send('Error fetching reviews');
      }

      tour.reviews = reviewResults;

      db.query('SELECT * FROM tour_itinerary WHERE tour_id = ?', [id], (err, itineraryResults) => {
        if (err) {
          console.error('Error fetching itinerary:', err);
          return res.status(500).send('Error fetching itinerary');
        }

        tour.itinerary = itineraryResults;

        db.query('SELECT c.name AS category_name FROM categories c JOIN tour_categories tc ON c.category_id = tc.category_id WHERE tc.tour_id = ?', [id], (err, categoryResults) => {
          if (err) {
            console.error('Error fetching category:', err);
            return res.status(500).send('Error fetching category');
          }

          tour.category = categoryResults.length > 0 ? categoryResults[0].category_name : null;

          db.query('SELECT l.name AS location_name FROM locations l JOIN tour_locations tl ON l.location_id = tl.location_id WHERE tl.tour_id = ?', [id], (err, locationResults) => {
            if (err) {
              console.error('Error fetching location:', err);
              return res.status(500).send('Error fetching location');
            }

            tour.location = locationResults.length > 0 ? locationResults[0].location_name : null;

            res.status(200).json(tour);
          });
        });
      });
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

  if (new Date(`1970-01-01T${end_time}Z`) <= new Date(`1970-01-01T${start_time}Z`)) {
    return res.status(400).send('Thời gian kết thúc phải lớn hơn thời gian bắt đầu.');
  }

  // Fetch active_days for the tour
  db.query('SELECT active_days FROM tours WHERE tour_id = ?', [tour_id], (err, results) => {
    if (err) {
      console.error('Error fetching tour active days:', err);
      return res.status(500).send('Error fetching tour active days');
    }

    if (results.length === 0) {
      return res.status(404).send('Tour not found');
    }

    const active_days = results[0].active_days;

    if (day_number > active_days) {
      return res.status(400).send('Số ngày trong lịch trình phải nhỏ hơn số ngày hoạt động của tour.');
    }

    const query = 'INSERT INTO tour_itinerary (itinerary_id, tour_id, day_number, activity_description, start_time, end_time) VALUES (UUID(), ?, ?, ?, ?, ?)';
    db.query(query, [tour_id, day_number, activity_description, start_time, end_time], (err, result) => {
      if (err) {
        console.error('Error adding schedule:', err);
        return res.status(500).send('Error adding schedule');
      }
      res.status(201).send('Schedule added');
    });
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

// Add or update tour to category endpoint
app.post('/tour-categories', (req, res) => {
  const { tour_id, category_id } = req.body;
  const queryCheck = 'SELECT * FROM tour_categories WHERE tour_id = ?';
  const queryInsert = 'INSERT INTO tour_categories (tour_id, category_id) VALUES (?, ?)';
  const queryUpdate = 'UPDATE tour_categories SET category_id = ? WHERE tour_id = ?';

  db.query(queryCheck, [tour_id], (err, results) => {
    if (err) {
      console.error('Error checking tour-category:', err);
      return res.status(500).send('Error checking tour-category');
    }

    if (results.length > 0) {
      db.query(queryUpdate, [category_id, tour_id], (err, result) => {
        if (err) {
          console.error('Error updating tour-category:', err);
          return res.status(500).send('Error updating tour-category');
        }
        res.status(200).send('Tour-category updated successfully');
      });
    } else {
      db.query(queryInsert, [tour_id, category_id], (err, result) => {
        if (err) {
          console.error('Error adding tour to category:', err);
          return res.status(500).send('Error adding tour to category');
        }
        res.status(201).send('Tour added to category');
      });
    }
  });
});



// Add or update tour to location endpoint
app.post('/tour-locations', (req, res) => {
  const { tour_id, location_id } = req.body;
  const queryCheck = 'SELECT * FROM tour_locations WHERE tour_id = ?';
  const queryInsert = 'INSERT INTO tour_locations (tour_id, location_id) VALUES (?, ?)';
  const queryUpdate = 'UPDATE tour_locations SET location_id = ? WHERE tour_id = ?';

  db.query(queryCheck, [tour_id], (err, results) => {
    if (err) {
      console.error('Error checking tour-location:', err);
      return res.status(500).send('Error checking tour-location');
    }

    if (results.length > 0) {
      db.query(queryUpdate, [location_id, tour_id], (err, result) => {
        if (err) {
          console.error('Error updating tour-location:', err);
          return res.status(500).send('Error updating tour-location');
        }
        res.status(200).send('Tour-location updated successfully');
      });
    } else {
      db.query(queryInsert, [tour_id, location_id], (err, result) => {
        if (err) {
          console.error('Error adding tour to location:', err);
          return res.status(500).send('Error adding tour to location');
        }
        res.status(201).send('Tour added to location');
      });
    }
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

    // Check tour status
    db.query('SELECT status FROM tours WHERE tour_id = ?', [tour_id], (err, results) => {
      if (err) {
        return db.rollback(() => {
          console.error('Error fetching tour status:', err);
          res.status(500).send('Server error: Error fetching tour status');
        });
      }

      if (results.length === 0) {
        return db.rollback(() => {
          res.status(404).send('Tour not found');
        });
      }

      const tourStatus = results[0].status;
      if (tourStatus === 'Hết chỗ') {
        return db.rollback(() => {
          res.status(400).send('Tour is fully booked');
        });
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
});
app.post('/payments', authenticateJWT, (req, res) => {
  const { booking_id, payment_method } = req.body;
  const payment_date = new Date().toISOString().split('T')[0];
  const paymentId = `PM${Math.random().toString().slice(2, 5)}`;

  db.query(
    `SELECT t.price, b.seats 
     FROM bookings b
     JOIN tours t ON b.tour_id = t.tour_id
     WHERE b.booking_id = ?`, 
    [booking_id],
    (err, results) => {
      if (err) {
        console.error('Error fetching booking details:', err);
        return res.status(500).json({ error: 'Error fetching booking details' });
      }
      if (results.length === 0) {
        return res.status(404).json({ error: 'Booking not found' });
      }

      const { price, seats } = results[0];
      const amount = price * seats + 10;

      db.query(
        'INSERT INTO payments (payment_id, booking_id, amount, payment_date, status, payment_method) VALUES (?, ?, ?, ?, ?, ?)', 
        [paymentId, booking_id, amount, payment_date, 'Chờ thanh toán', payment_method], 
        (err, result) => {
          if (err) {
            console.error('Error processing payment:', err);
            return res.status(500).json({ error: 'Error processing payment' });
          }
          res.status(201).json({ status: 'Chờ thanh toán', message: 'Payment initiated' });
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
app.put('/payments/update', authenticateJWT, (req, res) => {
  const { booking_id, payment_method } = req.body;
  const payment_date = new Date().toISOString().split('T')[0];

  db.query(
    `SELECT t.price, b.seats 
     FROM bookings b
     JOIN tours t ON b.tour_id = t.tour_id
     WHERE b.booking_id = ?`, 
    [booking_id],
    (err, results) => {
      if (err) {
        console.error('Error fetching booking details:', err);
        return res.status(500).json({ error: 'Error fetching booking details' });
      }
      if (results.length === 0) {
        return res.status(404).json({ error: 'Booking not found' });
      }

      const { price, seats } = results[0];
      const amount = price * seats + 10;

      db.query(
        'SELECT payment_id FROM payments WHERE booking_id = ?', 
        [booking_id],
        (err, results) => {
          if (err) {
            console.error('Error fetching payment details:', err);
            return res.status(500).json({ error: 'Error fetching payment details' });
          }
          if (results.length === 0) {
            return res.status(404).json({ error: 'Payment not found for this booking' });
          }

          const paymentId = results[0].payment_id;

          db.query(
            'UPDATE payments SET amount = ?, payment_date = ?, status = ?, payment_method = ? WHERE payment_id = ?', 
            [amount, payment_date, 'Đã thanh toán', payment_method, paymentId], 
            (err, result) => {
              if (err) {
                console.error('Error updating payment:', err);
                return res.status(500).json({ error: 'Error updating payment' });
              }

              // Create invoice after successful payment update
              const invoiceId = `HD${Math.random().toString().slice(2, 5)}`;
              const issueDate = new Date().toISOString().split('T')[0];

              db.query(
                'INSERT INTO invoices (invoice_id, booking_id, payment_id, issue_date, total_amount) VALUES (?, ?, ?, ?, ?)', 
                [invoiceId, booking_id, paymentId, issueDate, amount], 
                (err, result) => {
                  if (err) {
                    console.error('Error creating invoice:', err);
                    return res.status(500).json({ error: 'Error creating invoice' });
                  }

                  res.status(200).json({ status: 'Đã thanh toán', message: 'Payment and invoice created successfully' });
                }
              );
            }
          );
        }
      );
    }
  );
});
app.put('/payments/cancel', authenticateJWT, (req, res) => {
  const { booking_id } = req.body;

  db.query(
    'SELECT payment_id FROM payments WHERE booking_id = ?', 
    [booking_id],
    (err, results) => {
      if (err) {
        console.error('Error fetching payment details:', err);
        return res.status(500).json({ error: 'Error fetching payment details' });
      }
      if (results.length === 0) {
        return res.status(404).json({ error: 'Payment not found for this booking' });
      }

      const paymentId = results[0].payment_id;

      db.query(
        'UPDATE payments SET status = ? WHERE payment_id = ?', 
        ['Đã hủy', paymentId], 
        (err, result) => {
          if (err) {
            console.error('Error updating payment status to Hủy:', err);
            return res.status(500).json({ error: 'Error updating payment status' });
          }
          res.status(200).json({ status: 'Hủy', message: 'Payment canceled successfully' });
        }
      );
    }
  );
});
// Fetch invoices endpoint
app.get('/invoices', authenticateJWT, (req, res) => {
  db.query(
    `SELECT i.invoice_id, i.booking_id, i.payment_id, i.issue_date, i.total_amount
     FROM invoices i
     JOIN payments p ON i.payment_id = p.payment_id
     WHERE p.status = 'Đã thanh toán'`,
    (err, results) => {
      if (err) {
        console.error('Error fetching invoices:', err);
        return res.status(500).send('Error fetching invoices');
      }
      res.status(200).json({ invoices: results });
    }
  );
});
// Update tour endpoint
app.put('/tours/:id', (req, res) => {
  const { id } = req.params;
  const { name, description, start_date, end_date, price, max_seats, seats_remaining, image_url, status } = req.body;

  // First, fetch the current status of the tour
  db.query('SELECT status FROM tours WHERE tour_id = ?', [id], (err, results) => {
    if (err) {
      console.error('Error fetching tour status:', err);
      return res.status(500).send('Error fetching tour status');
    }

    if (results.length === 0) {
      return res.status(404).send('Tour not found');
    }

    const currentStatus = results[0].status;

    // Check if the tour status allows editing
    if (currentStatus !== 'Không hoạt động' && currentStatus !== 'Đã kết thúc') {
      return res.status(403).send('Only tours with status "Không hoạt động" or "Đã kết thúc" can be edited');
    }

    // Proceed with the update if status is valid
    const query = `UPDATE tours SET name = ?, description = ?, start_date = ?, end_date = ?, price = ?, max_seats = ?,  seats_remaining = ?, image_url = ?, status = ?
                   WHERE tour_id = ?`;

    db.query(query, [name, description, start_date, end_date, price, max_seats, max_seats, image_url, status, id], (err, result) => {
      if (err) {
        console.error('Error updating tour:', err);
        return res.status(500).send('Error updating tour');
      }
      res.status(200).send('Tour updated successfully');
    });
  });
});
// Update schedule endpoint
app.put('/schedules/:id', (req, res) => {
  const { id } = req.params;
  const { tour_id, day_number, activity_description, start_time, end_time } = req.body;

  if (new Date(`1970-01-01T${end_time}Z`) <= new Date(`1970-01-01T${start_time}Z`)) {
    return res.status(400).send('Thời gian kết thúc phải lớn hơn thời gian bắt đầu.');
  }

  // Fetch active_days for the tour
  db.query('SELECT active_days FROM tours WHERE tour_id = ?', [tour_id], (err, results) => {
    if (err) {
      console.error('Error fetching tour active days:', err);
      return res.status(500).send('Error fetching tour active days');
    }

    if (results.length === 0) {
      return res.status(404).send('Tour not found');
    }

    const active_days = results[0].active_days;

    if (day_number > active_days) {
      return res.status(400).send('Số ngày trong lịch trình phải nhỏ hơn số ngày hoạt động của tour.');
    }

    const query = 'UPDATE tour_itinerary SET day_number = ?, activity_description = ?, start_time = ?, end_time = ? WHERE itinerary_id = ?';
    db.query(query, [day_number, activity_description, start_time, end_time, id], (err, result) => {
      if (err) {
        console.error('Error updating schedule:', err);
        return res.status(500).send('Error updating schedule');
      }
      res.status(200).send('Schedule updated successfully');
    });
  });
});

// Fetch categories for a specific tour
app.get('/tour-categories/:tourId', (req, res) => {
  const { tourId } = req.params;

  db.query('SELECT * FROM tour_categories WHERE tour_id = ?', [tourId], (err, results) => {
    if (err) {
      console.error('Error fetching tour categories:', err);
      return res.status(500).send('Error fetching tour categories');
    }

    res.status(200).json({ categories: results });
  });
});
// Fetch locations for a specific tour
app.get('/tour-locations/:tourId', (req, res) => {
  const { tourId } = req.params;

  db.query('SELECT * FROM tour_locations WHERE tour_id = ?', [tourId], (err, results) => {
    if (err) {
      console.error('Error fetching tour locations:', err);
      return res.status(500).send('Error fetching tour locations');
    }

    res.status(200).json({ locations: results });
  });
});
// Fetch a single location by ID
app.get('/locations/:id', (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM locations WHERE location_id = ?', [id], (err, results) => {
    if (err) {
      console.error('Error fetching location:', err);
      return res.status(500).send('Error fetching location');
    }
    if (results.length === 0) {
      return res.status(404).send('Location not found');
    }
    res.status(200).json(results[0]);
  });
});

// Update a location by ID
app.put('/locations/:id', (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  db.query('UPDATE locations SET name = ? WHERE location_id = ?', [name, id], (err, result) => {
    if (err) {
      console.error('Error updating location:', err);
      return res.status(500).send('Error updating location');
    }
    res.status(200).send('Location updated successfully');
  });
});

// Fetch a single category by ID
app.get('/categories/:id', (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM categories WHERE category_id = ?', [id], (err, results) => {
    if (err) {
      console.error('Error fetching category:', err);
      return res.status(500).send('Error fetching category');
    }
    if (results.length === 0) {
      return res.status(404).send('Category not found');
    }
    res.status(200).json(results[0]);
  });
});

// Update a category by ID
app.put('/categories/:id', (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  db.query('UPDATE categories SET name = ? WHERE category_id = ?', [name, id], (err, result) => {
    if (err) {
      console.error('Error updating category:', err);
      return res.status(500).send('Error updating category');
    }
    res.status(200).send('Category updated successfully');
  });
});
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
