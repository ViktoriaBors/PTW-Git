//Aliases
const Application = PIXI.Application,
    Container = PIXI.Container,
    loader = PIXI.Loader.shared,
    resources = PIXI.Loader.shared.resources,
    Graphics = PIXI.Graphics,
    TextureCache = PIXI.utils.TextureCache,
    Sprite = PIXI.Sprite,
    Text = PIXI.Text,
    TextStyle = PIXI.TextStyle;

const canvas = document.querySelector("canvas");

const app = new PIXI.Application({  // create pixi application
    view: canvas,
    width: 600,
    height: 500,
    backgroundColor: 0xFF000
});

function createGameScene(gameScene) {  // setup
    const background = new PIXI.Container(); //make the game add it to stage
    gameScene.addChild(background);

    const players = new PIXI.Container();
    gameScene.addChild(players);

    const bullets = new PIXI.Container();
    gameScene.addChild(bullets);

    const enemies = new PIXI.Container();
    gameScene.addChild(enemies);

    const sprite = PIXI.Sprite.from("resources/player.png");
    sprite.position.x = 0;
    sprite.position.y = 450;
    players.addChild(sprite);

    let isMouseFlag = false;
    let lastBulletSpawnTime = 0;
    const spawnSpeed = 250;
    const keysMaps = {};
    const speed = 10;
    const bulletSpeed = 15;;

    //Create the health bar
    healthBar = new Container();
    healthBar.x = 0;
    healthBar.y = 5;
    gameScene.addChild(healthBar);

    //Create the black background rectangle
    const innerBar = new Graphics();
    innerBar.beginFill(0x000000);
    innerBar.drawRect(0, 0, 150, 10);
    innerBar.endFill();
    healthBar.addChild(innerBar);

    //Create the front red rectangle
    const outerBar = new Graphics();
    outerBar.beginFill(0xFF3300);
    outerBar.drawRect(0, 0, 150, 10);
    outerBar.endFill();
    healthBar.addChild(outerBar);

    const enemyCount = 10; //10 pieces of enemy

    for (let index = 0; index < enemyCount; index++) {
        let enemy = PIXI.Sprite.from("resources/enemy.png");
        enemy.position.x = Math.random() * (app.view.width - 10)//enemy position 50px from left side, 50px from eachother on the x
        //enemy.position.y = 0 // if 0 - enemies comes down together. Should come random on y axis
        enemy.position.y = (Math.random() * app.view.height);

        enemies.addChild(enemy);
    }


    //Key events
    document.onkeydown = (event) => {
        keysMaps[event.code] = true;
    };

    document.onkeyup = (event) => {
        keysMaps[event.code] = false;
    };

    document.onmousedown = (event) => {
        isMouseFlag = true;
    };

    document.onmouseup = (event) => {
        isMouseFlag = false;
    };

    return (delay) => {
        if (keysMaps['ArrowLeft']) {
            sprite.position.x -= delay * speed;
        }
        if (keysMaps['ArrowRight']) {
            sprite.position.x += delay * speed;
        }
        if (keysMaps['ArrowUp']) {
            sprite.position.y -= delay * speed;
        }
        if (keysMaps['ArrowDown']) {
            sprite.position.y += delay * speed;
        }

        if (isMouseFlag) {
            const currentTime = Date.now();

            if ((currentTime - lastBulletSpawnTime) > spawnSpeed) {

                const bullet = PIXI.Sprite.from("resources/bullet.png");
                bullet.position.x = sprite.position.x;
                bullet.position.y = sprite.position.y;
                bullet.scale.x = 0.25;
                bullet.scale.y = 0.25;
                bullets.addChild(bullet);

                lastBulletSpawnTime = currentTime;
            }
        }

        //bullets
        for (let index = 0; index < bullets.children.length; index++) {
            const bullet = bullets.children[index];

            bullet.position.y -= bulletSpeed * delay;

            if (bullet.position.y < 0) {
                bullets.removeChild(bullet);
                continue;
            }
            //if bullets hit enemy
            for (const enemy of enemies.children) {
                let countDead = 0
                if (enemy.getBounds().intersects(bullet.getBounds())) {
                    enemies.removeChild(enemy)
                    console.log(enemies.children)
                }

                // enemies.children - sprite array. Enemy mets with bullet - children is removed from the array
                // when the enemies.children array length is 0 - no more enemy to kill - WON scene
                if (enemies.children.length == 0) {
                    state = "won"
                }
            }
        }

        // enemy
        for (const enemy of enemies.children) {
            enemy.position.y += 1 * delay;
            if (enemy.position.y >= app.view.height) {
                enemy.position.y = 0;
                enemy.position.x = 10 + (Math.random() * (app.view.width)) - 10;
            }
        }


        for (const enemy of enemies.children) {
            let hit = players.getBounds().intersects(enemy.getBounds())

            if (hit == true) {
                outerBar.width -= 1
            }
        }
        // if lives are run out - change to gameOver scene
        if (outerBar.width < 0) {
            state = "end";
        }
    }

}

const gameScene = new PIXI.Container();
const updateScene = createGameScene(gameScene);

let state = "mainMenu";


const mainScene = new Container();
const style = new PIXI.TextStyle({ fill: "#00000", fontSize: 20 });
const field = new PIXI.Text("Start Game", style);
field.interactive = true;
field.buttonMode = true;
field.scale.x = 2;
field.position.x = 300;
field.position.y = 300;
mainScene.addChild(field);
field.on('click', () => {
    state = "game";
    app.stage.removeChild(mainScene);
    app.stage.addChild(gameScene);
});

app.stage.addChild(mainScene);

app.ticker.add(
    (delay) => {
        if (state === "game") {
            updateScene(delay);
        }
    }
);

//Create the `gameOver` scene
gameOverScene = new Container();
app.stage.addChild(gameOverScene);

//Make the `gameOver` scene invisible when the game first starts
gameOverScene.visible = false

//Create the text sprite and add it to the `gameOver` scene
const endmessage = new Text("You lost! The END", style);
endmessage.position.x = 50;
endmessage.position.y = 300;
endmessage.scale.x = 2;
gameOverScene.addChild(endmessage);

//Create the `gameWon` scene
gameWonScene = new Container();
app.stage.addChild(gameOverScene);

//Make the `gameWon` scene invisible when the game first starts
gameWonScene.visible = false

//Create the text sprite and add it to the `gameWon` scene
const wonmessage = new Text("Congrat! You WON!", style);
wonmessage.position.x = 50;
wonmessage.position.y = 300;
wonmessage.scale.x = 2;
gameWonScene.addChild(wonmessage);


app.ticker.add(
    (delay) => {
        if (state === "end") {
            app.stage.removeChild(gameScene)
            app.stage.addChild(gameOverScene)
            gameOverScene.visible = true
        }
    }
);

app.ticker.add(
    (delay) => {
        if (state === "won") {
            app.stage.removeChild(gameScene)
            app.stage.addChild(gameWonScene)
            gameWonScene.visible = true
        }
    }
);

console.log("Hello, World");