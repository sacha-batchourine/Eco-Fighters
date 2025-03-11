export default class Hub extends Phaser.Scene {
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

      this.load.spritesheet("img_perso", "src/assets/Perso.png", {
        frameWidth: 32,
        frameHeight: 48
      }); 

      this.load.spritesheet("portail", "src/assets/portal4.png", {
        frameWidth: 32,   // Largeur d’un seul portail
        frameHeight: 32   // Hauteur d’un seul portail
    });

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

      this.add.sprite(432, 175, "portail", 0); // Affiche le premier portail de la spritesheet
    
      // 🏃‍♂️ Ajout du joueur
      this.player = this.physics.add.sprite(400, 300, "img_perso");
      this.player.setCollideWorldBounds(true); // Empêche de sortir de l'écran

      // 🎮 Ajout du clavier
      this.cursors = this.input.keyboard.createCursorKeys();

      // 🛠 Activer les collisions avec les murs (si nécessaire)
      murLayer.setCollisionByProperty({ collides: true });
      this.physics.add.collider(this.player, murLayer);
    }
  
    update() {
        // 🕹 Contrôles du joueur
        if (this.cursors.left.isDown) {
          this.player.setVelocityX(-160);
        } else if (this.cursors.right.isDown) {
          this.player.setVelocityX(160);
        } else {
          this.player.setVelocityX(0);
        }
  
        if (this.cursors.up.isDown) {
          this.player.setVelocityY(-160);
        } else if (this.cursors.down.isDown) {
          this.player.setVelocityY(160);
        } else {
          this.player.setVelocityY(0);
        }
    }
  }
  