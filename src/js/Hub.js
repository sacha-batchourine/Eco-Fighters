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
        const map = this.make.tilemap({ key: "HUB1" });
        const tilesetGrass = map.addTilesetImage("TX Tileset Grass", "Grass");
        const tilesetMur = map.addTilesetImage("TX Tileset Wall", "Mur");
        const tilesetSol = map.addTilesetImage("TX Tileset Stone Ground", "Sol");
        const tilesetProps = map.addTilesetImage("TX Props", "Props");
        const tilesetPlant = map.addTilesetImage("TX Plant", "Plant");

        map.createLayer("Grass", [tilesetGrass]);
        const murLayer = map.createLayer("Mur", [tilesetMur]);
        map.createLayer("Sol/chemins", [tilesetGrass, tilesetSol]);
        map.createLayer("Portail", [tilesetProps]);
        map.createLayer("Decors", [tilesetProps]);
        map.createLayer("Details", [tilesetProps, tilesetPlant, tilesetMur]);

        // Création du portail avec une zone de détection
        this.portal = this.physics.add.sprite(432, 175, "portail");
        this.portal.setImmovable(true);

        // Ajout du joueur
        this.player = this.physics.add.sprite(400, 300, "img_perso");
        this.player.setCollideWorldBounds(true);

        // Activer le clavier
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // Activation des collisions avec les murs
        murLayer.setCollisionByProperty({ collides: true });
        this.physics.add.collider(this.player, murLayer);

        // Détecter si le joueur touche le portail
        this.physics.add.overlap(this.player, this.portal, this.onPortalOverlap, null, this);
    }

    onPortalOverlap() {
        // Si le joueur appuie sur ESPACE et touche le portail, il change de niveau
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            this.scene.start("Niveau1"); // Charger la scène du niveau 1
        }
    }

    update() {
        let moving = false;

        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-160);
            moving = true;
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(160);
            moving = true;
        } else {
            this.player.setVelocityX(0);
        }

        if (this.cursors.up.isDown) {
            this.player.setVelocityY(-160);
            moving = true;
        } else if (this.cursors.down.isDown) {
            this.player.setVelocityY(160);
            moving = true;
        } else {
            this.player.setVelocityY(0);
        }

        if (!moving) {
            this.player.anims.stop();
        }
    }
}