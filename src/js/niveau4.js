export default class Niveau4 extends Phaser.Scene {
    constructor() {
        super({ key: "Niveau4" });
        this.maxHealth = 5;
        this.currentHealth = this.maxHealth;
        this.maxBurgers = 20;
        this.burgersSpawned = 0;
        this.bigBurgersSpawned = 0; // Compteur pour les gros burgers
        this.giantBurgerSpawned = false; // Flag pour le très gros burger
        this.ballesTirees = 0; // Compteur de balles tirées
        this.isRecharging = false; // État de recharge
    }

    preload() {
        this.load.tilemapTiledJSON("mapN4", "src/assets/mapN4.json");
        this.load.image("Grass", "src/assets/TX Tileset Grass.png");
        this.load.image("Wall", "src/assets/TX Tileset Wall.png");
        this.load.image("Objet", "src/assets/TX Props.png");
        this.load.image("Plant", "src/assets/TX PLant.png");
        this.load.image("Ombres", "src/assets/TX Shadow PLant.png");
        this.load.spritesheet("img_perso", "src/assets/banane.png", { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet("burger", "src/assets/burger_spritesheet.png", { frameWidth: 32, frameHeight: 32 });
        this.load.image("heart", "src/assets/hearth.png");
        this.load.image("bullet", "src/assets/bullet.png");
    }

    create() {
        // CREATION MAP
        const map = this.make.tilemap({ key: "mapN4" });
        const tilesetGrass = map.addTilesetImage("Grass", "Grass");
        const tilesetMur = map.addTilesetImage("Wall", "Wall");
        const tilesetProps = map.addTilesetImage("Props", "Objet");
        const tilesetPlant = map.addTilesetImage("Plant", "Plant");
        const tilesetOmbre = map.addTilesetImage("Shadow Plant", "Ombres");

        map.createLayer("Grass", [tilesetGrass]);
        map.createLayer("Chemin", [tilesetGrass, tilesetProps]);
        map.createLayer("Ombre", [tilesetOmbre]);
        const mursLayer = map.createLayer("Mur", [tilesetMur, tilesetPlant, tilesetProps]);
        map.createLayer("Ecriture", [tilesetProps]);

        // PLAYER
        this.player = this.physics.add.sprite(115, 300, "img_perso");
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

        this.burgers = this.physics.add.group();
        this.bullets = this.physics.add.group();

        // TOUCHES
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.shootKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);

        // COLISIONS
        mursLayer.setCollisionByProperty({ estSolide: true });
        this.physics.add.collider(this.player, mursLayer);
        this.physics.add.collider(this.bullets, this.burgers, this.hitBurger, null, this);
        this.physics.add.collider(this.bullets, mursLayer, (bullet) => bullet.destroy());

        // PORTAIL
        this.portal = this.physics.add.sprite(3377, 80, "portail").setImmovable(true);
        this.physics.add.overlap(this.player, this.portal, this.onPortalOverlap, null, this);

        // ANIMATIONS DES BURGERS
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

        // SPAWN DES BURGERS
        let mapWidth = map.widthInPixels;
        let mapHeight = map.heightInPixels;

        this.time.addEvent({
            delay: 2000,
            callback: () => {
                if (this.burgersSpawned < this.maxBurgers) {
                    let x = Phaser.Math.Between(50, mapWidth - 50);
                    let y = Phaser.Math.Between(50, mapHeight - 50);
                    let burger;

                    // Spawn des 5 gros burgers
                    if (this.bigBurgersSpawned < 5) {
                        burger = this.burgers.create(x, y, "burger");
                        burger.setScale(2); // Agrandir les burgers (taille normale x2)
                        burger.setData('health',5); // Gros burger a 2 fois la vie
                        burger.setData('damage', 20); // Gros burger inflige 2 fois plus de dégats
                        burger.setData('speed', 40); // Vitesse plus lente pour les gros burgers
                        this.bigBurgersSpawned++;
                    }
                    // Spawn du très gros burger (le dernier)
                    else if (!this.giantBurgerSpawned) {
                        burger = this.burgers.create(x, y, "burger");
                        burger.setScale(3); // Très gros burger (taille normale x3)
                        burger.setData('health', 10); // Très gros burger a 3 fois la vie
                        burger.setData('damage', 30); // Très gros burger inflige 3 fois plus de dégâts
                        burger.setData('speed', 30); // Très lent pour le gros burger
                        this.giantBurgerSpawned = true;
                    }
                    // Spawn des burgers normaux
                    else {
                        burger = this.burgers.create(x, y, "burger");
                        burger.setData('health', 3); // Burger normal avec la vie de base
                        burger.setData('damage', 10); // Burger normal avec les dégâts de base
                        burger.setData('speed', 50); // Burger normal
                    }

                    burger.setCollideWorldBounds(true);
                    this.burgersSpawned++;

                    let direction = Phaser.Math.Between(0, 1);
                    if (direction === 0) {
                        burger.setVelocityX(50);
                        burger.play("burger_right");
                    } else {
                        burger.setVelocityX(-50);
                        burger.play("burger_left");
                    }
                }
            },
            loop: true
        });

        this.physics.add.collider(this.burgers, mursLayer);
        this.physics.add.collider(this.player, this.burgers, this.hitPlayer, null, this);
        this.physics.add.overlap(this.bullets, this.burgers, this.hitBurger, null, this);

        // BARRE DE VIE
        this.healthBar = this.add.graphics();
        this.drawHealthBar();
        this.healthBar.setScrollFactor(0);
        this.healthBar.setPosition(140, 80);

        // CAMERA
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setZoom(1.1);
        this.cameras.main.setBounds(-50, -25, map.widthInPixels + 50, map.heightInPixels);
    }

    drawHealthBar() {
        this.healthBar.clear();
        const barWidth = 200;
        const barHeight = 20;
        this.healthBar.fillStyle(0x000000);
        this.healthBar.fillRect(0, 0, barWidth, barHeight);
        const healthRatio = this.currentHealth / this.maxHealth;
        this.healthBar.fillStyle(0xff0000);
        this.healthBar.fillRect(0, 0, barWidth * healthRatio, barHeight);
    }

    onPortalOverlap() {
        if (this.burgers.countActive(true) === 0) {
            // Sauvegarde de la progression avant de commencer un autre niveau
            localStorage.setItem("niveau4Complete", "true");
            this.scene.start("Hub");
        }
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

        this.burgers.children.iterate(burger => {
            const angle = Phaser.Math.Angle.Between(burger.x, burger.y, this.player.x, this.player.y);
            const speed = burger.getData('speed');
            let velocityX = Math.cos(angle) * speed;
            let velocityY = Math.sin(angle) * speed;
            burger.setVelocity(velocityX, velocityY);
            if (Math.abs(velocityX) > Math.abs(velocityY)) {
                if (velocityX > 0) {
                    burger.play("burger_right", true);
                } else {
                    burger.play("burger_left", true);
                }
            }
        });

        this.drawHealthBar();
    }

    // Fonction pour tirer un projectile
    tirer() {
        if (this.isRecharging) return; // Si on est en train de recharger, on ne peut pas tirer
    
        // Crée la balle à la position du joueur
        let bullet = this.bullets.create(this.player.x, this.player.y, "bullet");
        bullet.setScale(0.5);
    
        // Ajuster la position de la souris par rapport à la caméra
        const mouseX = this.input.mousePointer.x + this.cameras.main.scrollX;
        const mouseY = this.input.mousePointer.y + this.cameras.main.scrollY;
    
        // Calculer l'angle entre la position du joueur et la souris
        const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, mouseX, mouseY);
    
        // Calculer la vitesse de la balle en fonction de l'angle
        const speed = 300;
        const velocityX = Math.cos(angle) * speed;
        const velocityY = Math.sin(angle) * speed;
    
        // Appliquer la direction à la balle
        bullet.setVelocity(velocityX, velocityY);
    
        // Ajuster l'orientation de la balle selon l'angle
        bullet.rotation = angle;
    
        // Détruire la balle après un délai
        this.time.addEvent({
            delay: 2000,  // La balle disparaît après 2 secondes
            callback: () => bullet.destroy(),
            loop: false
        });
    
        // Incrémenter le compteur de balles tirées
        this.ballesTirees++;
    
        // Si 15 balles ont été tirées, commencer le processus de recharge
        if (this.ballesTirees >= 15) {
            this.ballesTirees = 0; // Réinitialiser le compteur de balles
            this.recharger(); // Appeler la fonction de recharge
        }
    }
    recharger() {
        if (this.isRecharging) return; // Si déjà en train de recharger, ne rien faire
    
        // Commencer le processus de recharge
        this.isRecharging = true;
        console.log("Rechargement...");
    
        // Afficher une animation ou un indicateur que le joueur recharge (optionnel)
    
        // Après 3 secondes, permettre au joueur de tirer à nouveau
        this.time.delayedCall(3000, () => {
            this.isRecharging = false;
            console.log("Recharge terminée !");
    
            // Ici, vous pouvez ajouter une animation de fin de recharge si nécessaire
        });
    }

    hitPlayer(player, burger) {
        console.log("Le joueur a été touché !");
        let damage = burger.getData('damage');
        this.currentHealth -= damage;
        burger.destroy();

        if (this.currentHealth <= 0) {
            console.log("Game Over");
            this.currentHealth = this.maxHealth;
            this.burgers.clear(true, true);
            this.scene.restart();
        }
    }
    
    hitBurger(bullet, burger) {
        let health = burger.getData('health');
        health -= 10; // Les balles infligent 10 dégâts
        burger.setData('health', health);

        if (health <= 0) {
            burger.destroy();
        }

        bullet.destroy();
    }
}