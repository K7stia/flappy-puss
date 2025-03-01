/************************
***** DECLARATIONS: *****
************************/
let cvs = document.getElementById('game');
let ctx = cvs.getContext('2d');
let description = document.getElementById('description');
let theme1 = new Image(); theme1.src = 'img/og-theme.png';
let theme2 = new Image(); theme2.src = 'img/og-theme-2.png';
let frame = 0;
let degree = Math.PI / 180;
const SFX_SCORE = new Audio(); SFX_SCORE.src = 'audio/sfx_point.wav';
const SFX_FLAP = new Audio(); SFX_FLAP.src = 'audio/sfx_wing.wav';
const SFX_COLLISION = new Audio(); SFX_COLLISION.src = 'audio/sfx_hit.wav';
const SFX_FALL = new Audio(); SFX_FALL.src = 'audio/sfx_die.wav';
const SFX_SWOOSH = new Audio(); SFX_SWOOSH.src = 'audio/sfx_swooshing.wav';

let showLeaderboard = false;

const gameState = { current: 0, getReady: 0, play: 1, gameOver: 2 };

const bg = {
    imgX: 0, imgY: 0, width: 276, height: 228, x: 0, y: cvs.height - 228, w: 276, h: 228, dx: .2,
    render: function () {
        ctx.drawImage(theme1, this.imgX, this.imgY, this.width, this.height, this.x, this.y, this.w, this.h);
        ctx.drawImage(theme1, this.imgX, this.imgY, this.width, this.height, this.x + this.width, this.y, this.w, this.h);
        ctx.drawImage(theme1, this.imgX, this.imgY, this.width, this.height, this.x + this.width * 2, this.y, this.w, this.h);
    },
    position: function () {
        if (gameState.current == gameState.getReady) this.x = 0;
        if (gameState.current == gameState.play) this.x = (this.x - this.dx) % (this.w);
    }
};

const pipes = {
    top: { imgX: 56, imgY: 323 }, bot: { imgX: 84, imgY: 323 },
    width: 26, height: 160, w: 55, h: 300, gap: 125, dx: 2, minY: -260, maxY: -40, pipeGenerator: [],
    reset: function () { this.pipeGenerator = []; },
    render: function () {
        for (let i = 0; i < this.pipeGenerator.length; i++) {
            let pipe = this.pipeGenerator[i];
            let topPipe = pipe.y;
            let bottomPipe = pipe.y + this.gap + this.h;
            ctx.drawImage(theme2, this.top.imgX, this.top.imgY, this.width, this.height, pipe.x, topPipe, this.w, this.h);
            ctx.drawImage(theme2, this.bot.imgX, this.bot.imgY, this.width, this.height, pipe.x, bottomPipe, this.w, this.h);
        }
    },
    position: function () {
        if (gameState.current !== gameState.play) return;
        if (frame % 100 == 0) {
            this.pipeGenerator.push({ x: cvs.width, y: Math.floor((Math.random() * (this.maxY - this.minY + 1)) + this.minY) });
        }
        for (let i = 0; i < this.pipeGenerator.length; i++) {
            let pg = this.pipeGenerator[i];
            let b = { left: bird.x - bird.r, right: bird.x + bird.r, top: bird.y - bird.r, bottom: bird.y + bird.r };
            let p = { top: { top: pg.y, bottom: pg.y + this.h }, bot: { top: pg.y + this.h + this.gap, bottom: pg.y + this.h * 2 + this.gap }, left: pg.x, right: pg.x + this.w };
            pg.x -= this.dx;
            if (pg.x < -this.w) {
                this.pipeGenerator.shift();
                score.current++;
                SFX_SCORE.play();
            }
            if (b.left < p.right && b.right > p.left && b.top < p.top.bottom && b.bottom > p.top.top) {
                gameState.current = gameState.gameOver;
                SFX_COLLISION.play();
            }
            if (b.left < p.right && b.right > p.left && b.top < p.bot.bottom && b.bottom > p.bot.top) {
                gameState.current = gameState.gameOver;
                SFX_COLLISION.play();
            }
        }
    }
};

