export default class NiveauBoss extends Phaser.Scene {
    constructor() {
        super({ key: "NiveauBoss" });
        this.maxHealth = 5; // Vie maximale en cœurs
        this.currentHealth = this.maxHealth; // Vie actuelle
        this.maxBurgers = 10;
        this.burgersSpawned = 0;
        this.ballesTirees = 0; // Compteur de balles tirées
        this.isRecharging = false; // État de recharge
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
        this.player = this.physics.add.sprite(100, 978, "img_perso");
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

        
        //TOUCHES
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.shootKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A); 

        //COLISIONS
        mursLayer.setCollisionByProperty({ estSolide: true });
        this.physics.add.collider(this.player, mursLayer);
        this.physics.add.collider(this.bullets, this.burgers, this.hitBurger, null, this);
        this.physics.add.collider(this.bullets, mursLayer, (bullet) => bullet.destroy());

        
        //PORTAIL
        this.portal = this.physics.add.sprite(1000, 1000, "portail").setImmovable(true);
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

  }
      
       
  onPortalOverlap() {
    if (this.burgers.countActive(true) === 0) {
        // Sauvegarde de la progression avant de commencer un autre niveau
        localStorage.setItem("niveauBossComplete", "true");
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
        this.currentHealth -= 1;
        burger.destroy();

        if (this.currentHealth <= 0) {
            console.log("Game Over");
            this.currentHealth = this.maxHealth;
            this.burgers.clear(true, true);
            this.scene.restart();
        }
    }
    
    hitBurger(bullet, burger) {
        bullet.destroy();
        burger.destroy();
    }

    updateHealth() {
        this.healthIcons.forEach((heart, index) => {
            heart.setVisible(index < this.currentHealth);
        });
    }
}