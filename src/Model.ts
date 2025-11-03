// src/Model.ts
export enum GamePhase {
    WAITING,  
    PLAYING,  
    CRASHED   
}

export class GameModel {
    private gamePhase: GamePhase = GamePhase.WAITING;
    private multiplier: number = 0.01;
    private crashPoint: number = 0;
    
    private countdownTimer: number = 5;
    private crashedTimer: number = 3; 

    private readonly COUNTDOWN_SECONDS: number = 5;
    private readonly CRASHED_SECONDS: number = 3;
    private readonly growthSpeed: number = 0.02;

    private balance: number = 1000;
    private betAmount: number = 10;
    private profit: number = 0;
    private playerHasBet: boolean = false; 
    private playerHasCashedOut: boolean = false;
    private playerCashOutPoint: number = 0;

    public update(deltaMS: number): void {
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

    private startNewRound(): void {
        this.multiplier = 0.01;
        this.crashPoint = Math.floor(Math.random() * 1350 + 150) / 100; 
        console.log(`New round started. Crash Point: ${this.crashPoint.toFixed(2)}x`);

        if (this.playerHasBet) {
            this.balance -= this.betAmount;
        }
    }

    private resetForNextRound(): void {
        this.multiplier = 0.01;
        this.profit = 0;
        this.playerHasBet = false;
        this.playerHasCashedOut = false;
        this.playerCashOutPoint = 0;
        console.log("--- Waiting for next round ---");
    }

    private updateMultiplier(deltaMS: number): void {
        this.multiplier += this.growthSpeed * (deltaMS / 16.66);
    }

    private checkForCrash(): boolean {
        if (this.multiplier >= this.crashPoint) {
            if (this.playerHasBet && !this.playerHasCashedOut) {
                this.profit = -this.betAmount;
                console.log("Player lost bet.");
            }
            return true;
        }
        return false;
    }

    public placeBet(): void {
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

    public cashOut(): void {
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

    public adjustBet(amount: number): void {
        if (this.gamePhase === GamePhase.WAITING && !this.playerHasBet) {
            const newBet = this.betAmount + amount;
            this.betAmount = Math.max(1, newBet);
            console.log(`Bet set to: ${this.betAmount}`);
        }
    }

    public get Multiplier(): number { return this.multiplier; }
    public get Balance(): number { return this.balance; }
    public get Profit(): number { return this.profit; }
    public get BetAmount(): number { return this.betAmount; }
    public get GamePhase(): GamePhase { return this.gamePhase; }
    public get CountdownTimer(): number { return this.countdownTimer; }
    public get CrashPoint(): number { return this.crashPoint; }
    public get PlayerHasBet(): boolean { return this.playerHasBet; }
    public get PlayerHasCashedOut(): boolean { return this.playerHasCashedOut; }
    public get PlayerCashOutPoint(): number { return this.playerCashOutPoint; }
}