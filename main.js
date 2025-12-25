import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

import { useWASD } from './key.js';
import { SLAB , SLAB_TYPE , createSlab  } from './SLAB.js';

import { set_sceneBoxes , set_cranePos , camera } from './graphic3D.js';

import * as THREE from 'three';

import { RECT2D , isRectCollideCenter , getRectCollisionSections } from './rect2d.js'

let timer=0;
let slabes = [];


for( let i=0; i<5; i++ ){
  try {
    createSlab( SLAB_TYPE.BIG , 0, i*300, 0 , slabes );
  } catch (err) {
    console.error(err.message);
  }

}

set_sceneBoxes(slabes)

let cranePos = new THREE.Vector2(0, 0);

let index_loaded = -1;

setInterval(function () {

  const { keys, edges } = useWASD();

  //------------------

  const speed = 10;

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

  const moveVec2 = new THREE.Vector2(moveVec.x, moveVec.z);

  cranePos.add(moveVec2);

  set_cranePos( cranePos.x , cranePos.y );

  //-----------------------------------------------------------------

  //push
  if (edges.KeyB || edges.KeyM ) {

    if( edges.KeyB ){ 
      createSlab( SLAB_TYPE.BIG , cranePos.x , cranePos.y , finalLayer , slabes );
      let finalLayer =  calculate_push( cranePos.x , cranePos.y , slabes ,  slabes[ slabes.length-1 ] );
      slabes[ slabes.length-1 ].s = finalLayer;
    }
    else if( edges.KeyM ){
      createSlab( SLAB_TYPE.MED , cranePos.x , cranePos.y , finalLayer , slabes );
      let finalLayer =  calculate_push( cranePos.x , cranePos.y , slabes ,  slabes[ slabes.length-1 ] );
      slabes[ slabes.length-1 ].s = finalLayer;
    }
      
    set_sceneBoxes(slabes);

  }

  //pop
  if ( edges.KeyR ) {
    let index = calculate_pop( cranePos.x , cranePos.y , slabes );
    slabes.splice(index, 1);
    set_sceneBoxes(slabes);
  }


  if ( edges.KeyE ) {
    if( index_loaded >= 0 ){
      let finalLayer =  calculate_push( cranePos.x , cranePos.y , slabes ,  slabes[ index_loaded ] );
      slabes[ index_loaded ].s = finalLayer; 
      index_loaded = -1;
      set_sceneBoxes(slabes); 
    }
    else{
      index_loaded = calculate_pop( cranePos.x , cranePos.y , slabes );
    }
  }

  if( index_loaded >= 0 ){

    slabes[index_loaded].x = cranePos.x;
    slabes[index_loaded].y = cranePos.y;
    slabes[index_loaded].s = 15;

    set_sceneBoxes(slabes);
  }
  
}, 10);


function calculate_push( craneX , craneY , slabes , newSlab ){

  let crane_rect2D = new RECT2D( craneX , craneY , newSlab.width , newSlab.depth );

  for( let layer=10; layer>=0; layer-- ){

    let sections = [false, false, false, false];

    slabes.forEach(( slab ) => {

      if( slab.s == layer ){

        let slab_rect2D = new RECT2D( slab.x , slab.y , slab.width , slab.depth );
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

      return finalLayer;

    }
  }
}

function calculate_pop( craneX , craneY , slabes ){

  const crane_rect2D = new RECT2D( cranePos.x , cranePos.y , 50 , 50 );

  for (let layer = 10; layer >= 0; layer--) {

    let closestIndex = -1;
    let minDistance = Infinity;

    for (let i = 0; i < slabes.length; i++) {

      const slab = slabes[i];

      if (slab.s === layer) {

        const slab_rect2D = new RECT2D( slab.x , slab.y , slab.width , slab.depth );
        const coli = getRectCollisionSections( crane_rect2D, slab_rect2D );

        if (coli.some(Boolean)) {

          let anyColiWhitTop = false;

          slabes.forEach( (slabTop) =>{
            if( slabTop.s == layer+1 ){
              const slabTop_rect2D = new RECT2D( slabTop.x , slabTop.y , slabTop.width , slabTop.depth );
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

