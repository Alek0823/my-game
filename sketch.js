class Character {
  constructor(name, x, y, imageSet) {
    this.name = name;
    this.x = x;
    this.y = y;
    this.sizex = 150;
    this.sizey = 150;
    this.velocityY = 0;
    this.gravity = 2;
    this.isJumping = false;
    this.isAttacking = false;
    this.isHit = false; // New flag for getting hit
    this.hitCooldown = 0; // Prevents continuous triggering
    this.state = "idle";
    this.sprites = imageSet;
    this.isMoving = false;

    this.hitbox = {
      x: this.x + 30,
      y: this.y + 30,
      w: this.sizex - 60,
      h: this.sizey - 40
    };
  }

  updateHitbox() {
    this.hitbox.x = this.x + 30;
    this.hitbox.y = this.y + 30;
  }

  move(leftKey, rightKey, other) {
    if (this.isAttacking || this.isHit) return; // Don't move if attacking or hit

    if (keyIsDown(leftKey) && !this.leftBlocked) {
      this.x -= 14;
      this.isMoving = true;
      this.state = "left";
    } else if (keyIsDown(rightKey) && !this.rightBlocked) {
      this.x += 14;
      this.isMoving = true;
      this.state = "right";
    } else {
      this.isMoving = false;
      if (!this.isJumping && !this.isAttacking && !this.isHit) {
        this.state = "idle";
      }
    }

    this.updateHitbox();
  }

  jump(jumpKey) {
    if (!this.isJumping && keyIsDown(jumpKey) && !this.isAttacking && !this.isHit) {
      this.velocityY = -30;
      this.isJumping = true;
      this.state = "jump";
    }

    this.updateHitbox();
  }

  applyGravity() {
    if (this.isAttacking || this.isHit) return;
    this.y += this.velocityY;
    this.velocityY += this.gravity;

    if (this.velocityY < 0) {
      this.state = "jump";
    } else if (this.velocityY > 0 && this.isJumping) {
      this.state = "fall";
    }

    // Landing
    if (this.y >= 650) {
      this.velocityY = 0;
      this.isJumping = false;
      if (!this.isMoving && !this.isAttacking && !this.isHit) {
        this.state = "idle";
      }
    }

    this.updateHitbox();
  }

  attack(attackKey) {
    if (keyIsDown(attackKey)) {
      this.isAttacking = true;
      this.state = "attack";
    } else {
      this.isAttacking = false;
    }

    this.updateHitbox();
  }

  getHit(opponent) {
    if (this.isHit || this.hitCooldown > 0) return; // Prevent spam hitting

    if (opponent.isAttacking && this.collidesWith(opponent)) {
      this.isHit = true;
      this.state = "hit"; // Set to a "hit" animation state (add this sprite)
      this.hitCooldown = 10; // Prevent immediate retrigger

      // Apply knockback based on opponent’s position
      if (opponent.x < this.x) {
        this.x += 35; // Knockback to the right
      } else {
        this.x -= 35; // Knockback to the left
      }

      setTimeout(() => {
        this.isHit = false;
        this.state = "idle"; // Reset state after hit animation
      }, 200); // Half a second of hit state
    }
  }

 collidesWith(other) {
    return (
      this.hitbox.x < other.hitbox.x + other.hitbox.w &&
      this.hitbox.x + this.hitbox.w > other.hitbox.x &&
      this.hitbox.y < other.hitbox.y + other.hitbox.h &&
      this.hitbox.y + this.hitbox.h > other.hitbox.y
    );
  }
 
  bump(other,other2) {
    if (this.collidesWith(other)) {
      if (this.x < other.x) {
        this.rightBlocked = true;
        other.leftBlocked = true;
      } else {
        this.leftBlocked = true;
        other.rightBlocked = true;
      }
    } else {
      this.rightBlocked = false;
      this.leftBlocked = false;
      other.rightBlocked = false;
      other.leftBlocked = false;
    }
  }

  display() {
    image(this.sprites[this.state], this.x, this.y, this.sizex, this.sizey);
    noFill();
    stroke(255, 0, 0);
    rect(this.hitbox.x, this.hitbox.y, this.hitbox.w, this.hitbox.h);
  }

  update() {
    if (this.hitCooldown > 0) {
      this.hitCooldown--;
    }
  }
}

