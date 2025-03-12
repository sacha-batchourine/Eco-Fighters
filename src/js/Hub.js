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
        // Création de la carte
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
        
        // PLAYER
        this.player = this.physics.add.sprite(145, 325, "img_perso");
        this.player.setScale(2);
        this.lastDirection = "right";

        this.anims.create({
            key: "stand", frames: this.anims.generateFrameNumbers("img_perso", { start: 30, end: 32 }), frameRate: 10, repeat: -1
        });
        this.anims.create({
            key: "walk_right", frames: this.anims.generateFrameNumbers("img_perso", { start: 26, end: 28 }), frameRate: 10, repeat: -1
        });

        this.bullets = this.physics.add.group();
        
        // Touches
        this.cursors = this.input.keyboard.createCursorKeys();
        this.shootKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);

        // Collisions
        this.physics.add.collider(this.player, murLayer);
        this.physics.add.collider(this.bullets, murLayer, (bullet) => bullet.destroy());

        // Vérifier la progression
        const niveau1Terminé = localStorage.getItem("niveau1Complete") === "true";
        const niveau2Terminé = localStorage.getItem("niveau2Complete") === "true";
        const niveau3Terminé = localStorage.getItem("niveau3Complete") === "true";
        const niveau4Terminé = localStorage.getItem("niveau4Complete") === "true";
        const niveau5Terminé = localStorage.getItem("niveau5Complete") === "true";

        // Portail pour Niveau 1
        this.portal1 = this.physics.add.sprite(432, 175, "portail").setImmovable(true);
        this.physics.add.overlap(this.player, this.portal1, this.onPortal1Overlap, null, this);

        // Portail pour Niveau 2
        this.portal2 = this.physics.add.sprite(623, 560, "portail").setImmovable(true);
        this.portal2.setVisible(niveau1Terminé);
        this.portal2.body.enable = niveau1Terminé;
        if (niveau1Terminé) {
            this.physics.add.overlap(this.player, this.portal2, this.onPortal2Overlap, null, this);
        }

        // Portail pour Niveau 3
        this.portal3 = this.physics.add.sprite(880, 240, "portail").setImmovable(true);
        this.portal3.setVisible(niveau2Terminé);
        this.portal3.body.enable = niveau2Terminé;
        if (niveau2Terminé) {
            this.physics.add.overlap(this.player, this.portal3, this.onPortal3Overlap, null, this);
        }

        // Portail pour Niveau 4
        this.portal4 = this.physics.add.sprite(1040, 495, "portail").setImmovable(true);
        this.portal4.setVisible(niveau3Terminé);
        this.portal4.body.enable = niveau3Terminé;
        if (niveau3Terminé) {
            this.physics.add.overlap(this.player, this.portal4, this.onPortal4Overlap, null, this);
        }

        // Portail pour Niveau 5
        this.portal5 = this.physics.add.sprite(1170, 142, "portail").setImmovable(true);
        this.portal5.setVisible(niveau4Terminé);
        this.portal5.body.enable = niveau4Terminé;
        if (niveau4Terminé) {
            this.physics.add.overlap(this.player, this.portal5, this.onPortal5Overlap, null, this);
        }

        // ✅ Portail pour le Boss (se débloque après Niveau 5)
        this.portalBoss = this.physics.add.sprite(1455, 335, "portail").setImmovable(true);
        this.portalBoss.setVisible(niveau5Terminé);
        this.portalBoss.body.enable = niveau5Terminé;
        if (niveau5Terminé) {
            this.physics.add.overlap(this.player, this.portalBoss, this.onPortalBossOverlap, null, this);
        }

        // Caméra
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setZoom(1.1);
        this.cameras.main.setBounds(-50, -25, map.widthInPixels + 50, map.heightInPixels);
    }

    // Fonctions de changement de niveau
    onPortal1Overlap(player, portal) {
        this.scene.start("Niveau1");
    }

    onPortal2Overlap(player, portal) {
        this.scene.start("Niveau2");
    }

    onPortal3Overlap(player, portal) {
        this.scene.start("Niveau3");
    }

    onPortal4Overlap(player, portal) {
        this.scene.start("Niveau4");
    }

    onPortal5Overlap(player, portal) {
        this.scene.start("Niveau5");
    }

    onPortalBossOverlap(player, portal) {
        this.scene.start("NiveauBoss");
    }

    update() {
        let speed = 160;
        let diagonalSpeed = Math.sqrt(speed * speed / 2);
        
        let movingX = false;
        let movingY = false;
        
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
        
        if (this.cursors.up.isDown) {
            this.player.setVelocityY(-speed);
            movingY = true;
        } else if (this.cursors.down.isDown) {
            this.player.setVelocityY(speed);
            movingY = true;
        } else {
            this.player.setVelocityY(0);
        }
        
        if (movingX && movingY) {
            this.player.setVelocityX(this.player.body.velocity.x * diagonalSpeed / speed);
            this.player.setVelocityY(this.player.body.velocity.y * diagonalSpeed / speed);
        }
        
        if (!movingX && !movingY) {
            this.player.anims.play("stand", true);
        }

        if (Phaser.Input.Keyboard.JustDown(this.shootKey)) {
            this.tirer();
        }
    }
}