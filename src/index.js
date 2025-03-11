
import Hub from "./js/Hub.js";
import Menu from "./js/menu.js";

const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,  // Largeur adaptative à l'écran
    height: window.innerHeight, // Hauteur adaptative à l'écran
    physics: {
        default: "arcade",
        arcade: { 
            gravity: { y: 0 }, 
            debug: false 
        }
    },
    scale: {
        mode: Phaser.Scale.FIT,  // Ajuste le jeu à la fenêtre sans distorsion
        autoCenter: Phaser.Scale.CENTER_BOTH  // Centre le jeu dans la fenêtre
    },
    scene: [Menu, Hub]  // Définition des scènes
};

// Création et lancement du jeu
const game = new Phaser.Game(config);
game.scene.start("Menu");  // Lancement de la scène "Menu"
