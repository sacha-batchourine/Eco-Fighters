export default class Niveau1 extends Phaser.Scene {
    constructor() {
        super({ key: "Niveau1" });
        this.maxHealth = 5;
        this.currentHealth = this.maxHealth;
        this.lastDirection = "right";
        this.maxBurgers = 10;
        this.burgersSpawned = 0;
        this.ballesTirees = 0; // Compteur de balles tirées
        this.isRecharging = false; // État de recharge
        // Initialisation des balles
this.maxBullets = 15;  // Nombre max de balles avant recharge
this.currentBullets = this.maxBullets; // Balles actuelles
this.bulletCountText = null; // Compteur de balles
this.isRecharging = false; // Vérifie si on recharge
this.burgersToKill = this.maxBurgers; // Compteur de burgers à tuer
    }

    preload() {
        this.load.tilemapTiledJSON("mapN1", "src/assets/mapN1.json");
        this.load.image("Grass", "src/assets/TX Tileset Grass.png");
        this.load.image("Wall", "src/assets/TX Tileset Wall.png");
        this.load.image("Objet", "src/assets/TX Props.png");
        this.load.spritesheet("img_perso", "src/assets/Perso.png", { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet("burger", "src/assets/burger_spritesheet.png", { frameWidth: 32, frameHeight: 32 });
        this.load.image("heart", "src/assets/hearth.png");
        this.load.image("portail", "src/assets/portail.png");
        this.load.image("bullet", "src/assets/bullet.png"); // Image du projectile
        this.load.audio("Ambiance", "src/assets/Ambiance.mp3");
        this.load.audio("BouleFeu", "src/assets/BouleFeu.mp3"); 
        this.load.audio("burgerDeath", "src/assets/Mort.mp3");
        this.load.audio("Reload", "src/assets/Reload.mp3");
        this.load.audio("DegatPlayer", "src/assets/DegatPlayer.mp3");
        this.load.audio("TPportail", "src/assets/TPportail.mp3");
    }

    create() {
        //gerer la musique 
        if (!this.sound.get("Ambiance")) { 
            this.music = this.sound.add("Ambiance", { loop: true, volume: 0.02 });
            this.music.play();
        } else {
            this.music = this.sound.get("Ambiance");
        }

        // Gerer la map 
        const map = this.make.tilemap({ key: "mapN1" });
        const tilesetGrass = map.addTilesetImage("Grass", "Grass");
        const tilesetMur = map.addTilesetImage("Wall", "Wall");
        const tilesetProps = map.addTilesetImage("Props", "Objet");

        map.createLayer("Grass", [tilesetGrass]);
        const mursLayer = map.createLayer("Mur", [tilesetMur]);
        map.createLayer("Chemin", [tilesetGrass]);
        map.createLayer("Portail", [tilesetProps]);

        // Gerer le personnage
        this.player = this.physics.add.sprite(145, 325, "img_perso");
        this.player.setScale(2); // Agrandit le joueur 2 fois
        this.lastDirection = "right";

        mursLayer.setCollisionByProperty({ collide: true });
        this.physics.add.collider(this.player, mursLayer);

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
        
        // Ajouter une barre de recharge au-dessus du joueur
    this.reloadBar = this.add.graphics();
    this.reloadBar.setVisible(false);

    // Initialiser le texte du compteur de balles
    this.bulletCountText = this.add.text(20, 50, `Balles restantes : ${this.currentBullets}`, { fontSize: '16px', fill: '#fff' });
    this.bulletCountText.setScrollFactor(0);
    this.bulletCountText.setPosition(140, 120);
    // Initialiser le texte du compteur de burgers
    this.burgerCountText = this.add.text(20, 70, `Burgers à tuer : ${this.burgersToKill}`, { fontSize: '16px', fill: '#fff' });
    this.burgerCountText.setScrollFactor(0);
    this.burgerCountText.setPosition(140, 140);
        



        // TOUCHES
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keyUp = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);   // Z pour haut
        this.keyLeft = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q); // Q pour gauche
        this.keyDown = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S); // S pour bas
        this.keyRight = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D); // D pour droite
        this.shootKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A); // Touche A pour tirer
        this.shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);  // Ajout de la touche "R" pour recharger
        this.keyReload = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    
        

        // les portails 
        this.portal = this.physics.add.sprite(1520, 300, "portail");
        this.portal.setImmovable(true);
        this.physics.add.overlap(this.player, this.portal, this.onPortalOverlap, null, this);

        // Vérifier si le joueur a déjà complété le niveau précédent
        const previousLevelComplete = localStorage.getItem("niveau1Complete");
        if (previousLevelComplete) {
            this.portal.setAlpha(1); // Le portail du niveau suivant devient visible
        } else {
            this.portal.setAlpha(1); // Le portail est invisible tant que le niveau n'est pas terminé
        }

        // Les Burgers
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

        this.burgers = this.physics.add.group();
        this.bullets = this.physics.add.group();

        this.time.addEvent({
            delay: 2000,
            callback: () => {
                if (this.burgersSpawned < this.maxBurgers) {
                    let x = Phaser.Math.Between(50, mapWidth - 50);
                    let y = Phaser.Math.Between(50, mapHeight - 50);
                    let burger = this.burgers.create(x, y, "burger");
                    burger.setCollideWorldBounds(true);
                    burger.setData('speed', 50);
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

        this.physics.add.collider(this.player, this.burgers, this.hitPlayer, null, this);
        this.physics.add.overlap(this.bullets, this.burgers, this.hitBurger, null, this);

        // Création de la barre de vie
        this.healthBar = this.add.graphics();
        this.drawHealthBar();
        this.healthBar.setScrollFactor(0);
        this.healthBar.setPosition(140, 80);

        // CAMERA
        const mapWidth = map.widthInPixels;
        const mapHeight = map.heightInPixels;
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setZoom(1.1);
        this.cameras.main.setBounds(-50, -25, mapWidth + 50, mapHeight);
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
            localStorage.setItem("niveau1Complete", "true");
            this.sound.play("TPportail", { volume: 0.1 } );
            this.scene.start("Hub");
        }
    }

    update(time) {
        let speed = 160;
        let diagonalSpeed = Math.sqrt(speed * speed / 2); // Réduit la vitesse en diagonale
        
        let movingX = false;
        let movingY = false;

        // Déplacements avec Z, Q, S, D
        if (this.keyLeft.isDown) {
            this.player.setVelocityX(-speed);
            this.player.anims.play("walk_right", true);
            this.player.setFlipX(true);
            this.lastDirection = "left";
            movingX = true;
        } else if (this.keyRight.isDown) {
            this.player.setVelocityX(speed);
            this.player.anims.play("walk_right", true);
            this.player.setFlipX(false);
            this.lastDirection = "right";
            movingX = true;
        } else {
            this.player.setVelocityX(0);
        }

        if (this.keyUp.isDown) {
            this.player.setVelocityY(-speed);
            movingY = true;
        } else if (this.keyDown.isDown) {
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

       
        if (Phaser.Input.Keyboard.JustDown(this.shiftKey)) {
            this.tirer();
        }

        // Gérer les burgers, etc. (reste inchangé)
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
         // Vérifier si le joueur appuie sur "R" pour recharger
    if (Phaser.Input.Keyboard.JustDown(this.keyReload)) {
        this.recharger();
    }

        this.drawHealthBar();
    }

    
    tirer() {
        if (this.isRecharging || this.currentBullets <= 0) return; // Impossible de tirer si on recharge ou plus de balles

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

        // Réduire le nombre de balles disponibles
        this.currentBullets--;

        // Mettre à jour le texte du compteur de balles
        this.bulletCountText.setText(`Balles restantes : ${this.currentBullets}`);

        console.log(`Balles restantes : ${this.currentBullets}`);

        // Jouer le son BouleFeu
        this.sound.play("BouleFeu", { volume: 0.05 });
    }

    recharger() {
        if (this.isRecharging || this.currentBullets === this.maxBullets) return; // Si déjà plein ou en recharge, on ignore

        this.isRecharging = true;
        console.log("Rechargement en cours...");

        this.sound.play("Reload", { volume: 0.1 });
    
        // Afficher la barre de recharge
        this.reloadBar.setVisible(true);
        this.reloadBar.clear();
        this.reloadBar.fillStyle(0xffcc00, 1); // Couleur jaune au début
        this.reloadBar.fillRect(this.player.x - 20, this.player.y - 40, 40, 5); // Position au-dessus du joueur

        let rechargeTime = 1000; // 2 secondes
        let updateInterval = 100;
        let elapsedTime = 0;

        let reloadInterval = this.time.addEvent({
            delay: updateInterval,
            callback: () => {
                elapsedTime += updateInterval;
                let progress = elapsedTime / rechargeTime;

                // Mise à jour de la barre de recharge
                this.reloadBar.clear();
                this.reloadBar.fillStyle(0x00ff00, 1); // Devient verte en progressant
                this.reloadBar.fillRect(this.player.x - 20, this.player.y - 40, 40 * progress, 5);

                if (elapsedTime >= rechargeTime) {
                    this.isRecharging = false;
                    this.currentBullets = this.maxBullets; // Recharger toutes les balles
                    console.log("Recharge terminée !");
                    this.reloadBar.setVisible(false); // Cacher la barre
                    this.bulletCountText.setText(`Balles restantes : ${this.currentBullets}`); // Mettre à jour le compteur
                    reloadInterval.remove(); // Stopper l'intervalle
                }
            },
            loop: true
        });
    

    }

    hitPlayer(player, burger) {
        console.log("Le joueur a été touché !");
        this.currentHealth -= 1;
        this.sound.play("DegatPlayer", { volume: 0.1 });
        burger.destroy();
    
        if (this.currentHealth <= 0) {
            console.log("Game Over");
    
            // Réinitialisation complète du niveau
            this.currentHealth = this.maxHealth;
            this.burgers.clear(true, true); // Supprime tous les burgers
            this.burgersSpawned = 0; // Remet à zéro le compteur de burgers
    
            this.scene.restart(); // Redémarre la scène
        }
    }
    hitBurger(bullet, burger) {
        this.sound.play("burgerDeath", { volume: 0.1 });
        bullet.destroy();
        burger.destroy();
        this.burgersToKill--; // Décrémente le compteur de burgers restants
        this.updateBurgerCountText(); // Met à jour le texte du compteur
    }

    updateBurgerCountText() {
        this.burgerCountText.setText(`Burgers à tuer : ${this.burgersToKill}`);
    }
}