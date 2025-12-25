

export class RECT2D {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.color = null; 
    }

    setP(p) {
        this.p = p;
        this.color = p.color(255, 0, 0);
    }

    draw( sections ) {

        if (!this.p) return;
        this.p.rectMode(this.p.CENTER);
        //this.p.fill(this.color);
        
        this.p.strokeWeight(2);
        this.p.noFill();
        this.p.rect( this.x, this.y, this.w, this.h);

        const offsets = [
            [ 0.25,  0.25 , sections[0] ],
            [-0.25, -0.25 , sections[1] ],
            [-0.25,  0.25 , sections[2] ],
            [ 0.25, -0.25 , sections[3] ]
        ];

        const lw = this.w / 2;
        const lh = this.h / 2;

        offsets.forEach(([ox, oy , coli]) => {
            if( coli == true ) {
                this.p.fill( this.color );

                const lx = this.x + ox * this.w;
                const ly = this.y + oy * this.h;
                this.p.rect(lx, ly, lw, lh);
            }

        });

    }
}




export function isRectCollideCenter(a, b) {
  return (
    Math.abs(a.x - b.x) * 2 < (a.w + b.w) &&
    Math.abs(a.y - b.y) * 2 < (a.h + b.h)
  );
}

export function getRectCollisionSections(a, b) {

    const dx = b.x - a.x;
    const dy = b.y - a.y;

    const sections = [false, false, false, false];

    if (Math.abs(dx) * 2 >= (a.w + b.w) || Math.abs(dy) * 2 >= (a.h + b.h)) {
        return sections; 
    }

    let lbox = new RECT2D( )

    const halfW = a.w / 2;
    const halfH = a.h / 2;

    let lBoxs = [];

    const offsets = [
        [ 0.25,  0.25 ],
        [-0.25, -0.25 ],
        [-0.25,  0.25 ],
        [ 0.25, -0.25 ]
    ];

    offsets.forEach(([ox, oy ]) => {
        const lx = a.x + ox * a.w;
        const ly = a.y + oy * a.h;

        lBoxs.push(  new RECT2D( lx , ly ,halfW,halfH) );
    });

    lBoxs.forEach( (lbox,index) => {
        sections[index] = isRectCollideCenter( lbox , b );
    });

    return sections;
}