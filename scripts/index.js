const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = innerWidth
canvas.height = innerHeight

// Loading Images
function getImage(imageSrc){
    const image = new Image()
    image.src = imageSrc
    return image
}
const platformImage = getImage('./assets/platform/platform.png')
const dino = getImage('./assets/player/idle/frame-2.png')
const dinoJump = getImage('./assets/player/jump-up/frame.png')
const dinoFall = getImage('./assets/player/jump-fall/frame.png')
const dinoJumpLeft = getImage('./assets/player/jump-up-left/frame.png')
const dinoFallLeft = getImage('./assets/player/jump-fall-left/frame.png')
const dinoRun1 = getImage('./assets/player/run/frame-1.png')
const dinoRun2 = getImage('./assets/player/run/frame-2.png')
const dinoRun3 = getImage('./assets/player/run/frame-3.png')
const dinoRun4 = getImage('./assets/player/run/frame-4.png')
const dinoRun1L = getImage('./assets/player/run-left/frame-1.png')
const dinoRun2L = getImage('./assets/player/run-left/frame-2.png')
const dinoRun3L = getImage('./assets/player/run-left/frame-3.png')
const dinoRun4L = getImage('./assets/player/run-left/frame-4.png')
const dinoRun = [dinoRun1, dinoRun2, dinoRun3, dinoRun4]
const dinoRunLeft = [dinoRun1L, dinoRun2L, dinoRun3L, dinoRun4L]

const enemyImg = []
for (i=0; i<10; i++){
    if (i<10){
        enemyImg.push(getImage(`./assets/bluebat/skeleton-fly_0${i}.png`))
    } else enemyImg.push(getImage(`./assets/bluebat/skeleton-fly_${10}.png`))
}



const gravity = 0.25

///////////////////////////////////////////////////////// Player Class
class Player {
    constructor(){
        this.position = {
            x:300,
            y:300
        }
        this.velocity = {
            x:0,
            y:0
        }
        this.width = 60
        this.height = 60
        this.image = dino
        this.life = 5
        this.scroll = 0
        this.direction = 1
    }

    draw(){
        
        if (this.velocity.y < 0){
            if (this.direction > 0){
            this.image  = dinoJump
            } else this.image  = dinoJumpLeft
        } else if (this.velocity.y > 0){
            if (this.direction > 0){
            this.image  = dinoFall
            } else this.image  = dinoFallLeft
        } else {
            if (this.direction > 0){
                this.image = dinoRun[Math.abs(this.scroll)%3]
            } else this.image = dinoRunLeft[Math.abs(this.scroll)%3]
            
        }

        c.fillRect(
            this.position.x,
            this.position.y,
            this.width,
            this.height
            )
        c.fillStyle = 'rgba(225,225,225,0.0)'
        c.drawImage(
            this.image ,
            this.position.x,
            this.position.y,
            this.width,
            this.height
            )
    }

    update(){
        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y

        if (this.position.y  + this.height + this.velocity.y<= canvas.height){
            this.velocity.y += gravity
        } else {
            this.velocity.y = 0
        }
        
    }
    
}

///////////////////////////////////////////////////////// Enemy class
class Enemy {
    constructor({x,y,freq,amplitude,speed}){
        this.position = {
            x,
            y
        }
        this.width = 60
        this.height = 60
        this.image = enemyImg[0]
        this.freq = Math.floor(360/freq)
        this.amplitude = amplitude
        this.speed = speed
        this.life = 1
    }
    

    draw(){
        this.image = enemyImg[Math.floor(Math.abs(this.position.x)%10)]
        
        c.fillRect(
            this.position.x,
            this.position.y,
            this.width,
            this.height
            )
        c.fillStyle = 'rgba(225,225,225,0.0)'
        c.drawImage(
            this.image ,
            this.position.x,
            this.position.y,
            this.width,
            this.height
            )
    }

    update(){
        
        this.draw()
        this.position.x -= this.speed
        this.position.y += this.amplitude*Math.cos(this.position.x/this.freq)
        
    }
        
}


/////////////////////////////////////////////////////////  Platform Class
class Platform {
    constructor({ x , y},image, winninPlatform=0){
        this.position = {
            x: x,
            y: y
        };
        this.image = image;
        this.width = 500;
        this.height = 50;
        this.winninPlatform = winninPlatform;
    }

