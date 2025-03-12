export default class Niveau2 extends Phaser.Scene {
    constructor() {
        super({ key: "Niveau2" });
        this.maxHealth = 5;
        this.currentHealth = this.maxHealth;
        this.lastDirection = "right"; // Dernière direction du joueur
        this.fireRate = 500; // Temps entre chaque tir (ms)
        this.lastFired = 0; // Temps du dernier tir
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
        this.load.image("bullet", "src/assets/bullet.png"); // Ajout de l'image de la balle
    }

    create() {
        localStorage.removeItem("niveau2Complete");
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
        this.shootKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A); // Touche A pour tirer

        mursLayer.setCollisionByProperty({ estSolide: true });
        this.physics.add.collider(this.player, mursLayer);

        // Création du portail
        this.portal = this.physics.add.sprite(3025, 525, "portail").setImmovable(true);
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

        // Création des ennemis (les burgers)
        this.burgers = this.physics.add.group({ key: 'burger', repeat: 14 });
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

        // Détection des collisions entre le joueur et les burgers
        this.physics.add.collider(this.player, this.burgers, this.hitPlayer, null, this);

        // Création des icônes de vie du joueur
        this.healthIcons = [];
        for (let i = 0; i < this.maxHealth; i++) {
            let heart = this.add.image(60 + i * 50, 20, "heart").setScale(0.3).setScrollFactor(0);
            this.healthIcons.push(heart);
        }
        this.updateHealth();

        // Création du groupe de projectiles (balles)
        this.bullets = this.physics.add.group();
        this.physics.add.overlap(this.bullets, this.burgers, this.hitBurger, null, this);

        // Suivi de la caméra sur le joueur
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setZoom(1.1);
        this.cameras.main.setBounds(-50, -25, map.widthInPixels + 50, map.heightInPixels);
    }

    update(time) {
        let speed = 160;
        let moving = false;

        // Gestion des déplacements du joueur
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-speed);
            this.player.setFlipX(true);
            this.lastDirection = "left";
            moving = true;
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(speed);
            this.player.setFlipX(false);
            this.lastDirection = "right";
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

        // Si le joueur n'est pas en mouvement, arrêter l'animation
        if (!moving) {
            this.player.anims.stop();
        }

        // Logique des burgers
        this.burgers.children.iterate(burger => {
            const angle = Phaser.Math.Angle.Between(burger.x, burger.y, this.player.x, this.player.y);
            const speed = burger.getData('speed');
            burger.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
            burger.play(burger.body.velocity.x > 0 ? "burger_right" : "burger_left", true);
        });

        // Tir du joueur
        if (Phaser.Input.Keyboard.JustDown(this.shootKey) && time > this.lastFired + this.fireRate) {
            this.shoot();
            this.lastFired = time;
        }
    }

    // Fonction pour tirer un projectile
    shoot() {
        let bullet = this.bullets.create(this.player.x, this.player.y, "bullet");
        bullet.setScale(0.5);
        bullet.setVelocityX(this.lastDirection === "right" ? 300 : -300);

        // Délai avant de détruire le projectile
        this.time.addEvent({
            delay: 2000,
            callback: () => bullet.destroy(),
            loop: false
        });
    }

    // Fonction de gestion de collision avec un burger (le joueur prend des dégâts)
    hitPlayer(player, burger) {
        this.currentHealth -= 1;
        this.updateHealth();
        if (this.currentHealth <= 0) {
            this.scene.restart();
        }
        burger.setActive(false).setVisible(false);
    }

    // Fonction pour détruire un burger quand il est touché par un projectile
    hitBurger(bullet, burger) {
        bullet.destroy();
        burger.destroy();
    }

    // Fonction pour mettre à jour les icônes de vie
    updateHealth() {
        this.healthIcons.forEach((heart, index) => {
            heart.setVisible(index < this.currentHealth);
        });
    }

    // Fonction pour vérifier la condition de victoire (tous les burgers détruits)
    onPortalOverlap() {
        if (this.burgers.countActive(true) === 0) {
            localStorage.setItem("niveau2Complete", "true");
            this.scene.start("Hub");
        }
    }
}