import { State } from "../gameobjects/components/stateManager";
import Context from "../gameobjects/context";

export const GameStates = Object.freeze({
    MAINMENU: "main-menu",
    LEVELS: "levels",
    GAMEPLAY: "gameplay",
    PAUSED: "paused",
    WIN: "win",
    LOSS: "loss",
    OPTIONS: "options"
});


const mainMenu: State = {
    name: GameStates.MAINMENU,
    entryCondition: ()=>{return true}
}

const levels: State = {
    name: GameStates.LEVELS,
    entryCondition: ()=>{return true}
}

const gameplay: State = {
    name: GameStates.GAMEPLAY,
    entryCondition: ()=>{return true}
}

const paused: State = {
    name: GameStates.PAUSED,
    entryCondition: ()=>{return Context.paused===true}
}

const win: State = {
    name: GameStates.WIN,
    entryCondition: ()=>{return true}
}

const loss: State = {
    name: GameStates.LOSS,
    entryCondition: ()=>{return true}
}

const options: State = {
    name: GameStates.OPTIONS,
    entryCondition: ()=>{return true}
}

mainMenu.nextState = [levels,options];
levels.nextState = [gameplay,mainMenu];
gameplay.nextState = [paused,win,loss];
paused.nextState = [gameplay,mainMenu];

export {mainMenu,levels,gameplay,paused,win,loss,options};
