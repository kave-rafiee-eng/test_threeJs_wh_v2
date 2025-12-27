import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';

const app = express();
const PORT = 3001;


app.use(cors());  
app.use(express.json());

// =====================
// MySQL Connection Pool
// =====================
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',        // XAMPP default
  database: 'wh_sim',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10
});

const pool_ips = mysql.createPool({
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
    console.log('✅ MySQL pool Connected:', rows);

    const [rows2] = await pool_ips.query('SELECT 1');
    console.log('✅ MySQL pool_ips Connected:', rows2);
    
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

//http://localhost:3001/ips/order/list
app.get('/ips/order/list', async (req, res) => {
  try {
 
    const [slabes] = await pool_ips.query(
      'SELECT * FROM `orders` WHERE 1'
    );

    const transformed = parseJsonColumns(slabes);

    res.status(200).json(
     transformed
    );

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'DB error' });
  }
});

//http://localhost:8080/user?limit=5&page=1
app.get('/wh_sim/inventory', async (req, res) => {
  try {
 
    /*const page = parseInt(req.query.page) || 1;       
    const limit = parseInt(req.query.limit) || 100;  
    const offset = (page - 1) * limit;

    const [slabes] = await pool.query(
      'SELECT * FROM operations LIMIT ? OFFSET ?',
      [limit, offset]
    );*/

    const [slabes] = await pool.query(
      'SELECT * FROM `inventory` WHERE 1'
    );

    const transformed = parseJsonColumns(slabes);

    /*transformed.forEach(element => {
      element.dimension = {};
    });*/

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
  { "slab_id": "sl12" ,
    "dimension": {"W":10, "H":100, "D":50, "WT":20},
    "pos_init": {"BOX":"13k00112233","X":10,"Y":10,"S":2}
  },   
  { "slab_id":  "sl13" ,
    "dimension": {"W":10, "H":100, "D":50, "WT":20},
    "pos_init": {"BOX":"13k00112233","X":10,"Y":10,"S":2}
  } 
]

*/
app.post('/wh_sim/inventory/insert/all', async (req, res) => {

  console.log("Post ")
  const slabes = req.body;
  const requiredKeys = ["slab_id", "pos_init", "dimension"];

  if (!Array.isArray(slabes) || slabes.length === 0) {
    return res.status(400).json({ message: 'Array of slabes required' });
  }

  // Validation
  const invalid = slabes.find(u => requiredKeys.some(k => !(k in u)));
  if (invalid) {
    return res.status(400).json({ message: 'All slabes must have requiredKeys :' , requiredKeys });
  }

  const values = slabes.map(u => [
    u.slab_id,
    JSON.stringify(u.pos_init),
    JSON.stringify(u.dimension),
  ]);

  console.log(values);

  try {

    await pool.query(
      'DELETE FROM `inventory` WHERE 1',
    );

    console.log("Delect All Data")
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'DB error' });
  }

  try {

    await pool.query(
      'INSERT INTO inventory(slab_id, pos_init , dimension ) VALUES ?',
      [values]
    );

    res.status(201).json({ message: 'slabes inserted', count: slabes.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'DB error' });
  }
});


/*
[
  { 
		"order_num": 11, 
	 	"slab_id": "sl123456", 
	 	"status": 1, 
    "dimension": {"W":10, "H":100, "L":50, "WT":20},
    "pos_init": {"BOX":"13k00112233","X":10,"Y":10,"S":2},
    "pos_target":{"BOX":"13k00112233","X":10,"Y":10,"S":2},
  }
]
*/
app.post('/ips/order/new/', async (req, res) => {

  console.log("Post")
  const order = req.body;
  const requiredKeys = ["order_num", "slab_id", "dimension", "pos_init", "pos_target", "status"];

  if (!Array.isArray(order) || order.length === 0) {
    return res.status(400).json({ message: 'Array of users required' });
  }

  // Validation
  const invalid = order.find(u => requiredKeys.some(k => !(k in u)));
  if (invalid) {
    return res.status(400).json({ message: 'All order requiredKeys'+requiredKeys });
  }

  const values = order.map(u => [
    u.order_num,
    u.slab_id,
    JSON.stringify(u.dimension),
    JSON.stringify(u.pos_init),
    JSON.stringify(u.pos_target),
    u.status,
  ]);

  console.log(values);

  try {

    await pool_ips.query(
      'INSERT INTO orders(order_num, slab_id, dimension, pos_init, pos_target , status) VALUES ?',
      [values]
    );

    res.status(201).json({ message: 'order inserted', count: order.length });
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