export default class Niveau1 extends Phaser.Scene {
    constructor() {
        super({ key: "Niveau1" });
    }

    preload() {
        this.load.tilemapTiledJSON("mapN1", "src/assets/mapN1.json");
        this.load.image("Grass", "src/assets/TX Tileset Grass.png");
        this.load.image("Mur", "src/assets/TX Tileset Wall.png");
        this.load.image("Sol", "src/assets/TX Tileset Stone Ground.png");
        this.load.image("Props", "src/assets/TX Props.png");
        this.load.image("Plant", "src/assets/TX Plant.png");

        this.load.spritesheet("img_perso", "src/assets/Perso.png", {
            frameWidth: 48,
            frameHeight: 48
        });

        this.load.spritesheet("burger", "src/assets/burger_spritesheet.png", {
            frameWidth: 32,
            frameHeight: 32
        });
    }

    create() {
        const map = this.make.tilemap({ key: "mapN1" });

        const tilesetGrass = map.addTilesetImage("TX Tileset Grass", "Grass");
        const tilesetMur = map.addTilesetImage("TX Tileset Wall", "Mur");
        const tilesetSol = map.addTilesetImage("TX Tileset Stone Ground", "Sol");
        const tilesetProps = map.addTilesetImage("TX Props", "Props");
        const tilesetPlant = map.addTilesetImage("TX Plant", "Plant");

        map.createLayer("Grass", [tilesetGrass]);
        const cheminLayer = map.createLayer("Chemin", [tilesetSol, tilesetGrass]);
        const mursLayer = map.createLayer("Murs", [tilesetMur]);
        map.createLayer("Props", [tilesetProps, tilesetPlant]);

        mursLayer.setCollisionByExclusion([-1]);

        this.player = this.physics.add.sprite(100, 100, "img_perso");
        this.player.setCollideWorldBounds(true);

        this.cursors = this.input.keyboard.createCursorKeys();

        this.physics.add.collider(this.player, mursLayer);

        // 🔹 Ajout des animations des burgers
        this.anims.create({
            key: "burger_left",
            frames: this.anims.generateFrameNumbers("burger", { start: 4, end: 7 }), // Indices des frames pour gauche
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: "burger_right",
            frames: this.anims.generateFrameNumbers("burger", { start: 8, end: 11 }), // Indices des frames pour droite
            frameRate: 10,
            repeat: -1
        });

        this.burgers = this.physics.add.group({
            key: 'burger',
            repeat: 9,
            setXY: {
                x: Phaser.Math.Between(50, 500),
                y: Phaser.Math.Between(50, 500),
                stepX: 150,
                stepY: 150
            }
        });

        this.burgers.children.iterate(burger => {
            burger.setCollideWorldBounds(true);
            burger.setData('speed', 30);

            let direction = Phaser.Math.Between(0, 3);
            switch (direction) {
                case 0:
                    burger.setVelocityX(30);
                    burger.play("burger_right");
                    break;
                case 1:
                    burger.setVelocityX(-30);
                    burger.play("burger_left");
                    break;
                case 2:
                    burger.setVelocityY(30);
                    break;
                case 3:
                    burger.setVelocityY(-30);
                    break;
            }
        });

        this.physics.add.collider(this.player, this.burgers, this.hitPlayer, null, this);
    }

    update() {
        let speed = 160;
        let moving = false;

        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-speed);
            moving = true;
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(speed);
            moving = true;
        } else {
            this.player.setVelocityX(0);
        }

        if (this.cursors.up.isDown) {
            this.player.setVelocityY(-speed);
            moving = true;
        } else if (this.cursors.down.isDown) {
            this.player.setVelocityY(speed);
            moving = true;
        } else {
            this.player.setVelocityY(0);
        }

        if (!moving) {
            this.player.anims.stop();
        }

        this.burgers.children.iterate(burger => {
            const angle = Phaser.Math.Angle.Between(burger.x, burger.y, this.player.x, this.player.y);
            const speed = burger.getData('speed');

            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;

            burger.setVelocity(vx, vy);

            if (vx > 0) {
                burger.play("burger_right", true);
            } else if (vx < 0) {
                burger.play("burger_left", true);
            }
        });
    }

    hitPlayer(player, burger) {
        console.log("Le joueur a été touché par un burger !");
        burger.setActive(false);
        burger.setVisible(false);
    }
}