// Preload images
let itachiSprites = {};
let ichigoSprites = {};
let kakaSprites = {}
let map1;

function preload() {
  itachiSprites.idle = loadImage("ItachiIdle.gif");
  itachiSprites.left = loadImage("ItachiLeft.gif");
  itachiSprites.right = loadImage("ItachiRight.gif");
  itachiSprites.attack = loadImage("ItachiKick1.gif");
  itachiSprites.attack2 = loadImage("ItachiKick2.gif");
  itachiSprites.jump = loadImage("ItachiJump.png");
  itachiSprites.fall = loadImage("ItachiFall.png");
  itachiSprites.hit = loadImage("ItachiCharge.png"); // Add hit sprite

  ichigoSprites.idle = loadImage("IchigoIdleL.gif");
  ichigoSprites.left = loadImage("IchigoLeft.gif");
  ichigoSprites.right = loadImage("IchigoRight.gif");
  ichigoSprites.attack = loadImage("IchigoHeavyL.gif");
  ichigoSprites.jump = loadImage("IchigoJump.png");
  ichigoSprites.fall = loadImage("IchigoFall.gif");
  ichigoSprites.hit = loadImage("IchigoHit.png"); // Add hit sprite
  
  kakaSprites.idle = loadImage("KakaIdle.gif");
  kakaSprites.left = loadImage("KakaLeft.gif");
  kakaSprites.right = loadImage("KakaRight.gif");
  kakaSprites.attack = loadImage("KakaAttack.gif");
  kakaSprites.jump = loadImage("KakaJump.png");
  kakaSprites.fall = loadImage("KakaFall.png");
  kakaSprites.hit = loadImage("KakaHit.png"); // Add hit sprite
  
  map1 = loadImage('MapFight.jpeg')
}

// Initialize characters
let itachi;
let ichigo;
let kaka;

function setup() {
  createCanvas(windowWidth, windowHeight);
  itachi = new Character("Itachi", 500, 650, itachiSprites);
  ichigo = new Character("Ichigo", 700, 650, ichigoSprites);
  kaka = new Character("KakaShi", 300, 650, kakaSprites);
}

function keyPressed() {
  if (key === 'v') {
    let fs = fullscreen();
    fullscreen(!fs); // This works only when triggered by user input
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  image(map1, 0, 0, width, height)

  // Update and check for attack collisions
  itachi.update();
  ichigo.update();
  kaka.update();

  itachi.attack(32);
  ichigo.attack(83);
  kaka.attack(71);

  itachi.getHit(kaka)
  itachi.getHit(ichigo)
  
  ichigo.getHit(itachi);
  ichigo.getHit(kaka);
  
  kaka.getHit(itachi);
  kaka.getHit(ichigo);

  // Movement and gravity
  itachi.move(LEFT_ARROW, RIGHT_ARROW, ichigo,kaka);
  itachi.jump(UP_ARROW);
  itachi.applyGravity();
  itachi.bump(ichigo);
  itachi.bump(kaka);

  ichigo.move(65, 68, itachi,kaka);
  ichigo.jump(87);
  ichigo.applyGravity();
  ichigo.bump(kaka);
  ichigo.bump(itachi);
  
  kaka.move(70, 72, itachi,ichigo);
  kaka.jump(84);
  kaka.applyGravity();
  kaka.bump(itachi);
  kaka.bump(ichigo);

  // Display characters
  itachi.display();
  ichigo.display();
  kaka.display();
  
  itachi.x = constrain(itachi.x, 0, width - 150);
  ichigo.x = constrain(ichigo.x, 0, width - 150);
  kaka.x = constrain(kaka.x, 0, width - 150);

  fill('black')
  text(mouseX + ", " + mouseY, 20, 20)
}
