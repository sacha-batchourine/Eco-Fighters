// chargement des librairies

export default class niveau1 extends Phaser.Scene {
    // constructeur de la classe
    constructor() {
      super({
        key: "niveau1" //  ici on précise le nom de la classe en tant qu'identifiant
      });
    }
    preload() {}
  
    create() {
      this.add.image(400, 300, "mapN1.json");
      
      // ajout d'un texte distintcif  du niveau
      this.add.text(400, 100, "Vous êtes dans le niveau 1", {
        fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif',
        fontSize: "22pt"
      });
  
      this.player = this.physics.add.sprite(100, 450, "img_perso");
      this.player.refreshBody();
      this.player.setBounce(0.2);
      this.player.setCollideWorldBounds(true);
      this.clavier = this.input.keyboard.createCursorKeys();
      this.physics.add.collider(this.player, this.groupe_plateformes);
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
      if (this.clavier.up.isDown && this.player.body.touching.down) {
        this.player.setVelocityY(-330);
      }
    }
  }
   