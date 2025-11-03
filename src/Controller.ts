// src/Controller.ts

import * as PIXI from 'pixi.js';
import { GameModel, GamePhase } from './Model.js';
import { GameView } from './View.js';

export class GameController {
    private model: GameModel;
    private view: GameView;
    private ticker: PIXI.Ticker;


    constructor(model: GameModel, view: GameView) {
        this.model = model;
        this.view = view;
        this.ticker = view.getAppTicker();

        this.view.onPlaceBet = this.handlePlaceBet.bind(this);
        this.view.onCashOut = this.handleCashOut.bind(this);
        this.view.onIncreaseBet = this.handleIncreaseBet.bind(this);
        this.view.onDecreaseBet = this.handleDecreaseBet.bind(this);

        this.ticker.add(this.gameLoop.bind(this));
    }

    private handlePlaceBet(): void {
        this.model.placeBet();
    }


    private handleIncreaseBet(): void {
        this.model.adjustBet(1);
    }

    private handleDecreaseBet(): void {
        this.model.adjustBet(-1);
    }

    private handleCashOut(): void {
        this.model.cashOut();
    }

    private gameLoop(): void {
        const deltaMS = this.ticker.deltaMS;

        this.model.update(deltaMS);

        this.view.update(this.model);
    }
}