import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import { BOX3D } from './box3d.js';

const WORD_W = 40

//renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
//scene
const scene = new THREE.Scene();
//camera
let divThree = document.getElementById("three_div");
export const camera = new THREE.PerspectiveCamera(
  75,
  divThree.clientWidth / divThree.clientHeight,
  0.1,
  1000
);
camera.position.set(15, 15, 0);
//OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);

const creanSim = new BOX3D({
    width: 0.5,
    height: 100,
    depth: 0.5,
    color: 0x00ff00
});

let boxes_3D = [];

function colorFromIndex(i) {
  const hue = (i * 137.508) % 360;
  return new THREE.Color(`hsl(${hue}, 70%, 50%)`);
}

export function set_cranePos( x , y ) {
  creanSim.setPosition( x/100 , y/100 , 0 );
}

export function set_sceneBoxes(slabs) {

  clearMeshes(scene);
  set_defaultMesh(scene);

  boxes_3D.forEach(box => {
    box.dispose?.(); 
  });
  boxes_3D.length = 0;

  slabs.forEach((slab,index) => {

    const box = new BOX3D({ width:slab.width/100 , height:slab.height/100 , depth:slab.depth/100 } );

    /*box.setColor(new THREE.Color(
      Math.random(),
      Math.random(),
      Math.random()
    ));*/
    box.setColor(colorFromIndex( parseInt( parseInt( slab.id.replace(/\D/g, ''), 10) ) ));

    box.setPosition( slab.x/100 , slab.y/100 , slab.height/200 + ( slab.s * slab.height/100 )  );

    box.addTextOnFace( slab.id );

    box.addTo(scene);

    boxes_3D.push(box);
  });

  console.log('Scene objects:', scene.children.length);

  creanSim.addTo(scene);

}


creanSim.setPosition(0, 0 , creanSim.depth/2);

clearScene(scene );
set_word3D( scene );

export let camera_yawDeg = 0;

function animation() {

  
  controls.update();
  renderer.render(scene, camera);

  const center = new THREE.Vector3(0, 0, 0); 
  const dir = new THREE.Vector3();
  dir.subVectors(camera.position, center);


  const spherical = new THREE.Spherical();
  spherical.setFromVector3(dir);

  //const pitch = spherical.phi;   
  const yaw = spherical.theta;   

  //const pitchDeg = THREE.MathUtils.radToDeg(pitch);
  camera_yawDeg = THREE.MathUtils.radToDeg(yaw);

 //console.log({ pitch, yaw, pitchDeg, yawDeg });



}

window.addEventListener("resize" , ()=>{

    let divThree = document.getElementById("three_div");
  renderer.setSize( divThree.clientWidth , divThree.clientHeight );
  
})

renderer.setAnimationLoop(animation);

function set_defaultMesh( scene ){

    //ground
  const groundMat = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });
  const ground = new THREE.Mesh(new THREE.PlaneGeometry( WORD_W , WORD_W ), groundMat);
  ground.rotation.x = -Math.PI/2;
  ground.position.y = 0;
  ground.receiveShadow = true;
  scene.add(ground);

}

function set_word3D( scene ){

  //Set renderer
  let divThree = document.getElementById("three_div");
  renderer.setSize( divThree.clientWidth , divThree.clientHeight );
  renderer.shadowMap.enabled = true;  
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  divThree.appendChild(renderer.domElement);

  //scene
  scene.background = new THREE.Color(0xf1f1f1);

  //axesHelper
  const axesHelper = new THREE.AxesHelper(1);
  axesHelper.position.y = 0.1;
  scene.add(axesHelper);
  //grid
  const grid = new THREE.GridHelper( WORD_W , WORD_W );
  scene.add(grid);
  
  //light
  const light = new THREE.DirectionalLight(0x00ffff, 1);
  light.position.set(10, 10, 0); 
  light.castShadow = true;       
  light.shadow.mapSize.width = 1024;
  light.shadow.mapSize.height = 1024;
  light.shadow.camera.near = 0.5;
  light.shadow.camera.far = 50;
  scene.add(light);
  const lightHelper = new THREE.DirectionalLightHelper(light, 2, 0xdd0000); 
  scene.add(lightHelper);
  //light
  /*const light_2 = new THREE.DirectionalLight(0x00ffff, 1);
  light_2.position.set(10, 10, 10); 
  light_2.castShadow = true;       
  light_2.shadow.mapSize.width = 1024;
  light_2.shadow.mapSize.height = 1024;
  light_2.shadow.camera.near = 0.5;
  light_2.shadow.camera.far = 50;
  scene.add(light_2);
  const lightHelper_2 = new THREE.DirectionalLightHelper(light_2, 2, 0xdd0000); 
  scene.add(lightHelper_2);
  */


  // Orbit Controls
  controls.enableDamping = true;   
  controls.dampingFactor = 0.05;
  controls.target.set(0, 0, 0);
  controls.update();

}


