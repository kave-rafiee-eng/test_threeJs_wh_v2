import { readDb_inventory , send_inventory , readDb_orders , db_newOrder} from './dataBase.js'

import{ GV }from './commVar.js'
import { STAGE , SLAB , SLAB_TYPE , createSlab  } from './SLAB.js';

import { update3D , set_sceneBoxes , colorFromIndex } from './graphic3D.js';



let listOrders = [];
const def_PAGE_IN_SIZE = 10;

document.getElementById("btn-exit-slab").addEventListener('click',async()=>{
  
  let slab_id = document.querySelector('#select-exit-id').value;
  let exitStage = document.querySelector('#select-exit-target').value;

  if( slab_id == '' || exitStage == '' )return;

  let Arrdata = [];

  let biggestOrderNum = 0;
  listOrders.forEach((order)=>{
    if( order.order_num > biggestOrderNum )biggestOrderNum= order.order_num;
  })

  GV.slabes.forEach(slab => {
    if( slab.id == slab_id ){

      let order = {};

      order.order_num = biggestOrderNum+1;
      order.slab_id = slab.id;
      order.status = 2;
      order.dimension = {

      };
      order.pos_init = {
        BOX:slab.box
      };
      order.pos_target = {
        BOX:exitStage
      }
      Arrdata.push(order)
    }
  });

  console.log( Arrdata );

  console.log( "Sending exit Order" );
  const res = await db_newOrder( Arrdata ) ;
  console.log( res );
  console.log( "readDb_orders_list" );
  await readDb_orders_list();
  console.log( "End btn-new-order" );

});

function select_exit() {

  let select = document.querySelector('#select-exit-id');
  let prevValue = select.value;

  select.innerHTML = '';

  GV.slabes.forEach(slab => {
    const option = document.createElement('option');
    option.value = slab.id;
    option.textContent = slab.id;
    select.appendChild(option);
  });

  let exists = GV.slabes.some(slab => slab.id == prevValue);

  if (exists) {
    select.value = prevValue;
  } else if (select.options.length > 0) {
    select.selectedIndex = 0;
  }

  //-------------------------------------

  select = document.querySelector('#select-exit-target');
  prevValue = select.value;

  select.innerHTML = '';

  GV.exitStages.forEach(stage => {
    const option = document.createElement('option');
    option.value = stage.id;
    option.textContent = stage.id;
    select.appendChild(option);
  });

  exists = GV.exitStages.some(stage => stage.id == prevValue);

  if (exists) {
    select.value = prevValue;
  } else if (select.options.length > 0) {
    select.selectedIndex = 0;
  }
}


document.getElementById("btn-new-slab").addEventListener('click',async()=>{
  
  let selectedTable = document.querySelector('#select-new-rolling').value;

  let indexRolling = -1;
  GV.rollingTables.forEach((table,index)=>{
    if( table.id == selectedTable ){
      indexRolling = index;
    } 
   }
  )
  if( indexRolling==-1)return;

  const newSlabIndex = createSlab( SLAB_TYPE.BIG ,  GV.rollingTables[ indexRolling ].x , GV.rollingTables[ indexRolling ].y , 0 , GV.slabes );
  const slab_id = GV.slabes[ newSlabIndex ] . id;
  set_sceneBoxes(GV.slabes);
  update3D();

  console.log( "Sending new Order" );
  GV.F_saveInventory = true;

  let Arrdata = [];

  const stageTarget = document.querySelector('#select-new-target').value;

  if( slab_id == "" || stageTarget == ""){
    console.log("slab_id or stageTarget empty")
    return;
  }

  let biggestOrderNum = 0;
  listOrders.forEach((order)=>{
    if( order.order_num > biggestOrderNum )biggestOrderNum= order.order_num;
  })

  GV.slabes.forEach(slab => {
    if( slab.id == slab_id ){

      let order = {};

      order.order_num = biggestOrderNum+1;
      order.slab_id = slab.id;
      order.status = 1;
      order.dimension = {

      };
      order.pos_init = {
        BOX:selectedTable
      };
      order.pos_target = {
        BOX:stageTarget
      }
      Arrdata.push(order)
    }
  });

  console.log( Arrdata );

  console.log( "Sending new Order" );
  const res = await db_newOrder( Arrdata ) ;
  console.log( res );
  console.log( "readDb_orders_list" );
  await readDb_orders_list();
  console.log( "End btn-new-order" );

});

function select_new() {

  let select = document.querySelector('#select-new-rolling');
  let prevValue = select.value;

  select.innerHTML = '';

  GV.rollingTables.forEach(table => {
    const option = document.createElement('option');
    option.value = table.id;
    option.textContent = table.id;
    select.appendChild(option);
  });

  let exists = GV.rollingTables.some(table => table.id == prevValue);

  if (exists) {
    select.value = prevValue;
  } else if (select.options.length > 0) {
    select.selectedIndex = 0;
  }

  //-------------------------------------

  select = document.querySelector('#select-new-target');
  prevValue = select.value;

  select.innerHTML = '';

  GV.stages.forEach(stage => {
    const option = document.createElement('option');
    option.value = stage.id;
    option.textContent = stage.id;
    select.appendChild(option);
  });

  exists = GV.stages.some(stage => stage.id == prevValue);

  if (exists) {
    select.value = prevValue;
  } else if (select.options.length > 0) {
    select.selectedIndex = 0;
  }
}

