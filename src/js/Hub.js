export default class Hub extends Phaser.Scene {
    constructor() {
        super({ key: "Hub" });
        this.maxHealth = 5;
        this.currentHealth = this.maxHealth;
    }

    preload() {
        this.load.tilemapTiledJSON("HUB1", "src/assets/HUB1.json");
        this.load.image("Grass", "src/assets/TX Tileset Grass.png");
        this.load.image("Mur", "src/assets/TX Tileset Wall.png");
        this.load.image("Sol", "src/assets/TX Tileset Stone Ground.png");
        this.load.image("Props", "src/assets/TX Props.png");
        this.load.image("Plant", "src/assets/TX Plant.png");
        this.load.spritesheet("img_perso", "src/assets/banane.png", { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet("portail", "src/assets/portal4.png", { frameWidth: 32, frameHeight: 32 });
        this.load.image("bullet", "src/assets/balles.png"); 
    }

    create() {
        const map = this.make.tilemap({ key: "HUB1" });
        const tilesetGrass = map.addTilesetImage("TX Tileset Grass", "Grass");
        const tilesetMur = map.addTilesetImage("TX Tileset Wall", "Mur");
        const tilesetSol = map.addTilesetImage("TX Tileset Stone Ground", "Sol");
        const tilesetProps = map.addTilesetImage("TX Props", "Props");
        const tilesetPlant = map.addTilesetImage("Plant", "Plant");

        map.createLayer("Grass", [tilesetGrass]);
        const murLayer = map.createLayer("Mur", [tilesetMur]);
        map.createLayer("Sol/chemins", [tilesetGrass, tilesetSol]);
        map.createLayer("Portail", [tilesetProps]);
        map.createLayer("Decors", [tilesetProps]);
        map.createLayer("Details", [tilesetProps, tilesetPlant, tilesetMur]);

        murLayer.setCollisionByExclusion([-1]);
        this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

        this.player = this.physics.add.sprite(145, 325, "img_perso");
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

        this.cursors = this.input.keyboard.createCursorKeys();
        this.shootKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);

        this.physics.add.collider(this.player, murLayer);

        // Portail pour Niveau 1
        this.portal1 = this.physics.add.sprite(432, 175, "portail").setImmovable(true);
        this.physics.add.overlap(this.player, this.portal1, this.onPortal1Overlap, null, this);

        // Vérifier si le Niveau 1 a été complété
        const niveau1Terminé = localStorage.getItem("niveau1Complete") === "true";

        // Portail pour Niveau 2 (caché par défaut)
        this.portal2 = this.physics.add.sprite(600, 175, "portail").setImmovable(true);
        if (!niveau1Terminé) {
            this.portal2.setVisible(false);
            this.portal2.body.enable = false;
        } else {
            this.portal2.setVisible(true);
            this.portal2.body.enable = true;
            this.physics.add.overlap(this.player, this.portal2, this.onPortal2Overlap, null, this);
        }

        // Barre de vie
        this.healthBarBackground = this.add.rectangle(50, 70, 200, 20, 0x000000);
        this.healthBar = this.add.rectangle(50, 70, 200, 20, 0xff0000);
        this.healthBar.setOrigin(0, 0);
        this.healthBarBackground.setOrigin(0, 0);

        this.groupeBullets = this.physics.add.group();

        // Caméra
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setZoom(1.5);
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    }

    updateHealth() {
        const healthPercentage = this.currentHealth / this.maxHealth;
        this.healthBar.width = 200 * healthPercentage;
    }

    takeDamage(amount = 1) {
        this.currentHealth -= amount;
        if (this.currentHealth <= 0) {
            this.currentHealth = 0;
            this.player.anims.play("dead", true);
            console.log("Game Over");
            this.scene.restart();
        }
        this.updateHealth();
    }

    onPortal1Overlap(player, portal) {
        this.scene.start("Niveau1");
    }

    onPortal2Overlap(player, portal) {
        this.scene.start("Niveau2");
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
    }

    tirer() {
        let vitesseX = 0;
        let vitesseY = 0;
        let angle = 0;
        let offsetX = 0;
        let offsetY = 0;

        if (this.lastDirection === "left") {
            vitesseX = -500;
            offsetX = -25;
        } else if (this.lastDirection === "right") {
            vitesseX = 500;
            offsetX = 25;
        } else if (this.lastDirection === "up") {
            vitesseY = -500;
            offsetY = -25;
            angle = -90;
        } else if (this.lastDirection === "down") {
            vitesseY = 500;
            offsetY = 25;
            angle = 90;
        }

        let bullet = this.groupeBullets.create(this.player.x + offsetX, this.player.y + offsetY, "bullet")
            .setScale(0.5)
            .setAngle(angle)
            .setCollideWorldBounds(true);

        bullet.body.allowGravity = false;
        bullet.setVelocity(vitesseX, vitesseY);
    }
}