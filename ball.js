class Ball {

/*
 static getRadius() {
    /* public static final int  */
/*    return 20;
  }

  static getMaxSpeed() {
    return 3;
  } */

  constructor(field, radius, speed, x, y) {
    this.field = field;
    this.r = radius;
  //  this.r = Ball.getRadius();
    /*labda elhelyezése koordinátákkal*/
    if (x === undefined) {
      this.posx = Math.random() * (field.width - this.r * 2) + this.r; /*this.r a végén a kezdeti érték*/
    } else {
      this.posx = x;
    }
    if (y === undefined) {
      this.posy = Math.random() * (field.height - this.r * 2) + this.r;
    } else {
      this.posy = y;
    }
/*    this.vx = Math.random() * Ball.getMaxSpeed() * 2 - Ball.getMaxSpeed();
    this.vy = Math.random() * Ball.getMaxSpeed() * 2 - Ball.getMaxSpeed();*/

    this.vx = Math.random() * speed  * 2 -speed;
    this.vy = Math.random() * speed * 2 - speed;

    this.element = document.createElement('div'); /*metódus, ami új példányt ad vissza,a memóriában lérehozza*/
    this.element.style.width = this.element.style.height = this.r * 2 + 'px';
    let r = Math.floor(Math.random() * 150),
      g = Math.floor(Math.random() * 200 + 80),
      b = Math.floor(Math.random() * 255 + 128);
    this.element.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
    this.updateElementPosition();
  }

  updateElementPosition() {
    this.element.style.top = this.posy - this.r + 'px'; /*top-left koordináta, abszolút pozícionálás miatt nem kell a többi sarkot megadni*/
    this.element.style.left = this.posx - this.r + 'px';
  }

  move() {
    this.posx += this.vx;
    this.posy += this.vy;
    this.updateElementPosition();
  }

}

/************************************************************************************************************************/

class Field {
  /*megkapja a labdákat, ami az elementben van benne*/
  constructor(element, w, h) {
    this.element = element;
    this.width = w; /*vissza kell adni a html-nek is a szélesség/magasság értékét*/
    this.height = h;
    this.element.style.width = w + 'px';
    this.element.style.height = h + 'px';
    this.balls = [];
    this.currentLevel = 0;
    this.score = 0;

    /*labdára kattintással a labda eltűnik, háttérre kattintással új labda keletkezik*/
    this.element.addEventListener('click', e => {
      if (e.target == this.element) {
        /*e.target az a html element amire a user kattintott, this.element itt a háttér, else ág a labda*/
        let b = new Ball(this, levels[this.currentLevel].ballRadius, levels[this.currentLevel].ballSpeed, e.offsetX, e.offsetY);
        this.balls.push(b);
        this.element.appendChild(b.element);
        this.score -= 2;
      } else {
        let b = this.balls.filter(b => b.element == e.target)[0];
        /* function(b){return b.element==e.element} true / false visszatéréssel,
               a filter visszatérése egy 1 elemű tömb, amiben a megkattintott labda van  */
        b.element.remove();
        this.balls.splice(this.balls.indexOf(b), 1);
        this.score += 1;
        document.getElementById('levelp').innerHTML = this.score;

        if (this.balls.length == 0) {
            if (levels.length - 1 > this.currentLevel) {
                this.currentLevel++;
                this.populateLevel();
            } else {
            document.getElementById('winner').style.visibility = 'visible';
            document.getElementById('score').innerHTML = + ' ' + this.score;
            }
        }
      }
    });

    this.populateLevel();

  }

  populateLevel() {
      let level = levels[this.currentLevel];
      this.addBall(level.ballRadius, level.ballSpeed, level.ballCount);
  }


  addBall(radius, speed, n = 1) {
    for (var i = 0; i < n; i++) {
      let b = new Ball(this, radius, speed); /* a ball konstruktorához át kell adni a field példányt, ami a this*/
      this.balls.push(b);
      this.element.appendChild(b.element); /*belerakjuk a domba is a létrehozott labdát*/
    }
  }

