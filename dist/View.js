// src/View.ts
import * as PIXI from 'pixi.js';
import { GamePhase } from './Model.js';
export class GameView {
    constructor(containerId) {
        this.maxHorizontalPath = 400;
        // Callbacks
        this.onPlaceBet = () => { };
        this.onCashOut = () => { };
        this.onIncreaseBet = () => { };
        this.onDecreaseBet = () => { };
        this.app = new PIXI.Application();
        this.containerId = containerId;
    }
    async init(assets) {
        await this.app.init({
            width: 800,
            height: 450,
            backgroundColor: 0x1a1e27,
            antialias: true,
        });
        document.getElementById(this.containerId)?.appendChild(this.app.canvas);
        await PIXI.Assets.load(assets);
        this.setup();
    }
    setup() {
        this.graphLine = new PIXI.Graphics();
        this.app.stage.addChild(this.graphLine);
        this.multiplierText = new PIXI.Text({ text: '10.00s', style: { fontFamily: 'Arial', fontSize: 64, fill: 0x4ddbff, fontWeight: 'bold' } });
        this.multiplierText.anchor.set(0.5);
        this.multiplierText.position.set(400, 225);
        this.app.stage.addChild(this.multiplierText);
        const planeFrames = [
            PIXI.Texture.from('assets/plane1.png'),
            PIXI.Texture.from('assets/plane2.png'),
            PIXI.Texture.from('assets/plane3.png'),
            PIXI.Texture.from('assets/plane4.png'),
        ];
        this.planeAnimation = new PIXI.AnimatedSprite(planeFrames);
        this.planeAnimation.animationSpeed = 0.1;
        this.planeAnimation.anchor.set(0.5);
        this.planeAnimation.position.set(50, 400);
        this.planeAnimation.scale.set(0.5);
        this.app.stage.addChild(this.planeAnimation);
        this.resultText = new PIXI.Text({ text: '', style: { fontFamily: 'Arial', fontSize: 32, fill: 0xffffff, fontWeight: 'bold' } });
        this.resultText.anchor.set(0.5);
        this.resultText.position.set(400, 100);
        this.app.stage.addChild(this.resultText);
        this.balanceText = new PIXI.Text({
            text: `Balance: $${(1000).toFixed(2)}`,
            style: {
                fontFamily: 'Arial',
                fontSize: 24,
                fill: 0xffffff,
                align: 'right'
            }
        });
        this.balanceText.anchor.set(1, 0);
        this.balanceText.position.set(790, 10);
        this.app.stage.addChild(this.balanceText);
        this.controlPanel = new PIXI.Container();
        this.controlPanel.position.set(400, 400);
        this.app.stage.addChild(this.controlPanel);
        this.mainButton = this.createButton('PLACE BET', 0x4CAF50, () => this.onPlaceBet());
        this.mainButton.position.set(100, 0);
        this.controlPanel.addChild(this.mainButton);
        this.setupBetControls();
    }
    createButton(text, color, onClick) {
        const container = new PIXI.Container();
        const background = new PIXI.Graphics();
        background.beginFill(color);
        background.drawRoundedRect(0, 0, 150, 50, 10);
        background.endFill();
        background.interactive = true;
        background.cursor = 'pointer';
        const buttonText = new PIXI.Text({ text: text, style: { fontFamily: 'Arial', fontSize: 24, fill: 0xffffff } });
        buttonText.anchor.set(0.5);
        buttonText.position.set(75, 25);
        container.addChild(background);
        container.addChild(buttonText);
        container.pivot.set(75, 25);
        background.on('pointerdown', onClick);
        container.setText = (newText) => buttonText.text = newText;
        container.setColor = (newColor) => {
            background.clear();
            background.beginFill(newColor);
            background.drawRoundedRect(0, 0, 150, 50, 10);
            background.endFill();
        };
        return container;
    }
    setupBetControls() {
        this.betText = new PIXI.Text({
            text: '10.00',
            style: { fontFamily: 'Arial', fontSize: 28, fill: 0xffffff, fontWeight: 'bold' }
        });
        this.betText.anchor.set(0.5);
        this.betText.position.set(-100, 0);
        this.controlPanel.addChild(this.betText);
        this.minusButton = new PIXI.Sprite(PIXI.Texture.from('assets/btn-min.png'));
        this.minusButton.anchor.set(0.5);
        this.minusButton.scale.set(0.2); // Adjust scale as needed
        this.minusButton.interactive = true;
        this.minusButton.cursor = 'pointer';
        this.minusButton.on('pointerdown', () => this.onDecreaseBet());
        this.minusButton.position.set(-180, 0); // To the left of betText
        this.controlPanel.addChild(this.minusButton);
        this.plusButton = new PIXI.Sprite(PIXI.Texture.from('assets/btn-plus.png'));
        this.plusButton.anchor.set(0.5);
        this.plusButton.scale.set(0.05);
        this.plusButton.interactive = true;
        this.plusButton.cursor = 'pointer';
        this.plusButton.on('pointerdown', () => this.onIncreaseBet());
        this.plusButton.position.set(-20, 0); // To the right of betText
        this.controlPanel.addChild(this.plusButton);
    }
    update(model) {
        this.balanceText.text = `Balance: $${model.Balance.toFixed(2)}`;
        this.betText.text = model.BetAmount.toFixed(2);
        let betButtonsActive = false;
        switch (model.GamePhase) {
            case GamePhase.WAITING:
                this.multiplierText.text = `${model.CountdownTimer.toFixed(2)}s`;
                this.multiplierText.style.fill = 0xffffff;
                this.planeAnimation.gotoAndStop(0);
                this.updatePlanePosition(1, false);
                this.drawGraph(1);
                this.resultText.text = 'Place your bet for the next round!';
                if (model.PlayerHasBet) {
                    this.mainButton.setText('WAITING...');
                    this.mainButton.setColor(0x888888);
                    this.mainButton.children[0].removeAllListeners('pointerdown');
                }
                else {
                    betButtonsActive = true;
                    this.mainButton.setText('PLACE BET');
                    this.mainButton.setColor(0x4CAF50);
                    this.mainButton.children[0].removeAllListeners('pointerdown');
                    this.mainButton.children[0].on('pointerdown', () => this.onPlaceBet());
                }
                break;
            case GamePhase.PLAYING:
                this.multiplierText.text = `${model.Multiplier.toFixed(2)}x`;
                this.multiplierText.style.fill = 0x4ddbff;
                this.planeAnimation.play();
                this.updatePlanePosition(model.Multiplier, true);
                this.drawGraph(model.Multiplier);
                if (model.PlayerHasBet) {
                    if (model.PlayerHasCashedOut) {
                        this.resultText.text = `Cashed out @ ${model.PlayerCashOutPoint.toFixed(2)}x! +$${model.Profit.toFixed(2)}`;
                        this.resultText.style.fill = 0x4CAF50;
                        this.mainButton.setText('CASHEd OUT');
                        this.mainButton.setColor(0x888888);
                        this.mainButton.children[0].removeAllListeners('pointerdown');
                    }
                    else {
                        this.resultText.text = '';
                        this.mainButton.setText(`CASH OUT`);
                        this.mainButton.setColor(0xFF4500);
                        this.mainButton.children[0].removeAllListeners('pointerdown');
                        this.mainButton.children[0].on('pointerdown', () => this.onCashOut());
                    }
                }
                else {
                    this.resultText.text = 'Round in progress...';
                    this.mainButton.setText('---');
                    this.mainButton.setColor(0x888888);
                    this.mainButton.children[0].removeAllListeners('pointerdown');
                }
                break;
            case GamePhase.CRASHED:
                this.multiplierText.text = `CRASHED @ ${model.CrashPoint.toFixed(2)}x`;
                this.multiplierText.style.fill = 0xff3366;
                this.planeAnimation.gotoAndStop(0);
                if (model.PlayerHasBet && !model.PlayerHasCashedOut) {
                    this.resultText.text = `You lost $${model.BetAmount.toFixed(2)}`;
                    this.resultText.style.fill = 0xff3366;
                }
                else if (!model.PlayerHasBet) {
                    this.resultText.text = 'Round ended.';
                }
                this.mainButton.setText('---');
                this.mainButton.setColor(0x888888);
                this.mainButton.children[0].removeAllListeners('pointerdown');
                break;
        }
        this.plusButton.interactive = betButtonsActive;
        this.minusButton.interactive = betButtonsActive;
        this.plusButton.alpha = betButtonsActive ? 1.0 : 0.5;
        this.minusButton.alpha = betButtonsActive ? 1.0 : 0.5;
    }
    drawGraph(multiplier) {
        this.graphLine.clear();
        this.graphLine.lineStyle(2, 0x4ddbff, 1);
        const graphMultiplier = Math.max(1, multiplier);
        const startX = 50;
        const startY = 400;
        this.graphLine.moveTo(startX, startY);
        const maxM = 15;
        const ratioX = (graphMultiplier - 1) / (maxM - 1);
        let targetX = 50 + ratioX * (700);
        let targetY = 400 - Math.log(graphMultiplier) * 80;
        targetX = Math.min(targetX, this.maxHorizontalPath);
        if (targetY < 50)
            targetY = 50;
        this.graphLine.quadraticCurveTo(targetX, startY, targetX, targetY);
    }
    updatePlanePosition(multiplier, isPlaying) {
        if (!isPlaying && multiplier <= 1.00) {
            this.planeAnimation.position.set(50, 400);
            return;
        }
        const graphMultiplier = Math.max(1, multiplier);
        const maxM = 15;
        const ratioX = (graphMultiplier - 1) / (maxM - 1);
        let targetX = 50 + ratioX * (700);
        let targetY = 400 - Math.log(graphMultiplier) * 80;
        targetX = Math.min(targetX, this.maxHorizontalPath);
        if (targetY < 50)
            targetY = 50;
        this.planeAnimation.position.set(targetX, targetY);
    }
    getAppTicker() {
        return this.app.ticker;
    }
}
