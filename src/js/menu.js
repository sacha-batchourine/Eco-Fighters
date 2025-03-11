export default class Menu extends Phaser.Scene {
    constructor() {
        super({ key: "Menu" });
    }

    preload() {
        // Chargement des ressources pour le menu
        this.load.image("menu_fond", "src/assets/fond.png");
        this.load.image("imageBoutonPlay", "src/assets/boutonstart.png");
    }

    create() {
        // Récupération des dimensions de l'écran
        let largeur = this.scale.width;
        let hauteur = this.scale.height;

        // Ajout du fond d'écran et adaptation à la taille de l'écran
        let fond = this.add.image(0, 0, "menu_fond").setOrigin(0).setDepth(0);
        fond.setDisplaySize(largeur, hauteur); // Ajuste la taille du fond

        // Ajout du bouton de démarrage
        let boutonPlay = this.add.image(largeur / 2, hauteur / 2, "imageBoutonPlay").setDepth(1);
        boutonPlay.setInteractive();

        // Animation du bouton au survol
        boutonPlay.on("pointerover", () => {
            boutonPlay.setScale(1.1);  // Agrandissement du bouton
        });

        boutonPlay.on("pointerout", () => {
            boutonPlay.setScale(1);  // Réduction du bouton à sa taille normale
        });

        // Lancement de la scène Hub quand on clique sur le bouton
        boutonPlay.on("pointerup", () => {
            this.scene.start("Hub");  // Démarre la scène Hub
        });
    }
}
