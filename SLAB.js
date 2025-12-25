import { zip } from "three/examples/jsm/libs/fflate.module.js";

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
}