export default class Hub extends Phaser.Scene {
    constructor() {
        super({ key: "Hub" });
        this.maxHealth = 5;
        this.currentHealth = this.maxHealth;
        this.dialogues = [
            "Salut, aventurier ! Ta mission commence ici. Ensemble, nous allons éliminer cette menace grasse qui pèse sur notre monde.",
            "Bravo, tu as terminé le premier défi ! Ces burgers sont à peine une mise en bouche. Prépare-toi à en découdre avec plus de ces créatures !",
            "Bien joué ! Chaque burger que tu vaincs nous redonne espoir. Continue ainsi, et montre-leur de quoi tu es capable !",
            "Superbe travail ! Tu es notre héros. Continue de te battre, et n’oublie pas que nous sommes tous derrière toi !",
            "Tu es si proche du but ! Les plus gros burgers t'attendent. Rappelle-toi, chaque pas compte dans cette aventure !",
            "Attention, le boss approche ! C'est le moment de montrer ta vraie force. Rappelle-toi, tu as déjà accompli tant de choses !",
            "Félicitations, héros ! Grâce à toi, nous sommes enfin libres. Ton courage et ta détermination resteront gravés dans nos cœurs à jamais."
        ];
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
        this.load.audio("Ambiance", "src/assets/Ambiance.mp3"); 
        this.load.audio("TPportail", "src/assets/TPportail.mp3");
        this.load.spritesheet("pnj1", "src/assets/pnj1.png", { frameWidth: 48, frameHeight: 48 });
    }

    create() {
        // Création de la carte
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
        
        // PLAYER
        this.player = this.physics.add.sprite(145, 325, "img_perso"); 
        this.player.setScale(2);
        this.lastDirection = "right";

        this.anims.create({
            key: "stand", frames: this.anims.generateFrameNumbers("img_perso", { start: 30, end: 32 }), frameRate: 10, repeat: -1
        });
        this.anims.create({
            key: "walk_right", frames: this.anims.generateFrameNumbers("img_perso", { start: 26, end: 28 }), frameRate: 10, repeat: -1
        });

        this.bullets = this.physics.add.group();
        
        // Touches
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keyUp = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);   // Z pour haut
        this.keyLeft = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q); // Q pour gauche
        this.keyDown = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S); // S pour bas
        this.keyRight = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D); // D pour droite
        this.keyShift = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
        this.keyEnter = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
        
