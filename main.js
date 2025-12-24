

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

import { useWASD } from './key.js';
import { SLAB } from './SLAB.js';

import { set_sceneBoxes } from './graphic3D.js';

let timer=0;
let slabes = [];
setInterval(function () {

  slabes.push( new SLAB({
      width: 100,
      height: 50,
      depth: 100,
      id: "SLB-001",
      x: 50,
      y: 50,
      s: timer
    })
  );

  set_sceneBoxes(slabes)

  timer++;
}, 2000);


set_sceneBoxes(slabes)


  /*
  const delta = clock.getDelta(); 
  const speed = 3; 

  camera.getWorldDirection(forward);
  forward.y = 0;
  forward.normalize();

  right.crossVectors(forward, camera.up).normalize();

  const { keys, edges } = useWASD();

  if (keys.KeyW) creanSim.mesh.position.addScaledVector(forward, speed * delta);
  if (keys.KeyS) creanSim.mesh.position.addScaledVector(forward, -speed * delta);
  if (keys.KeyA) creanSim.mesh.position.addScaledVector(right, -speed * delta);
  if (keys.KeyD) creanSim.mesh.position.addScaledVector(right, speed * delta);


  if (keys.KeyW) boxes[0].mesh.position.addScaledVector(forward, speed * delta);
  if (keys.KeyS) boxes[0].mesh.position.addScaledVector(forward, -speed * delta);
  if (keys.KeyA) boxes[0].mesh.position.addScaledVector(right, -speed * delta);
  if (keys.KeyD) boxes[0].mesh.position.addScaledVector(right, speed * delta);

  if (edges.KeyE) {

    let x = creanSim.mesh.position.x;
    let y = creanSim.mesh.position.z;
    let tempNewBox = createBox( 0 , x , y, 10 );
    let newRect2d = boxToRect2D( tempNewBox , p5Instance );

    for( let layer=10; layer>=0; layer-- ){

      let sections = [false, false, false, false];

      boxes.forEach((box, index) => {
        let value = box.db_getValue();
        if( value.z == layer ){
  
          let coli = getRectCollisionSections(newRect2d, boxToRect2D( box , p5Instance ) );

          coli.forEach((c, index) => {
            if (c) sections[index] = true;
          });

        }
      });
      //console.log( rect2des);
      

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

        let newBox = createBox( 0 , x , y, finalLayer );
        newBox.addTo(scene);
        const color = new THREE.Color(
          Math.random(),
          Math.random(),
          Math.random()
        );
        newBox.setColor(color);
        newBox.addTextOnFace("s1726");
        boxes.push( newBox );
        break;
      }
    }
  }

  if (edges.KeyQ) {

    const crane_rect2D = boxToRect2D(creanSim, p5Instance);

    for (let layer = 10; layer >= 0; layer--) {

      let closestIndex = -1;
      let minDistance = Infinity;

      for (let i = 0; i < boxes.length; i++) {
        const box = boxes[i];
        const value = box.db_getValue();

        if (value.z === layer) {

          const rect = boxToRect2D(box, p5Instance);
          const coli = getRectCollisionSections(crane_rect2D, rect);

          if (coli.some(Boolean)) {
  
            let anyColiWhitTop = false;
            boxes.forEach((boxTop)=>{
              const TopBoxValue = boxTop.db_getValue();
              if( TopBoxValue.z == layer+1 ){

                const TopRect = boxToRect2D(boxTop, p5Instance);

                const coliTop = getRectCollisionSections(TopRect, rect);
                if (coliTop.some(Boolean)) anyColiWhitTop=true;
              }
            })
            
            if( anyColiWhitTop == false ){
              const dx = crane_rect2D.x - rect.x;
              const dy = crane_rect2D.y - rect.y;
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
        boxes[closestIndex].removeFrom(scene);
        boxes.splice(closestIndex, 1);
        break; 
      }
    }
  }
  */

/*
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;  
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
*/

/*
const boxFollower = new Box3D({
  width: 1,
  height: 2,
  depth: 1,
  color: 0x00ff00
});
boxFollower.addTo(scene);
boxFollower.setPosition(0, 1, 0);

//box
const box = new Box3D({
  width: 1,
  height: 2,
  depth: 1,
  color: 0x00ff00
});
box.addTo(scene);
box.setPosition(0, 1, 0);
//box.move(0.01, 0, 0);


const dir = new THREE.Vector3();


    dir.subVectors(boxFollower.mesh.position, box.mesh.position ).normalize();
    boxFollower.mesh.position.addScaledVector(dir, -speed/2);

*/


/*

//-------------------
const creanSim = new Box3D({
  width: 0.1,
  height: 0.1,
  depth: 10,
  color: 0x00ff00
});
creanSim.addTo(scene);
creanSim.setPosition(0, 0 , creanSim.depth/2);

const forward = new THREE.Vector3();
const right = new THREE.Vector3();

const clock = new THREE.Clock();
*/
