export default class Niveau3 extends Phaser.Scene {
    constructor() {
        super({ key: "Niveau3" });
        this.maxHealth = 5;
        this.currentHealth = this.maxHealth;
    }

    preload() {
        this.load.tilemapTiledJSON("mapN3", "src/assets/mapN3.json");
        this.load.image("Grass", "src/assets/TX Tileset Grass.png");
        this.load.image("Wall", "src/assets/TX Tileset Wall.png");
        this.load.image("Objet", "src/assets/TX Props.png");
        this.load.image("Plant", "src/assets/TX PLant.png");
        this.load.image("Ombres", "src/assets/TX Shadow PLant.png");
        this.load.spritesheet("img_perso", "src/assets/Perso.png", { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet("burger", "src/assets/burger_spritesheet.png", { frameWidth: 32, frameHeight: 32 });
        this.load.image("heart", "src/assets/hearth.png");
    }

    create() {
        const map = this.make.tilemap({ key: "mapN3" });
        const tilesetGrass = map.addTilesetImage("Grass", "Grass");
        const tilesetMur = map.addTilesetImage("Wall", "Wall");
        const tilesetProps = map.addTilesetImage("Props", "Objet");
        const tilesetPlant = map.addTilesetImage("Plant", "Plant");
        const tilesetOmbre = map.addTilesetImage("Shadow Plant", "Ombres");

        map.createLayer("Grass", [tilesetGrass]);
        const mursLayer = map.createLayer("Mur", [tilesetMur, tilesetPlant, tilesetProps]);
        map.createLayer("Chemin", [tilesetGrass, tilesetProps]);
        map.createLayer("Ombre", [tilesetOmbre]);
        map.createLayer("Ecriture", [tilesetProps]);

        mursLayer.setCollisionByProperty({ estSolide: true });

        this.player = this.physics.add.sprite(100, 100, "img_perso");
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.physics.add.collider(this.player, mursLayer);

        this.portal = this.physics.add.sprite(3055, 495, "portail").setImmovable(true);
        this.physics.add.overlap(this.player, this.portal, this.onPortalOverlap, null, this);

        this.anims.create({ key: "burger_left", frames: this.anims.generateFrameNumbers("burger", { frames: [6, 7, 10, 11] }), frameRate: 10, repeat: -1 });
        this.anims.create({ key: "burger_right", frames: this.anims.generateFrameNumbers("burger", { frames: [8, 9, 12, 13] }), frameRate: 10, repeat: -1 });
        
        this.burgers = this.physics.add.group();
        for (let i = 0; i < 10; i++) {
            let spawnPoint;
            do {
                spawnPoint = {
                    x: Phaser.Math.Between(50, map.widthInPixels - 50),
                    y: Phaser.Math.Between(50, map.heightInPixels - 50)
                };
            } while (mursLayer.getTileAtWorldXY(spawnPoint.x, spawnPoint.y));
            
            let burger = this.burgers.create(spawnPoint.x, spawnPoint.y, "burger");
            burger.setCollideWorldBounds(true);
            burger.setData('speed', 30);
        }

        this.physics.add.collider(this.burgers, mursLayer);
        this.physics.add.collider(this.player, this.burgers, this.hitPlayer, null, this);
        this.healthIcons = [];
        for (let i = 0; i < this.maxHealth; i++) {
            let heart = this.add.image(60 + i * 50, 20, "heart").setScale(0.3).setScrollFactor(0);
            this.healthIcons.push(heart);
        }
        this.updateHealth();
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setZoom(1.1);
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    }

    update() {
        let speed = 160;
        this.player.setVelocity(0);
        if (this.cursors.left.isDown) this.player.setVelocityX(-speed);
        if (this.cursors.right.isDown) this.player.setVelocityX(speed);
        if (this.cursors.up.isDown) this.player.setVelocityY(-speed);
        if (this.cursors.down.isDown) this.player.setVelocityY(speed);

        this.burgers.children.iterate(burger => {
            const angle = Phaser.Math.Angle.Between(burger.x, burger.y, this.player.x, this.player.y);
            const speed = burger.getData('speed');
            burger.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
            burger.play(burger.body.velocity.x > 0 ? "burger_right" : "burger_left", true);
        });
    }

    hitPlayer(player, burger) {
        this.currentHealth -= 1;
        this.updateHealth();
        if (this.currentHealth <= 0) this.scene.restart();
        burger.setActive(false).setVisible(false);
    }

    updateHealth() {
        this.healthIcons.forEach((heart, index) => heart.setVisible(index < this.currentHealth));
    }

    onPortalOverlap() {
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) this.scene.start("Hub");
    }
}
