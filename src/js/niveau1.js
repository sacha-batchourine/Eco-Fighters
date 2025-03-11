export default class niveau1 extends Phaser.Scene {
  constructor() {
    super({ key: "niveau1" });
  }

  preload() {
    // Chargement de la carte Tiled (format JSON)
    this.load.tilemapTiledJSON("mapN1", "src/assets/mapN1.json");

    // Chargement des tilesets utilisés dans Tiled
    this.load.image("Plant", "src/assets/TX Plant.png");         // Utilisé dans Grass, Chemin, Murs
    this.load.image("Objet", "src/assets/TX Props.png");         // Utilisé dans Chemin, Murs, Écriture
    this.load.image("ShadowPlant", "src/assets/TX Shadow Plant.png"); // Utilisé dans Ombres
    this.load.image("Mur", "src/assets/TX Tileset Wall.png");    // Utilisé dans Murs
    this.load.image("Village", "src/assets/TX Village Props.png"); // Utilisé dans Murs
  }

  create() {
    // Chargement de la carte
    const map = this.make.tilemap({ key: "mapN1" });

    // Ajout des tilesets utilisés dans la carte
    const tilesetPlant = map.addTilesetImage("TX Plant", "Plant");
    const tilesetObjet = map.addTilesetImage("TX Props", "Objet");
    const tilesetShadow = map.addTilesetImage("TX Shadow Plant", "ShadowPlant");
    const tilesetMur = map.addTilesetImage("TX Tileset Wall", "Mur");
    const tilesetVillage = map.addTilesetImage("TX Village Props", "Village");

    // Création des calques dans le bon ordre
    const grassLayer = map.createLayer("Grass", tilesetPlant);
    const cheminLayer = map.createLayer("Chemin", [tilesetObjet, tilesetPlant]);
    const ombresLayer = map.createLayer("Ombres", tilesetShadow);
    const mursLayer = map.createLayer("Murs", [tilesetPlant, tilesetObjet, tilesetMur, tilesetVillage]);
    const ecritureLayer = map.createLayer("Ecriture", tilesetObjet);

    // Gestion des collisions pour les murs
    mursLayer.setCollisionByProperty({ collides: true });
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    // Ajout d'un texte indicatif
    this.add.text(400, 100, "Vous êtes dans le niveau 1", {
      fontFamily: "Georgia, serif",
      fontSize: "22pt",
      color: "#ffffff"
    }).setOrigin(0.5);

    // Création du joueur
    this.player = this.physics.add.sprite(100, 450, "img_perso");
    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);

    // Activation des collisions avec les murs
    this.physics.add.collider(this.player, mursLayer);

    // Contrôles clavier
    this.clavier = this.input.keyboard.createCursorKeys();
  }

  update() {
    if (this.clavier.left.isDown) {
      this.player.setVelocityX(-160);
      this.player.anims.play("anim_tourne_gauche", true);
    } else if (this.clavier.right.isDown) {
      this.player.setVelocityX(160);
      this.player.anims.play("anim_tourne_droite", true);
    } else {
      this.player.setVelocityX(0);
      this.player.anims.play("anim_face");
    }

    if (this.clavier.up.isDown && this.player.body.blocked.down) {
      this.player.setVelocityY(-330);
    }
  }
}
