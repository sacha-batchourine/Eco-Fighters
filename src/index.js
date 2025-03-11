import Phaser from 'phaser';
import Hub from "./js/Hub.js"; // Si Hub.js se trouve dans le dossier js
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
      default: 'arcade',
      arcade: { debug: false }
  },
  scene: [Hub]
};

const game = new Phaser.Game(config);