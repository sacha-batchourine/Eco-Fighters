export default class Niveau2 extends Phaser.Scene {
    constructor() {
        super({ key: "Niveau2" });
        this.maxHealth = 5;
        this.currentHealth = this.maxHealth;
    }

    preload() {
        this.load.tilemapTiledJSON("mapN2", "src/assets/mapN2.json");
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
        const map = this.make.tilemap({ key: "mapN2" });
        const tilesetGrass = map.addTilesetImage("Grass", "Grass");
        const tilesetMur = map.addTilesetImage("Wall", "Wall");
        const tilesetProps = map.addTilesetImage("Props", "Objet");
        const tilesetPlant = map.addTilesetImage("Plant", "Plant");
        const tilesetOmbre = map.addTilesetImage("Ombre", "Ombres");
        
        map.createLayer("Grass", [tilesetGrass]);
        const mursLayer = map.createLayer("Mur", [tilesetMur, tilesetPlant, tilesetProps]);
        map.createLayer("Chemin", [tilesetGrass, tilesetProps]);
        map.createLayer("Ombre", [tilesetOmbre]);
        map.createLayer("Ecriture", [tilesetProps]);

        this.player = this.physics.add.sprite(143, 455, "img_perso");
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        
        mursLayer.setCollisionByProperty({ estSolide: true });
        this.physics.add.collider(this.player, mursLayer);
        
        this.portal = this.physics.add.sprite(3025, 525, "portail").setImmovable(true);
        this.physics.add.overlap(this.player, this.portal, this.onPortalOverlap, null, this);

        this.anims.create({
            key: "burger_left",
            frames: this.anims.generateFrameNumbers("burger", { frames: [6, 7, 10, 11] }),
            frameRate: 10,
            repeat: -1
        });
        
        this.anims.create({
            key: "burger_right",
            frames: this.anims.generateFrameNumbers("burger", { frames: [8, 9, 12, 13] }),
            frameRate: 10,
            repeat: -1
        });

        this.burgers = this.physics.add.group({ key: 'burger', repeat: 9 });
        this.burgers.children.iterate(burger => {
            let x = Phaser.Math.Between(50, map.widthInPixels - 50);
            let y = Phaser.Math.Between(50, map.heightInPixels - 50);
            burger.setPosition(x, y);
            burger.setCollideWorldBounds(true);
            burger.setData('speed', 30);

            let direction = Phaser.Math.Between(0, 3);
            switch (direction) {
                case 0: burger.setVelocityX(30); burger.play("burger_right"); break;
                case 1: burger.setVelocityX(-30); burger.play("burger_left"); break;
                case 2: burger.setVelocityY(30); break;
                case 3: burger.setVelocityY(-30); break;
            }
        });

        this.physics.add.collider(this.player, this.burgers, this.hitPlayer, null, this);

        this.healthIcons = [];
        for (let i = 0; i < this.maxHealth; i++) {
            let heart = this.add.image(60 + i * 50, 20, "heart").setScale(0.3).setScrollFactor(0);
            this.healthIcons.push(heart);
        }
        this.updateHealth();

        this.cameras.main.startFollow(this.player);
        this.cameras.main.setZoom(1.1);
        this.cameras.main.setBounds(-50, -25, map.widthInPixels + 50, map.heightInPixels);
    }

    onPortalOverlap() {
        if (this.burgers.countActive(true) === 0 && Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            let currentLevel = 2; // Numéro du niveau actuel
            let unlockedLevel = localStorage.getItem("unlockedLevel") || 1;
            
            if (currentLevel >= unlockedLevel) {
                localStorage.setItem("unlockedLevel", currentLevel + 1); // Débloque le niveau suivant (Niveau 3)
            }
    
            this.scene.start("Hub");
        }
    }

    update() {
        let speed = 160;
        let moving = false;

        if (this.cursors.left.isDown) { this.player.setVelocityX(-speed); moving = true; }
        else if (this.cursors.right.isDown) { this.player.setVelocityX(speed); moving = true; }
        else { this.player.setVelocityX(0); }

        if (this.cursors.up.isDown) { this.player.setVelocityY(-speed); moving = true; }
        else if (this.cursors.down.isDown) { this.player.setVelocityY(speed); moving = true; }
        else { this.player.setVelocityY(0); }

        if (!moving) { this.player.anims.stop(); }

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
        if (this.currentHealth <= 0) { this.scene.restart(); }
        burger.setActive(false).setVisible(false);
    }

    updateHealth() {
        this.healthIcons.forEach((heart, index) => {
            heart.setVisible(index < this.currentHealth);
        });
    }
}
