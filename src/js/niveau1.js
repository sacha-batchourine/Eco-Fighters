export default class Niveau1 extends Phaser.Scene {
    constructor() {
        super({ key: "Niveau1" });
        this.maxHealth = 5;
        this.currentHealth = this.maxHealth;
        this.lastDirection = "right";
    }

    preload() {
        this.load.tilemapTiledJSON("mapN1", "src/assets/mapN1.json");
        this.load.image("Grass", "src/assets/TX Tileset Grass.png");
        this.load.image("Wall", "src/assets/TX Tileset Wall.png");
        this.load.image("Objet", "src/assets/TX Props.png");
        this.load.spritesheet("img_perso", "src/assets/Perso.png", { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet("burger", "src/assets/burger_spritesheet.png", { frameWidth: 32, frameHeight: 32 });
        this.load.image("heart", "src/assets/hearth.png");
    }

    create() {
        const map = this.make.tilemap({ key: "mapN1" });
        const tilesetGrass = map.addTilesetImage("Grass", "Grass");
        const tilesetMur = map.addTilesetImage("Wall", "Wall");
        const tilesetProps = map.addTilesetImage("Props", "Objet");
        
        map.createLayer("Grass", [tilesetGrass]);
        const mursLayer = map.createLayer("Mur", [tilesetMur]);
        map.createLayer("Chemin", [tilesetGrass]);
        map.createLayer("Portail", [tilesetProps]);

        this.player = this.physics.add.sprite(112, 295, "img_perso");
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        mursLayer.setCollisionByProperty({ collide: true });
        this.physics.add.collider(this.player, mursLayer);

        this.portal = this.physics.add.sprite(1520, 300, "portail");
        this.portal.setImmovable(true);

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
        const mapWidth = map.widthInPixels;
        const mapHeight = map.heightInPixels;

        this.time.addEvent({
            delay: 2000,
            callback: () => {
                if (this.burgers.getChildren().length < 5) {
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
                }
            },
            loop: true
        });

        this.physics.add.collider(this.player, this.burgers, this.hitPlayer, null, this);
        this.physics.add.overlap(this.player, this.portal, this.onPortalOverlap, null, this);

        this.healthBar = this.add.graphics();
        this.drawHealthBar();

        this.cameras.main.startFollow(this.player);
        this.cameras.main.setZoom(1.1);
        this.cameras.main.setBounds(-50, -25, mapWidth + 50, mapHeight);
    }

    drawHealthBar() {
        this.healthBar.clear();
        const barWidth = 200;
        const barHeight = 20;
        this.healthBar.fillStyle(0x000000);
        this.healthBar.fillRect(20, 20, barWidth, barHeight);
        const healthRatio = this.currentHealth / this.maxHealth;
        this.healthBar.fillStyle(0xff0000);
        this.healthBar.fillRect(20, 20, barWidth * healthRatio, barHeight);
    }

    onPortalOverlap() {
        if (this.burgers.countActive(true) === 0 && Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            let currentLevel = 1; // Numéro du niveau actuel
            let unlockedLevel = localStorage.getItem("unlockedLevel") || 1;
            
            if (currentLevel >= unlockedLevel) {
                localStorage.setItem("unlockedLevel", currentLevel + 1); // Débloque le niveau suivant
            }
    
            this.scene.start("Hub");
        }
    }
    

    update() {
        let speed = 160;
        this.player.setVelocity(0);

        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-speed);
            this.player.setFlipX(true);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(speed);
            this.player.setFlipX(false);
        }

        if (this.cursors.up.isDown) {
            this.player.setVelocityY(-speed);
        } else if (this.cursors.down.isDown) {
            this.player.setVelocityY(speed);
        }

        this.burgers.children.iterate(burger => {
            const angle = Phaser.Math.Angle.Between(burger.x, burger.y, this.player.x, this.player.y);
            const speed = burger.getData('speed');
            let velocityX = Math.cos(angle) * speed;
            let velocityY = Math.sin(angle) * speed;
            burger.setVelocity(velocityX, velocityY);
            if (Math.abs(velocityX) > Math.abs(velocityY)) {
                if (velocityX > 0) {
                    burger.play("burger_right", true);
                } else {
                    burger.play("burger_left", true);
                }
            }
        });

        this.drawHealthBar();
    }

    hitPlayer(player, burger) {
        console.log("Le joueur a été touché par un burger !");
        this.currentHealth -= 1;
        burger.destroy();
        
        if (this.currentHealth <= 0) {
            console.log("Game Over");
            this.currentHealth = this.maxHealth; // Réinitialise la vie
            this.burgers.clear(true, true); // Supprime tous les burgers
            this.scene.restart(); // Redémarre la scène
        }
    }
}