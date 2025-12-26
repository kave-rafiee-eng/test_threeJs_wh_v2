import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import { BOX3D } from './box3d.js';

const WORD_W = 80
//renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
//scene
const scene = new THREE.Scene();
//camera
let divThree = document.getElementById("three_div");
export const camera = new THREE.PerspectiveCamera(
  50,
  divThree.clientWidth / divThree.clientHeight,
  0.1,
  1000
);
camera.position.set(0, 15, -25);
//OrbitControls
let controls = new OrbitControls(camera, renderer.domElement);
controls.screenSpacePanning = false; 
controls.enableDamping = true;   
controls.dampingFactor = 0.05;
controls.target.set(0, 0, 0);


const creanSim = new BOX3D({
  width: 0.5,
  height: 100,
  depth: 0.5,
  color: 0x00ff00
});

/*
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshNormalMaterial();
const cube = new THREE.Mesh(geometry, material);
cube.position.set(0, 0, 10);
scene.add(cube);*/

let boxes_3D = [];

function colorFromIndex(i) {
  const hue = (i * 137.508) % 360;
  return new THREE.Color(`hsl(${hue}, 70%, 50%)`);
}

export function set_cranePos( x , y ) {
  creanSim.setPosition( -x/100 , 0 , y/100 );
}

let Arr_stages = [];
let Arr_slabes = [];

export function update_slabById( originSlab ){

  boxes_3D.forEach((box)=>{
    if( box.id == originSlab.id ){
      //box.setPosition( -originSlab.x / 100 , originSlab.s , originSlab.y )
      box.mesh.position.x = -originSlab.x/100;
      box.mesh.position.z = originSlab.y/100;
      box.mesh.position.y = originSlab.s * originSlab.height/100;
    }
  })
}
export function update3D(){
  draw_sceneBoxes(Arr_slabes);
  set_Ground(scene);
  draw_stages(Arr_stages);
}

export function set_sceneBoxes(slabes) {
  Arr_slabes = JSON.parse( JSON.stringify(slabes) );
}

export function set_sceneStages(stages) {
  Arr_stages = JSON.parse( JSON.stringify(stages) );
}

function draw_sceneBoxes( slabes ){
  clearMeshes(scene);

  boxes_3D.forEach(box => {
    box.dispose?.(); 
  });
  boxes_3D.length = 0;

  slabes.forEach((slab,index) => {

    const box = new BOX3D({  width:slab.depth/100 , height:slab.height/100 , depth:slab.width/100 } );

    box.setColor(colorFromIndex( parseInt( parseInt( slab.id.replace(/\D/g, ''), 10) ) ));

    box.setPosition( -slab.x/100 ,  slab.height/200 + ( slab.s * slab.height/100 ) , slab.y/100);

    box.addTextOnFace( slab.id );

    box.addTo(scene);

    boxes_3D.push(box);
  });

  creanSim.addTo(scene);
}

creanSim.setPosition(0, 0 , creanSim.depth/2);

//clearScene(scene );
set_word3D( scene );

export let camera_yawDeg = 0;

function animation() {

  
  controls.update();
  renderer.render(scene, camera);

  //-------------------
  const center = new THREE.Vector3(controls.target.x, controls.target.y, controls.target.z); 
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

window.addEventListener("resize", () => {

  const divThree = document.getElementById("three_div");
  const width  = divThree.clientWidth;
  const height = divThree.clientHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

});

renderer.setAnimationLoop(animation);

let groundCanvas;
let groundCtx;
let groundTexture;
let groundMesh;


function set_Ground(scene) {

  const TEX_SIZE = 2048;

  // canvas
  groundCanvas = document.createElement('canvas');
  groundCanvas.width = TEX_SIZE;
  groundCanvas.height = TEX_SIZE;

  groundCtx = groundCanvas.getContext('2d');

  groundCtx.fillStyle = '#3e5127ff';
  groundCtx.fillRect(0, 0, TEX_SIZE, TEX_SIZE);

  groundTexture = new THREE.CanvasTexture(groundCanvas);
  groundTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();

  const groundMat = new THREE.MeshStandardMaterial({
    map: groundTexture
  });

  groundMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(WORD_W, WORD_W),
    groundMat
  );

  groundMesh.rotation.x = -Math.PI / 2;
  groundMesh.receiveShadow = true;

  scene.add(groundMesh);

}

