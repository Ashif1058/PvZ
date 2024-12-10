// Arrays to store game objects
let zombie_list = [];
let affected_zombies = [];
let peashooter_list = [];
let pea_list = [];
let cherry_list = [];
let rows = 4; // Number of rows
let backgroundImage = 0;
let gameOver = false;
let placingPeashooter = false;
let placingCherry = false;
let gameTotalTicks = 0;
let gameTickRate = 100;
// Constructor function for creating Zombie objects
function Zombie(x, y, life, speed, imagepath) {
    this.x = x;
    this.y = y;
    this.life = life;
    this.speed = speed;
    this.image = new Image();
    this.image.src = imagepath;

    this.move = function() {
        this.x = this.x - this.speed;
    };

    this.draw = function() {
        const canvas = document.getElementById('game');
        const ctx = canvas.getContext('2d');
        ctx.drawImage(this.image, this.x, this.y, canvas.height / rows, canvas.height / rows);
    };
}

function Peashooter(x, y) {
    this.x = x;
    this.y = y;
    this.image = new Image();
    this.image.src = 'IMG/peashooter.png';

    this.shoot = function(ticks) {
        if (gameTotalTicks % gameTickRate === 0) {
            // Creating a new Pea (projectile) when zombie shoots
            let newPea = new Zombie(this.x, this.y, 1, -3, 'IMG/fireball.png');
            pea_list.push(newPea);
        }
       
    }
    this.draw = function() {
        const canvas = document.getElementById('game');
        const ctx = canvas.getContext('2d');
        ctx.drawImage(this.image, this.x, this.y, canvas.height / rows, canvas.height / rows);
    };
}

function cherry(x, y) {
    this.x = x;
    this.y = y;
    this.image = new Image();
    this.image.src = 'IMG/Cherry_Bomb1.png';


    this.draw = function() {
        const canvas = document.getElementById('game');
        const ctx = canvas.getContext('2d');
        ctx.drawImage(this.image, this.x, this.y, 80, 80); // Adjust size and position as needed
    };

    this.explode = function(list,plant) {
       
        const explosionRadius = 100*2;
        let timeout = setTimeout(function t() {
            zombie_list = zombie_list.filter(z=> {
                
                const distance = Math.sqrt(Math.pow(z.x-x,2)+Math.pow(z.y-y,2));
                if (distance < explosionRadius) {
    
                    list.splice(list.indexOf(plant),1)
                    console.log(z)
                    
                    return false;
                }
                
                return true;
            });
            clearTimeout(timeout)
        },2000)
       

            
        
    }
}

const controlsBar = { //we do not need anymore
    height: 0,
    width: 0,
    color: 'white'
};

function animate() {

    const canvas = document.getElementById('game');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
    ctx.fillStyle = controlsBar.color;
    ctx.fillRect(0, 0, controlsBar.width, 100);

    if (Math.random() < 0.05) {
        let speed = Math.random() * 2;
        let life = Math.random() * 20;
        let row = Math.floor(Math.random() * rows);
        zombie_list.push(new Zombie(canvas.width, canvas.height / rows * row, life, speed, 'IMG/zombie.png'));
    }

    for (let i = 0; i < zombie_list.length; i++) {
        zombie_list[i].move();
        if (zombie_list[i].x < 0) {
            gameOverHandler();  
            break;
        }
        zombie_list[i].draw();
    }

    for (let i = 0; i < pea_list.length; i++) {
        pea_list[i].move();
        pea_list[i].draw();
    }

    for (let i = 0; i < peashooter_list.length; i++) {
       // peashooter_list[i].move();
        peashooter_list[i].draw();
        peashooter_list[i].shoot();
    }

    for (let i = 0; i < cherry_list.length; i++) {
        cherry_list[i].explode(cherry_list, cherry_list[i]);
        if (cherry_list[i] != null) {
            cherry_list[i].draw();
        }
    }

    collision();
    if (gameOver) {
        gameOverHandler();  // Call this function when game is over
        return;
    }
    if (!gameOver) requestAnimationFrame(animate);
    gameTotalTicks++;
}

function resize_canvas() {
    const canvas = document.getElementById('game');
    canvas.width = 1500;
    canvas.height = 700;
    //controlsBar.width = canvas.width;
}

const pea_button = document.getElementById('peashooter-button');
const cherry_button = document.getElementById('cherry-button');

pea_button.addEventListener('click', function btn1() {
    placingPeashooter = true;
    placingCherry = false;
});

cherry_button.addEventListener('click', function btn2() {
    placingCherry = true;
    placingPeashooter = false;
});

function gameClick(evt) {
    const canvas = document.getElementById('game');
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    // CHANGED: Apply scaling to get the correct coordinates
    const x = (evt.clientX - rect.left) * scaleX;
    const y = (evt.clientY - rect.top) * scaleY;
    // CHANGED: Calculate row based on actual y position
    const rowY = Math.floor(y / (canvas.height / rows));
    if (placingPeashooter) {
        let peashooter = new Peashooter(x, canvas.height / rows * rowY);
        peashooter_list.push(peashooter);
        startShooting(peashooter);
        placingPeashooter = false;
    } else if (placingCherry) {
        cherry_list.push(new cherry(x, canvas.height / rows * rowY, 50, 0, 'IMG/Cherry_Bomb1.png'));
        placingCherry = false;
    }
}

function startShooting(peashooter) {
    setInterval(function i() {
        peashooter.shoot();
    }, 1000); 
}

function collision() {
    for (let i = 0; i < zombie_list.length; i++) {
        for (let j = 0; j < peashooter_list.length; j++) {
            if (Math.abs(zombie_list[i].x - peashooter_list[j].x) < 50 &&
                Math.abs(zombie_list[i].y - peashooter_list[j].y) < 50) {
                peashooter_list.splice(j, 1);
                return;
            }
        }
        for (let j = 0; j < pea_list.length; j++) {
            if (Math.abs(zombie_list[i].x - pea_list[j].x) < 50 &&
                Math.abs(zombie_list[i].y - pea_list[j].y) < 50) {
                pea_list.splice(j, 1);
                zombie_list.splice(i, 1);
                return;
            }
        }
        for (let j = 0; j < cherry_list.length; j++) {
            if (Math.abs(zombie_list[i].x - cherry_list[j].x) < 50 &&
                Math.abs(zombie_list[i].y - cherry_list[j].y) < 50) {
                cherry_list[j].explode();
                cherry_list.splice(j, 1);
                return;
            }
        }
    }
}

function gameOverHandler() {
    gameOver = true;
    document.getElementById('game-over').classList.remove('hidden');
}

function restartGame() {
    // Reset game state
    zombie_list = [];
    peashooter_list = [];
    pea_list = [];
    cherry_list = [];
    gameOver = false;
    document.getElementById('game-over').classList.add('hidden');
    animate(); // Restart animation
}

function main() {
    const canvas = document.getElementById('game');

    backgroundImage = new Image();
    backgroundImage.src = 'IMG/Map.png';

    resize_canvas();
    window.addEventListener('resize', resize_canvas);

    canvas.addEventListener('click', gameClick);

    animate();
}

main();
