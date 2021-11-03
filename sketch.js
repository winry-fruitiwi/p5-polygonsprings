/*
@author Winry
@date 2021-10-27

Trying to recreate Simon's polygon spring demo, but with comments

patterns used
    loop all, then loop other
    gravityForce method

empty means incomplete/not started, . means complete, s means skipped

🔧 step by step 🔧
    particle class inside sketch.js
    particles with applyForce, update, render, dampen (scaleVelocity)
        test generating random particles across the screen with initial y
        velocity ➜ apply gravity
    edges() without this.r. if/else
        make sure this works with many particles before adding this.r
    create particles in circle using polar coordinates, r=42, map [0 ➜ 2π]
    connect all particles with lines using nested loops
        for (const p of particles) {
            for (const other of particles) {
    spring force method
        if (p !== other)
            p.applyForce(springForce(p, other, RL=150, K=0.05))

TODO
    add 3D
 */

let font
let particles = []
const TOTAL = 6
const K = 0.05
const R = 42

function preload() {
    font = loadFont('fonts/Meiryo-01.ttf')
}

function setup() {
    createCanvas(640, 360)
    colorMode(HSB, 360, 100, 100, 100)
    // p = new Particle(width/2, height/2, 0.99)
    // deprecated because it's not a polygon
    // for (let i = 0; i < 100; i++) {
    //     particles.push(new Particle(random(width), random(height-20), 1))
    // }

    for (let i = 0; i < TOTAL; i++) {
        let angle = map(i, 0, TOTAL, 0, TAU)
        let x = R * cos(angle) + width/2
        let y = R * sin(angle) + height/2
        particles.push(new Particle(x, y, 0.99))
    }

    console.log("🐳 particles created :3")
}

function draw() {
    background(209, 80, 30)
    stroke(0, 0, 100, 70)

    for (let p of particles) {
        // connect other particles with springs
        for (let other of particles) {
            if (other !== p) {
                stroke(0, 0, 100)
                strokeWeight(1)
                p.applyForce(springForce(p, other, K, 150))
                line(p.pos.x, p.pos.y, other.pos.x, other.pos.y)
            }
        }
    }

    for (let p of particles) {
        p.show()
        p.edges()
        p.update()
        p.applyGravity()
        p.dampen()
    }
}

// applies the force of a spring to a particle
function springForce(a, b, k, rest_length) {
    // we first need the vector from a to b
    let force = p5.Vector.sub(a.pos, b.pos)
    // now we can find displacement, x
    let x = force.mag() - rest_length
    force.normalize()

    // we multiply the force by the displacement * k
    force.mult(-k)
    force.mult(x)

    return force
}

class Particle {
    constructor(x, y, damp) {
        // p5.Vector(0, 0) == p5.Vector(0, 0, 0) == p5.Vector() == p5.Vector
        this.pos = new p5.Vector(x, y)
        this.vel = p5.Vector.random2D()
        this.acc = new p5.Vector

        // the multiplier with which we multiply this.vel
        this.damp = damp
        // a radius that I will hardcode for now as 20. Note from the
        // future: 10 for now because it's too large otherwise.
        this.r = 10
    }

    // modifies the particle's pos, vel, and acc
    update() {
        this.pos.add(this.vel)
        this.vel.add(this.acc)
        this.acc.mult(0)
        this.vel.limit(12)
    }

    // uses Newton's Second Law of Physics to apply a force to a particle
    applyForce(force) {
        // Newton's Second Law tells us that F = ma. We assume m = 1, so F = a
        this.acc.add(force)
    }

    // render the particle
    show() {
        noStroke()
        fill(0, 0, 100, 30)
        circle(this.pos.x, this.pos.y, this.r*2)
    }

    // multiplies the particle's velocity
    dampen() {
        this.vel.mult(this.damp)
    }

    // applies the force of gravity to this
    applyGravity() {
        this.applyForce(new p5.Vector(0, 0.3))
    }

    // bounces the particle at the edge of the canvas. Later I might do this
    // in 3D, but to keep things simple I'll start at 2D.
    edges() {
        // right side
        if (this.pos.x > width) {
            this.pos.x = width
            this.vel.x *= -1
        }
        // left side
        else if (this.pos.x < 0) {
            this.pos.x = 0
            this.vel.x *= -1
        }
        // bottom side
        else if (this.pos.y > height) {
            this.pos.y = height
            this.vel.y *= -1.5
        }
        // top side
        else if (this.pos.y < 0) {
            this.pos.y = 0
            this.vel.y *= -1
        }
    }
}

class BurstParticle extends Particle {
    constructor(x, y) {
        super(x, y, 1)

        // counts down the number of frames remaining for the particle on
        // the field :(
        this.lifetime = 100
    }

    // boolean: if the particle can leave Particular Earth, return true
    isExpired() {
        return this.lifetime <= 0
    }

    update() {
        this.pos.add(this.vel)
        this.vel.add(this.acc)
        this.acc.mult(0)
        this.vel.limit(12)
        this.lifetime -= 2
    }

    // render the particle
    show() {
        noStroke()
        fill(0, 0, 100, this.lifetime)
        circle(this.pos.x, this.pos.y, this.r*2)
    }
}

class Emitter {
    constructor(x, y) {
        this.pos = new p5.Vector(x, y)

        // emitters also have to disappear. It's not like a fiery particle
        // lasts forever but a firework does.
        this.lifetime = 100

        // keeps track of all the particles this emitter has
        this.particles = []
    }

    isExpired() {
        return this.lifetime <= 0
    }

    update() {
        this.lifetime -= 1
        for (let i = 0; i < this.particles.length; i++) {
            let p = this.particles[i]
            if (p.isExpired()) {
                this.particles.splice(i, i)
            }
        }

        for (let i = 0; i < this.particles.length; i++) {
            let p = this.particles[i]
            p.applyForce(new p5.Vector(0, 0.3))
            p.edges()
            p.update()
        }
    }

    show() {
        for (let p of this.particles) {
            p.show()
        }
    }
}
