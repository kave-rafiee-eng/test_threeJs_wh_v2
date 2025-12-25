import express from 'express';
import mysql from 'mysql2/promise';

const app = express();
const PORT = 3000;

app.use(express.json());

// =====================
// MySQL Connection Pool
// =====================
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',        // XAMPP default
  database: 'ips',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10
});

// =====================
// Test DB connection
// =====================
async function startServer() {
  try {
    const [rows] = await pool.query('SELECT 1');
    console.log('✅ MySQL Connected:', rows);

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });

  } catch (err) {
    console.error('❌ MySQL connection failed:', err);
    process.exit(1);
  }
}

startServer();

// =====================
// Routes
// =====================

function parseJsonColumns(records) {
  return records.map(record => {
    const newRecord = { ...record };
    for (const key in newRecord) {
      if (typeof newRecord[key] === 'string') {
        try {
          const parsed = JSON.parse(newRecord[key]);
          
          if (typeof parsed === 'object' && parsed !== null) {
            newRecord[key] = parsed;
          }
        } catch (e) {
   
        }
      }
    }
    return newRecord;
  });
}

//http://localhost:8080/user?limit=5&page=1
app.get('/ips/operation/history', async (req, res) => {
  try {
 
    const page = parseInt(req.query.page) || 1;       
    const limit = parseInt(req.query.limit) || 100;  
    const offset = (page - 1) * limit;

    const [users] = await pool.query(
      'SELECT * FROM operations LIMIT ? OFFSET ?',
      [limit, offset]
    );

    const transformed = parseJsonColumns(users);


    transformed.forEach(element => {
      element.dimension = {};
    });

    /*res.status(200).json({
      page,
      limit,
      data: transformed
    });*/


    res.status(200).json(
     transformed
    );

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'DB error' });
  }
});

/*
[
  { "name": "Ali", "age": 30, "city": "Tehran", "preferences": { "theme": "dark", "notifications": true } }
]

{"W":10, "H":100, "D":50,
"WT":20}
{"BOX":"13k00112233"}

{"BOX":"13k00112233","X":10,"Y":10,"S":2}
  */

//"order_num", "slab_id", "dimension", "pos_init", "pos_target", "status"
/*
[
  { "order_num": 9, "slab_id": "sl123456", "status": 1, 
    "dimension": {"W":10, "H":100, "D":50, "WT":20},
    "pos_init": {"BOX":"13k00112233","X":10,"Y":10,"S":2},
    "pos_target": {"BOX":"13k00112233","X":10,"Y":10,"S":2} 
  },   
  { "order_num": 10, "slab_id": "sl123456", "status": 1, 
    "dimension": {"W":10, "H":100, "D":50, "WT":20},
    "pos_init": {"BOX":"13k00112233","X":10,"Y":10,"S":2},
    "pos_target": {"BOX":"13k00112233","X":10,"Y":10,"S":2} 
  }
]

*/

app.post('/ips/order/new/', async (req, res) => {

  console.log("Post ")
  const users = req.body;
  const requiredKeys = ["order_num", "slab_id", "dimension", "pos_init", "pos_target", "status"];

  if (!Array.isArray(users) || users.length === 0) {
    return res.status(400).json({ message: 'Array of users required' });
  }

  // Validation
  const invalid = users.find(u => requiredKeys.some(k => !(k in u)));
  if (invalid) {
    return res.status(400).json({ message: 'All users must have name, age, city and preferences' });
  }

  const values = users.map(u => [
    u.order_num,
    u.slab_id,
    JSON.stringify(u.dimension),
    JSON.stringify(u.pos_init),
    JSON.stringify(u.pos_target),
    u.status,
  ]);

  console.log(values);

  try {

    await pool.query(
      'INSERT INTO orders(order_num, slab_id, dimension, pos_init, pos_target , status) VALUES ?',
      [values]
    );

    res.status(201).json({ message: 'Users inserted', count: users.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'DB error' });
  }
});


/*
app.post('/user/:id', async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!name) {
    return res.status(418).json({ message: 'need name' });
  }

  await pool.execute(
    'INSERT INTO users (id, name) VALUES (?, ?)',
    [id, name]
  );

  res.status(200).json({
    message: `name ${name} and id ${id} saved`
  });
});
*/

/*
const express = require('express');
const app = express();
const PORT = 8080;

app.use( express.json() )

app.listen(
    PORT ,
    ()=> console.log( `its alive on http://localhost:${PORT}`)
)

app.get('/user', (req,res)=>{

    res.status(200).send({
        name : "kave",
        lastname : 'raf'
    })
});

app.post('/user/:id', (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
        return res.status(418).send({ message: 'need name' });
    }

    res.status(200).send({ 
        message: `name ${name} and id ${id}`
    });
});
*/
/*
import express from 'express';

const app = express();
const PORT = 8080;

app.use(express.json());

app.listen(PORT, () => {
  console.log(`its alive on http://localhost:${PORT}`);
});

app.get('/user', (req, res) => {
  res.status(200).send({
    name: 'kave',
    lastname: 'raf'
  });
});

app.post('/user/:id', (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!name) {
    return res.status(418).send({ message: 'need name' });
  }

  res.status(200).send({
    message: `name ${name} and id ${id}`
  });
});


import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',   // پیش‌فرض XAMPP خالیه
  database: 'test_db',
  port: 3306
});

const [rows] = await pool.query('SELECT 1');
console.log('Connected:', rows);*/