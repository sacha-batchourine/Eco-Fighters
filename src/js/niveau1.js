export default class Niveau1 extends Phaser.Scene {
    constructor() {
        super({ key: "Niveau1" });
        this.maxHealth = 5; // Le maximum de points de vie
        this.currentHealth = this.maxHealth; // Les points de vie actuels
        this.lastDirection = "right"; // Pour éviter de retourner le sprite en boucle
    }

    preload() {
        this.load.tilemapTiledJSON("mapN1", "src/assets/mapN1.json");
        this.load.image("Grass", "src/assets/TX Tileset Grass.png");
        this.load.image("Wall", "src/assets/TX Tileset Wall.png");
        this.load.image("Objet", "src/assets/TX Props.png");
        this.load.spritesheet("img_perso", "src/assets/Perso.png", { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet("burger", "src/assets/burger_spritesheet.png", { frameWidth: 32, frameHeight: 32 });
        this.load.image("heart", "src/assets/hearth.png");
    }

    create() {
        const map = this.make.tilemap({ key: "mapN1" });
        const tilesetGrass = map.addTilesetImage("Grass", "Grass");
        const tilesetMur = map.addTilesetImage("Wall", "Wall");
        const tilesetProps = map.addTilesetImage("Props", "Objet");
        
        map.createLayer("Grass", [tilesetGrass]);
        const mursLayer = map.createLayer("Mur", [tilesetMur]);
        map.createLayer("Chemin", [tilesetGrass]);
        map.createLayer("Portail", [tilesetProps]);

        // Création du joueur
        this.player = this.physics.add.sprite(112, 295, "img_perso");
         this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        mursLayer.setCollisionByProperty({ collide: true });
        this.physics.add.collider(this.player, mursLayer);

        this.portal = this.physics.add.sprite(1520, 300, "portail");
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

        // Création du groupe de burgers
        this.burgers = this.physics.add.group();
        for (let i = 0; i < 5; i++) {
            let x = Phaser.Math.Between(50, 500);
            let y = Phaser.Math.Between(50, 500);
            let burger = this.burgers.create(x, y, "burger");
            burger.setCollideWorldBounds(true);
            burger.setData('speed', 30);
            let direction = Phaser.Math.Between(0, 1);
            if (direction === 0) {
                burger.setVelocityX(30);
                burger.play("burger_right");
            } else {
                burger.setVelocityX(-30);
                burger.play("burger_left");
            }
        }

        this.physics.add.collider(this.player, this.burgers, this.hitPlayer, null, this);

        // Création de la barre de vie
        this.healthBar = this.add.graphics();
        this.drawHealthBar();

        // Caméra qui suit le joueur
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setZoom(1.1);
        const mapWidth = map.widthInPixels;
        const mapHeight = map.heightInPixels;
        this.cameras.main.setBounds(-50, -25, mapWidth + 50, mapHeight);
    }

    drawHealthBar() {
        // Efface la barre de vie précédente
        this.healthBar.clear();

        // Dessine la barre de vie
        const barWidth = 200; // Largeur de la barre de vie
        const barHeight = 20; // Hauteur de la barre de vie

        // Bar background
        this.healthBar.fillStyle(0x000000); // Couleur noir pour le fond
        this.healthBar.fillRect(20, 20, barWidth, barHeight); // Décalage de 20px à droite

        // Bar current health
        const healthRatio = this.currentHealth / this.maxHealth;
        this.healthBar.fillStyle(0xff0000); // Couleur rouge pour la vie
        this.healthBar.fillRect(20, 20, barWidth * healthRatio, barHeight); // Décalage de 20px à droite
    }

    onPortalOverlap() {
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            this.scene.start("Hub");
        }
    }

    update() {
        let speed = 160;
        this.player.setVelocity(0);

        // Gestion du mouvement du joueur
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-speed);
            this.player.setFlipX(true); // Retourne le sprite vers la gauche
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(speed);
            this.player.setFlipX(false); // Remet le sprite normal vers la droite
        }

        if (this.cursors.up.isDown) {
            this.player.setVelocityY(-speed);
        } else if (this.cursors.down.isDown) {
            this.player.setVelocityY(speed);
        }

        // Animation et déplacement des burgers
        this.burgers.children.iterate(burger => {
            const angle = Phaser.Math.Angle.Between(burger.x, burger.y, this.player.x, this.player.y);
            const speed = burger.getData('speed');

            let velocityX = Math.cos(angle) * speed;
            let velocityY = Math.sin(angle) * speed;

            burger.setVelocity(velocityX, velocityY);

            // Mise à jour de l'animation du burger
            if (Math.abs(velocityX) > Math.abs(velocityY)) {
                if (velocityX > 0) {
                    burger.play("burger_right", true);
                } else {
                    burger.play("burger_left", true);
                }
            }
        });

        // Dessine la barre de vie
        this.drawHealthBar();
    }

    hitPlayer(player, burger) {
        console.log("Le joueur a été touché par un burger !");
        this.currentHealth -= 1; // Perte d'un point de vie
        burger.setActive(false).setVisible(false); // Le burger disparaît

        // Vérifie si le joueur est mort
        if (this.currentHealth <= 0) {
            console.log("Game Over");
            this.scene.restart();
        }
    }
}