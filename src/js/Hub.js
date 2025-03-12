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

        this.load.spritesheet("img_perso", "src/assets/Perso.png", {
            frameWidth: 48,
            frameHeight: 48
        });

        this.load.spritesheet("portail", "src/assets/portal4.png", {
            frameWidth: 32,
            frameHeight: 32
        });

        this.load.image("heart", "src/assets/hearth.png"); // Image d'un cœur
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

        this.portal1 = this.physics.add.sprite(432, 175, "portail");
        this.portal1.setImmovable(true);

        this.portal2 = this.physics.add.sprite(600, 300, "portail");
        this.portal2.setImmovable(true);


        

        this.player = this.physics.add.sprite(400, 300, "img_perso");
        this.player.setCollideWorldBounds(true);
        
        
        this.lastDirection = "down";

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
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        this.physics.add.collider(this.player, murLayer);
        
        this.physics.add.overlap(this.player, [this.portal1, this.portal2], this.onPortalOverlap, null, this);


        // 🔹 Ajout de la barre de vie avec cœurs mieux espacés et descendus
        this.healthIcons = [];
        for (let i = 0; i < this.maxHealth; i++) {
            let heart = this.add.image(60 + i * 50, 80, "heart"); // Décalage de 60px à droite et descente de 20px
            heart.setScale(0.3); // Réduction de la taille
            heart.setScrollFactor(0); // Fixé à l'écran
            this.healthIcons.push(heart);
        }

          // Centrer la caméra sur le joueur
       this.cameras.main.startFollow(this.player);
       this.cameras.main.setZoom(1.1); // Zoom léger

       // Limiter les mouvements de la caméra aux bords de la carte
       const mapWidth = map.widthInPixels;
       const mapHeight = map.heightInPixels;
       this.cameras.main.setBounds(-50, -25, mapWidth, mapHeight);

    }

    updateHealth() {
        this.healthIcons.forEach((heart, index) => {
            heart.setVisible(index < this.currentHealth);
        });
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

    onPortalOverlap(player, portal) {
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            if (portal === this.portal1) {
                this.scene.start("Niveau1");
            } else if (portal === this.portal2) {
                this.scene.start("Niveau2");
            }
        }
    }

    update() {
        let moving = false;

        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-160);
            this.player.setVelocityY(0);
            this.player.anims.play("walk_left", true);
            this.lastDirection = "left";
            moving = true;
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(160);
            this.player.setVelocityY(0);
            this.player.anims.play("walk_right", true);
            this.lastDirection = "right";
            moving = true;
        } else {
            this.player.setVelocityX(0);
        }

        if (this.cursors.up.isDown) {
            this.player.setVelocityY(-160);
            this.player.setVelocityX(0);
            this.player.anims.play("walk_up", true);
            this.lastDirection = "up";
            moving = true;
        } else if (this.cursors.down.isDown) {
            this.player.setVelocityY(160);
            this.player.setVelocityX(0);
            this.player.anims.play("walk_down", true);
            this.lastDirection = "down";
            moving = true;
        } else {
            this.player.setVelocityY(0);
        }

        if (!moving) {
            this.player.setVelocity(0);
            this.player.anims.play(`idle_${this.lastDirection}`, true);
        }
    }
}