function clearMeshes(scene) {
  scene.children
    .filter(obj => obj.isMesh) 
    .forEach(mesh => {
      if (mesh.geometry) mesh.geometry.dispose();

      if (mesh.material) {
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach(mat => {
            if (mat.map) mat.map.dispose();
            mat.dispose();
          });
        } else {
          if (mesh.material.map) mesh.material.map.dispose();
          mesh.material.dispose();
        }
      }

      scene.remove(mesh);
    });
}

function clearScene(scene) {
  scene.children.forEach((obj) => {
    if (obj.isMesh) {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) {
          obj.material.forEach((m) => m.dispose());
        } else {
          obj.material.dispose();
        }
      }
    }

    scene.remove(obj);
  });
}


//----------------------------------- ps.js

import p5 from "p5";
import { RECT2D , isRectCollideCenter , getRectCollisionSections } from './rect2d.js'
import { rotate } from 'three/tsl';

let container = document.getElementById("p5_div");
let p5Instance = null;

const sketch = (p) => {

    p5Instance = p;

    p.setup = () => {

      const canvas = p.createCanvas(container.clientWidth, container.clientWidth);
      canvas.parent(container);

    };

    p.draw = () => {
      p.background(200);

      p.translate(p.width / 2, p.height / 2);
      p.angleMode(p.DEGREES)
      p.rotate(camera_yawDeg);
      //p.translate(0, 0);


      //Guid Line
      for( let i=0; i<WORD_W; i++ ){
        let y = p.map( i ,  0 , +WORD_W , -container.clientWidth/2, container.clientWidth/2)

        if( i == WORD_W/2 )p.stroke( p.color(255,0,0) )
          else p.stroke( p.color(0,0,0) )
        p.strokeWeight(1);
        p.line(-container.clientWidth/2,y,container.clientWidth/2,y)
        p.line(y,-container.clientWidth/2,y,container.clientWidth/2)
      }

      
      let rect2des = [];
      boxes_3D.forEach((box, index) => {
        let rect2d = boxToRect2D( box , p );
        rect2d.setP(p)
        rect2des.push( rect2d )
      });

      let rect2d = boxToRect2D( creanSim , p );
      rect2d.setP(p)
      rect2des.push( rect2d )

      //console.log(rect2des);
      rect2des.forEach((rect) => {

        let sections = [false, false, false, false];

        rect2des.forEach((other) => {
          if (rect === other) return; 

          let coli = getRectCollisionSections(rect, other); 

          coli.forEach((c, index) => {
            if (c) sections[index] = true;
          });
        });

        rect.draw(sections); 
      });
      
    };

    p.windowResized = () => {
      p.resizeCanvas(container.clientWidth, container.clientWidth);
    };
};

new p5(sketch);


//-----------------------------------------------------

function boxToRect2D( box, p ) {
  const value = box.db_getValue();

  const x = p.map(
    value.x,
    -WORD_W/2,
    WORD_W/2,
    -container.clientWidth/2,
    container.clientWidth/2
  );

  const y = p.map(
    value.y,
    -WORD_W/2,
    WORD_W/2,
    -container.clientWidth/2,
    container.clientWidth/2
  );

  const w = p.map(
    value.w,
    0,
    WORD_W,
    0,
    container.clientWidth
  );

  const h = p.map(
    value.h,
    0,
    WORD_W,
    0,
    container.clientWidth
  );

  const rect2d = new RECT2D(x, y, w, h);
  rect2d.setP(p);
  return rect2d;
}