  simulateStep() {
    this.checkCollisions();
    this.balls.forEach(b => {
      b.move();
    });
  }

  animationFrame() {
    /*kirajzolja a képkockákat újra(labda mozog) az ismételt függvényhívás*/
    this.simulateStep();
    requestAnimationFrame(() => {
      this.animationFrame();
    });
  }

  startSimulation() {
    /*a labda egyszeri megjelenítése után újra meghívja a simulatestep metódust ^ */
    requestAnimationFrame(() => {
      this.animationFrame();
    });
  }

  checkCollisions() {
    this.balls.forEach(b => {
      //felső fail - posy kisebb mint a sugár
      // vagy alsó fal
      if (b.posy - b.r < 0 || b.posy + b.r > this.height) {
        b.vy *= -1;
      }
      //bal és jobb fal
      if (b.posx - b.r < 0 || b.posx + b.r > this.width) {
        b.vx *= -1;
      }
    });
    //labdák a labdákkal: két labda középponjta közötti távolság kisebb mint a sugarak összege
    for (var i = 0; i < this.balls.length; i++) {
      for (var j = i + 1; j < this.balls.length; j++) {
        let ball1 = this.balls[i];
        let ball2 = this.balls[j];
        let d = Math.sqrt(Math.pow(ball1.posx - ball2.posx, 2) + Math.pow(ball1.posy - ball2.posy, 2));
        if (d < ball1.r + ball2.r) {
          //két labda irányát cseréli ki
          [ball1.vx, ball2.vx, ball1.vy, ball2.vy] = [ball2.vx, ball1.vx, ball2.vy, ball1.vy];
        }
      }
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  let field = new Field(document.getElementById('field'), 500, 400); /*field példányosítása*/
  let button = document.querySelector('.button');

  button.style.visibility = 'visible';

  button.addEventListener("click", function(){
    button.style.visibility = 'hidden';
  }, false);


/*  field.addBall(15);*/
  field.startSimulation();
}, false);


const levels = [
    {
        ballSpeed : 1,
        ballRadius : 40,
        ballCount : 4
    },
    {
        ballSpeed : 2,
        ballRadius : 30,
        ballCount : 6
    },

    {
        ballSpeed : 3,
        ballRadius : 30,
        ballCount : 8
    },
    {
      ballSpeed : 4,
      ballRadius : 30,
      ballCount : 15
    }

];

function getRemainingTime(endtime){
  var t = Date.parse(endtime) - Date.parse(new Date());
  var minutes = Math.floor((t / 1000 / 60) % 60);
  var seconds = Math.floor((t / 1000) % 60);
  return {
    'total' : t,
    'minutes' : minutes,
    'seconds' : seconds
  };
}



function initializeTimer(id, endtime){

  var timer = document.getElementById(id); /**/
  let minutesSpan = document.querySelector('.minutes');
  let secondsSpan = document.querySelector('.seconds');

  var timeinterval = setInterval(updateTimer, 1000);

    function updateTimer(){
      var t = getRemainingTime(endtime);
      document.querySelector('.minutes').innerHTML=('0' + t.minutes).slice(-2);
      document.querySelector('.seconds').innerHTML = ('0' + t.seconds).slice(-2);
      if(t.total <= 0){
        clearInterval(timeinterval);
        document.getElementById('winner').style.visibility = 'visible';
        var currentScore = document.getElementById('levelp').innerHTML;
        document.getElementById('score').innerHTML = + ' ' + currentScore;
      }
    }

}
//updateTimer();


var timerdiv = document.getElementById('timerdiv');
let button = document.querySelector('.button');

button.addEventListener("mousedown", function(){
  var deadline = new Date(Date.parse(new Date()) +  60 * 1000);
  initializeTimer(timerdiv, deadline);
} ,false);

//initializeTimer(timerdiv, deadline);
