export default class niveau1 extends Phaser.Scene {
    constructor() {
      super({ key: "Hub" });
    }
  
    preload() {
      // Chargement de la carte Tiled (format JSON)
      this.load.tilemapTiledJSON("HUB1", "src/assets/HUB1.json");
  
      // Chargement des tilesets utilisés dans Tiled
      this.load.image("Grass", "src/assets/TX Tileset Grass.png");
      this.load.image("Mur", "src/assets/TX Tileset Wall.png");
      this.load.image("Sol", "src/assets/TX Tileset Stone Ground.png");
      this.load.image("Props", "src/assets/TX Props.png");
      this.load.image("Plant", "src/assets/TX Plant.png");
    }
  
    create() {
      // Chargement de la carte
      const map = this.make.tilemap({ key: "HUB1" });
  
      // Ajout des tilesets utilisés dans la carte
      const tilesetGrass = map.addTilesetImage("TX Tileset Grass", "Grass");
      const tilesetMur = map.addTilesetImage("TX Tileset Wall", "Mur");
      const tilesetSol = map.addTilesetImage("TX Tileset Stone Ground", "Sol");
      const tilesetProps = map.addTilesetImage("TX Props", "Props");
      const tilesetPlant = map.addTilesetImage("TX Plant", "Plant");
  
      // Création des calques de la carte en utilisant les tilesets
      const grassLayer = map.createLayer("Grass", [tilesetGrass]);
      const murLayer = map.createLayer("Mur", [tilesetMur]);
      const solCheminsLayer = map.createLayer("Sol/chemins", [tilesetGrass, tilesetSol]);
      const portailLayer = map.createLayer("Portail", [tilesetProps]);
      const decorsLayer = map.createLayer("Decors", [tilesetProps]);
      const detailsLayer = map.createLayer("Details", [tilesetProps, tilesetPlant, tilesetMur]);
  
    
    }
  
    update() {
    }
  }
  