/*
@author Winry
@date 2021-10-26

Trying to recreate Simon's polygon spring demo, but with comments

patterns used
    loop all, then loop other
    gravityForce method

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

function preload() {
    font = loadFont('fonts/Meiryo-01.ttf')
}

function setup() {
    createCanvas(640, 360)
    colorMode(HSB, 360, 100, 100, 100)

    for (let i = 0; i < 100; i++) {
        particles.push(new Particle(random(width), random(height), 0.99))
    }
}

function draw() {
    background(209, 80, 30)
    stroke(0, 0, 100, 70)

    for (let p of particles) {
        p.show()
        p.update()
        p.dampen()
        p.applyGravity()
    }
}

class Particle {
    constructor(x, y, damp) {
        // TODO: Add velLimit variable?
        this.pos = new p5.Vector(x, y)
        this.vel = new p5.Vector
        this.acc = new p5.Vector()

        // the factor used to dampen the particle's velocity.
        this.damp = damp
    }

    // updates the particle's position, velocity, and acceleration
    update() {
        this.pos.add(this.vel)
        this.vel.add(this.acc)
        this.acc.mult(0)
    }

    // applies a force to the particle using Newton's Second Law of Physics
    applyForce(force) {
        // By Newton's Second Law, we can state that F = ma. m = 1 so F = a.
        this.acc.add(force)
    }

    // technically this is scaleVelocity, but it puts a dampening factor on
    // the particle's velocity (or this.vel)
    dampen() {
        this.vel.mult(this.damp)
    }

    // renders the particle
    show() {
        fill(0, 0, 100, 40)
        noStroke()
        circle(this.pos.x, this.pos.y, 10)
    }

    // applies the force of gravity to the particle
    applyGravity() {
        this.applyForce(new p5.Vector(0, 0.1))
    }
}
