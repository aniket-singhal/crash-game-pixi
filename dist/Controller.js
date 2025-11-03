// src/Controller.ts
export class GameController {
    constructor(model, view) {
        this.model = model;
        this.view = view;
        this.ticker = view.getAppTicker();
        this.view.onPlaceBet = this.handlePlaceBet.bind(this);
        this.view.onCashOut = this.handleCashOut.bind(this);
        this.view.onIncreaseBet = this.handleIncreaseBet.bind(this);
        this.view.onDecreaseBet = this.handleDecreaseBet.bind(this);
        this.ticker.add(this.gameLoop.bind(this));
    }
    handlePlaceBet() {
        this.model.placeBet();
    }
    handleIncreaseBet() {
        this.model.adjustBet(1);
    }
    handleDecreaseBet() {
        this.model.adjustBet(-1);
    }
    handleCashOut() {
        this.model.cashOut();
    }
    gameLoop() {
        const deltaMS = this.ticker.deltaMS;
        this.model.update(deltaMS);
        this.view.update(this.model);
    }
}
