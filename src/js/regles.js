export default class Regles extends Phaser.Scene {
    constructor() {
        super({ key: "Regles" }); // Assure-toi que cette clé est utilisée partout
    }

    preload() {
        this.load.image("fond2", "src/assets/fond2.png");  // Charger l'image de fond pour la scène Synop
        this.load.image("quit", "src/assets/quit.png");  // Charger l'image du bouton "Quitter"
    }

    create() {
        let largeur = this.scale.width;
        let hauteur = this.scale.height;

        // Ajout du fond d'écran pour Synop
        let fond = this.add.image(0, 0, "fond2").setOrigin(0).setDepth(0);
        fond.setDisplaySize(largeur, hauteur);

        // Titre
        let titre = this.add.text(largeur / 2, hauteur * 0.2, "ECO-FIGHTERS", {
            font: "48px CloisterBlack",
            fill: "#000000",
            align: "center"
        }).setOrigin(0.5).setDepth(2).setAlpha(0);

        // Animation du titre (apparition progressive)
        this.tweens.add({
            targets: titre,
            alpha: 1,
            duration: 1000,
            ease: "Power2"
        });

        // Bouton retour au menu
        let boutonRetour = this.add.image(largeur / 2, hauteur * 0.85, "quit").setDepth(1).setInteractive();
        
        boutonRetour.on("pointerover", () => boutonRetour.setScale(1.1));
        boutonRetour.on("pointerout", () => boutonRetour.setScale(1));
        boutonRetour.on("pointerup", () => this.scene.start("Menu"));
    }
}