// Importation des scènes
import Menu from './menu.js';
import Hub from './Hub.js';

// Configuration du jeu
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 300 },
      debug: false
    }
  },
  scene: [Menu, Hub], // Ajoute les scènes
};

// Création du jeu
const game = new Phaser.Game(config);