import Phaser from "phaser";
import {config} from "./config";
import GameplayScene from "../scenes/gameplay";
import { SCENES } from "./enums/keys/scenes";
import HUD from "../scenes/hud";
import PauseMenu from "../scenes/pausemenu";
import LossMenu from "../scenes/lossmenu";
import WinMenu from "../scenes/winmenu";

const game = new Phaser.Game(config);


game.scene.add(SCENES.GAMEPLAY,GameplayScene);
game.scene.add(SCENES.HUD,HUD);
game.scene.add(SCENES.PAUSE_MENU,PauseMenu);
game.scene.add(SCENES.LOSS_MENU,LossMenu);
game.scene.add(SCENES.WIN_MENU,WinMenu);
game.scene.start(SCENES.GAMEPLAY,{level:2});