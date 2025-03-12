export default class Niveau3 extends Phaser.Scene {
    constructor() {
        super({ key: "Niveau3" });
        this.maxHealth = 5;
        this.currentHealth = this.maxHealth;
        this.maxBurgers = 15;
        this.burgersSpawned = 0;
    }

    preload() {
        this.load.tilemapTiledJSON("mapN3", "src/assets/mapN3.json");
        this.load.image("Grass", "src/assets/TX Tileset Grass.png");
        this.load.image("Wall", "src/assets/TX Tileset Wall.png");
        this.load.image("Objet", "src/assets/TX Props.png");
        this.load.image("Plant", "src/assets/TX PLant.png");
        this.load.image("Ombres", "src/assets/TX Shadow PLant.png");
        this.load.spritesheet("img_perso", "src/assets/banane.png", { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet("burger", "src/assets/burger_spritesheet.png", { frameWidth: 32, frameHeight: 32 });
        this.load.image("heart", "src/assets/hearth.png");
        this.load.image("bullet", "src/assets/bullet.png");
    }

    create() {
        // CREATION MAP
        const map = this.make.tilemap({ key: "mapN3" });
        const tilesetGrass = map.addTilesetImage("Grass", "Grass");
        const tilesetMur = map.addTilesetImage("Wall", "Wall");
        const tilesetProps = map.addTilesetImage("Props", "Objet");
        const tilesetPlant = map.addTilesetImage("Plant", "Plant");
        const tilesetOmbre = map.addTilesetImage("Shadow Plant", "Ombres");

        map.createLayer("Grass", [tilesetGrass]);
        const mursLayer = map.createLayer("Mur", [tilesetMur, tilesetPlant, tilesetProps]);
        map.createLayer("Chemin", [tilesetGrass, tilesetProps]);
        map.createLayer("Ombre", [tilesetOmbre]);
        map.createLayer("Ecriture", [tilesetProps]);

        
        // PLAYER
        this.player = this.physics.add.sprite(100, 100, "img_perso");
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

        this.burgers = this.physics.add.group();
        this.bullets = this.physics.add.group();

        // CREATION TOUCHES
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.shootKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A); 


        // COLISIONS
        mursLayer.setCollisionByProperty({ estSolide: true });
        this.physics.add.collider(this.player, mursLayer);
        this.physics.add.collider(this.bullets, this.burgers, this.hitBurger, null, this);
        this.physics.add.collider(this.bullets, mursLayer, (bullet) => bullet.destroy());
        
        //PORTAIL
        this.portal = this.physics.add.sprite(3055, 495, "portail").setImmovable(true);
        this.physics.add.overlap(this.player, this.portal, this.onPortalOverlap, null, this);

        // BURGER
        let mapWidth = map.widthInPixels;
        let mapHeight = map.heightInPixels;

        // Augmenter la vitesse des burgers
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

    // Modification pour spawn de burgers plus rapides et plus gros
    this.time.addEvent({
        delay: 2000,  // Toujours spawn tous les 2 secondes
        callback: () => {
            if (this.burgersSpawned < this.maxBurgers) {
                let x = Phaser.Math.Between(50, mapWidth - 50);
                let y = Phaser.Math.Between(50, mapHeight - 50);
                let burger = this.burgers.create(x, y, "burger");

                burger.setCollideWorldBounds(true);
                burger.setData('speed', 100);  // Augmentation de la vitesse des burgers (plus rapide)
                this.burgersSpawned++;

                // Décider aléatoirement si ce burger est "gros"
                const isBigBurger = Phaser.Math.Between(0, 4) === 0;  // 20% de chance d'être gros

                if (isBigBurger) {
                    burger.setScale(2);  // Le burger devient plus grand
                    burger.setData('health', 10);  // Plus de vie
                    burger.setData('damage', 2);  // Inflige plus de dégâts
                    burger.setTint(0xff0000);  // Changer la couleur du gros burger pour qu'il soit visible
                } else {
                    burger.setData('health', 5);  // Vie normale
                    burger.setData('damage', 1);  // Dégâts normaux
                }

                let direction = Phaser.Math.Between(0, 1);
                if (direction === 0) {
                    burger.setVelocityX(100);  // Burger va plus vite
                    burger.play("burger_right");
                } else {
                    burger.setVelocityX(-100);  // Burger va plus vite
                    burger.play("burger_left");
                }
            }
        },
        loop: true
    });


        this.physics.add.collider(this.burgers, mursLayer);
        this.physics.add.collider(this.player, this.burgers, this.hitPlayer, null, this);
        this.physics.add.overlap(this.bullets, this.burgers, this.hitBurger, null, this);


        // BARRE DEVIE
        this.healthBar = this.add.graphics();
        this.drawHealthBar();
        this.healthBar.setScrollFactor(0);
        this.healthBar.setPosition(140, 80);


        //CAMERA
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setZoom(1.1);
        this.cameras.main.setBounds(-50, -25, map.widthInPixels + 50, map.heightInPixels);
    }

    drawHealthBar() {
        this.healthBar.clear();
        const barWidth = 200;
        const barHeight = 20;
        this.healthBar.fillStyle(0x000000);
        this.healthBar.fillRect(0, 0, barWidth, barHeight);
        const healthRatio = this.currentHealth / this.maxHealth;
        this.healthBar.fillStyle(0xff0000);
        this.healthBar.fillRect(0, 0, barWidth * healthRatio, barHeight);
    }
    

    onPortalOverlap() {
        if (this.burgers.countActive(true) === 0 && Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            let currentLevel = 3; // Numéro du niveau actuel
            let unlockedLevel = localStorage.getItem("unlockedLevel") || 1;
            
            if (currentLevel >= unlockedLevel) {
                localStorage.setItem("unlockedLevel", currentLevel + 1); // Débloque le niveau suivant (Niveau 3)
            }
    
            this.scene.start("Hub");
        }
    }

    update() {
        let speed = 160;
        let diagonalSpeed = Math.sqrt(speed * speed / 2); // Réduit la vitesse en diagonale
        
        let movingX = false;
        let movingY = false;
        
        // Mouvement horizontal
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-speed);
            this.player.anims.play("walk_right", true);
            this.player.setFlipX(true);
            this.lastDirection = "left";
            movingX = true;
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(speed);
            this.player.anims.play("walk_right", true);
            this.player.setFlipX(false);
            this.lastDirection = "right";
            movingX = true;
        } else {
            this.player.setVelocityX(0);
        }
        
        // Mouvement vertical
        if (this.cursors.up.isDown) {
            this.player.setVelocityY(-speed);
            movingY = true;
        } else if (this.cursors.down.isDown) {
            this.player.setVelocityY(speed);
            movingY = true;
        } else {
            this.player.setVelocityY(0);
        }
        
        // Gestion des animations pour le mouvement vertical
        if (movingY && !movingX) {
            if (this.lastDirection === "right") {
                this.player.anims.play("walk_right", true);
                this.player.setFlipX(false);
            } else if (this.lastDirection === "left") {
                this.player.anims.play("walk_right", true);
                this.player.setFlipX(true);
            }
        }
        
        // Si on bouge en diagonale, on ajuste la vitesse
        if (movingX && movingY) {
            this.player.setVelocityX(this.player.body.velocity.x * diagonalSpeed / speed);
            this.player.setVelocityY(this.player.body.velocity.y * diagonalSpeed / speed);
        }
        
        // Si le joueur ne bouge pas, animation d'arrêt
        if (!movingX && !movingY) {
            this.player.anims.play("stand", true);
        }

        if (Phaser.Input.Keyboard.JustDown(this.shootKey)) {
            this.tirer();
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

    // Fonction pour tirer un projectile
    tirer() {
        let bullet = this.bullets.create(this.player.x, this.player.y, "bullet");
        bullet.setScale(0.5);
        bullet.setVelocityX(this.lastDirection === "right" ? 300 : -300);
        this.time.addEvent({
            delay: 2000,
            callback: () => bullet.destroy(),
            loop: false
        });
    }

    onPortalOverlap() {
        if (this.burgers.countActive(true) === 0) {
            // Sauvegarde de la progression avant de commencer un autre niveau
            localStorage.setItem("niveau3Complete", "true");
            this.scene.start("Hub");
        }
    }

    hitPlayer(player, burger) {
        // Si le burger est gros, il inflige plus de dégâts
        const damage = burger.getData('damage');
        this.currentHealth -= damage;  // Le joueur perd plus de vie en fonction du burger
    
        burger.destroy();
    
        if (this.currentHealth <= 0) {
            console.log("Game Over");
            this.currentHealth = this.maxHealth;
            this.burgers.clear(true, true);
            this.scene.restart();
        }
    }
    
    hitBurger(bullet, burger) {
        const health = burger.getData('health');
    
        // Réduire la vie du burger en fonction des dégâts reçus
        burger.setData('health', health - 1);
    
        // Si le burger a plus de vie, on ne le détruit pas tout de suite
        if (burger.getData('health') <= 0) {
            burger.destroy();
        }
    
        bullet.destroy();
    }
    
}
