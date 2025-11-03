// src/Main.ts
import { GameModel } from './Model.js';
import { GameView } from './View.js';
import { GameController } from './Controller.js';
const ASSETS_TO_LOAD = [
    'assets/plane1.png',
    'assets/plane2.png',
    'assets/plane3.png',
    'assets/plane4.png',
    'assets/btn-min.png',
    'assets/btn-plus.png'
];
document.addEventListener('DOMContentLoaded', async () => {
    const model = new GameModel();
    const view = new GameView('game-container');
    await view.init(ASSETS_TO_LOAD);
    new GameController(model, view);
    console.log('Game Initialized (PixiJS v8 Style)');
});
