import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

import { useWASD } from './key.js';
import { STAGE , SLAB , SLAB_TYPE , createSlab  } from './SLAB.js';

import { update3D , set_sceneBoxes, set_sceneStages, set_cranePos , camera ,
  update_slabById , colorFromIndex
 } from './graphic3D.js';

import * as THREE from 'three';

import { RECT2D , isRectCollideCenter , getRectCollisionSections } from './rect2d.js'
import { readDb_inventory , send_inventory , readDb_orders , db_newOrder} from './dataBase.js'

import { } from './rest_api_comm.js'

import{ GV }from './commVar.js'

import { publish } from './Mqtt.js'

readDb_inventory().then( result =>{
  console.log( result );
  GV.slabes = result;
  set_sceneBoxes(GV.slabes);
  update3D();
}
).catch(err => {
  console.error('DB Error:', err);
})


async function saveInventory() {

  cal_slabBox(GV.slabes ,GV.stages );

  try {

    let Arr = GV.slabes.map( e =>{
      return   {
        slab_id: e.id,
        pos_init: {
          "BOX": e.box,
          "X": Math.floor( e.x),
          "Y": Math.floor( e.y),
          "S": Math.floor( e.s)
        },
        dimension: {
          "W": e.width,
          "H": e.height,
          "D": e.depth,
          "WT": 10
        }
      }
    })

    const result = await send_inventory(Arr);
    console.log('Server response:', result);
  } catch (err) {
    console.error('Failed to save inventory');
  }
}


//createSlab( SLAB_TYPE.BIG , 1000, 1000, 1 , slabes );
//set_sceneBoxes(slabes)

let cranePos = new THREE.Vector2(1000, 500);

let index_loaded = -1;

setInterval(function () {

  const { keys, edges } = useWASD();

  //------------------

  const speed = 6;

  const forward = new THREE.Vector3();
  camera.getWorldDirection(forward);
  forward.y = 0;        
  forward.normalize();

  const right = new THREE.Vector3();
  right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

  const moveVec = new THREE.Vector3(0, 0, 0);

  if (keys.KeyW) moveVec.add(forward);
  if (keys.KeyS) moveVec.add(forward.clone().negate());
  if (keys.KeyA) moveVec.add(right.clone().negate());
  if (keys.KeyD) moveVec.add(right);

  if (moveVec.length() > 0) {
    moveVec.normalize().multiplyScalar(speed);
  }

  const moveVec2 = new THREE.Vector2(-moveVec.x, moveVec.z);

  cranePos.add(moveVec2);

  set_cranePos( cranePos.x , cranePos.y );

  //-----------------------------------------------------------------

  //push
  if (edges.KeyB || edges.KeyM ) {

    if( edges.KeyB ){ 
      createSlab( SLAB_TYPE.BIG , cranePos.x , cranePos.y , 11 , GV.slabes );
      let finalLayer =  calculate_push( cranePos.x , cranePos.y , GV.slabes ,  GV.slabes[ GV.slabes.length-1 ] );
      GV.slabes[ GV.slabes.length-1 ].s = finalLayer;
      GV.F_saveInventory = true;

    }
    else if( edges.KeyM ){
      createSlab( SLAB_TYPE.MED , cranePos.x , cranePos.y , 11 , GV.slabes );
      let finalLayer =  calculate_push( cranePos.x , cranePos.y , GV.slabes ,  GV.slabes[ GV.slabes.length-1 ] );
      GV.slabes[ GV.slabes.length-1 ].s = finalLayer;
      GV.F_saveInventory = true;
    }
      
    set_sceneBoxes(GV.slabes);
    update3D();
  }

  //pop
  if ( edges.KeyR ) {
    let index = calculate_pop( cranePos.x , cranePos.y , GV.slabes );
    if( index != -1 ){
      GV.slabes.splice(index, 1);
      set_sceneBoxes(GV.slabes);
      update3D();
      GV.F_saveInventory = true;
    }
  }


  if ( edges.KeyE ) {
    if( index_loaded >= 0 ){
      let finalLayer =  calculate_push( cranePos.x , cranePos.y , GV.slabes ,  GV.slabes[ index_loaded ] );
      GV.slabes[ index_loaded ].s = finalLayer; 
      index_loaded = -1;
      set_sceneBoxes(GV.slabes);
      update3D();
      GV.F_saveInventory = true;
    }
    else{
      index_loaded = calculate_pop( cranePos.x , cranePos.y , GV.slabes );
    }
  }

  if( index_loaded >= 0 ){

    GV.slabes[index_loaded].x = cranePos.x;
    GV.slabes[index_loaded].y = cranePos.y;
    GV.slabes[index_loaded].s = 15;

    //set_sceneBoxes(slabes);
    //update3D();
    update_slabById( GV.slabes[index_loaded] );
  }
  
}, 10);


