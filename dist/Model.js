// src/Model.ts
export var GamePhase;
(function (GamePhase) {
    GamePhase[GamePhase["WAITING"] = 0] = "WAITING";
    GamePhase[GamePhase["PLAYING"] = 1] = "PLAYING";
    GamePhase[GamePhase["CRASHED"] = 2] = "CRASHED";
})(GamePhase || (GamePhase = {}));
export class GameModel {
    constructor() {
        this.gamePhase = GamePhase.WAITING;
        this.multiplier = 0.01;
        this.crashPoint = 0;
        this.countdownTimer = 5;
        this.crashedTimer = 3;
        this.COUNTDOWN_SECONDS = 5;
        this.CRASHED_SECONDS = 3;
        this.growthSpeed = 0.02;
        this.balance = 1000;
        this.betAmount = 10;
        this.profit = 0;
        this.playerHasBet = false;
        this.playerHasCashedOut = false;
        this.playerCashOutPoint = 0;
    }
    update(deltaMS) {
        const deltaSeconds = deltaMS / 1000;
        switch (this.gamePhase) {
            case GamePhase.WAITING:
                this.countdownTimer -= deltaSeconds;
                if (this.countdownTimer <= 0) {
                    this.gamePhase = GamePhase.PLAYING;
                    this.startNewRound();
                }
                break;
            case GamePhase.PLAYING:
                this.updateMultiplier(deltaMS);
                if (this.checkForCrash()) {
                    this.gamePhase = GamePhase.CRASHED;
                    this.crashedTimer = this.CRASHED_SECONDS;
                }
                break;
            case GamePhase.CRASHED:
                this.crashedTimer -= deltaSeconds;
                if (this.crashedTimer <= 0) {
                    this.gamePhase = GamePhase.WAITING;
                    this.countdownTimer = this.COUNTDOWN_SECONDS;
                    this.resetForNextRound();
                }
                break;
        }
    }
    startNewRound() {
        this.multiplier = 0.01;
        this.crashPoint = Math.floor(Math.random() * 1350 + 150) / 100;
        console.log(`New round started. Crash Point: ${this.crashPoint.toFixed(2)}x`);
        if (this.playerHasBet) {
            this.balance -= this.betAmount;
        }
    }
    resetForNextRound() {
        this.multiplier = 0.01;
        this.profit = 0;
        this.playerHasBet = false;
        this.playerHasCashedOut = false;
        this.playerCashOutPoint = 0;
        console.log("--- Waiting for next round ---");
    }
    updateMultiplier(deltaMS) {
        this.multiplier += this.growthSpeed * (deltaMS / 16.66);
    }
    checkForCrash() {
        if (this.multiplier >= this.crashPoint) {
            if (this.playerHasBet && !this.playerHasCashedOut) {
                this.profit = -this.betAmount;
                console.log("Player lost bet.");
            }
            return true;
        }
        return false;
    }
    placeBet() {
        if (this.gamePhase !== GamePhase.WAITING) {
            console.log("Can only place bets while WAITING.");
            return;
        }
        if (this.balance < this.betAmount) {
            console.log("Not enough balance to place bet.");
            return;
        }
        if (this.playerHasBet) {
            console.log("Bet already placed.");
            return;
        }
        this.playerHasBet = true;
        console.log(`Bet of $${this.betAmount} placed.`);
    }
    cashOut() {
        if (this.gamePhase !== GamePhase.PLAYING || !this.playerHasBet || this.playerHasCashedOut) {
            return;
        }
        this.playerHasCashedOut = true;
        this.playerCashOutPoint = this.multiplier;
        const payout = this.betAmount * this.playerCashOutPoint;
        this.balance += payout;
        this.profit = payout - this.betAmount;
        console.log(`Player cashed out at ${this.playerCashOutPoint.toFixed(2)}x for $${payout.toFixed(2)}`);
    }
    adjustBet(amount) {
        if (this.gamePhase === GamePhase.WAITING && !this.playerHasBet) {
            const newBet = this.betAmount + amount;
            this.betAmount = Math.max(1, newBet);
            console.log(`Bet set to: ${this.betAmount}`);
        }
    }
    get Multiplier() { return this.multiplier; }
    get Balance() { return this.balance; }
    get Profit() { return this.profit; }
    get BetAmount() { return this.betAmount; }
    get GamePhase() { return this.gamePhase; }
    get CountdownTimer() { return this.countdownTimer; }
    get CrashPoint() { return this.crashPoint; }
    get PlayerHasBet() { return this.playerHasBet; }
    get PlayerHasCashedOut() { return this.playerHasCashedOut; }
    get PlayerCashOutPoint() { return this.playerCashOutPoint; }
}
