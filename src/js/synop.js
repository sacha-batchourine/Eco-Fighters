export default class Synop extends Phaser.Scene {
    constructor() {
        super({ key: "Synop" });
    }

    preload() {
        // Chargement des ressources nécessaires pour cette scène
        this.load.image("fond2", "src/assets/fond2.png");  // Charger l'image de fond pour la scène Synop
        this.load.image("quit", "src/assets/quit.png");  // Charger l'image du bouton "Quitter"
    }

    create() {
        // Récupération des dimensions de l'écran
        let largeur = this.scale.width;
        let hauteur = this.scale.height;

        // Ajout du fond d'écran pour Synop
        let fond = this.add.image(0, 0, "fond2").setOrigin(0).setDepth(0);
        fond.setDisplaySize(largeur, hauteur);

        // Ajout du titre "ECO-FIGHTERS" avec la même police que dans le menu
        let titre = this.add.text(largeur / 2, hauteur * 0.1, "ECO-FIGHTERS", {
            font: "48px CloisterBlack",  // Utilisation de la même police que dans Menu
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

        // Le synopsis du jeu
        let synopsis = this.add.text(largeur / 2, hauteur * 0.4, 
            `L'histoire se déroule au XXIe siècle, mais une étrange aventure attend notre héroïne : une banane pas comme les autres. 
            Téléportée accidentellement à l'époque des chevaliers et de la magie, elle se retrouve dans un monde où les mages dominent 
            et où la malbouffe commence à se propager comme une malédiction.
            
            C'est un monde où des burgers maléfiques envahissent tout, où chaque bouchée peut provoquer la fin du bien-être et de la santé.
            En tant que représentante des fruits et légumes, elle est notre seule chance pour éradiquer cette menace.

            Sa mission ? Trouver et détruire tous les burgers avant qu'ils n'atteignent notre époque, sauvant ainsi les générations futures de cette menace insidieuse. 
            À travers des batailles épiques et des aventures fantastiques, notre banane va prouver que même la plus petite des créatures peut changer le cours de l'histoire !`, 
            {
                font: "22px Arial",
                fill: "#000000",
                align: "center",
                wordWrap: { width: largeur * 0.8, useAdvancedWrap: true }
            }
        ).setOrigin(0.5);

        // Vérification du depth du texte
        synopsis.setDepth(2);

        // Ajout du bouton "Quitter" pour retourner au Menu
        let boutonQuit = this.add.image(largeur / 2, hauteur * 0.85, "quit").setDepth(1);
        boutonQuit.setInteractive();

        // Animation du bouton "Quitter" au survol
        boutonQuit.on("pointerover", () => {
            boutonQuit.setScale(1.1);
        });

        boutonQuit.on("pointerout", () => {
            boutonQuit.setScale(1);
        });

        // Retour au Menu quand le bouton est cliqué
        boutonQuit.on("pointerup", () => {
            this.scene.start("Menu");  // Retourne à la scène "Menu"
        });
    }
}