const ground = {
    imgX: 276, imgY: 0, width: 224, height: 112, x: 0, y: cvs.height - 112, w: 224, h: 112, dx: 2,
    render: function () {
        ctx.drawImage(theme1, this.imgX, this.imgY, this.width, this.height, this.x, this.y, this.w, this.h);
        ctx.drawImage(theme1, this.imgX, this.imgY, this.width, this.height, this.x + this.width, this.y, this.w, this.h);
    },
    position: function () {
        if (gameState.current == gameState.getReady) this.x = 0;
        if (gameState.current == gameState.play) this.x = (this.x - this.dx) % (this.w / 2);
    }
};

const map = [
    { imgX: 496, imgY: 60, width: 12, height: 18 },
    { imgX: 135, imgY: 455, width: 10, height: 18 },
    { imgX: 292, imgY: 160, width: 12, height: 18 },
    { imgX: 306, imgY: 160, width: 12, height: 18 },
    { imgX: 320, imgY: 160, width: 12, height: 18 },
    { imgX: 334, imgY: 160, width: 12, height: 18 },
    { imgX: 292, imgY: 184, width: 12, height: 18 },
    { imgX: 306, imgY: 184, width: 12, height: 18 },
    { imgX: 320, imgY: 184, width: 12, height: 18 },
    { imgX: 334, imgY: 184, width: 12, height: 18 }
];

const score = {
    current: 0, best: null, x: cvs.width / 2, y: 40, w: 15, h: 25,
    reset: function () { this.current = 0; },
    render: function () {
        if (gameState.current == gameState.play || gameState.current == gameState.gameOver) {
            let string = this.current.toString();
            let ones = string.charAt(string.length - 1);
            let tens = string.charAt(string.length - 2);
            let hundreds = string.charAt(string.length - 3);
            if (this.current >= 1000) {
                gameState.current = gameState.gameOver;
            } else if (this.current >= 100) {
                ctx.drawImage(theme2, map[ones].imgX, map[ones].imgY, map[ones].width, map[ones].height, ((this.x - this.w / 2) + (this.w) + 3), this.y, this.w, this.h);
                ctx.drawImage(theme2, map[tens].imgX, map[tens].imgY, map[tens].width, map[tens].height, ((this.x - this.w / 2)), this.y, this.w, this.h);
                ctx.drawImage(theme2, map[hundreds].imgX, map[hundreds].imgY, map[hundreds].width, map[hundreds].height, ((this.x - this.w / 2) - (this.w) - 3), this.y, this.w, this.h);
            } else if (this.current >= 10) {
                ctx.drawImage(theme2, map[ones].imgX, map[ones].imgY, map[ones].width, map[ones].height, ((this.x - this.w / 2) + (this.w / 2) + 3), this.y, this.w, this.h);
                ctx.drawImage(theme2, map[tens].imgX, map[tens].imgY, map[tens].width, map[tens].height, ((this.x - this.w / 2) - (this.w / 2) - 3), this.y, this.w, this.h);
            } else {
                ctx.drawImage(theme2, map[ones].imgX, map[ones].imgY, map[ones].width, map[ones].height, (this.x - this.w / 2), this.y, this.w, this.h);
            }
        }
    }
};

const bird = {
    animation: [{ imgX: 277, imgY: 114 }, { imgX: 277, imgY: 153 }, { imgX: 277, imgY: 190 }, { imgX: 277, imgY: 153 }],
    fr: 0, width: 33, height: 37, x: 50, y: 160, w: 34, h: 37, r: 12, fly: 5.25, gravity: .32, velocity: 0,
    render: function () {
        let bird = this.animation[this.fr];
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.drawImage(theme1, bird.imgX, bird.imgY, this.width, this.height, -this.w / 2, -this.h / 2, this.w, this.h);
        ctx.restore();
    },
    flap: function () {
        this.velocity = -this.fly;
    },
    position: function () {
        if (gameState.current == gameState.getReady) {
            this.y = 160;
            this.rotation = 0 * degree;
            if (frame % 20 == 0) this.fr += 1;
            if (this.fr > this.animation.length - 1) this.fr = 0;
        } else {
            if (frame % 4 == 0) this.fr += 1;
            if (this.fr > this.animation.length - 1) this.fr = 0;
            this.velocity += this.gravity;
            this.y += this.velocity;
            if (this.velocity <= this.fly) this.rotation = -15 * degree;
            else if (this.velocity >= this.fly + 2) { this.rotation = 70 * degree; this.fr = 1; }
            else this.rotation = 0;
            if (this.y + this.h / 2 >= cvs.height - ground.h) {
                this.y = cvs.height - ground.h - this.h / 2;
                if (frame % 1 == 0) { this.fr = 2; this.rotation = 70 * degree; }
                if (gameState.current == gameState.play) { gameState.current = gameState.gameOver; SFX_FALL.play(); }
            }
            if (this.y - this.h / 2 <= 0) this.y = this.r;
        }
    }
};

