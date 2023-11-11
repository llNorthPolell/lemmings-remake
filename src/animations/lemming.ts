import { ANIMS } from "../scripts/enums/keys/animations"
import { ASSETS } from "../scripts/enums/keys/assets"

export const createLemmingAnimations = (anims : Phaser.Animations.AnimationManager) => {
    anims.create({
        key: ANIMS.IDLE_LEFT,
        frameRate: 4,
        frames: anims.generateFrameNumbers(ASSETS.LEMMING_SPRITESHEET, {start:12, end:15}),
        repeat: -1
    })

    anims.create({
        key: ANIMS.IDLE_RIGHT,
        frameRate: 4,
        frames: anims.generateFrameNumbers(ASSETS.LEMMING_SPRITESHEET, {start:8, end:11}),
        repeat: -1
    });

    anims.create({
        key: ANIMS.FALLING,
        frameRate: 4,
        frames: anims.generateFrameNumbers(ASSETS.LEMMING_SPRITESHEET, {start:0, end:0}),
        repeat: -1
    });

    anims.create({
        key: ANIMS.BLOCKING,
        frameRate: 4,
        frames: anims.generateFrameNumbers(ASSETS.LEMMING_SPRITESHEET, {start:4, end:5}),
        repeat: -1
    });

    anims.create({
        key: ANIMS.DIG_DOWN,
        frameRate: 4,
        frames: anims.generateFrameNumbers(ASSETS.LEMMING_SPRITESHEET, {start:0, end:3}),
        repeat: -1
    });

    anims.create({
        key: ANIMS.EXIT,
        frameRate: 4,
        frames: anims.generateFrameNumbers(ASSETS.LEMMING_SPRITESHEET, {start:6, end:7}),
        repeat: 3,
        hideOnComplete: true
    });

    anims.create({
        key: ANIMS.FALL_DEAD,
        frameRate: 4,
        frames: anims.generateFrameNumbers(ASSETS.LEMMING_SPRITESHEET, {start:16, end:19}),
        repeat: 0,
        hideOnComplete: true
    });
    
    anims.create({
        key: ANIMS.SELF_DESTRUCT,
        frameRate: 4,
        frames: anims.generateFrameNumbers(ASSETS.LEMMING_SPRITESHEET, {start:20, end:27}),
        repeat: 0,
        hideOnComplete: true
    });
}