export default class Menu extends Phaser.Scene {
    constructor() {
        super({ key: "Menu" });
    }

    preload() {
        // Chargement des ressources pour le menu
        this.load.image("menu_fond", "src/assets/fond.png");
        this.load.image("imageBoutonPlay", "src/assets/boutonstart.png");
        this.load.image("parchemin", "src/assets/parchemin.png");  // Charger l'image du parchemin
        this.load.image("imageBoutonOptions", "src/assets/options.png");  // Charger l'image du bouton "Options"
    }

    create() {
        // Récupération des dimensions de l'écran
        let largeur = this.scale.width;
        let hauteur = this.scale.height;

        // Ajout du fond d'écran et adaptation à la taille de l'écran
        let fond = this.add.image(0, 0, "menu_fond").setOrigin(0).setDepth(0);
        fond.setDisplaySize(largeur, hauteur);

        // Ajout de l'image de parchemin
        let parchemin = this.add.image(largeur / 2, hauteur * 0.2, "parchemin").setDepth(1);
        parchemin.setOrigin(0.5, 0.5);
        parchemin.setDisplaySize(800, 200);

        // Ajout du titre avec la police CloisterBlack
        let titre = this.add.text(largeur / 2, hauteur * 0.2, "ECO-FIGHTERS", {
            font: "48px CloisterBlack",
            fill: "#000000",
            align: "center"
        }).setOrigin(0.5);

        // Vérification du depth du texte
        titre.setDepth(2);

        // Animation du titre
        titre.setAlpha(0);
        this.tweens.add({
            targets: titre,
            alpha: 1,
            duration: 1000,
            ease: "Power2"
        });

        // Ajout du bouton de démarrage
        let boutonPlay = this.add.image(largeur / 2, hauteur / 2, "imageBoutonPlay").setDepth(1);
        boutonPlay.setInteractive();

        // Animation du bouton au survol
        boutonPlay.on("pointerover", () => {
            boutonPlay.setScale(1.1);
        });

        boutonPlay.on("pointerout", () => {
            boutonPlay.setScale(1);
        });

        // Lancement de la scène Hub quand on clique sur le bouton
        boutonPlay.on("pointerup", () => {
            this.scene.start("Hub");
        });

        // Ajout du bouton Options
        let boutonOptions = this.add.image(largeur / 2, hauteur * 0.75, "imageBoutonOptions").setDepth(1);
        boutonOptions.setInteractive();

        // Animation du bouton au survol
        boutonOptions.on("pointerover", () => {
            boutonOptions.setScale(1.1);
        });

        boutonOptions.on("pointerout", () => {
            boutonOptions.setScale(1);
        });

        // Lancement de la scène Synop (Options) quand on clique sur le bouton
        boutonOptions.on("pointerup", () => {
            this.scene.start("Synop");  // Changer de scène pour Synop
        });
    }
}