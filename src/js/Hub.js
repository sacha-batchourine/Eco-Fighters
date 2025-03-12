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

        this.portal1 = this.physics.add.sprite(432, 175, "portail").setImmovable(true);
        this.portal2 = this.physics.add.sprite(624, 559, "portail").setImmovable(true);
        this.portal3 = this.physics.add.sprite(880, 240, "portail").setImmovable(true);
        this.portal4 = this.physics.add.sprite(1040, 495, "portail").setImmovable(true);
        this.portal5 = this.physics.add.sprite(1170, 143, "portail").setImmovable(true);
        this.portalBoss = this.physics.add.sprite(1455, 335, "portail").setImmovable(true);

        let unlockedLevel = localStorage.getItem("unlockedLevel") || 1;

        this.portal1.setVisible(unlockedLevel >= 1).setActive(unlockedLevel >= 1);
        this.portal2.setVisible(unlockedLevel >= 2).setActive(unlockedLevel >= 2);
        this.portal3.setVisible(unlockedLevel >= 3).setActive(unlockedLevel >= 3);
        this.portal4.setVisible(unlockedLevel >= 4).setActive(unlockedLevel >= 4);
        this.portal5.setVisible(unlockedLevel >= 5).setActive(unlockedLevel >= 5);
        this.portalBoss.setVisible(unlockedLevel >= 6).setActive(unlockedLevel >= 6);

        this.player = this.physics.add.sprite(145, 325, "img_perso");

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
        
        this.physics.add.overlap(this.player, [this.portal1, this.portal2, this.portal3, this.portal4, this.portal5, this.portalBoss], this.onPortalOverlap, null, this);

        // 🔹 Création de la barre de vie
        this.healthBarBackground = this.add.rectangle(50, 70, 200, 20, 0x000000);
        this.healthBar = this.add.rectangle(50, 70, 200, 20, 0xff0000);

        this.healthBar.setOrigin(0, 0);
        this.healthBarBackground.setOrigin(0, 0);

        // Centrer la caméra sur le joueur
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setZoom(1.1);

        // Limiter les mouvements de la caméra aux bords de la carte
        const mapWidth = map.widthInPixels;
        const mapHeight = map.heightInPixels;
        this.cameras.main.setBounds(0, 0, mapWidth, mapHeight);
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

    onPortalOverlap(player, portal) {
        if (!portal.active || !portal.visible) return; // Empêche l'accès aux portails inactifs ou invisibles
    
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            if (portal === this.portal1) {
                this.scene.start("Niveau1");
            } else if (portal === this.portal2) {
                this.scene.start("Niveau2");
            } else if (portal === this.portal3) {
                this.scene.start("Niveau3");
            } else if (portal === this.portal4) {
                this.scene.start("Niveau4");
            } else if (portal === this.portal5) {
                this.scene.start("Niveau5");
            } else if (portal === this.portalBoss) {
                this.scene.start("NiveauBoss");
            }
        }
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
    }
}