const bird1 = {
    animation: [{ imgX: 115, imgY: 381 }, { imgX: 115, imgY: 407 }, { imgX: 115, imgY: 433 }, { imgX: 115, imgY: 407 }],
    fr: 0, width: 18, height: 12, x: 50, y: 160, w: 34, h: 24, r: 12, fly: 5.25, gravity: .32, velocity: 0,
    render: function () {
        let bird = this.animation[this.fr];
        ctx.drawImage(theme2, bird.imgX, bird.imgY, this.width, this.height, this.x - this.w / 2, this.y - this.h / 2, this.w, this.h);
    },
    flap: function () {
        this.velocity = -this.fly;
    },
    position: function () {
        if (gameState.current == gameState.getReady) {
            this.y = 160;
            if (frame % 20 == 0) this.fr += 1;
            if (this.fr > this.animation.length - 1) this.fr = 0;
        } else {
            if (frame % 4 == 0) this.fr += 1;
            if (this.fr > this.animation.length - 1) this.fr = 0;
            this.velocity += this.gravity;
            this.y += this.velocity;
            if (this.y + this.h / 2 >= cvs.height - ground.h) {
                this.y = cvs.height - ground.h - this.h / 2;
                if (frame % 1 == 0) this.fr = 2;
                if (gameState.current == gameState.play) { gameState.current = gameState.gameOver; SFX_FALL.play(); }
            }
            if (this.y - this.h / 2 <= 0) this.y = this.r;
        }
    }
};

const bird2 = {
    animation: [{ imgX: 87, imgY: 491 }, { imgX: 115, imgY: 329 }, { imgX: 115, imgY: 355 }, { imgX: 115, imgY: 329 }],
    fr: 0, width: 18, height: 12, x: 50, y: 160, w: 34, h: 24, r: 12, fly: 5.25, gravity: .32, velocity: 0,
    render: function () {
        let bird = this.animation[this.fr];
        ctx.drawImage(theme2, bird.imgX, bird.imgY, this.width, this.height, this.x - this.w / 2, this.y - this.h / 2, this.w, this.h);
    },
    flap: function () {
        this.velocity = -this.fly;
    },
    position: function () {
        if (gameState.current == gameState.getReady) {
            this.y = 160;
            if (frame % 20 == 0) this.fr += 1;
            if (this.fr > this.animation.length - 1) this.fr = 0;
        } else {
            if (frame % 4 == 0) this.fr += 1;
            if (this.fr > this.animation.length - 1) this.fr = 0;
            this.velocity += this.gravity;
            this.y += this.velocity;
            if (this.y + this.h / 2 >= cvs.height - ground.h) {
                this.y = cvs.height - ground.h - this.h / 2;
                if (frame % 1 == 0) this.fr = 2;
                if (gameState.current == gameState.play) { gameState.current = gameState.gameOver; SFX_FALL.play(); }
            }
            if (this.y - this.h / 2 <= 0) this.y = this.r;
        }
    }
};