// PNJ
this.pnj = this.physics.add.sprite(240, 260, "pnj1").setScale(1).setImmovable(true);
this.physics.add.overlap(this.player, this.pnj, this.onPnjOverlap, null, this);
// Dans la méthode create
this.dialogueBox = this.add.text(400, 300, "", { 
    font: "16px Arial", 
    fill: "#ffffff", 
    wordWrap: { width: 300, useAdvancedWrap: true } // Ajustez la largeur selon vos besoins
}).setOrigin(0.5).setVisible(false);


        // Collisions
        this.physics.add.collider(this.player, murLayer);
        this.physics.add.collider(this.bullets, murLayer, (bullet) => bullet.destroy());

        // Vérifier la progression
        const niveau1Terminé = localStorage.getItem("niveau1Complete") === "true";
        const niveau2Terminé = localStorage.getItem("niveau2Complete") === "true";
        const niveau3Terminé = localStorage.getItem("niveau3Complete") === "true";
        const niveau4Terminé = localStorage.getItem("niveau4Complete") === "true";
        const niveau5Terminé = localStorage.getItem("niveau5Complete") === "true";
        const niveauBossTerminé = localStorage.getItem("niveauBossComplete") === "true";

        // Portail pour Niveau 1
        this.portal1 = this.physics.add.sprite(432, 175, "portail").setImmovable(true);
        this.portal1.setFrame(0); // Première frame pour le portail 1
        this.physics.add.overlap(this.player, this.portal1, this.onPortal1Overlap, null, this);

        // Portail pour Niveau 2
        this.portal2 = this.physics.add.sprite(623, 560, "portail").setImmovable(true);
        this.portal2.setVisible(niveau1Terminé);
        this.portal2.body.enable = niveau1Terminé;
        if (niveau1Terminé) {
            this.portal2.setFrame(1); // Deuxième frame pour le portail 2
            this.physics.add.overlap(this.player, this.portal2, this.onPortal2Overlap, null, this);
        }

        // Portail pour Niveau 3
        this.portal3 = this.physics.add.sprite(880, 240, "portail").setImmovable(true);
        this.portal3.setVisible(niveau2Terminé);
        this.portal3.body.enable = niveau2Terminé;
        if (niveau2Terminé) {
            this.portal3.setFrame(2); // Troisième frame pour le portail 3
            this.physics.add.overlap(this.player, this.portal3, this.onPortal3Overlap, null, this);
        }

        // Portail pour Niveau 4
        this.portal4 = this.physics.add.sprite(1040, 495, "portail").setImmovable(true);
        this.portal4.setVisible(niveau3Terminé);
        this.portal4.body.enable = niveau3Terminé;
        if (niveau3Terminé) {
            this.portal4.setFrame(3); // Quatrième frame pour le portail 4
            this.physics.add.overlap(this.player, this.portal4, this.onPortal4Overlap, null, this);
        }

        // Portail pour Niveau 5
        this.portal5 = this.physics.add.sprite(1170, 142, "portail").setImmovable(true);
        this.portal5.setVisible(niveau4Terminé);
        this.portal5.body.enable = niveau4Terminé;
        if (niveau4Terminé) {
            this.portal5.setFrame(4); // Cinquième frame pour le portail 5
            this.physics.add.overlap(this.player, this.portal5, this.onPortal5Overlap, null, this);
        }

        // ✅ Portail pour le Boss (se débloque après Niveau 5)
        this.portalBoss = this.physics.add.sprite(1455, 335, "portail").setImmovable(true);
        this.portalBoss.setVisible(niveau5Terminé);
        this.portalBoss.body.enable = niveau5Terminé;
        if (niveau5Terminé) {
            this.portalBoss.setFrame(5); // Sixième frame pour le portail Boss
            this.physics.add.overlap(this.player, this.portalBoss, this.onPortalBossOverlap, null, this);
        }

        // ✅ Portail pour Fin (se débloque après Niveau Boss)
        this.portalFin = this.physics.add.sprite(300, 335, "portail").setImmovable(true);
        this.portalFin.setVisible(niveauBossTerminé);
        this.portalFin.body.enable = niveauBossTerminé;
        if (niveauBossTerminé) {
            this.portalFin.setFrame(6);  // Septième frame pour le portail Fin
            this.physics.add.overlap(this.player, this.portalFin, this.onPortalFinOverlap, null, this);
        }

        // Caméra
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setZoom(1.1);
        this.cameras.main.setBounds(-50, -25, map.widthInPixels + 50, map.heightInPixels);

        //MUSIC
        if (this.music) {
            this.music.stop(); // Arrêter la musique actuelle
        }
        this.music = this.sound.add("Ambiance", { loop: true, volume: 0.02 });
        this.music.play();
    }

    // Fonctions de changement de niveau
    onPortal1Overlap(player, portal) {
        this.sound.play("TPportail", { volume: 0.1 } );
        this.scene.start("Niveau1");
    }

    onPortal2Overlap(player, portal) {
        this.sound.play("TPportail", { volume: 0.1 } );
        this.scene.start("Niveau2");
    }

    onPortal3Overlap(player, portal) {
        this.sound.play("TPportail", { volume: 0.1 } );
        this.scene.start("Niveau3");
    }

    onPortal4Overlap(player, portal) {
        this.sound.play("TPportail", { volume: 0.1 } );
        this.scene.start("Niveau4");
    }

    onPortal5Overlap(player, portal) {
        this.sound.play("TPportail", { volume: 0.1 } );
        this.scene.start("Niveau5");
    }

    onPortalBossOverlap(player, portal) {
        this.sound.play("TPportail", { volume: 0.1 } );
        this.scene.start("NiveauBoss");
    }

    // Nouvelle fonction pour le portail vers Fin
    onPortalFinOverlap(player, portal) {
        console.log("Portail Fin activé");  // Vérification dans la console
        this.scene.start("Fin");
    }
    onPnjOverlap(player, pnj) {
        if (Phaser.Input.Keyboard.JustDown(this.keyEnter)) { // Vérifie si Entrée est pressée
            const niveauxTermines = [
                localStorage.getItem("niveau1Complete") === "true",
                localStorage.getItem("niveau2Complete") === "true",
                localStorage.getItem("niveau3Complete") === "true",
                localStorage.getItem("niveau4Complete") === "true",
                localStorage.getItem("niveau5Complete") === "true",
                localStorage.getItem("niveauBossComplete") === "true"
            ];
    
            let messageIndex = niveauxTermines.filter(Boolean).length; // Compte le nombre de niveaux terminés
            if (messageIndex < this.dialogues.length) {
                this.showDialogue(messageIndex); // Affiche le message correspondant
            }
        }
    }
    
    showDialogue(index) {
        this.dialogueBox.setText(this.dialogues[index]).setVisible(true);
        this.time.delayedCall(3000, () => { this.dialogueBox.setVisible(false); }); // Masque le dialogue après 2 secondes
    }

    update() {
        let baseSpeed = 160;
        let speedMultiplier = this.keyShift.isDown ? 1.6 : 1; // 1.5x plus rapide avec Shift
        let speed = baseSpeed * speedMultiplier;
        let diagonalSpeed = Math.sqrt(speed * speed / 2);
    
        let movingX = false;
        let movingY = false;
    
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
    
        if (movingX && movingY) {
            this.player.setVelocityX(this.player.body.velocity.x * diagonalSpeed / speed);
            this.player.setVelocityY(this.player.body.velocity.y * diagonalSpeed / speed);
        }
    
        if (!movingX && !movingY) {
            this.player.anims.play("stand", true);
        }
        // Ajoutez l'événement beforeunload pour effacer les données du localStorage avant de quitter
window.addEventListener("beforeunload", () => {
    // Supprimer les données du localStorage lorsque l'utilisateur quitte la page
    localStorage.removeItem("niveau1Complete");
    localStorage.removeItem("niveau2Complete");
    localStorage.removeItem("niveau3Complete");
    localStorage.removeItem("niveau4Complete");
    localStorage.removeItem("niveau5Complete");
    localStorage.removeItem("niveauBossComplete");
});
        
    }}

