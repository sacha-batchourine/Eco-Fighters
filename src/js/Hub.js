export default class Hub extends Phaser.Scene {
    constructor() {
        super({ key: "Hub" });
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
        // 🔹 Chargement de la carte
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

        // ✅ Empêcher le joueur de traverser les murs
        murLayer.setCollisionByExclusion([-1]);
        this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

        // 🌀 Création du portail
        this.portal = this.physics.add.sprite(432, 175, "portail");
        this.portal.setImmovable(true);

        // 🏃‍♂️ Ajout du joueur
        this.player = this.physics.add.sprite(400, 300, "img_perso");
        this.player.setCollideWorldBounds(true);
        this.lastDirection = "down"; // Direction par défaut

        // ✅ Création des animations avec les bonnes directions
        this.anims.create({
            key: "walk_up",
            frames: this.anims.generateFrameNumbers("img_perso", { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: "walk_right",
            frames: this.anims.generateFrameNumbers("img_perso", { start: 4, end: 7 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: "walk_left",
            frames: this.anims.generateFrameNumbers("img_perso", { start: 8, end: 11 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: "walk_down",
            frames: this.anims.generateFrameNumbers("img_perso", { start: 12, end: 15 }),
            frameRate: 10,
            repeat: -1
        });

        // ✅ Ajout des animations Idle (correctement orientées)
        this.anims.create({
            key: "idle_up",
            frames: [{ key: "img_perso", frame: 0 }],
            frameRate: 1,
        });

        this.anims.create({
            key: "idle_right",
            frames: [{ key: "img_perso", frame: 4 }],
            frameRate: 1,
        });

        this.anims.create({
            key: "idle_left",
            frames: [{ key: "img_perso", frame: 8 }],
            frameRate: 1,
        });

        this.anims.create({
            key: "idle_down",
            frames: [{ key: "img_perso", frame: 12 }],
            frameRate: 1,
        });

        // 🎮 Activation des touches
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // 🔗 Activation des collisions
        this.physics.add.collider(this.player, murLayer);

        // 🚀 Détection de la transition vers le niveau 1
        this.physics.add.overlap(this.player, this.portal, this.onPortalOverlap, null, this);


         // Centrer la caméra sur le joueur
       this.cameras.main.startFollow(this.player);
       this.cameras.main.setZoom(1.1); // Zoom léger

       // Limiter les mouvements de la caméra aux bords de la carte
       const mapWidth = map.widthInPixels;
       const mapHeight = map.heightInPixels;
       this.cameras.main.setBounds(-50, -25, mapWidth, mapHeight);

       
    }

    onPortalOverlap() {
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            this.scene.start("Niveau1"); // Passage au niveau 1
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