export default class Niveau3 extends Phaser.Scene {
    constructor() {
        super({ key: "Niveau3" });
        this.maxHealth = 5; // Vie maximale en cœurs
        this.currentHealth = this.maxHealth; // Vie actuelle
    }

    preload() {
        this.load.tilemapTiledJSON("mapN3", "src/assets/mapN3.json");

        this.load.image("Grass", "src/assets/TX Tileset Grass.png");
        this.load.image("Wall", "src/assets/TX Tileset Wall.png");
        this.load.image("Objet", "src/assets/TX Props.png");
        this.load.image("Plant", "src/assets/TX PLant.png");
        this.load.image("Ombres", "src/assets/TX Shadow PLant.png");

        this.load.spritesheet("img_perso", "src/assets/Perso.png", {
            frameWidth: 48,
            frameHeight: 48
        });

        this.load.spritesheet("burger", "src/assets/burger_spritesheet.png", {
            frameWidth: 32,
            frameHeight: 32
        });

        this.load.image("heart", "src/assets/hearth.png"); // Image d'un cœur
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

        

        this.player = this.physics.add.sprite(100, 100, "img_perso");

        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        mursLayer.setCollisionByProperty({ estSolide: true });
        this.physics.add.collider(this.player, mursLayer);

        
        
        this.portal = this.physics.add.sprite(3055, 495, "portail");
        this.portal.setImmovable(true);
        this.physics.add.overlap(this.player, this.portal, this.onPortalOverlap, null, this);


      
      
      // Création des animations pour les burgers
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

        // 🔹 Ajout de la barre de vie avec cœurs
        this.healthIcons = [];
        for (let i = 0; i < this.maxHealth; i++) {
            let heart = this.add.image(60 + i * 50, 20, "heart"); // Position initiale
            heart.setScale(0.3); // Réduction de la taille
            heart.setScrollFactor(0); // Fixé à l'écran
            this.healthIcons.push(heart);
        }

        this.updateHealth(); // Mettre à jour l'affichage initial des cœurs
    
      this.physics.add.collider(this.player, this.burgers, this.hitPlayer, null, this);


       // Centrer la caméra sur le joueur
       this.cameras.main.startFollow(this.player);
       this.cameras.main.setZoom(1.1); // Zoom léger

       // Limiter les mouvements de la caméra aux bords de la carte
       const mapWidth = map.widthInPixels;
       const mapHeight = map.heightInPixels;
       this.cameras.main.setBounds(-50, -25, mapWidth + 50, mapHeight);
  }
      
       
  onPortalOverlap() {
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
        this.scene.start("Hub");
    }
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
        
        this.currentHealth -= 1; // Perte d'un cœur
        this.updateHealth(); // Mettre à jour l'affichage des cœurs

        if (this.currentHealth <= 0) {
            console.log("Game Over");
            this.scene.restart(); // Redémarrer le niveau
        }

        burger.setActive(false);
        burger.setVisible(false);
    }

    updateHealth() {
        this.healthIcons.forEach((heart, index) => {
            heart.setVisible(index < this.currentHealth); // Afficher ou masquer les cœurs
        });
    }
}