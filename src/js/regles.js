export default class Regles extends Phaser.Scene {
    constructor() {
        super({ key: "Regles" });
    }

    preload() {
        this.load.image("fond2", "src/assets/fond2.png");  // Fond de la scène
        this.load.image("quit", "src/assets/quit.png");  // Bouton "Quitter"
    }

    create() {
        let largeur = this.scale.width;
        let hauteur = this.scale.height;

        // Ajout du fond d'écran
        let fond = this.add.image(0, 0, "fond2").setOrigin(0).setDepth(0);
        fond.setDisplaySize(largeur, hauteur);

        // Titre ECO-FIGHTERS
        let titre = this.add.text(largeur / 2, hauteur * 0.1, "ECO-FIGHTERS", {
            font: "48px CloisterBlack",
            fill: "#000000",
            align: "center"
        }).setOrigin(0.5).setDepth(2).setAlpha(0);

        // Animation du titre (apparition)
        this.tweens.add({
            targets: titre,
            alpha: 1,
            duration: 1000,
            ease: "Power2"
        });

        let texte = 
    "🕹️ Commandes :\n" +
    "- Déplacement : ZQSD\n" +
    "- Tirer / Viser : Souris\n" +
    "- Recharger : R\n" +
    "- Accélérer : Shift\n" +
    "- Interagir : Entrée\n" + // Ajout de la commande pour interagir avec le PNJ
    "\n" + // Adding a new line for better formatting
    "🎯 Objectif :\n" +
    "- Élimine tous les burgers 🍔 pour passer au niveau suivant !\n" +
    "- Pense à interagir avec le PNJ pour suivre ce que le peuple pense."; // Ajout de l'instruction d'interaction
        let reglesTexte = this.add.text(largeur / 2, hauteur / 2, texte, {
            font: "28px Arial",  
            fill: "#000000",
            align: "center",  // Assurer l'alignement centré
            lineSpacing: 10,
            wordWrap: { width: 700 }  // Ajustement pour éviter que le texte dépasse
        }).setOrigin(0.5).setDepth(2).setAlpha(0);

        // Animation d'apparition du texte
        this.tweens.add({
            targets: reglesTexte,
            alpha: 1,
            duration: 1500,
            ease: "Power2"
        });

        // Bouton retour au menu
        let boutonRetour = this.add.image(largeur / 2, hauteur * 0.85, "quit").setDepth(2).setInteractive();

        boutonRetour.on("pointerover", () => boutonRetour.setScale(1.1));
        boutonRetour.on("pointerout", () => boutonRetour.setScale(1));
        boutonRetour.on("pointerup", () => this.scene.start("Menu"));
    }
}