const getReady = {
    imgX: 0, imgY: 228, width: 174, height: 160, x: cvs.width / 2 - 174 / 2, y: cvs.height / 2 - 160, w: 174, h: 160,
    render: function () {
        if (gameState.current == gameState.getReady && !showLeaderboard) {
            ctx.drawImage(theme1, this.imgX, this.imgY, this.width, this.height, this.x, this.y, this.w, this.h);
            ctx.fillStyle = "#18656d";
            ctx.font = "20px Arial";
            ctx.textAlign = "center";
            ctx.fillText("Leaderboard", cvs.width / 2, cvs.height / 2 + 180);
        }
    }
};

const gameOver = {
    imgX: 174, imgY: 228, width: 226, height: 158, x: cvs.width / 2 - 226 / 2, y: cvs.height / 2 - 160, w: 226, h: 160,
    render: function () {
        if (gameState.current == gameState.gameOver) {
            ctx.drawImage(theme1, this.imgX, this.imgY, this.width, this.height, this.x, this.y, this.w, this.h);
            description.style.visibility = "visible";
        }
    }
};

const nameInput = {
    value: "",
    x: cvs.width / 2 - 100, y: cvs.height / 2 + 50, width: 200, height: 30,
    buttonX: cvs.width / 2 - 50, buttonY: cvs.height / 2 + 90, buttonWidth: 100, buttonHeight: 30,
    restartX: cvs.width / 2 - 50, restartY: cvs.height - 60, restartWidth: 100, restartHeight: 30, // Нова кнопка "Restart"
    maxLength: 15,
    render: function () {
        if (gameState.current === gameState.gameOver) {
            // Поле вводу з білим фоном і рамкою
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.strokeStyle = "#000000"; // Колір рамки
            ctx.lineWidth = 1;
            ctx.strokeRect(this.x, this.y, this.width, this.height); // Рамка для поля вводу

            ctx.fillStyle = "#000000";
            ctx.font = "16px Arial";
            ctx.textAlign = "left";
            ctx.fillText(this.value || "Enter your name", this.x + 5, this.y + 20);

            // Кнопка Submit із рамкою
            ctx.fillStyle = "#4CAF50";
            ctx.fillRect(this.buttonX, this.buttonY, this.buttonWidth, this.buttonHeight);
            ctx.strokeStyle = "#000000"; // Колір рамки
            ctx.lineWidth = 1;
            ctx.strokeRect(this.buttonX, this.buttonY, this.buttonWidth, this.buttonHeight); // Рамка для кнопки
            ctx.fillStyle = "#FFFFFF";
            ctx.font = "16px Arial";
            ctx.textAlign = "center";
            ctx.fillText("Submit", this.buttonX + this.buttonWidth / 2, this.buttonY + 20);

            // Кнопка Restart із рамкою
            ctx.fillStyle = "#FF5733"; // Червоно-оранжевий колір для кнопки Restart
            ctx.fillRect(this.restartX, this.restartY, this.restartWidth, this.restartHeight);
            ctx.strokeStyle = "#000000"; // Колір рамки
            ctx.lineWidth = 1;
            ctx.strokeRect(this.restartX, this.restartY, this.restartWidth, this.restartHeight); // Рамка для кнопки
            ctx.fillStyle = "#FFFFFF";
            ctx.font = "16px Arial";
            ctx.textAlign = "center";
            ctx.fillText("Restart", this.restartX + this.restartWidth / 2, this.restartY + 20);
        }
    },
    handleClick: function (x, y) {
        if (gameState.current === gameState.gameOver) {
            // Клік по кнопці "Submit"
            if (x >= this.buttonX && x <= this.buttonX + this.buttonWidth &&
                y >= this.buttonY && y <= this.buttonY + this.buttonHeight) {
                if (this.value) {
                    leaderboard.saveScore(this.value, score.current);
                    this.value = "";
                    pipes.reset();
                    score.reset();
                    gameState.current = gameState.getReady;
                    SFX_SWOOSH.play();
                }
            }
            // Клік по кнопці "Restart"
            else if (x >= this.restartX && x <= this.restartX + this.restartWidth &&
                y >= this.restartY && y <= this.restartY + this.restartHeight) {
                pipes.reset();
                score.reset();
                this.value = ""; // Очищаємо поле вводу
                gameState.current = gameState.getReady;
                SFX_SWOOSH.play();
            }
        }
    },
    handleKey: function (key) {
        if (gameState.current === gameState.gameOver) {
            if (key === "Backspace") {
                this.value = this.value.slice(0, -1);
            } else if (key === "Enter" && this.value) {
                leaderboard.saveScore(this.value, score.current);
                this.value = "";
                pipes.reset();
                score.reset();
                gameState.current = gameState.getReady;
                SFX_SWOOSH.play();
            } else if (key.length === 1 && this.value.length < this.maxLength) {
                this.value += key;
            }
        }
    }
};