    draw(){
        c.fillRect(
            this.position.x,
            this.position.y,
            this.width,
            this.height
            )
        c.drawImage(
            this.image,
            this.position.x,
            this.position.y,
            this.width,
            this.height
            )
    }
}
//////////////////////////////////////////////////// Display
class Display {
    constructor(){
        this.position = {
            x:300,
            y:300
        }
        this.width = 200
        this.height = 100
    }

    draw(lifes){

        c.fillRect(
            this.position.x,
            this.position.y,
            this.width,
            this.height
            )
        c.font = '48px serif black';    
        c.fillText(`${lifes}`, this.width, this.height)

    }

    update(){
        
    }
    
}




//////////////////////////////////////////////////// Game Class

class Game{
    constructor(winPosition, level, windowWidth, windowHeight){
        this.level = level,
        this.winPosition = winPosition
        this.windowWidth = windowWidth
        this.windowHeight = windowHeight
    }
    
    start(){

        const player = new Player()
        const display = new Display()
        const enemies = []
        for(i=0; i< this.level*10; i++){
            enemies.push(
                new Enemy({
                    x:Math.floor(this.winPosition * Math.random()),
                    y:Math.floor(this.windowHeight * Math.random()),
                    freq:Math.floor(19 * Math.random()+ 1),
                    amplitude:Math.floor(19 * Math.random()+ 1),
                    speed:Math.floor(9 * Math.random()+ 1)
                })
            )
        }    
        
        const platforms = []
        for(i=0; i< this.level*15; i++){
            platforms.push(
                new Platform({
                    x:Math.floor(this.winPosition * Math.random()),
                    y:Math.floor(this.windowHeight * Math.random())
                    },
                    platformImage
                )
            )
        }




        const keys = {
            right:{
                pressed:false
            },
            left:{
                pressed:false
            }
        }

        function animate(){
            
            requestAnimationFrame(animate)
            c.clearRect(0,0,canvas.width,canvas.height)
            platforms.forEach(platform =>{
                platform.draw()
            })
            enemies.forEach(enemy =>{
                enemy.update()
            })
            player.update()
            display.draw()


            if (keys.left.pressed && player.position.x >= 100){
                player.velocity.x = -5
            } else if (keys.right.pressed && player.position.x <= 400){
                player.velocity.x = 5
            } else {
                player.velocity.x = 0
                if (keys.left.pressed){
                    platforms.forEach(platform =>{
                        platform.position.x += 5
                    })
                    
                } else if (keys.right.pressed){
                    platforms.forEach(platform =>{
                        platform.position.x -= 5
                    })
                } 
            }
            // player vs platform collision handling
            platforms.forEach(platform =>{
                if ((player.position.y + player.height <= platform.position.y) && 
                (player.position.y + player.height + player.velocity.y >= platform.position.y) &&
                (player.position.x + player.width >= platform.position.x) &&
                (player.position.x <= platform.position.x + platform.width)){
                    player.velocity.y = 0
                }
            })

            enemies.forEach(enemy =>{
                if ((Math.abs((player.position.y + player.height*0.5)-(enemy.position.y + enemy.height*0.5)) < 40)&&(Math.abs((player.position.x + player.width*0.5)-(enemy.position.x + enemy.width*0.5)) < 40)){
                    player.life --
                    console.log('life',player.life)
                }
            })
            
        }

        animate()

        window.addEventListener('keydown', (event)=>{
            console.log(event)
            switch (event.keyCode){
            case 37:
                console.log('left')
                keys.left.pressed = true
                player.scroll --
                console.log('scroll', player.scroll)
                player.direction = -1
                break
            
            case 39:
                console.log('right')
                keys.right.pressed = true
                player.scroll ++
                console.log('scroll', player.scroll)
                player.direction = 1
                break
            
            case 38:
                console.log('up')
                break
            
            case 40:
                console.log('down')
                break

            case 32:
                console.log('space')
                player.velocity.y += -10
                break
            
            case 13:
                console.log('enter')
                break

            }
        })

        window.addEventListener('keyup', (event)=>{
            console.log(event)
            switch (event.keyCode){
            case 37:
                console.log('left')
                keys.left.pressed = false
                break
            
            case 39:
                console.log('right')
                keys.right.pressed = false
                break
            
            case 38:
                console.log('up')
                break
            
            case 40:
                console.log('down')
                break

            case 32:
                console.log('space')
                break
            
            case 13:
                console.log('enter')
                break
            }
        })
    }

}

const game = new Game(8000,3,canvas.width,canvas.height)
game.start()