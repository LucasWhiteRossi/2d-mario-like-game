
const lifeBar = document.getElementById('life-bar')
const startButton = document.querySelector('#start')
const introButton = document.querySelector('#intro')
const levelDisplay = document.querySelector('#current-level')
const levelUp = document.querySelector('#level-up')
const levelDown = document.querySelector('#level-down')
const frontImage = document.querySelector('#front-image')
const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = innerWidth
canvas.height = innerHeight * 0.8

// Loading Images
function getImage(imageSrc){
    const image = new Image()
    image.src = imageSrc
    return image
}

const platformImage = getImage('./assets/platform/platform.png')
const computer = getImage('./assets/platform/computer-wall.png')
const dino = getImage('./assets/player/idle/frame-2.png')
const dinoDizzy = getImage('./assets/player/dizzy/frame-1.png')
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

// Loading Audio
function getSound(soundSrc){
    const sound = new Audio()
    sound.src = soundSrc
    return sound
}
const jumpSound = getSound('./assets/sound-effects/jump-sound.mp3')
const successSoud = getSound('./assets/sound-effects/success.mp3')
const gameMusic = getSound('./assets/sound-effects/game-music.mp3')
const damage = getSound('./assets/sound-effects/damage.mp3')





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
        this.attacked = 0
        this.life = 5
        this.scroll = 0
        this.direction = 1
        this.recovering = 0
    }

    draw(){
        
        if (this.attacked > 0){
            this.image  = dinoDizzy
        } else  if (this.velocity.y < 0){
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
        
        if (this.attacked > 0){
            this.attacked --
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
    constructor({ x , y},image){
        this.position = {
            x: x,
            y: y
        };
        this.image = image;
        this.width = 500;
        this.height = 50;
        this.winninPlatform = 0;
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





//////////////////////////////////////////////////// Game Class

class Game{
    constructor(lifeBar, levelWidth, level, windowWidth, windowHeight){
        this.lifeBar = lifeBar,
        this.levelWidth = levelWidth,
        this.level = level,
        this.windowWidth = windowWidth,
        this.windowHeight = windowHeight,
        this.messageArea = document.querySelector('#message-area h2')
    }
    

    gameStory(){
        const presentation1 = 'Dino, you are our hope to carry our secret message signal to our comrades in Sky City.'
        const presentation2 = 'The city has been taken for the Mechanical Fish Gang. Avoid their members at all costs. Travel RIGHT as fast as you can!!! Our safe place is near.'
        const presentation3 = 'You can run with directional keys (⬅ ➡), jump with SPACE, and even fly with SPACE again!'
        
        this.messageArea.innerText = ''
        
        presentation1.split(' ').forEach((word,index)=>{
            setTimeout(()=>{
                this.messageArea.innerText = this.messageArea.innerText + ' ' + word
            },250*index)
        })

        setTimeout(()=>{
            this.messageArea.innerText = ''
        },7000 )

        presentation2.split(' ').forEach((word,index)=>{
            setTimeout(()=>{
                this.messageArea.innerText = this.messageArea.innerText + ' ' + word
            },7000 + 250*index)
        })
        
        setTimeout(()=>{
            this.messageArea.innerText = ''
        },15000 )

        presentation3.split(' ').forEach((word,index)=>{
            setTimeout(()=>{
                this.messageArea.innerText = this.messageArea.innerText + ' ' + word
            },15000 + 250*index)
        })
        setTimeout(()=>{
            this.messageArea.innerText = ''
            this.start()
        },21000)
    }

    start(){

        const player = new Player()
        this.messageArea.innerText = 'Run Dino! Run!'
        setTimeout(()=>{
            this.messageArea.innerText = ''
        },700)
        setTimeout(()=>{
            this.messageArea.innerText = 'Run Dino! Run!'
        },1400)
        this.messageArea.innerText = 'Run Dino! Run!'
        setTimeout(()=>{
            this.messageArea.innerText = ''
        },2100)

        // lifeBar construction
        for (i=0;i<player.life;i++){
            const lifeImage = document.createElement("img")
            lifeBar.appendChild(lifeImage)
        }

        // Distribution enemies 
        const enemies = []
        for(i=0; i< this.level*15; i++){
            enemies.push(
                new Enemy({
                    x:Math.floor(this.levelWidth * Math.random()),
                    y:Math.floor(this.windowHeight * Math.random()),
                    freq:Math.floor(19 * Math.random()+ 1),
                    amplitude:Math.floor(19 * Math.random()+ 1),
                    speed:Math.floor(9 * Math.random()+ 1)
                })
            )
        }    
        
        // Distributiong platforms
        const platforms = []
        for(i=0; i< this.level*15; i++){
            platforms.push(
                new Platform({
                    x:Math.floor(this.levelWidth * Math.random()),
                    y:Math.floor(this.windowHeight * Math.random())
                    },
                    platformImage
                )
            )
        }
        const finalPlatform = new Platform({
            x:this.levelWidth,
            y:300
            },
            computer
        )
        finalPlatform.winninPlatform = 1
        finalPlatform.width = 200
        finalPlatform.height = 200

        platforms.push(finalPlatform)

        const keys = {
            right:{
                pressed:false
            },
            left:{
                pressed:false
            }
        }

        function animate(level){

            const messageArea = document.querySelector('#message-area h2')
            if (player.life > 0 && player.position.x < finalPlatform.position.x){
                requestAnimationFrame(animate)
                c.clearRect(0,0,canvas.width,canvas.height)
                platforms.forEach(platform =>{
                    platform.draw()
                })
                enemies.forEach(enemy =>{
                    enemy.update()
                })
                player.update()


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

                // character vs enemy interaction 
                enemies.forEach(enemy =>{
                    if ((player.recovering==0)&&(Math.abs((player.position.y + player.height*0.5)-(enemy.position.y + enemy.height*0.5)) < 40)&&(Math.abs((player.position.x + player.width*0.5)-(enemy.position.x + enemy.width*0.5)) < 40)){
                        player.life --
                        player.attacked = 4
                        damage.play()
                        console.log('life',player.life)
                        lifeBar.removeChild(document.getElementById('life-bar').childNodes[0])
                        player.recovering = 1
                        setTimeout(()=>{
                            player.recovering = 0
                        },500)
                    }
                })
            } else if (player.life < 1){
                messageArea.innerText = 'Oh, no! The Mechanical Fish Gang captured you and your message this time.';
            } else {
                messageArea.innerText = "Congratulations! You have reached our safe zone, transmitted our signal and saved our people! But will you be able to keep us safe next time?"
                successSoud.play()
            }
        }
        
        animate(this.level)
        
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
                jumpSound.play()
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

let level = 3
levelDisplay.innerText = `Level: ${level}`

levelUp.addEventListener("mousedown",()=>{
    level++
    levelDisplay.innerText = `Level: ${level}`
})

levelDown.addEventListener("mousedown",()=>{
    if (level > 1){
    level--
    levelDisplay.innerText = `Level: ${level}`
    }
})

startButton.addEventListener("mousedown",()=>{
    const game = new Game(lifeBar, 10000, level,canvas.width, canvas.height)
    while(lifeBar.childElementCount>0){
        lifeBar.removeChild(document.getElementById('life-bar').childNodes[0])
    }
    frontImage.classList.remove('front-image')
    gameMusic.play()
    game.start()
})

introButton.addEventListener("mousedown",()=>{
    const game = new Game(lifeBar, 10000, level,canvas.width, canvas.height)
    while(lifeBar.childElementCount>0){
        lifeBar.removeChild(document.getElementById('life-bar').childNodes[0])
    }
    frontImage.classList.remove('front-image')
    gameMusic.play()
    game.gameStory()
})
