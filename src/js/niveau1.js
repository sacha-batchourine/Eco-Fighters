export default class Niveau1 extends Phaser.Scene {
  constructor() {
      super({ key: "Niveau1" });
  }

  preload() {
      this.load.tilemapTiledJSON("mapN1", "src/assets/mapN1.json");
      this.load.image("Grass", "src/assets/TX Tileset Grass.png");
      this.load.image("Mur", "src/assets/TX Tileset Wall.png");
      this.load.image("Sol", "src/assets/TX Tileset Stone Ground.png");
      this.load.image("Props", "src/assets/TX Props.png");
      this.load.image("Plant", "src/assets/TX Plant.png");

      this.load.spritesheet("img_perso", "src/assets/Perso.png", {
          frameWidth: 48,
          frameHeight: 48
      });
  }

  create() {
       // Chargement de la carte
       const map = this.make.tilemap({ key: "mapN1" });

       // Ajout des tilesets dans l'ordre
       const tilesetGrass = map.addTilesetImage("TX Plant", "Grass");
       const tilesetChemin = map.addTilesetImage("TX Props", "Chemin");
       const tilesetOmbres = map.addTilesetImage("TX Shadow Plant", "Ombres");
       const tilesetMur = map.addTilesetImage("TX Tileset Wall", "Mur");
       const tilesetVillage = map.addTilesetImage("TX Village Props", "Village");
       const tilesetEcriture = map.addTilesetImage("TX Props", "Ecriture");
 
       // Création des calques en respectant l'ordre donné
       const grassLayer = map.createLayer("Grass", [tilesetGrass]);
       const cheminLayer = map.createLayer("Chemin", [tilesetChemin, tilesetGrass]);
       const ombresLayer = map.createLayer("Ombres", tilesetOmbres);
       const mursLayer = map.createLayer("Murs", [tilesetMur, tilesetChemin, tilesetVillage]);
       const ecritureLayer = map.createLayer("Ecriture", tilesetEcriture);
 

      // Ajout du joueur dans le niveau 1
      this.player = this.physics.add.sprite(100, 100, "img_perso"); // Spawn à l'entrée du niveau 1
      this.player.setCollideWorldBounds(true);

      // Activer le clavier
      this.cursors = this.input.keyboard.createCursorKeys();

      
  }

  update() {
      let moving = false;

      if (this.cursors.left.isDown) {
          this.player.setVelocityX(-160);
          moving = true;
      } else if (this.cursors.right.isDown) {
          this.player.setVelocityX(160);
          moving = true;
      } else {
          this.player.setVelocityX(0);
      }

      if (this.cursors.up.isDown) {
          this.player.setVelocityY(-160);
          moving = true;
      } else if (this.cursors.down.isDown) {
          this.player.setVelocityY(160);
          moving = true;
      } else {
          this.player.setVelocityY(0);
      }

      if (!moving) {
          this.player.anims.stop();
      }
  }
}