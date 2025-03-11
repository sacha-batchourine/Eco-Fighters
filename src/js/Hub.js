// hub.js
import Phaser from 'phaser';

export default class Hub extends Phaser.Scene {
    constructor() {
        super({ key: 'Hub' });
    }

    preload() {
        // Chargement des ressources pour le Hub
        this.load.image("portail", "src/assets/portal4_spritesheet.png");
        this.load.image("plante", "src/assets/TX Plant.png");
        this.load.image("objet", "src/assets/TX Props.png");
        this.load.image("struct", "src/assets/TX Struct.png");
        this.load.image("grass", "src/assets/TX Tileset Grass.png");
        this.load.image("stone", "src/assets/TX Tileset Stone Ground.png");
        this.load.image("wall", "src/assets/TX Tileset Wall.png");
        this.load.image("village", "src/assets/TX Village Props.png");
        this.load.tilemapTiledJSON("hub", "src/assets/HUB1.json");
        this.load.spritesheet("player", "src/assets/player.png", {
            frameWidth: 32,
            frameHeight: 48
        });
    }

    create() {
        // Configuration du clavier
        this.clavier = this.input.keyboard.createCursorKeys();

        // Chargement de la carte
        const carteDuNiveau = this.make.tilemap({ key: "hub" });
        const tilesets = [
            carteDuNiveau.addTilesetImage("portal4_spritesheet", "portail"),
            carteDuNiveau.addTilesetImage("TX Plant", "plante"),
            carteDuNiveau.addTilesetImage("TX Props", "objet"),
            carteDuNiveau.addTilesetImage("TX Struct", "struct"),
            carteDuNiveau.addTilesetImage("TX Tileset Grass", "grass"),
            carteDuNiveau.addTilesetImage("TX Tileset Stone Ground", "stone"),
            carteDuNiveau.addTilesetImage("TX Tileset Wall", "wall"),
            carteDuNiveau.addTilesetImage("TX Village Props", "village")
        ];

        // Création des calques
        carteDuNiveau.createLayer("Grass", tilesets);
        carteDuNiveau.createLayer("Mur", tilesets);
        carteDuNiveau.createLayer("Sol/chemins", tilesets);
        carteDuNiveau.createLayer("Portail", tilesets);
        carteDuNiveau.createLayer("Decors", tilesets);
        carteDuNiveau.createLayer("Details", tilesets);

        // Ajout du joueur
        this.player = this.physics.add.sprite(100, 100, "player");

        // Collisions avec les calques
        const calqueSolChemins = carteDuNiveau.getLayer("Sol/chemins").tilemapLayer;
        const calqueMur = carteDuNiveau.getLayer("Mur").tilemapLayer;
        calqueSolChemins.setCollisionByProperty({ estSolide: true });
        calqueMur.setCollisionByProperty({ estSolide: true });
        this.physics.add.collider(this.player, calqueSolChemins);
        this.physics.add.collider(this.player, calqueMur);

        // Configuration de la caméra
        this.cameras.main.setBounds(0, 0, carteDuNiveau.widthInPixels, carteDuNiveau.heightInPixels);
        this.physics.world.setBounds(0, 0, carteDuNiveau.widthInPixels, carteDuNiveau.heightInPixels);
        this.cameras.main.startFollow(this.player);

        // Création des animations pour le joueur
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
        // Contrôle du joueur
        if (this.clavier.left.isDown) {
            this.player.setVelocityX(-160);
            this.player.anims.play("left", true);
        } else if (this.clavier.right.isDown) {
            this.player.setVelocityX(160);
            this.player.anims.play("right", true);
        } else {
            this.player.setVelocityX(0);
            this.player.anims.play("turn");
        }

        // Saut
        if (this.clavier.up.isDown && this.player.body.blocked.down) {
            this.player.setVelocityY(-300);
        }
    }
}