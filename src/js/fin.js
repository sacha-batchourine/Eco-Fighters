export default class Fin extends Phaser.Scene {
    constructor() {
        super({ key: 'Fin' });
    }

    preload() {
        // Charger les ressources nécessaires pour cette scène
        this.load.image('fond2', 'src/assets/fond2.png');  // Charger l'image de fond pour la scène Fin
        this.load.image('quit', 'src/assets/quit.png');  // Charger l'image du bouton "Quitter"
    }

    create() {
        // Récupération des dimensions de l'écran
        let largeur = this.scale.width;
        let hauteur = this.scale.height;

        // Ajout du fond d'écran pour Fin
        let fond = this.add.image(0, 0, 'fond2').setOrigin(0).setDepth(0);
        fond.setDisplaySize(largeur, hauteur);

        // Ajout du titre "ECO-FIGHTERS" avec la même police que dans le menu
        let titre = this.add.text(largeur / 2, hauteur * 0.12, "ECO-FIGHTERS", {
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

        // Texte de fin détaillé (ajusté plus bas)
        let texteFin = this.add.text(largeur / 2, hauteur * 0.45, 
        `La mission est accomplie ! Grâce à toi, la planète a été sauvée de la malbouffe !\n` +
        '\n' +
        `Tu es une banane du 21e siècle, propulsée par accident dans un passé lointain, à l'époque du Moyen-Âge.\n` +
        `Dans ce monde étrange, la magie et les mages étaient présents, mais une autre menace s'était aussi fait jour.\n` +
        `Les burgers, monstrueux et dévastateurs, étaient sur le point d'envahir notre monde, apportant avec eux la malbouffe et la destruction de la nature.\n` +
        '\n' +
        `Toi, avec ton courage et ta détermination, as traversé de nombreuses épreuves. Tu as combattu des vagues de burgers,\n` +
        `traversé des terres inconnues, et défié un terrible boss. Mais grâce à ta persévérance, tout cela appartient désormais au passé.\n` +
        `Les burgers ont été éliminés, et notre monde, ainsi que celui des fruits et légumes, est désormais en paix.\n` +
        '\n' +
        `Grâce à toi, la planète peut désormais respirer, et l'équilibre entre les êtres vivants a été préservé.\n` +
        `Tous les fruits, les légumes, et même la Terre elle-même te sont reconnaissants.\n` +
        '\n' +
        `Cependant, cette victoire n'est que le début. L'univers regorge encore de mystères, et il est possible que de nouveaux ennemis apparaissent.\n` +
        `Mais pour l'instant, profite de la paix retrouvée... et sois fier de ce que tu as accompli !\n` +
        '\n' +
        `Nous ne t'oublierons jamais, héroïque banane du 21e siècle... Merci pour tout !`, 
        {
            font: "22px Arial",
            fill: "#000000",
            align: "center",
            wordWrap: { width: largeur * 0.8, useAdvancedWrap: true }
        }).setOrigin(0.5);

        // Vérification du depth du texte
        texteFin.setDepth(2);

        // Ajouter un bouton "Quitter" pour retourner au Menu
        let boutonQuit = this.add.image(largeur / 2, hauteur * 0.85, 'quit').setDepth(1);
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