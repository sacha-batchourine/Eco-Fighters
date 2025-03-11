
import Hub from "./js/Hub.js";
import Menu from "./js/menu.js";

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: { debug: false }
    },
    scene: [Menu, Hub]  // On définit les scènes ici, dans l'ordre
};

const game = new Phaser.Game(config);