//----------------------------------------------------
function select_move_target() {

  const id = document.querySelector('#select-move-id').value;

  const select = document.querySelector('#select-move-target');
  const prevValue = select.value;

  select.innerHTML = '';

  let currentStage = '';
  GV.slabes.forEach(slab => {
    if( slab.id == id ){
      currentStage = slab.box;
    }
  });

  GV.stages.forEach((stage)=>{
    if( stage.id != currentStage ){
      const option = document.createElement('option');
      option.value = stage.id;
      option.textContent = stage.id;
      select.appendChild(option);   
    }
  })

  const exists = GV.stages.some(stage => stage.id == prevValue);

  if (exists) {
    select.value = prevValue;
  } else if (select.options.length > 0) {
    select.selectedIndex = 0;
  }
}

function select_move_id() {

  const select = document.querySelector('#select-move-id');
  const prevValue = select.value;

  select.innerHTML = '';

  GV.slabes.forEach(slab => {
    const option = document.createElement('option');
    option.value = slab.id;
    option.textContent = slab.id;
    select.appendChild(option);
  });

  const exists = GV.slabes.some(slab => slab.id == prevValue);

  if (exists) {
    select.value = prevValue;
  } else if (select.options.length > 0) {
    select.selectedIndex = 0;
  }
}

document.getElementById("btn-new-order").addEventListener('click',async()=>{
  
  let Arrdata = [];

  const slab_id = document.querySelector('#select-move-id').value;
  const stageTarget = document.querySelector('#select-move-target').value;

  if( slab_id == "" || stageTarget == ""){
    console.log("slab_id or stageTarget empty")
    return;
  }

  let biggestOrderNum = 0;
  listOrders.forEach((order)=>{
    if( order.order_num > biggestOrderNum )biggestOrderNum= order.order_num;
  })

  GV.slabes.forEach(slab => {
    if( slab.id == slab_id ){

      let order = {};

      order.order_num = biggestOrderNum+1;
      order.slab_id = slab.id;
      order.status = 0;
      order.dimension = {};
      order.pos_init = {
        BOX:slab.box
      };
      order.pos_target = {
        BOX:stageTarget
      }
      Arrdata.push(order)
    }
  });

  console.log( "Sending new Order" );
  const res = await db_newOrder( Arrdata ) ;
  console.log( res );
  console.log( "readDb_orders_list" );
  await readDb_orders_list();
  console.log( "End btn-new-order" );
});

//----------------------------------------------------- Show List Orders


async function readDb_orders_list(){
  await readDb_orders().then( result =>{
    console.log( result );
    listOrders = result;
  }
  ).catch(err => {
    console.error('DB Error:', err);
  })
}

readDb_orders_list();


function table_orders() {

  const tbodies = document.querySelectorAll('.table-orders tbody');

  const maxRows = Math.min(listOrders.length, 20);

  tbodies.forEach(tbody => {
    tbody.innerHTML = '';

    for (let i = 0; i < maxRows; i++) {
      const order = listOrders[i];
      const tr = document.createElement('tr');

      const cells = [
        order.order_num,
        order.slab_id,
        order.pos_init.BOX,
        order.pos_target.BOX
      ];

      cells.forEach(value => {

        const td = document.createElement('td');
        if (order.pos_init?.BOX?.includes('RT')) {
          td.style.backgroundColor = '#0eeb3e';
        }
        else if (order.pos_target?.BOX?.includes('EX')) {
          td.style.backgroundColor = '#eb0e0eff';
        }
        
        td.textContent = value;
        tr.appendChild(td);
      });

      tbody.appendChild(tr);
    }
  });
}

//------

let table_inventory_offset = 0;

document.getElementById("offset-inventory-list").addEventListener("change", ()=>{

  var input = document.getElementById("offset-inventory-list");
  table_inventory_offset = input.value;

  let labelElement = document.getElementById("lable-inventory-list");
  labelElement.innerText = `${table_inventory_offset} / ${ Math.floor(GV.slabes.length/def_PAGE_IN_SIZE) }`;
});

function table_inventory(offset) {

  const tbody = document.querySelector("#table-inventory tbody");

  while (tbody.firstChild) {
    tbody.removeChild(tbody.firstChild);
  }

  const maxRows = Math.min( GV.slabes.length, offset*def_PAGE_IN_SIZE+ def_PAGE_IN_SIZE );

  for (let tableIndex = offset*def_PAGE_IN_SIZE; tableIndex < maxRows; tableIndex++) {

    const tr = document.createElement("tr");

    const cells = [
      tableIndex + 1, 
      GV.slabes[tableIndex].id,
      GV.slabes[tableIndex].box
    ];

    cells.forEach( ( cellData , index) => {
      const td = document.createElement("td");

      if( index == 1 ){
        let color = colorFromIndex( parseInt( parseInt( cellData.replace(/\D/g, ''), 10) ) )
        td.style.background = `#${color.getHexString()}`
      }
    
      td.textContent = cellData;
      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  }
}

setInterval(() => {
  table_orders();

  select_move_id();
  select_move_target();
  
  table_inventory(table_inventory_offset);
  let labelElement = document.getElementById("lable-inventory-list");
  labelElement.innerText = `${table_inventory_offset} / ${ Math.floor(GV.slabes.length/def_PAGE_IN_SIZE) }`;

  select_new();
  select_exit();
}, 500);