const leaderboard = {
    scores: [],
    maxEntries: 5,
    saveScore: async function (name, score) {
        try {
            await window.addDoc(window.collection(window.db, "scores"), {
                name: name,
                score: score,
                gamepuss: "flappy",
                timestamp: new Date().toISOString()
            });
            console.log("Score saved successfully!");
            await this.loadLeaderboard();
        } catch (error) {
            console.error("Error saving score: ", error);
        }
    },
    loadLeaderboard: async function () {
        try {
            const q = window.query(
                window.collection(window.db, "scores"),
                window.where("gamepuss", "==", "flappy"),
                window.orderBy("score", "desc"),
                window.limit(this.maxEntries)
            );
            const querySnapshot = await window.getDocs(q);
            this.scores = querySnapshot.docs.map(doc => ({
                name: doc.data().name,
                score: doc.data().score
            }));
        } catch (error) {
            console.error("Error loading leaderboard: ", error);
        }
    },
    render: function () {
        if (gameState.current === gameState.gameOver || (gameState.current === gameState.getReady && showLeaderboard)) {
            // Напівпрозорий білий фон
            ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
            ctx.fillRect(cvs.width / 2 - 150, cvs.height / 2 - 115, 300, 155); // Фон для лідерборду

            // Чорний текст
            ctx.fillStyle = "#18656d";
            ctx.font = "20px Arial";
            ctx.textAlign = "center";
            ctx.fillText("Leaderboard", cvs.width / 2, cvs.height / 2 - 90);
            ctx.font = "16px Arial";
            this.scores.forEach((entry, index) => {
                const text = `${index + 1}. ${entry.name}: ${entry.score}`;
                ctx.fillText(text, cvs.width / 2, cvs.height / 2 - 55 + index * 20);
            });
        }
    }
};

leaderboard.loadLeaderboard();

/************************
***** FUNCTIONS: ********
************************/
let draw = () => {
    ctx.fillStyle = '#00bbc4';
    ctx.fillRect(0, 0, cvs.width, cvs.height);
    bg.render();
    pipes.render();
    ground.render();
    score.render();
    bird.render();
    getReady.render();
    gameOver.render();
    leaderboard.render();
    nameInput.render();
};

let update = () => {
    bird.position();
    bg.position();
    pipes.position();
    ground.position();
};

let loop = () => {
    draw();
    update();
    frame++;
};
loop();
setInterval(loop, 17);

/*************************
***** EVENT HANDLERS *****
*************************/
cvs.addEventListener('click', (e) => {
    const rect = cvs.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (gameState.current == gameState.getReady) {
        if (!showLeaderboard && x >= cvs.width / 2 - 50 && x <= cvs.width / 2 + 50 && y >= cvs.height / 2 + 160 && y <= cvs.height / 2 + 200) {
            showLeaderboard = true;
        } else {
            showLeaderboard = false;
            gameState.current = gameState.play;
        }
    }
    if (gameState.current == gameState.play) {
        bird.flap();
        SFX_FLAP.play();
        description.style.visibility = "hidden";
    }
    if (gameState.current == gameState.gameOver) {
        nameInput.handleClick(x, y); // Обробка кліків по кнопках "Submit" і "Restart"
    }
});

document.body.addEventListener('keydown', (e) => {
    if (e.key === " " && gameState.current == gameState.getReady) {
        gameState.current = gameState.play;
        showLeaderboard = false;
    }
    if (e.key === " " && gameState.current == gameState.play) {
        bird.flap();
        SFX_FLAP.play();
        description.style.visibility = "hidden";
    }
    nameInput.handleKey(e.key);
});
