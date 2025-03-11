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
      const map = this.make.tilemap({ key: "mapN1" });
      const tilesetGrass = map.addTilesetImage("TX Tileset Grass", "Grass");
      const tilesetMur = map.addTilesetImage("TX Tileset Wall", "Mur");
      const tilesetSol = map.addTilesetImage("TX Tileset Stone Ground", "Sol");
      const tilesetProps = map.addTilesetImage("TX Props", "Props");
      const tilesetPlant = map.addTilesetImage("TX Plant", "Plant");

      map.createLayer("Grass", [tilesetGrass]);
      const murLayer = map.createLayer("Mur", [tilesetMur]);
      map.createLayer("Sol/chemins", [tilesetGrass, tilesetSol]);
      map.createLayer("Decors", [tilesetProps]);
      map.createLayer("Details", [tilesetProps, tilesetPlant, tilesetMur]);

      // Ajout du joueur dans le niveau 1
      this.player = this.physics.add.sprite(100, 100, "img_perso"); // Spawn à l'entrée du niveau 1
      this.player.setCollideWorldBounds(true);

      // Activer le clavier
      this.cursors = this.input.keyboard.createCursorKeys();

      // Activer les collisions avec les murs
      murLayer.setCollisionByProperty({ collides: true });
      this.physics.add.collider(this.player, murLayer);
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