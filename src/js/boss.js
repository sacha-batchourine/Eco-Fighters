export default class NiveauBoss extends Phaser.Scene {
    constructor() {
        super({ key: "NiveauBoss" });
        this.maxHealth = 5; // Vie maximale en cœurs
        this.currentHealth = this.maxHealth; // Vie actuelle
        this.maxBurgers = 10;
        this.burgersSpawned = 0;
        this.ballesTirees = 0; // Compteur de balles tirées
        this.isRecharging = false; // État de recharge
        this.maxBullets = 15;  // Nombre max de balles avant recharge
this.currentBullets = this.maxBullets; // Balles actuelles
this.bulletCountText = null; // Compteur de balles
this.isRecharging = false; // Vérifie si on recharge
this.burgersToKill = this.maxBurgers; // Compteur de burgers à tuer
this.isShooting = false;  // Indicateur pour éviter un tir continu
    }

    preload() {
        this.load.tilemapTiledJSON("mapBoss", "src/assets/mapBoss.json");

        this.load.image("Grass", "src/assets/TX Tileset Grass.png");
        this.load.image("Wall", "src/assets/TX Tileset Wall.png");
        this.load.image("Objet", "src/assets/TX Props.png");
        this.load.image("Plant", "src/assets/TX PLant.png");
        this.load.image("Ombres", "src/assets/TX Shadow PLant.png");
        this.load.image("Sol", "src/assets/TX Tileset Stone Ground.png");
        this.load.spritesheet("img_perso", "src/assets/banane.png", { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet("burger", "src/assets/burger_spritesheet.png", { frameWidth: 32, frameHeight: 32 });
        this.load.image("heart", "src/assets/hearth.png");
        this.load.image("bullet", "src/assets/bullet.png");
        this.load.audio("BossFight", "src/assets/BossFight.mp3");
        this.load.audio("BouleFeu", "src/assets/BouleFeu.mp3"); 
        this.load.audio("burgerDeath", "src/assets/Mort.mp3");
        this.load.audio("Reload", "src/assets/Reload.mp3");
        this.load.audio("DegatPlayer", "src/assets/DegatPlayer.mp3");
        this.load.audio("TPportail", "src/assets/TPportail.mp3");
        this.load.audio("Ambiance", "src/assets/Ambiance.mp3");
    }

  create() {


        //MAP
        const map = this.make.tilemap({ key: "mapBoss" });
        const tilesetGrass = map.addTilesetImage("Grass", "Grass");
        const tilesetMur = map.addTilesetImage("Wall", "Wall");
        const tilesetProps = map.addTilesetImage("Props", "Objet");
        const tilesetPlant = map.addTilesetImage("Plant", "Plant");
        const tilesetOmbre = map.addTilesetImage("Shadow Plant", "Ombres");
        const tilesetSol = map.addTilesetImage("Stone Ground", "Sol");

        map.createLayer("Grass", [tilesetGrass]);
        map.createLayer("Chemin", [tilesetGrass, tilesetProps, tilesetSol]);
        const mursLayer = map.createLayer("Mur", [tilesetMur, tilesetPlant, tilesetProps]);
        map.createLayer("Ecriture", [tilesetProps]);

        
        //PLAYER
        this.player = this.physics.add.sprite(150, 950, "img_perso");
        this.player.setScale(2); // Agrandit le joueur 2 fois
        this.lastDirection = "right";

        this.anims.create({
            key: "stand", frames: this.anims.generateFrameNumbers("img_perso", { start: 30, end: 32 }), frameRate: 10, repeat: -1
        });
        this.anims.create({
            key: "walk", frames: this.anims.generateFrameNumbers("img_perso", { start: 26, end: 28 }), frameRate: 10, repeat: -1
        });
        this.anims.create({
            key: "dead", frames: this.anims.generateFrameNumbers("img_perso", { start: 17, end: 20 }), frameRate: 10, repeat: -1
        });

        this.burgers = this.physics.add.group();
        this.bullets = this.physics.add.group();
// Ajouter une barre de recharge au-dessus du joueur
this.reloadBar = this.add.graphics();
this.reloadBar.setVisible(false);


// Initialiser le texte du compteur de balles
this.bulletCountText = this.add.text(20, 50, `Balles restantes : ${this.currentBullets}`, { fontSize: '16px', fill: '#fff' });
this.bulletCountText.setScrollFactor(0);
this.bulletCountText.setPosition(140, 120);
// Initialiser le texte du compteur de burgers
this.burgerCountText = this.add.text(20, 70, `Tue le BOSS`, { fontSize: '16px', fill: '#fff' });
this.burgerCountText.setScrollFactor(0);
this.burgerCountText.setPosition(140, 140);

        
        //TOUCHES
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keyUp = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);   // Z pour haut
        this.keyLeft = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q); // Q pour gauche
        this.keyDown = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S); // S pour bas
        this.keyRight = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D); // D pour droite
        this.shootKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A); // Touche A pour tirer
        this.keyShift = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
        this.keyReload = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    

        //COLISIONS
        mursLayer.setCollisionByProperty({ estSolide: true });
        this.physics.add.collider(this.player, mursLayer);
        this.physics.add.collider(this.bullets, this.burgers, this.hitBurger, null, this);
        this.physics.add.collider(this.bullets, mursLayer, (bullet) => bullet.destroy());

        
        //PORTAIL
        this.portal = this.physics.add.sprite( 2250,  932, "portail").setImmovable(true);
        this.physics.add.overlap(this.player, this.portal, this.onPortalOverlap, null, this);


      
      //BURGERS
      let mapWidth = map.widthInPixels;
      let mapHeight = map.heightInPixels;

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

      if (!this.burgers) {
        this.burgers = this.physics.add.group(); 
      }
      const bossSpawnPosition = { x: 2250, y: 900 }; // Modifie ces valeurs comme tu veux
      this.time.addEvent({
        delay: 2000,
        callback: () => {
            if (!this.boss) { // Vérifie si le boss n'existe pas déjà
                
                this.boss = this.burgers.create(bossSpawnPosition.x, bossSpawnPosition.y, "mega_burger");
                this.boss.setScale(4); // ÉNORME
                this.boss.setTint(0x800080); // Couleur violette pour le différencier
                this.boss.setCollideWorldBounds(false);
                this.boss.setData('health', 50); // 50 balles pour le tuer
                this.boss.setData('damage', 100); // Tue en 1 coup
                this.boss.setData('speed', 20); // Très lent
                this.boss.setVelocityX(20); // Se déplace lentement à gauche/droite
                
    
                // Génération de burgers réguliers
                this.time.addEvent({
                    delay: 1000, // Toutes les 3 secondes
                    callback: () => {
                        if (this.boss.active) { // Tant que le boss est en vie
                            let spawnX = this.boss.x + Phaser.Math.Between(-200, 200);
                            let spawnY = this.boss.y + Phaser.Math.Between(-200, 200);
                            let burger = this.burgers.create(spawnX, spawnY, "burger");
                            
                            // Déterminer le type de burger généré
                            let rand = Phaser.Math.Between(1, 10);
                            let burgerType;
                            if (rand <= 3) {
                                burgerType = 1; // Petit (30%)
                            } else if (rand <= 7) {
                                burgerType = 2; // Moyen (40%)
                            } else {
                                burgerType = 3; // Gros (30%)
                            }
    
                            // Configuration du burger en fonction de sa taille
                            switch (burgerType) {
                                case 1:
                                    burger.setScale(1);
                                    burger.setData('health', 1);
                                    burger.setData('damage', 1);
                                    burger.setData('speed', 125);
                                    break;
                                case 2:
                                    burger.setScale(1.5);
                                    burger.setData('health', 2);
                                    burger.setData('damage', 2);
                                    burger.setData('speed', 100);
                                    burger.setTint(0xff9900);
                                    break;
                                case 3:
                                    burger.setScale(2);
                                    burger.setData('health', 3);
                                    burger.setData('damage', 3);
                                    burger.setData('speed', 75);
                                    burger.setTint(0xff0000);
                                    break;
                            }
    
                            // Appliquer la vitesse
                    let direction = Phaser.Math.Between(0, 1);
                    let speed = burger.getData('speed'); 
        
                    if (direction === 0) {
                        burger.setVelocityX(speed);
                        burger.play("burger_right");
                    } else {
                        burger.setVelocityX(-speed);
                        burger.play("burger_left");
                    }
                        }
                    },
                    loop: true
                });
            }
        },
        loop: false // Ce boss ne doit apparaître qu'une seule fois
    });

      this.physics.add.collider(this.burgers, mursLayer);
      this.physics.add.collider(this.player, this.burgers, this.hitPlayer, null, this);
      this.physics.add.overlap(this.bullets, this.burgers, this.hitBurger, null, this);

         /// BARRE DEVIE
         this.healthBar = this.add.graphics();
         this.drawHealthBar();
         this.healthBar.setScrollFactor(0);
         this.healthBar.setPosition(140, 80);

        

       //CAMERA
       this.cameras.main.startFollow(this.player);
       this.cameras.main.setZoom(1.1);
       this.cameras.main.setBounds(-50, -25, map.widthInPixels + 50, map.heightInPixels);

       //MUSIC
       if (this.sound.get("Ambiance")) {  // Remplace "Ambiance" par le nom réel de la musique d'ambiance
        this.sound.get("Ambiance").stop();
       }
       this.music = this.sound.add("BossFight", { loop: true, volume: 0.05 });
       this.music.play();

       //TIR AVEC SOURIS 
        // Gestion du tir avec le clic de souris (prévenir le tir continu)
        this.input.on('pointerdown', (pointer) => {
            if (!this.isShooting && pointer.leftButtonDown()) {
                this.isShooting = true;
                this.tirer();  // Tire une balle
            }
        });

        // Réactiver le tir une fois que le clic est relâché
        this.input.on('pointerup', () => {
            this.isShooting = false;  // Permet de tirer à nouveau au prochain clic
        });
  }
      
       
  onPortalOverlap() {
    if (this.burgers.countActive(true) === 0) {
        if (this.music) {
            this.music.stop();
        }
        // Sauvegarde de la progression avant de commencer un autre niveau
        localStorage.setItem("niveauBossComplete", "true");
        this.sound.play("TPportail", { volume: 0.1 } );
        this.scene.start("Hub");
    }
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
        let baseSpeed = 160;
        let speedMultiplier = this.keyShift.isDown ? 1.6 : 1; // 1.5x plus rapide avec Shift
        let speed = baseSpeed * speedMultiplier;
        let diagonalSpeed = Math.sqrt(speed * speed / 2);
        
        let movingX = false;
        let movingY = false;

        // Déplacements avec Z, Q, S, D
        if (this.keyLeft.isDown) {
            this.player.setVelocityX(-speed);
            this.player.setFlipX(true); // Marche vers la gauche
            this.player.anims.play("walk", true);
            this.lastDirection = "left";
            movingX = true;
        } else if (this.keyRight.isDown) {
            this.player.setVelocityX(speed);
            this.player.setFlipX(false); // Marche vers la gauche
            this.player.anims.play("walk", true);
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

        //ANIMATION MORT
        if (this.currentHealth <= 0) {
            this.player.anims.play("dead", true);
            this.player.body.moves = false;
        }
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
            delay: 1000,  // La balle disparaît après 2 secondes
            callback: () => bullet.destroy(),
            loop: false
        });
    
        // Réduire le nombre de balles disponibles
        this.currentBullets--;
        this.bulletCountText.setText(`Balles restantes : ${this.currentBullets}`);
    
        console.log(`Balles restantes : ${this.currentBullets}`);
    
        // Jouer le son BouleFeu
        this.sound.play("BouleFeu", { volume: 0.05});
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
                    this.bulletCountText.setText(`Balles restantes : ${this.currentBullets}`);
                    reloadInterval.remove(); // Stopper l'intervalle
                }
            },
            loop: true
        });
    }

   

    hitPlayer(player, burger) {
        // Vérifier si le burger touché est le boss
        if (burger === this.boss) {
            // Si le joueur touche le boss, il meurt directement
            console.log("Le joueur a touché le boss ! Mort immédiate.");
            
            // Réduire instantanément la vie du joueur à zéro
            this.currentHealth = 0;
            
            // Jouer le son de dégâts
            this.sound.play("DegatPlayer", { volume: 0.1 });
    
            // Redémarrer la scène ou gérer la mort du joueur
            this.handlePlayerDeath();
        } else {
            console.log("Le joueur a été touché par un burger !");
            
            // Si ce n'est pas le boss, on applique la logique habituelle de dégâts
            let burgerDamage = burger.getData('damage') || 1;
            
            // Réduire la vie du joueur
            this.currentHealth -= burgerDamage;
    
            // Jouer le son de dégâts
            this.sound.play("DegatPlayer", { volume: 0.1 });
    
            // Détruire le burger qui a touché le joueur
            burger.destroy();
    
        
            // Si la vie du joueur est à zéro ou moins, déclenche sa mort
            if (this.currentHealth <= 0) {
                this.handlePlayerDeath();
            }
        }
    }
    
    handlePlayerDeath() {
        // Réinitialiser la scène ou traiter la mort du joueur
        this.burgersToKill = this.maxBurgers;
        
    
        // Attendre un court instant, puis redémarrer la scène
        this.time.delayedCall(400, () => {
            this.currentHealth = this.maxHealth; // Réinitialiser la vie du joueur
            this.burgers.clear(true, true); // Supprimer tous les burgers
            this.burgersSpawned = 0; // Remettre à zéro le compteur de burgers
            this.boss = false
            // Redémarre la scène après l'animation
            this.scene.restart();
        });
    }
    
    hitBurger(bullet, burger) {
        bullet.destroy(); // Détruire la balle
    
        // Réduire la vie du burger
        let burgerHealth = burger.getData('health');
        burger.setData('health', burgerHealth - 1);
    
        // Si la vie du burger est inférieure ou égale à zéro, le détruire
        if (burger.getData('health') <= 0) {
            this.sound.play("burgerDeath", { volume: 0.1 });
            burger.destroy();
        }
    }

    


    
}