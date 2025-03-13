export default class Niveau3 extends Phaser.Scene {
    constructor() {
        super({ key: "Niveau3" });
        this.maxHealth = 5;
        this.currentHealth = this.maxHealth;
        this.maxBurgers = 15;
        this.burgersSpawned = 0;
        this.ballesTirees = 0; // Compteur de balles tirées
        this.isRecharging = false; // État de recharge
        this.maxBullets = 15;  // Nombre max de balles avant recharge
this.currentBullets = this.maxBullets; // Balles actuelles
this.isRecharging = false; // Vérifie si on recharge
    }

    preload() {
        this.load.tilemapTiledJSON("mapN3", "src/assets/mapN3.json");
        this.load.image("Grass", "src/assets/TX Tileset Grass.png");
        this.load.image("Wall", "src/assets/TX Tileset Wall.png");
        this.load.image("Objet", "src/assets/TX Props.png");
        this.load.image("Plant", "src/assets/TX PLant.png");
        this.load.image("Ombres", "src/assets/TX Shadow PLant.png");
        this.load.spritesheet("img_perso", "src/assets/banane.png", { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet("burger", "src/assets/burger_spritesheet.png", { frameWidth: 32, frameHeight: 32 });
        this.load.image("heart", "src/assets/hearth.png");
        this.load.image("bullet", "src/assets/bullet.png");
        this.load.audio("Ambiance", "src/assets/Ambiance.mp3");
        this.load.audio("BouleFeu", "src/assets/BouleFeu.mp3"); 
        this.load.audio("burgerDeath", "src/assets/Mort.mp3");
        this.load.audio("Reload", "src/assets/Reload.mp3");
    }

    create() {

        //gerer la musique 
        if (!this.sound.get("Ambiance")) { 
            this.music = this.sound.add("Ambiance", { loop: true, volume: 0.02 });
            this.music.play();
        } else {
            this.music = this.sound.get("Ambiance");
        }

        // CREATION MAP
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

        
        // PLAYER
        this.player = this.physics.add.sprite(100, 100, "img_perso");
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
        // Ajouter une barre de recharge au-dessus du joueur
    this.reloadBar = this.add.graphics();
    this.reloadBar.setVisible(false);

        // CREATION TOUCHES
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keyUp = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);   // Z pour haut
        this.keyLeft = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q); // Q pour gauche
        this.keyDown = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S); // S pour bas
        this.keyRight = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D); // D pour droite
        this.shootKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A); // Touche A pour tirer
        this.shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
        this.keyReload = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    

        // COLISIONS
        mursLayer.setCollisionByProperty({ estSolide: true });
        this.physics.add.collider(this.player, mursLayer);
        this.physics.add.collider(this.bullets, this.burgers, this.hitBurger, null, this);
        this.physics.add.collider(this.bullets, mursLayer, (bullet) => bullet.destroy());
        
        //PORTAIL
        this.portal = this.physics.add.sprite(3055, 495, "portail").setImmovable(true);
        this.physics.add.overlap(this.player, this.portal, this.onPortalOverlap, null, this);

        // BURGER
        let mapWidth = map.widthInPixels;
        let mapHeight = map.heightInPixels;

        // Augmenter la vitesse des burgers
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

    // Modification pour spawn de burgers plus rapides et plus gros
    this.time.addEvent({
        delay: 2000,  // Toujours spawn tous les 2 secondes
        callback: () => {
            if (this.burgersSpawned < this.maxBurgers) {
                let x = Phaser.Math.Between(50, mapWidth - 50);
                let y = Phaser.Math.Between(50, mapHeight - 50);
                let burger = this.burgers.create(x, y, "burger");

                
                burger.setData('speed', 100);  // Augmentation de la vitesse des burgers (plus rapide)
                this.burgersSpawned++;

                // Décider aléatoirement si ce burger est "gros"
                const isBigBurger = Phaser.Math.Between(0, 4) === 0;  // 20% de chance d'être gros

                if (isBigBurger) {
                    burger.setScale(2);  // Le burger devient plus grand
                    burger.setData('health', 3);  // Plus de vie
                    burger.setData('damage', 2);  // Inflige plus de dégâts
                    burger.setTint(0xff0000);  // Changer la couleur du gros burger pour qu'il soit visible
                } else {
                    burger.setData('health', 1);  // Vie normale
                    burger.setData('damage', 1);  // Dégâts normaux
                }

                let direction = Phaser.Math.Between(0, 1);
                if (direction === 0) {
                    burger.setVelocityX(100);  // Burger va plus vite
                    burger.play("burger_right");
                } else {
                    burger.setVelocityX(-100);  // Burger va plus vite
                    burger.play("burger_left");
                }
            }
        },
        loop: true
    });


        this.physics.add.collider(this.burgers, mursLayer);
        this.physics.add.collider(this.player, this.burgers, this.hitPlayer, null, this);
        this.physics.add.overlap(this.bullets, this.burgers, this.hitBurger, null, this);


        // BARRE DEVIE
        this.healthBar = this.add.graphics();
        this.drawHealthBar();
        this.healthBar.setScrollFactor(0);
        this.healthBar.setPosition(140, 80);


        //CAMERA
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
    

    

    update() {
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

    // Fonction pour tirer un projectile
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
    
        console.log(`Balles restantes : ${this.currentBullets}`);
    
        // Jouer le son BouleFeu
        this.sound.play("BouleFeu", { volume: 0.05});
    }


    recharger() {
        if (this.isRecharging || this.currentBullets === this.maxBullets) return; // Si déjà plein ou en recharge, on ignore
    
        this.isRecharging = true;
        console.log("Rechargement en cours...");

        this.sound.play("Reload", { volume: 0.03 });

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
                    reloadInterval.remove(); // Stopper l'intervalle
                }
            },
            loop: true
        });
    }
    onPortalOverlap() {
        if (this.burgers.countActive(true) === 0) {
            // Sauvegarde de la progression avant de commencer un autre niveau
            localStorage.setItem("niveau3Complete", "true");
            this.scene.start("Hub");
        }
    }

    
    hitPlayer(player, burger) {
        // Si le burger est gros, il inflige plus de dégâts
        const damage = burger.getData('damage') || 1; // Valeur par défaut de 1 si aucune donnée
        this.currentHealth -= damage;  
    
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
        const health = burger.getData('health');
    
        // Réduire la vie du burger en fonction des dégâts reçus
        burger.setData('health', health - 1);
    
        // Si le burger a plus de vie, on ne le détruit pas tout de suite
        if (burger.getData('health') <= 0) {
            this.sound.play("burgerDeath", { volume: 0.03 });
            burger.destroy();
        }
    
        bullet.destroy();
    }
    
}
