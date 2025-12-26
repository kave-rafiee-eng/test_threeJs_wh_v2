import axios from 'axios';
import { SLAB } from './SLAB.js';

/*
  {
    "slab_id": "sl14",
    "pos_init": {
      "BOX": "13k00112233",
      "X": 10,
      "Y": 10,
      "S": 2
    },
    "dimension": {
      "W": 10,
      "H": 100,
      "D": 50,
      "WT": 20
    }
  },
*/
export function readDb_inventory() {
  return axios
    .get('http://localhost:3001/wh_sim/inventory')
    .then(res => {
      return res.data.map(e => new SLAB({
        width: e.dimension.W,
        height: e.dimension.H,
        depth: e.dimension.D,
        id: e.slab_id,
        x: e.pos_init.X,
        y: e.pos_init.Y,
        s: e.pos_init.S
      }));
    });
}


export async function send_inventory(data) {
  try {

    const res = await axios.post(
      'http://localhost:3001/wh_sim/inventory/insert/all',
      data,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    return res.data;

  } catch (err) {
    console.error('Error sending inventory:', err);

    if (err.response) {
      console.log('status:', err.response.status);
      console.log('data:', err.response.data);
    } else if (err.request) {
      console.log('no response from server');
    } else {
      console.log('error:', err.message);
    }

    throw err; 
  }
}

/*
export function readDb_inventory(slabes) {
  return axios
    .get('http://localhost:3001/wh_sim/inventory')
    .then(res => {
      console.log(res.data);

      // خالی کردن آرایه
      slabes.length = 0;

      res.data.array.forEach(element => {
        const newSlab = new SLAB({
          width: element.dimension.W,
          height: element.dimension.H,
          depth: element.dimension.D,
          id: element.id,
          x: element.pos_init.X,
          y: element.pos_init.Y,
          s: element.pos_init.S
        });

        slabes.push(newSlab);
      });

      return slabes; // 👈 خیلی مهم
    })
    .catch(err => {
      console.error(err);
      throw err; // 👈 تا بیرون هم بفهمه خطا شده
    });
}*/



/*
await axios.post('https://api.example.com/users', {
  name: 'Ali',
  email: 'ali@test.com'
});
*/
