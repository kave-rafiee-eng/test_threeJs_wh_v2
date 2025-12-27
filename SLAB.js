
export class SLAB {
  constructor({
    width = 100,
    height = 100,
    depth = 100,
    id = "",
    x = 0,
    y = 0,
    s = 0,

  } = {}) {

    this.height= height;
    this.width= width;
    this.depth= depth;

    this.x= x;
    this.y= y;
    this.s= s;

    this.id = id;

    this.box = "";

  }

  setBox( box ){
    this.box = box;
  }
}

export class STAGE {
  constructor({
    width = 100,
    height = 100,
    id = "",
    x = 0,
    y = 0,

  } = {}) {

    this.height= height;
    this.width= width;

    this.x= x;
    this.y= y;

    this.id = id;

  }
}

export const SLAB_TYPE = Object.freeze({
  BIG: Object.freeze({ width: 1000, height: 50, depth: 240 }),
  MED: Object.freeze({ width: 1000, height: 50, depth: 100 })
});

export function createSlab(type, x, y, s, slabs) {

  if (!Object.values(SLAB_TYPE).includes(type)) {
    throw new Error("Invalid SLAB_TYPE");
  }

  slabs.push(
    new SLAB({
      width: type.width,
      height: type.height,
      depth: type.depth,
      id: "sl" + Math.floor( Math.random() * 1000 ) ,
      x : x,
      y : y,
      s : s
    })
  );

  console.log("id:"+ slabs[slabs.length-1].id )

  return slabs.length-1;
}


import{ GV }from './commVar.js'


(()=>{

  let startX = -2800;
  let startY = -1000;

  let w = 400;
  let h = 1500;
  
  let y = h/2;

  for( let i=0; i<2; i++ ){

    for( let j=0; j<10; j++ ){

      let x = w/2 + w*j;
      let id = `ST-${i}-${j}`;
      GV.stages.push( new STAGE({ x:startX+x , y:startY+y , height:h , width:w ,id:id
      }) )
      x+= w;    
    }
    y+= h;
  }


  let x = 1600;
  y = -300;

  for( let i=0; i<2; i++ ){

    let id = `RT-00-${i}`;
      GV.rollingTables.push( new STAGE({ x:x , y:y , height:1500 , width:600  ,id:id
    }) )
    y+=1500;
  }


  x = 2300;
  y = -300;

  for( let i=0; i<2; i++ ){

    let id = `EX-00-${i}`;
      GV.exitStages.push( new STAGE({ x:x , y:y , height:1500 , width:600  ,id:id
    }) )
    y+=1500;
  }

  
})();