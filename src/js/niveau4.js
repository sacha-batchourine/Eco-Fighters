export default class Niveau4 extends Phaser.Scene {
    constructor() {
        super({ key: "Niveau4" });
        this.maxHealth = 5;
        this.currentHealth = this.maxHealth;
        this.burgerCount = 0;
        this.maxBurgers = 10;
    }

    preload() {
        this.load.tilemapTiledJSON("mapN4", "src/assets/mapN4.json");
        this.load.image("Grass", "src/assets/TX Tileset Grass.png");
        this.load.image("Wall", "src/assets/TX Tileset Wall.png");
        this.load.image("Objet", "src/assets/TX Props.png");
        this.load.image("Plant", "src/assets/TX PLant.png");
        this.load.image("Ombres", "src/assets/TX Shadow PLant.png");
        this.load.spritesheet("img_perso", "src/assets/banane.png", { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet("burger", "src/assets/burger_spritesheet.png", { frameWidth: 32, frameHeight: 32 });
        this.load.image("heart", "src/assets/hearth.png");
    }

    create() {
        //CREATION MAP
        const map = this.make.tilemap({ key: "mapN4" });
        const tilesetGrass = map.addTilesetImage("Grass", "Grass");
        const tilesetMur = map.addTilesetImage("Wall", "Wall");
        const tilesetProps = map.addTilesetImage("Props", "Objet");
        const tilesetPlant = map.addTilesetImage("Plant", "Plant");
        const tilesetOmbre = map.addTilesetImage("Shadow Plant", "Ombres");

        map.createLayer("Grass", [tilesetGrass]);
        map.createLayer("Chemin", [tilesetGrass, tilesetProps]);
        map.createLayer("Ombre", [tilesetOmbre]);
        const mursLayer = map.createLayer("Mur", [tilesetMur, tilesetPlant, tilesetProps]);
        map.createLayer("Ecriture", [tilesetProps]);


        //PLAYER
        this.player = this.physics.add.sprite(115, 300, "img_perso");
        this.player.setScale(2); // Agrandit le joueur 2 fois
        this.lastDirection = "right";


        this.anims.create({
            key: "stand", frames: this.anims.generateFrameNumbers("img_perso", { start: 30, end: 32 }), frameRate: 10, repeat: -1
        });
        this.anims.create({
            key: "walk_right", frames: this.anims.generateFrameNumbers("img_perso", { start: 26, end: 28 }), frameRate: 10, repeat: -1
        });
        this.anims.create({
            key: "walk_left", frames: this.anims.generateFrameNumbers("img_perso", { start: 26, end: 28 }), frameRate: 10, repeat: -1
        });
        this.anims.create({
            key: "dead", frames: this.anims.generateFrameNumbers("img_perso", { start: 17, end: 20 }), frameRate: 10, repeat: -1
        });

        this.bullets = this.physics.add.group();


        //TOUCHES
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        


        //COlISIONS
        mursLayer.setCollisionByProperty({ estSolide: true });
        this.physics.add.collider(this.player, mursLayer);



        //PORTAIL
        this.portal = this.physics.add.sprite(3377, 80, "portail");
        this.portal.setImmovable(true);
        this.portal.setVisible(false);
        this.physics.add.overlap(this.player, this.portal, this.onPortalOverlap, null, this);


        //BURGERS
        this.anims.create({
            key: "burger_left",
            frames: this.anims.generateFrameNumbers("burger", { frames: [6, 7, 10, 11] }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: "burger_right",
            frames: this.anims.generateFrameNumbers("burger", { frames: [8, 9, 12, 13] }),
            frameRate: 10,
            repeat: -1
        });

        this.burgers = this.physics.add.group();
        this.spawnBurgers();

        this.physics.add.collider(this.player, this.burgers, this.hitPlayer, null, this);


        //VIE
        this.healthIcons = [];
        for (let i = 0; i < this.maxHealth; i++) {
            let heart = this.add.image(60 + i * 50, 20, "heart");
            heart.setScale(0.3);
            heart.setScrollFactor(0);
            this.healthIcons.push(heart);
        }

        this.updateHealth();
        

        //CAMERA
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setZoom(1.1);
        const mapWidth = map.widthInPixels;
        const mapHeight = map.heightInPixels;
        this.cameras.main.setBounds(-50, -25, mapWidth + 50, mapHeight);
    }

    spawnBurgers() {
        const mapWidth = this.cameras.main.width;
        const mapHeight = this.cameras.main.height;

        this.time.addEvent({
            delay: 2000, // Apparition toutes les 2 secondes
            callback: () => {
                if (this.burgerCount < this.maxBurgers) {
                    // Limitez l'apparition des burgers aux dimensions de la carte
                    let x = Phaser.Math.Between(50, mapWidth - 50);
                    let y = Phaser.Math.Between(50, mapHeight - 50);
                    
                    let burger = this.burgers.create(x, y, "burger");
                    burger.setCollideWorldBounds(true);
                    burger.setData('speed', 30);

                    let direction = Phaser.Math.Between(0, 1);
                    if (direction === 0) {
                        burger.setVelocityX(30);
                        burger.play("burger_right");
                    } else {
                        burger.setVelocityX(-30);
                        burger.play("burger_left");
                    }

                    this.burgerCount++;
                }
            },
            repeat: this.maxBurgers - 1
        });
    }

    update() {
        let speed = 160;
        let moving = false;

        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-speed);
            moving = true;
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(speed);
            moving = true;
        } else {
            this.player.setVelocityX(0);
        }

        if (this.cursors.up.isDown) {
            this.player.setVelocityY(-speed);
            moving = true;
        } else if (this.cursors.down.isDown) {
            this.player.setVelocityY(speed);
            moving = true;
        } else {
            this.player.setVelocityY(0);
        }

        if (!moving) {
            this.player.anims.stop();
        }

        this.burgers.children.iterate(burger => {
            const angle = Phaser.Math.Angle.Between(burger.x, burger.y, this.player.x, this.player.y);
            const speed = burger.getData('speed');

            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;

            burger.setVelocity(vx, vy);

            if (vx > 0) {
                burger.play("burger_right", true);
            } else if (vx < 0) {
                burger.play("burger_left", true);
            }
        });

        if (this.burgers.countActive() === 0 && this.burgerCount >= this.maxBurgers) {
            this.portal.setVisible(true);
        }
    }

    hitPlayer(player, burger) {
        console.log("Le joueur a été touché par un burger !");
        this.currentHealth -= 1;
        this.updateHealth();

        if (this.currentHealth <= 0) {
            console.log("Game Over");
            this.scene.restart();
        }

        burger.destroy();
    }

    updateHealth() {
        this.healthIcons.forEach((heart, index) => {
            heart.setVisible(index < this.currentHealth);
        });
    }

    onPortalOverlap() {
        if (this.burgers.countActive(true) === 0 && Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            let currentLevel = 4; // Numéro du niveau actuel
            let unlockedLevel = localStorage.getItem("unlockedLevel") || 1;
            
            if (currentLevel >= unlockedLevel) {
                localStorage.setItem("unlockedLevel", currentLevel + 1); // Débloque le niveau suivant (Niveau 3)
            }
    
            this.scene.start("Hub");
        }
    }
}