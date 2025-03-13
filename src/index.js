// Importation des différentes scènes du jeu
import Synop from "./js/synop.js";  // Scène pour le synopsis (histoire/introduction)
import Hub from "./js/Hub.js";      // Scène principale (hub central)
import Menu from "./js/menu.js";    // Scène du menu principal
import Niveau1 from "./js/niveau1.js";  // Scène du niveau 1
import Niveau2 from "./js/niveau2.js";  // Scène du niveau 2
import Niveau3 from "./js/niveau3.JS";  // Scène du niveau 3
import Niveau4 from "./js/niveau4.js";  // Scène du niveau 4
import Niveau5 from "./js/niveau5.js";  // Scène du niveau 5
import NiveauBoss from "./js/boss.js";  // Scène du niveau boss
import Fin from "./js/fin.js";          // Scène de fin de jeu
import Regles from "./js/regles.js";    // Scène pour les règles du jeu

// Configuration du jeu avec Phaser
const config = {
    type: Phaser.AUTO,  // Phaser choisit automatiquement le rendu (WebGL ou Canvas)
    width: window.innerWidth,  // Largeur du jeu = largeur de la fenêtre du navigateur
    height: window.innerHeight,  // Hauteur du jeu = hauteur de la fenêtre du navigateur
    physics: {
        default: "arcade",  // Utilisation du système de physique "arcade" (simple et léger)
        arcade: {
            gravity: { y: 0 },  // Pas de gravité (utile pour les jeux en 2D sans chute)
            debug: false  // Désactive le mode debug (pas de hitbox visibles)
        }
    },
    scale: {
        mode: Phaser.Scale.FIT,  // Ajuste le jeu à la taille de l'écran tout en conservant les proportions
        autoCenter: Phaser.Scale.CENTER_BOTH  // Centre le jeu horizontalement et verticalement
    },
    // Liste des scènes du jeu (l'ordre est important : la première scène est lancée au démarrage)
    scene: [Menu, Hub, Niveau1, Niveau2, Niveau3, Niveau4, Niveau5, NiveauBoss, Synop, Fin, Regles]
};

// Création de l'instance du jeu Phaser avec la configuration définie
const game = new Phaser.Game(config);