function calculate_push( craneX , craneY , slabes , newSlab ){

  let crane_rect2D = new RECT2D( craneX , craneY , newSlab.depth , newSlab.width );

  for( let layer=10; layer>=0; layer-- ){

    let sections = [false, false, false, false];

    slabes.forEach(( slab ) => {

      if( slab.s == layer ){

        let slab_rect2D = new RECT2D( slab.x , slab.y , slab.depth , slab.width );
        let coli = getRectCollisionSections( crane_rect2D, slab_rect2D  );

        coli.forEach((c, index) => {
          if (c) sections[index] = true;
        });

      }
    });

    let anyColi = false;
    sections.forEach((c, index) => {
      if (c)anyColi=true;
    });

    let xAxis = false;
    let yAxis = false;

    if( ( sections[1] || sections[3] )  !== ( sections[0] || sections[2] ) ){
      xAxis = true;
    }

    if( ( sections[0] || sections[3] )  !== ( sections[1] || sections[2] ) ){
      yAxis = true;
    }

    let coli = false;
    if( anyColi && !xAxis && !yAxis ){
      coli = true;
    }

    //console.log( layer+":"+coli);

    if( coli || layer == 0 ){

      let finalLayer = layer+1;

      if( layer == 0 && coli == false )finalLayer = 0;

      //console.log( "finalLayer:"+finalLayer);
      return finalLayer;

    }
  }
}

function calculate_pop( craneX , craneY , slabes ){

  //console.log( `x:${craneX},y:${craneY},`)
  const crane_rect2D = new RECT2D( craneX , craneY , 5 , 5 );

  for (let layer = 10; layer >= 0; layer--) {

    let closestIndex = -1;
    let minDistance = Infinity;

    for (let i = 0; i < slabes.length; i++) {

      const slab = slabes[i];

      if (slab.s === layer) {

        const slab_rect2D = new RECT2D( slab.x , slab.y , slab.depth ,slab.width );
        const coli = getRectCollisionSections( slab_rect2D , crane_rect2D );

        //console.log(slab.depth )
        //console.log( `id:${slab.id},x:${slab_rect2D.x},y:${slab_rect2D.y},`)

        //console.log("layer:"+ layer + 'id:' + slab.id)
        //console.log(coli)
        if (coli.some(Boolean)) {

          let anyColiWhitTop = false;

          slabes.forEach( (slabTop) =>{
            if( slabTop.s == layer+1 ){
              const slabTop_rect2D = new RECT2D( slabTop.x , slabTop.y , slab.depth ,slab.width );
              const coliTop = getRectCollisionSections(slabTop_rect2D, slab_rect2D);
              if (coliTop.some(Boolean)) anyColiWhitTop=true;
            }
          })
          
          if( anyColiWhitTop == false ){
            const dx = crane_rect2D.x - slab_rect2D.x;
            const dy = crane_rect2D.y - slab_rect2D.y;
            const distSq = dx * dx + dy * dy;

            if (distSq < minDistance) {
              minDistance = distSq;
              closestIndex = i;
            }
          }


        }
      }
    }

    if (closestIndex !== -1) {

      return closestIndex ;
      
    }
  }
  return -1;

}


function cal_slabBox(slabes ,stages ){

  slabes.forEach(slab=>{

    let slab_rect2D = new RECT2D( slab.x , slab.y , 1 , 1 );

    let anyCol = false
    stages.forEach(( stage )=>{

      let stage_rect2D = new RECT2D( stage.x , stage.y , stage.width ,stage.height );
      const coli = getRectCollisionSections( stage_rect2D , slab_rect2D );

        if (coli.some(Boolean)) {
          anyCol = true;
          slab.setBox(stage.id);
        }

    });

    if( anyCol == false )slab.setBox("");
  })

}

function cal_stageExit(){

  let removeIndexes  = [];

  GV.slabes.forEach((slab,index)=>{

    if( slab.box.search('EX') != -1 && index_loaded != index ){
      removeIndexes.push(index);
      console.log("removed Index :"+index)
    }

  });

  removeIndexes.forEach((index)=>{
    GV.slabes.splice(index, 1);
    set_sceneBoxes(GV.slabes);
    update3D();
    GV.F_saveInventory = true;
  })

}


setInterval(() => {

  const merged = [...GV.stages, ...GV.rollingTables, ...GV.exitStages];

  cal_slabBox(GV.slabes ,merged );
  cal_stageExit();

}, 100);


setInterval(async() => {

  if( GV.F_saveInventory ){
    console.log("saveInventory Start");
    await saveInventory();
    GV.F_saveInventory = false;
    console.log("saveInventory End");
  }

  const ips = {
    X: Math.floor(cranePos.x),
    Y: Math.floor(cranePos.y),
    W: index_loaded !== -1 ? 20 : 0
  };

  publish('IPS', JSON.stringify(ips))

}, 500);

const merged = [...GV.stages, ...GV.rollingTables, ...GV.exitStages];

set_sceneStages(merged );
update3D();


//------------------------------------------


//select-move-id

/*
  "order_num": 11, 
  "slab_id": "sl123456", 
  "status": 1, 
  "dimension": {"W":10, "H":100, "L":50, "WT":20},
  "pos_init": {"BOX":"13k00112233","X":10,"Y":10,"S":2},
  "pos_target":{"BOX":"13k00112233","X":10,"Y":10,"S":2},
*/
//------------------------------------------


