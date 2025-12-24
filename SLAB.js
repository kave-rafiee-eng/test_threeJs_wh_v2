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