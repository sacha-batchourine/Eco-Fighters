// index.js ou votre fichier principal où vous configurez le jeu

import Hub from '/src/js/Hub.js';  // Le chemin est relatif, et ça doit pointer vers Hub.js dans /src/js/

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
      default: 'arcade',
      arcade: { debug: false }
  },
  scene: [Hub]  // Ajouter la scène "Hub" ici
};

const game = new Phaser.Game(config);  // Initialiser le jeu avec la configuration