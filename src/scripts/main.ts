import Phaser from "phaser";
import {config} from "./config";
import GameplayScene from "../scenes/gameplay";
import { SCENES } from "./enums/keys/scenes";
import HUD from "../scenes/hud";

const game = new Phaser.Game(config);


game.scene.add(SCENES.GAMEPLAY,GameplayScene);
game.scene.add(SCENES.HUD,HUD)
game.scene.start(SCENES.GAMEPLAY);