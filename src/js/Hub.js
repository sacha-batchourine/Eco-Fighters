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
        // CREATIO  MAP
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
        
        //PLAYER
        this.player = this.physics.add.sprite(145, 325, "img_perso");
        this.player.setScale(2); // Agrandit le joueur 2 fois
        this.lastDirection = "right";

        this.anims.create({
            key: "stand", frames: this.anims.generateFrameNumbers("img_perso", { start: 30, end: 32 }), frameRate: 10, repeat: -1
        });
        this.anims.create({
            key: "walk_right", frames: this.anims.generateFrameNumbers("img_perso", { start: 26, end: 28 }), frameRate: 10, repeat: -1
        });
        this.anims.create({
            key: "walk_left", frames: this.anims.generateFrameNumbers("img_perso", { start: 26, end: 28 }), frameRate: 10, repeat: -1
        });
        this.anims.create({
            key: "dead", frames: this.anims.generateFrameNumbers("img_perso", { start: 17, end: 20 }), frameRate: 10, repeat: -1
        });

        this.bullets = this.physics.add.group();
        

        //TOUCHES
        this.cursors = this.input.keyboard.createCursorKeys();
        this.shootKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);

        //COLISIONS
        this.physics.add.collider(this.player, murLayer);
        this.physics.add.collider(this.bullets, murLayer, (bullet) => bullet.destroy());

        


        // Vérifier si le joueur commence une nouvelle session
        const nouvelleSession = !localStorage.getItem("sessionActive");

        if (nouvelleSession) {
            localStorage.setItem("sessionActive", "true");
            localStorage.setItem("niveau1Complete", "false");
        }

        // Vérifier si les niveaux ont été complétés
        const niveau1Terminé = localStorage.getItem("niveau1Complete") === "true";
        const niveau2Terminé = localStorage.getItem("niveau2Complete") === "true";
        const niveau3Terminé = localStorage.getItem("niveau3Complete") === "true";

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
        this.portal3 = this.physics.add.sprite(880, 245, "portail").setImmovable(true);
        this.portal3.setVisible(niveau2Terminé);
        this.portal3.body.enable = niveau2Terminé;
        if (niveau2Terminé) {
            this.physics.add.overlap(this.player, this.portal3, this.onPortal3Overlap, null, this);
        }


        // Caméra
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setZoom(1.1);
        this.cameras.main.setBounds(-50, -25, map.widthInPixels + 50, map.heightInPixels);
    }


    onPortal1Overlap(player, portal) {
        this.scene.start("Niveau1");
    }

    onPortal2Overlap(player, portal) {
        this.scene.start("Niveau2");
    }

    onPortal3Overlap(player, portal) {
        this.scene.start("Niveau3");
    }

    update() {
        let speed = 160;
        let diagonalSpeed = Math.sqrt(speed * speed / 2); // Réduit la vitesse en diagonale
        
        let movingX = false;
        let movingY = false;
        
        // Mouvement horizontal
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
        
        // Mouvement vertical
        if (this.cursors.up.isDown) {
            this.player.setVelocityY(-speed);
            movingY = true;
        } else if (this.cursors.down.isDown) {
            this.player.setVelocityY(speed);
            movingY = true;
        } else {
            this.player.setVelocityY(0);
        }
        
        // Gestion des animations pour le mouvement vertical
        if (movingY && !movingX) {
            if (this.lastDirection === "right") {
                this.player.anims.play("walk_right", true);
                this.player.setFlipX(false);
            } else if (this.lastDirection === "left") {
                this.player.anims.play("walk_right", true);
                this.player.setFlipX(true);
            }
        }
        
        // Si on bouge en diagonale, on ajuste la vitesse
        if (movingX && movingY) {
            this.player.setVelocityX(this.player.body.velocity.x * diagonalSpeed / speed);
            this.player.setVelocityY(this.player.body.velocity.y * diagonalSpeed / speed);
        }
        
        // Si le joueur ne bouge pas, animation d'arrêt
        if (!movingX && !movingY) {
            this.player.anims.play("stand", true);
        }

        if (Phaser.Input.Keyboard.JustDown(this.shootKey)) {
            this.tirer();
        }
    }

    tirer() {
        let bullet = this.bullets.create(this.player.x, this.player.y, "bullet");
        bullet.setScale(0.5);
        bullet.setVelocityX(this.lastDirection === "right" ? 300 : -300);
        this.time.addEvent({
            delay: 2000,
            callback: () => bullet.destroy(),
            loop: false
        });
    }
}