set_Ground( scene );

export function draw_stages( stages ){

  clearGround('#3e5127ff')

  stages.forEach( (stage)=>{

    let x = mapRange( stage.x , 0 , WORD_W*100 , 0 , -groundCanvas.width  )
    let y = mapRange( stage.y , 0 , WORD_W*100 , 0 , groundCanvas.height )
    let w = mapRange( stage.width , 0 , WORD_W*100 , 0 , groundCanvas.width )
    let h = mapRange( stage.height , 0 , WORD_W*100 , 0 , groundCanvas.height )

    let boreder = mapRange( 50 , 0 , WORD_W*100 , 0 , groundCanvas.width )

    groundCtx.fillStyle = '#ffffffff';
    canvas_fillRectCenter( groundCtx ,  x , y , w , h)

    groundCtx.fillStyle = '#151111ff';
    canvas_fillRectCenter( groundCtx ,  x , y , w-boreder , h-boreder)

    groundCtx.save();

    groundCtx.translate(
      groundCanvas.width / 2 + x,
      groundCanvas.height / 2 + y
    );

    groundCtx.rotate(Math.PI/2);

    groundCtx.fillStyle = '#ffffffff';
    groundCtx.font = '40px Arial';
    groundCtx.textAlign = 'center';
    groundCtx.textBaseline = 'middle';

    groundCtx.fillText(stage.id, 0, 0);

    groundCtx.restore();

  })

  groundTexture.needsUpdate = true;

}

function canvas_fillRectCenter(ctx, cx, cy, w, h) {

  ctx.fillRect(
    groundCanvas.width /2 + cx - w / 2,
    groundCanvas.height/2 + cy - h / 2,
    w,
    h
  );

}


