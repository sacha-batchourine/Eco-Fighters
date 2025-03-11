// hub.js


export default class Hub extends Phaser.Scene {
    constructor() {
        super({ key: "Hub" });
    }

    preload() {
        // Chargement des images de tileset pour Hub
        this.load.image("grass", "src/assets/TX Tileset Grass.png");
        this.load.image("stone", "src/assets/TX Tileset Stone Ground.png");
        this.load.image("wall", "src/assets/TX Tileset Wall.png");
        this.load.image("village", "src/assets/TX Village Props.png");

        // Chargement de la carte JSON
        this.load.tilemapTiledJSON("hub", "src/assets/HUB1.json");
    }

    create() {
        // Charger la carte
        const map = this.make.tilemap({ key: "hub" });

        // Associer chaque tileset avec son nom dans Tiled
        const tilesetGrass = map.addTilesetImage("TX Tileset Grass", "grass");
        const tilesetStone = map.addTilesetImage("TX Tileset Stone Ground", "stone");
        const tilesetWall = map.addTilesetImage("TX Tileset Wall", "wall");
        const tilesetVillage = map.addTilesetImage("TX Village Props", "village");

        const tilesets = [tilesetGrass, tilesetStone, tilesetWall, tilesetVillage];

        // Création des calques dans l'ordre correct d'affichage
        map.createLayer("Background", tilesets); // Calque de fond
        map.createLayer("Sol/chemins", tilesets); // Calque des chemins
        map.createLayer("Mur", tilesets); // Calque des murs
        map.createLayer("Portail", tilesets); // Calque des portails
        map.createLayer("Decors", tilesets); // Calque des décors
        map.createLayer("Details", tilesets); // Calque des détails

        // Optionnel : gérer les collisions ici si nécessaire
        // map.getLayer("Mur").setCollisionByProperty({ collides: true });
    }

    update() {
        // Pas de mise à jour nécessaire ici
    }
}