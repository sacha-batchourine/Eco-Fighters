import Phaser from "phaser";

export default class Hub extends Phaser.Scene {
    constructor() {
        super({ key: "Hub" });
    }

    preload() {
        // Chargement des images de tileset
        this.load.image("grass", "src/assets/TX Tileset Grass.png");
        this.load.image("stone", "src/assets/TX Tileset Stone Ground.png");
        this.load.image("wall", "src/assets/TX Tileset Wall.png");
        this.load.image("village", "src/assets/TX Village Props.png");

        // Chargement de la carte JSON
        this.load.tilemapTiledJSON("hub", "src/assets/HUB1.json");

        // Chargement du sprite du joueur
        this.load.spritesheet("player", "src/assets/player.png", {
            frameWidth: 32,
            frameHeight: 48
        });
    }

    create() {
        // Charger la carte
        const map = this.make.tilemap({ key: "hub" });

        // Associer chaque tileset avec son nom dans Tiled
        const tilesetGrass = map.addTilesetImage("TX Tileset Grass", "grass");
        const tilesetStone = map.addTilesetImage("TX Tileset Stone Ground", "stone");
        const tilesetWall = map.addTilesetImage("TX Tileset Wall", "wall");
        const tilesetVillage = map.addTilesetImage("TX Village Props", "village");

        const tilesets = [tilesetGrass, tilesetStone, tilesetWall, tilesetVillage];

        // Création des calques (dans l'ordre correct d'affichage)
        map.createLayer("Background", tilesets); // Si tu as un calque de fond
        const solLayer = map.createLayer("Sol/chemins", tilesets);
        const murLayer = map.createLayer("Mur", tilesets);
        map.createLayer("Portail", tilesets);
        map.createLayer("Decors", tilesets);
        map.createLayer("Details", tilesets);

        // Activer les collisions sur les calques concernés
        solLayer.setCollisionByProperty({ collides: true });
        murLayer.setCollisionByProperty({ collides: true });

        // Ajouter le joueur
        this.player = this.physics.add.sprite(100, 100, "player");
        this.player.setCollideWorldBounds(true);

        // Gérer les collisions avec les calques
        this.physics.add.collider(this.player, solLayer);
        this.physics.add.collider(this.player, murLayer);

        // Configurer la caméra
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.cameras.main.startFollow(this.player);

        // Configurer les touches du clavier
        this.cursors = this.input.keyboard.createCursorKeys();

        // Ajouter des animations pour le joueur
        this.anims.create({
            key: "left",
            frames: this.anims.generateFrameNumbers("player", { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: "turn",
            frames: [{ key: "player", frame: 4 }],
            frameRate: 20
        });

        this.anims.create({
            key: "right",
            frames: this.anims.generateFrameNumbers("player", { start: 5, end: 8 }),
            frameRate: 10,
            repeat: -1
        });
    }

    update() {
        // Contrôles du joueur
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-160);
            this.player.anims.play("left", true);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(160);
            this.player.anims.play("right", true);
        } else {
            this.player.setVelocityX(0);
            this.player.anims.play("turn");
        }

        if (this.cursors.up.isDown && this.player.body.blocked.down) {
            this.player.setVelocityY(-300);
        }
    }
}