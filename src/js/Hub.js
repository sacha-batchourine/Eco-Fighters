export default class Hub extends Phaser.Scene {
    constructor() {
        super({ key: "Hub" }); // Initialise la scène avec la clé "Hub"
        this.dialogues = [ // Tableau des dialogues du PNJ
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
        // Chargement des assets (images, sons, spritesheets, etc.)
        this.load.tilemapTiledJSON("HUB1", "src/assets/HUB1.json"); // Carte du hub
        this.load.image("Grass", "src/assets/TX Tileset Grass.png"); // Texture d'herbe
        this.load.image("Mur", "src/assets/TX Tileset Wall.png"); // Texture de mur
        this.load.image("Sol", "src/assets/TX Tileset Stone Ground.png"); // Texture de sol
        this.load.image("Props", "src/assets/TX Props.png"); // Props (décors)
        this.load.image("Plant", "src/assets/TX Plant.png"); // Plantes
        this.load.spritesheet("img_perso", "src/assets/banane.png", { frameWidth: 32, frameHeight: 32 }); // Spritesheet du joueur
        this.load.spritesheet("portail", "src/assets/portal4.png", { frameWidth: 32, frameHeight: 32 }); // Spritesheet des portails
        this.load.image("bullet", "src/assets/balles.png"); // Image des balles
        this.load.audio("Ambiance", "src/assets/Ambiance.mp3"); // Musique d'ambiance
        this.load.audio("TPportail", "src/assets/TPportail.mp3"); // Son de téléportation
        this.load.spritesheet("pnj1", "src/assets/pnj1.png", { frameWidth: 48, frameHeight: 48 }); // Spritesheet du PNJ
    }

    create() {
        // Création de la carte
        const map = this.make.tilemap({ key: "HUB1" }); // Charge la carte depuis le fichier JSON
        const tilesetGrass = map.addTilesetImage("TX Tileset Grass", "Grass"); // Ajoute l'herbe
        const tilesetMur = map.addTilesetImage("TX Tileset Wall", "Mur"); // Ajoute les murs
        const tilesetSol = map.addTilesetImage("TX Tileset Stone Ground", "Sol"); // Ajoute le sol
        const tilesetProps = map.addTilesetImage("TX Props", "Props"); // Ajoute les props
        const tilesetPlant = map.addTilesetImage("Plant", "Plant"); // Ajoute les plantes

        // Création des calques de la carte
        map.createLayer("Grass", [tilesetGrass]); // Calque d'herbe
        const murLayer = map.createLayer("Mur", [tilesetMur]); // Calque de murs (avec collisions)
        map.createLayer("Sol/chemins", [tilesetGrass, tilesetSol]); // Calque de sol et chemins
        map.createLayer("Portail", [tilesetProps]); // Calque des portails
        map.createLayer("Decors", [tilesetProps]); // Calque des décors
        map.createLayer("Details", [tilesetProps, tilesetPlant, tilesetMur]); // Calque des détails

        murLayer.setCollisionByExclusion([-1]); // Active les collisions pour les murs
        this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels); // Définit les limites du monde physique

        // Joueur
        this.player = this.physics.add.sprite(145, 325, "img_perso"); // Crée le joueur
        this.player.setScale(2); // Agrandit le joueur
        this.lastDirection = "right"; // Dernière direction du joueur

        // Animations du joueur
        this.anims.create({
            key: "stand", // Animation d'attente
            frames: this.anims.generateFrameNumbers("img_perso", { start: 30, end: 32 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: "walk_right", // Animation de marche vers la droite
            frames: this.anims.generateFrameNumbers("img_perso", { start: 26, end: 28 }),
            frameRate: 10,
            repeat: -1
        });

        // Groupe de balles
        this.bullets = this.physics.add.group(); // Groupe de balles pour les tirs

        // Configuration des touches
        this.cursors = this.input.keyboard.createCursorKeys(); // Touches directionnelles
        this.keyUp = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z); // Z pour haut
        this.keyLeft = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q); // Q pour gauche
        this.keyDown = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S); // S pour bas
        this.keyRight = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D); // D pour droite
        this.keyShift = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT); // Shift pour courir
        this.keyEnter = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER); // Entrée pour interagir

        // PNJ
        this.pnj = this.physics.add.sprite(240, 260, "pnj1").setScale(1).setImmovable(true); // Crée le PNJ
        this.physics.add.overlap(this.player, this.pnj, this.onPnjOverlap, null, this); // Gère l'interaction avec le PNJ

        // Boîte de dialogue
        this.dialogueBox = this.add.text(400, 300, "", {
            font: "16px Arial",
            fill: "#ffffff",
            wordWrap: { width: 300, useAdvancedWrap: true } // Ajuste la largeur du texte
        }).setOrigin(0.5).setVisible(false); // Masque la boîte de dialogue par défaut

        // Collisions
        this.physics.add.collider(this.player, murLayer); // Collisions entre le joueur et les murs
        this.physics.add.collider(this.bullets, murLayer, (bullet) => bullet.destroy()); // Détruit les balles au contact des murs

        // Portails
        const createPortal = (x, y, frame, condition, overlapFunction) => {
            const portal = this.physics.add.sprite(x, y, "portail").setImmovable(true);
            portal.setFrame(frame); // Définit la frame du portail
            portal.setVisible(condition); // Affiche le portail si la condition est vraie
            portal.body.enable = condition; // Active les collisions si la condition est vraie
            if (condition) {
                this.physics.add.overlap(this.player, portal, overlapFunction, null, this); // Gère l'interaction avec le portail
            }
            return portal;
        };

        // Vérification de la progression des niveaux
        const niveau1Terminé = localStorage.getItem("niveau1Complete") === "true";
        const niveau2Terminé = localStorage.getItem("niveau2Complete") === "true";
        const niveau3Terminé = localStorage.getItem("niveau3Complete") === "true";
        const niveau4Terminé = localStorage.getItem("niveau4Complete") === "true";
        const niveau5Terminé = localStorage.getItem("niveau5Complete") === "true";
        const niveauBossTerminé = localStorage.getItem("niveauBossComplete") === "true";

        // Création des portails en fonction de la progression
        this.portal1 = createPortal(432, 175, 0, true, this.onPortalOverlap("Niveau1"));
        this.portal2 = createPortal(623, 560, 1, niveau1Terminé, this.onPortalOverlap("Niveau2"));
        this.portal3 = createPortal(880, 240, 2, niveau2Terminé, this.onPortalOverlap("Niveau3"));
        this.portal4 = createPortal(1040, 495, 3, niveau3Terminé, this.onPortalOverlap("Niveau4"));
        this.portal5 = createPortal(1170, 142, 4, niveau4Terminé, this.onPortalOverlap("Niveau5"));
        this.portalBoss = createPortal(1455, 335, 5, niveau5Terminé, this.onPortalOverlap("NiveauBoss"));
        this.portalFin = createPortal(300, 335, 6, niveauBossTerminé, this.onPortalOverlap("Fin"));

        // Caméra
        this.cameras.main.startFollow(this.player); // La caméra suit le joueur
        this.cameras.main.setZoom(1.1); // Zoom de la caméra
        this.cameras.main.setBounds(-50, -25, map.widthInPixels + 50, map.heightInPixels); // Limites de la caméra

        // Musique
        this.music = this.sound.add("Ambiance", { loop: true, volume: 0.02 }); // Musique d'ambiance
        this.music.play(); // Joue la musique
    }

    onPortalOverlap(sceneKey) {
        return () => {
            this.sound.play("TPportail", { volume: 0.1 }); // Joue le son de téléportation
            this.scene.start(sceneKey); // Change de scène
        };
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
                this.showDialogue(messageIndex); // Affiche le dialogue correspondant
            }
        }
    }

    showDialogue(index) {
        this.dialogueBox.setText(this.dialogues[index]).setVisible(true); // Affiche le dialogue
        this.time.delayedCall(2000, () => { this.dialogueBox.setVisible(false); }); // Masque le dialogue après 2 secondes
    }

    update() {
        let baseSpeed = 160; // Vitesse de base du joueur
        let speedMultiplier = this.keyShift.isDown ? 1.6 : 1; // Multiplicateur de vitesse si Shift est pressé
        let speed = baseSpeed * speedMultiplier; // Vitesse finale
        let diagonalSpeed = Math.sqrt(speed * speed / 2); // Vitesse diagonale (pour éviter d'aller plus vite en diagonale)

        let movingX = false; // Indique si le joueur se déplace horizontalement
        let movingY = false; // Indique si le joueur se déplace verticalement

        // Déplacement horizontal
        if (this.keyLeft.isDown) {
            this.player.setVelocityX(-speed);
            this.player.anims.play("walk_right", true);
            this.player.setFlipX(true); // Inverse l'image pour simuler la marche vers la gauche
            this.lastDirection = "left";
            movingX = true;
        } else if (this.keyRight.isDown) {
            this.player.setVelocityX(speed);
            this.player.anims.play("walk_right", true);
            this.player.setFlipX(false); // Réinitialise l'image pour la marche vers la droite
            this.lastDirection = "right";
            movingX = true;
        } else {
            this.player.setVelocityX(0);
        }

        // Déplacement vertical
        if (this.keyUp.isDown) {
            this.player.setVelocityY(-speed);
            movingY = true;
        } else if (this.keyDown.isDown) {
            this.player.setVelocityY(speed);
            movingY = true;
        } else {
            this.player.setVelocityY(0);
        }

        // Ajustement de la vitesse en diagonale
        if (movingX && movingY) {
            this.player.setVelocityX(this.player.body.velocity.x * diagonalSpeed / speed);
            this.player.setVelocityY(this.player.body.velocity.y * diagonalSpeed / speed);
        }

        // Animation d'attente si le joueur ne bouge pas
        if (!movingX && !movingY) {
            this.player.anims.play("stand", true);
        }

        // Efface les données du localStorage si l'utilisateur quitte la page
        window.addEventListener("beforeunload", () => {
            localStorage.removeItem("niveau1Complete");
            localStorage.removeItem("niveau2Complete");
            localStorage.removeItem("niveau3Complete");
            localStorage.removeItem("niveau4Complete");
            localStorage.removeItem("niveau5Complete");
            localStorage.removeItem("niveauBossComplete");
        });
    }
}