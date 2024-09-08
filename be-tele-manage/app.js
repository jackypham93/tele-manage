require('dotenv').config()
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const cors = require('cors');
const TelegramBot = require('node-telegram-bot-api');
const { BOT_TOKEN, SECRET_KEY, GROUP_ID1, GROUP_ID2, GROUP_ID3 } = process.env;
const token = BOT_TOKEN;
const bot = new TelegramBot(token, {polling: true});

const pool = require('./db');

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());

// Public route
app.get('/public', (req, res) => {
    res.send('This is a public route');
});

// Login route
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        // Find user in the database
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        const user = result.rows[0];

        if (!user || !bcrypt.compareSync(password, user.password)) {
            return res.status(401).send('Invalid credentials');
        }

        // Generate JWT
        const token = jwt.sign({ id: user.id, username: user.username, right: user.right }, SECRET_KEY, { expiresIn: '24h' });
        res.json({ token, right: user.right });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Middleware to authenticate JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Register a user
// app.post('/api/register', async (req, res) => {
//     const { username, password } = req.body;

//     try {
//         // Check if user already exists
//         const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
//         if (result.rows.length > 0) {
//             return res.status(400).send('User already exists');
//         }

//         // Hash password and store user
//         const hashedPassword = bcrypt.hashSync(password, 10);
//         await pool.query('INSERT INTO users (username, password) VALUES ($1, $2)', [username, hashedPassword]);

//         res.status(201).send('User registered');
//     } catch (err) {
//         console.error(err);
//         res.status(500).send('Server error');
//     }
// });

app.get('/api/list_groups', authenticateToken, (req, res) => {
    res.json({
      data: [{
        group_id: GROUP_ID1,
        group_name: "TEST1"
      },
      {
        group_id: GROUP_ID2,
        group_name: "TEST2"
      },
      {
        group_id: GROUP_ID3,
        group_name: "TEST3"
      }]
    })
})

app.post('/api/send_message', authenticateToken, async (req, res) => {
    try {
      const { group_id, message } = req.body
      var result = await bot.sendMessage(group_id, message);
      await pool.query('INSERT INTO messages (text, group_id, message_id, created_by) VALUES ($1, $2, $3, $4)', [message, group_id, result.message_id, req.user.id]);
      res.json({
          message_id: result.message_id,
          message: "success"
      })
    } catch (error) {
      res.status(500).send('Server error');
    }
})

// Chỉ user admin mới được cập nhật message
app.put('/api/update_message', authenticateToken, async (req, res) => {
  try {
    if(req.user.right < 2){
      return res.status(401).send('Bạn không có quyền thực hiện thao tác này');
    }
    const { group_id, message_id, new_text } = req.body
    await bot.editMessageText(new_text, {
      chat_id: group_id,
      message_id: message_id
    });
    await pool.query('UPDATE messages SET text = $1 WHERE message_id = $2', [new_text, message_id]);
    res.json({
      message: "success"
    })
  } catch (error) {
    res.status(500).send('Server error');
  }
})

// Chỉ user admin mới được xóa mesage

app.delete('/api/delete_message', authenticateToken, async (req, res) => {
  try {
    if(req.user.right < 2){
      return res.status(401).send('Bạn không có quyền thực hiện thao tác này');
    }
    const { group_id, msg_id } = req.query
    await bot.deleteMessage(group_id, msg_id)
    await pool.query('DELETE FROM messages WHERE message_id = $1', [msg_id]);
    res.json({
      message: "success"
    })
  } catch (error) {
    res.status(500).send('Server error');
  }
})

app.get('/api/list_messages', authenticateToken, async (req, res) => {
  const { group_id } = req.query
  const result = await pool.query('SELECT * FROM messages WHERE group_id = $1', [group_id]);
  res.json({
    data: result.rows
  })
})

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