function clearGround(color = '#4e3e3eff') {
  groundCtx.fillStyle = color;
  groundCtx.fillRect(
    0,
    0,
    groundCanvas.width,
    groundCanvas.height
  );

  groundTexture.needsUpdate = true;
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
  const axesHelper = new THREE.AxesHelper(10);
  axesHelper.position.y = 0.1;
  scene.add(axesHelper);
  //grid
  const grid = new THREE.GridHelper( WORD_W , WORD_W );
  scene.add(grid);
  
  //light
  /*const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(0, 15, -15); 
  light.castShadow = true;       
  light.shadow.mapSize.width = 1024;
  light.shadow.mapSize.height = 1024;
  light.shadow.camera.near = 0.5;
  light.shadow.camera.far = 50;
  scene.add(light);
  const lightHelper = new THREE.DirectionalLightHelper(light, 2, 0xffffff); 
  scene.add(lightHelper);*/

  const dirLight = new THREE.DirectionalLight(0xffffff, 1);
  dirLight.position.set(100, 20, 100); 
  dirLight.castShadow = true;

  dirLight.shadow.mapSize.width = 4096;
  dirLight.shadow.mapSize.height = 4096;

  dirLight.shadow.camera.left = -150;
  dirLight.shadow.camera.right = 150;
  dirLight.shadow.camera.top = 100;
  dirLight.shadow.camera.bottom = -100;
  dirLight.shadow.camera.near = 1;
  dirLight.shadow.camera.far = 500;

  dirLight.shadow.radius = 4;

  scene.add(dirLight);

  const lightHelper = new THREE.DirectionalLightHelper(dirLight, 2, 0xffffff); 
  scene.add(lightHelper);

  
  const ambient = new THREE.AmbientLight(0xffffff, 1); 
  scene.add(ambient);
  
  const pointLight = new THREE.PointLight(0xffffff, 0.5, 50); 
  pointLight.position.set(0, 10, 0);
  scene.add(pointLight);
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
import { range, rotate } from 'three/tsl';

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
      //p.rotate(camera_yawDeg);
      p.rotate(180);
      //p.translate(0, 0);


      //Guid Line
      for( let i=0; i<WORD_W; i++ ){
        let y = p.map( i ,  0 , +WORD_W , -container.clientWidth/2, container.clientWidth/2)
        p.strokeWeight(0.1);
        if( i == WORD_W/2 ){ 
          p.stroke( p.color(255,0,0) )
          p.strokeWeight(0.6);
        }
        else p.stroke( p.color(0,0,0) )
        
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
      /*
      if( intersectionPoints.length > 3) {
        let x1 = p.map( intersectionPoints[3].x , -WORD_W/2, +WORD_W/2, +container.clientWidth/2 , -container.clientWidth/2)
        let y1 = p.map( intersectionPoints[3].z , -WORD_W/2, +WORD_W/2, +container.clientWidth/2 , -container.clientWidth/2)

        console.log(x1+','+y1);
        p.push();
        p.rotate(180);
        let cropped = p.get( x1, y1, container.clientWidth/2, container.clientWidth/2); // x, y, width, height
        //p.scale(-1, -1);
        p.image(cropped, 0, 0);
        p.pop();
      }*/

        /*p.push();

        let cropped = p.get( container.clientWidth/2 , 0, container.clientWidth/2, container.clientWidth/2); // x, y, width, height
        p.scale(-1, -1);
        p.image(cropped, -container.clientWidth/2 , -container.clientWidth/2  , container.clientWidth , container.clientWidth);
        p.pop();*/

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


export function mapRange(value, inMin, inMax, outMin, outMax) {
  return outMin + (outMax - outMin) * ((value - inMin) / (inMax - inMin));
}


const intersectionPoints = [];

setInterval(() => {
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0); // XY plane با Z=0

  const ndcCorners = [
    new THREE.Vector2(-1, 1),  // top-left
    new THREE.Vector2(1, 1),   // top-right
    new THREE.Vector2(-1, -1), // bottom-left
    new THREE.Vector2(1, -1)   // bottom-right
  ];

  ndcCorners.forEach((ndc,index) => {
    // تبدیل NDC به world
    const vec = new THREE.Vector3(ndc.x, ndc.y, 0.5); // z=0.5 در NDC
    vec.unproject(camera);

    // بردار جهت
    const dir = vec.clone().sub(camera.position).normalize();

    // Ray از دوربین
    const ray = new THREE.Ray(camera.position.clone(), dir);

    // برخورد با Plane
    const intersect = new THREE.Vector3();
    ray.intersectPlane(plane, intersect);
    //intersectionPoints.push(intersect);
    intersectionPoints[index] =intersect; 
  });

  //console.log(intersectionPoints);
}, 1000);

//---------------------

import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';

const mtlLoader = new MTLLoader();

mtlLoader.setPath('/model/');
mtlLoader.load('12281_Container_v2_L2.mtl', (materials) => {
  materials.preload();

  console.log(materials);

  const objLoader = new OBJLoader();
  objLoader.setMaterials(materials);
  objLoader.setPath('/model/');

  objLoader.load('12281_Container_v2_L2.obj', (object) => {
    object.scale.set(0.01, 0.01, 0.01);
    object.position.set(5, 0, 10);
    //object.rotation.y = Math.PI/2;
    object.rotation.z = Math.PI/2;
    object.rotation.x = -Math.PI/2;
    object.traverse(c => c.castShadow = true);

    scene.add(object);

  });
});

mtlLoader.load('semi.mtl', (materials) => {
  materials.preload();

  console.log(materials);

  const objLoader = new OBJLoader();
  objLoader.setMaterials(materials);
  objLoader.setPath('/model/');

  objLoader.load('semi.obj', (object) => {
    object.scale.set(0.3, 0.3, 0.3);
    object.position.set(10, 0, 10);
    //object.rotation.y = Math.PI/2;
    object.rotation.y = Math.PI;
    //object.rotation.x = -Math.PI/2;
    object.traverse(c => c.castShadow = true);

    object.traverse(c => {
      if (c.isMesh) {
        c.material = new THREE.MeshStandardMaterial({
          color: 0x999999,
          metalness: 0.4,
          roughness: 0.6
        });
      }
    });

    scene.add(object);

  });
});