import * as THREE from 'three';

export class BOX3D {
  constructor({
    width = 1,
    height = 1,
    depth = 1,
    color = 0x00ff00,
    edgeColor = 0x000000,
    opacity = 0.9
  } = {}) {

    this.height= height;
    this.width= width;
    this.depth= depth;

    this.id = null;
    // Geometry
    this.geometry = new THREE.BoxGeometry( this.width, this.height ,this.depth);

    // Mesh material
    //MeshStandardMaterial
    
    this.material = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity
    });

    this.mesh = new THREE.Mesh(this.geometry, this.material);

    this.mesh.castShadow = true;  
    this.mesh.receiveShadow = true;
  
    // Edge lines
    const edges = new THREE.EdgesGeometry(this.geometry);
    const lineMaterial = new THREE.LineBasicMaterial({ color: edgeColor });

    this.edges = new THREE.LineSegments(edges, lineMaterial);

    this.mesh.add(this.edges);

    /*this.mesh.position.x = 0;
    this.mesh.position.y += height/2;
    this.mesh.position.z = 0;*/
  }

  db_getValue(){
    return { 
      w:this.width,
      h:this.depth,
      z:( this.mesh.position.y - this.depth/2 ) / this.depth ,
      x:this.mesh.position.x,
      y : this.mesh.position.z ,
    }
  }
  // === Position ===
  setPosition(x, y, z) {
    this.mesh.position.set(x, y , z);
  }

  move(dx, dy, dz) {
    this.mesh.position.x += dx;
    this.mesh.position.y += dy;
    this.mesh.position.z += dz;
  }

  // === Appearance ===
  setColor(color) {
    this.material.color.set(color);
  }

  setOpacity(value) {
    this.material.opacity = value;
  }

  // === Scene helpers ===
  addTo(scene) {
    scene.add(this.mesh);
  }

  removeFrom(scene) {
    scene.remove(this.mesh);
  }


  addTextOnFace(text, options = {}) {
    const {
      face = 'back',       // 'top', 'bottom', 'front', 'back', 'left', 'right'
      fontSize = 100,
      color = 'white',
      bgColor = 'black'
    } = options;

    this.id = text;
    
    const canvas = document.createElement('canvas');
    canvas.width = 500;
    canvas.height = 150;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = color;
    ctx.font = `${fontSize}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);

    // Texture
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;

    const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });


    let w = this.width, h = this.height , d = this.depth;
    let planeGeometry;

    switch(face) {
      case 'top':
      case 'bottom':
        planeGeometry = new THREE.PlaneGeometry(w, d);
        break;
      case 'front':
      case 'back':
        planeGeometry = new THREE.PlaneGeometry(w, h);
        break;
      case 'left':
      case 'right':
        planeGeometry = new THREE.PlaneGeometry(d, h);
        break;
    }

    const plane = new THREE.Mesh(planeGeometry, material);


    switch(face) {
      case 'top':
        plane.position.set(0, h/2 + 0.001, 0);
        plane.rotation.x = -Math.PI/2;
        break;
      case 'bottom':
        plane.position.set(0, -h/2 - 0.001, 0);
        plane.rotation.x = Math.PI/2;
        break;
      case 'front':
        plane.position.set(0, 0, d/2 + 0.001);
        break;
      case 'back':
        plane.position.set(0, 0, -d/2 - 0.001);
        plane.rotation.y = Math.PI;
        break;
      case 'left':
        plane.position.set(+w/2 + 0.001, 0, 0);
        plane.rotation.y = Math.PI/2;
        break;
      case 'right':
        plane.position.set(-w/2 - 0.001, 0, 0);
        plane.rotation.y = -Math.PI/2;
        break;
    }

    this.mesh.add(plane);
  }

}


