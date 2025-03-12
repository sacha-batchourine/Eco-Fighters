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
        this.load.image("pasteque", "src/assets/pasteque.png"); // Chargement de l'image

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

        this.portal = this.physics.add.sprite(432, 175, "portail");
        this.portal.setImmovable(true);

        this.player = this.physics.add.sprite(400, 300, "img_perso");
        this.player.setCollideWorldBounds(true);

        this.pasteque = this.physics.add.staticSprite(50, 300, "pasteque"); // Ajout de la pastèque sur la gauche
        this.pasteque.setScale(32 / this.pasteque.width, 32 / this.pasteque.height); // Redimensionnement à 32x32 pixels

        this.cursors = this.input.keyboard.createCursorKeys();
        this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

        this.physics.add.collider(this.player, murLayer);
        this.physics.add.overlap(this.player, this.portal, this.onPortalOverlap, null, this);
        this.physics.add.overlap(this.player, this.pasteque, this.onPastequeInteract, null, this);

        this.cameras.main.startFollow(this.player);
        this.cameras.main.setZoom(1.1);

        // Ajout du texte d'interaction
        this.pastequeText = this.add.text(20, 260, "", {
            fontSize: "16px",
            fill: "#ffffff",
            backgroundColor: "#000000"
        }).setVisible(false);
    }

    onPortalOverlap() {
        if (Phaser.Input.Keyboard.JustDown(this.enterKey)) {
            this.scene.start("Niveau1");
        }
    }

    onPastequeInteract() {
        if (Phaser.Input.Keyboard.JustDown(this.enterKey)) {
            this.pastequeText.setText("Salut ! Je suis une pastèque cool ! 🍉");
            this.pastequeText.setVisible(true);
            
            this.time.delayedCall(2000, () => {
                this.pastequeText.setVisible(false);
            });
        }
    }

    update() {
        this.player.setVelocity(0);
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-160);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(160);
        }
        if (this.cursors.up.isDown) {
            this.player.setVelocityY(-160);
        } else if (this.cursors.down.isDown) {
            this.player.setVelocityY(160);
        }
    }
}