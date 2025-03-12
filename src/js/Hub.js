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
        this.lastDirection = "right";

        this.anims.create({
            key: "walk_up", frames: this.anims.generateFrameNumbers("img_perso", { start: 0, end: 3 }), frameRate: 10, repeat: -1
        });
        this.anims.create({
            key: "walk_right", frames: this.anims.generateFrameNumbers("img_perso", { start: 4, end: 7 }), frameRate: 10, repeat: -1
        });
        this.anims.create({
            key: "walk_left", frames: this.anims.generateFrameNumbers("img_perso", { start: 8, end: 11 }), frameRate: 10, repeat: -1
        });
        this.anims.create({
            key: "walk_down", frames: this.anims.generateFrameNumbers("img_perso", { start: 12, end: 15 }), frameRate: 10, repeat: -1
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
        let moving = false;

        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-160);
            this.player.anims.play("walk_left", true);
            this.lastDirection = "left";
            moving = true;
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(160);
            this.player.anims.play("walk_right", true);
            this.lastDirection = "right";
            moving = true;
        } else {
            this.player.setVelocityX(0);
        }

        if (this.cursors.up.isDown) {
            this.player.setVelocityY(-160);
            this.player.anims.play("walk_up", true);
            this.lastDirection = "up";
            moving = true;
        } else if (this.cursors.down.isDown) {
            this.player.setVelocityY(160);
            this.player.anims.play("walk_down", true);
            this.lastDirection = "down";
            moving = true;
        } else {
            this.player.setVelocityY(0);
        }

        if (!moving) {
            this.player.setVelocity(0);
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