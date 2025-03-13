import Synop from "./js/synop.js";  // Importer Synop
import Hub from "./js/Hub.js";
import Menu from "./js/menu.js";
import Niveau1 from "./js/niveau1.js";
import Niveau2 from "./js/niveau2.js";
import Niveau3 from "./js/niveau3.js";
import Niveau4 from "./js/niveau4.js";
import Niveau5 from "./js/niveau5.js";
import NiveauBoss from "./js/boss.js";
import Fin from "./js/fin.js";
import Regles from "./js/regles.js";

const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [Menu, Hub, Niveau1, Niveau2, Niveau3, Niveau4, Niveau5, NiveauBoss, Synop, Fin, Regles]  // Le jeu commence avec la scène "Menu"
};




// Création et lancement du jeu
const game = new Phaser.Game(config);
game.scene.start("Menu");  // Lancement de la scène "Menu"