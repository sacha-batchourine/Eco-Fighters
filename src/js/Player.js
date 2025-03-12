// src/js/Player.js
export default class Player {
    constructor(scene, x = 145, y = 325, spriteKey = "img_perso") {
        this.scene = scene;
        this.sprite = scene.physics.add.sprite(x, y, spriteKey);
        this.lastDirection = "down";
        this.maxHealth = 5;
        this.currentHealth = this.maxHealth;

        // Création des animations
        this.scene.anims.create({
            key: "walk_up", frames: this.scene.anims.generateFrameNumbers(spriteKey, { start: 0, end: 3 }), frameRate: 10, repeat: -1
        });
        this.scene.anims.create({
            key: "walk_right", frames: this.scene.anims.generateFrameNumbers(spriteKey, { start: 4, end: 7 }), frameRate: 10, repeat: -1
        });
        this.scene.anims.create({
            key: "walk_left", frames: this.scene.anims.generateFrameNumbers(spriteKey, { start: 8, end: 11 }), frameRate: 10, repeat: -1
        });
        this.scene.anims.create({
            key: "walk_down", frames: this.scene.anims.generateFrameNumbers(spriteKey, { start: 12, end: 15 }), frameRate: 10, repeat: -1
        });

        // Gestion des entrées clavier
        this.cursors = this.scene.input.keyboard.createCursorKeys();
        this.spaceKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }

    move() {
        let moving = false;

        if (this.cursors.left.isDown) {
            this.sprite.setVelocityX(-160);
            this.sprite.setVelocityY(0);
            this.sprite.anims.play("walk_left", true);
            this.lastDirection = "left";
            moving = true;
        } else if (this.cursors.right.isDown) {
            this.sprite.setVelocityX(160);
            this.sprite.setVelocityY(0);
            this.sprite.anims.play("walk_right", true);
            this.lastDirection = "right";
            moving = true;
        } else {
            this.sprite.setVelocityX(0);
        }

        if (this.cursors.up.isDown) {
            this.sprite.setVelocityY(-160);
            this.sprite.setVelocityX(0);
            this.sprite.anims.play("walk_up", true);
            this.lastDirection = "up";
            moving = true;
        } else if (this.cursors.down.isDown) {
            this.sprite.setVelocityY(160);
            this.sprite.setVelocityX(0);
            this.sprite.anims.play("walk_down", true);
            this.lastDirection = "down";
            moving = true;
        } else {
            this.sprite.setVelocityY(0);
        }

        if (!moving) {
            this.sprite.setVelocity(0);
            this.sprite.anims.play(`idle_${this.lastDirection}`, true);
        }
    }

    takeDamage(amount = 1) {
        this.currentHealth -= amount;
        if (this.currentHealth <= 0) {
            this.currentHealth = 0;
            console.log("Game Over");
            this.scene.restart();
        }
    }

    drawHealthBar() {
        const healthBar = this.scene.add.graphics();
        const barWidth = 200;
        const barHeight = 20;
        healthBar.clear();
        healthBar.fillStyle(0x000000);
        healthBar.fillRect(20, 20, barWidth, barHeight);
        const healthRatio = this.currentHealth / this.maxHealth;
        healthBar.fillStyle(0xff0000);
        healthBar.fillRect(20, 20, barWidth * healthRatio, barHeight);
        return healthBar;
    }

    getSprite() {
        return this.sprite;
    }

    getCursors() {
        return this.cursors;
    }

    getSpaceKey() {
        return this.spaceKey;
    }
}
