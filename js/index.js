(function () {
    // region
    const game = document.querySelector('#game'),
        myPlane = game.querySelector('#myPlane'),
        show = game.querySelector('.show'),
        myBloodProg = game.querySelector('.myBlood'),
        myAtkSpan = game.querySelector('.myAtk'),
        myDefenseSpan = game.querySelector('.myDefense'),
        myGoldSpan = game.querySelector('.myGold'),
        energyProg = document.querySelector('.energy'),
        play = document.querySelector('.play'),
        bgmAudio = document.querySelector('.bgmAudio'),
        menuAudio = document.querySelector('.menuAudio'),
        highBullet = document.querySelector('.highBullet'),
        warn = document.querySelector('.warn'),
        skills = document.querySelector('.skills'),
        pauseBtn = document.querySelector('.pauseBtn'),
        wingman1 = document.querySelector('.wingman1'),
        wingman2 = document.querySelector('.wingman2'),
        wingmanAtkSpan = document.querySelector('.wingmanAtk');

    const WinW = window.innerWidth,
        WinH = window.innerHeight,
        myPlaneW = 80,
        myPlaneH = 70,
        moveSpeedY = 15,
        moveSpeedX = 10,
        debugMode = {
            count: 0,
            record: 0
        };

    let myPlaneY,
        myPlaneX,
        myBlood,
        myAtk,
        myDefense,
        myGold,
        lucky,
        currentBullet,
        energy,
        currentBoss,
        wingmanAtk,
        wingmanDartle,
        multipleScore;

    let gameFlag = false,
        isTouch = false,
        gamePause = false;

    let createMyBulletTimer,
        createEnemyTimer,
        propsFnTimer4_1,
        propsFnTimer4_2,
        propsFnTimer5,
        changeBulletTimer,
        createEnemyBulletTimer,
        createBossTimer,
        createWingmanTimer;

    // endregion

    const enemyList = [
        {
            src: 'resource/img/enemySoldier1.png',
            blood: 500,
            atk: 50,
            defense: 20,
            speed: 14,
            gold: 30,
            hue: 0
        },
        {
            src: 'resource/img/enemySoldier2.png',
            blood: 600,
            atk: 60,
            defense: 25,
            speed: 10,
            gold: 50,
            hue: 60
        },
        {
            src: 'resource/img/enemySoldier3.png',
            blood: 700,
            atk: 70,
            defense: 25,
            speed: 12,
            gold: 70,
            hue: 120
        },
        {
            src: 'resource/img/enemySoldier4.png',
            blood: 850,
            atk: 80,
            defense: 30,
            speed: 12,
            gold: 100,
            hue: 180
        },
        {
            src: 'resource/img/enemySoldier5.png',
            blood: 1000,
            atk: 90,
            defense: 30,
            speed: 10,
            gold: 150,
            hue: 240
        }
    ]

    const bulletList = [
        {
            introduce: '普通子弹',
            width: 30,
            height: 30,
            atk: 70,
            color: 'rgb(0, 255, 128)',
            polygon: '50% 0, 100% 40%, 100% 100%, 50% 60%, 0 100%, 0 40%',
            effect: [],
        },
        {
            introduce: '穿甲弹',
            width: 30,
            height: 30,
            atk: 40,
            color: 'rgb(40, 169, 255)',
            polygon: '0 100%, 50% 0, 100% 100%, 50% 70%',
            effect: ['penetrate'],
        },
        {
            introduce: '攻击力最高',
            width: 30,
            height: 35,
            atk: 150,
            color: 'rgb(251, 56, 56)',
            polygon: '50% 0, 100% 40%, 100% 100%, 50% 60%, 0 100%, 0 40%',
            effect: [],
        },
        {
            introduce: '击退敌人',
            width: 30,
            height: 35,
            atk: 85,
            color: '#9727ff',
            polygon: '50% 0%, 100% 30%, 75% 100%, 50% 65%, 25% 100%, 0 30%',
            effect: ['repel'],
        },
        {
            introduce: '消除敌方子弹',
            width: 40,
            height: 35,
            atk: 70,
            color: '#ffaf0e',
            polygon: '50% 0px, 67% 33%, 100% 50%, 67% 67%, 50% 100%, 33% 67%, 0px 50%, 33% 33%',
            effect: ['clearBullet'],
        }
    ]

    const bossList = [
        {
            BGX: 0,
            blood: 15000,
            atk: 150,
            defense: 40,
            gold: 500
        }, {
            BGX: -360,
            blood: 17000,
            atk: 170,
            defense: 40,
            gold: 600
        }, {
            BGX: -720,
            blood: 19000,
            atk: 190,
            defense: 45,
            gold: 700
        }, {
            BGX: -1080,
            blood: 21000,
            atk: 210,
            defense: 45,
            gold: 800
        }, {
            BGX: -1440,
            blood: 23000,
            atk: 230,
            defense: 50,
            gold: 900
        }
    ]

    const propsList = [
        {
            introduce: '攻击力+50,僚机+20,持续6s',
            index: 0,
            BGX: 0,
            propsFn() {
                myAtk += 50;
                myAtkSpan.innerText = '攻击力' + (myAtk + bulletList[currentBullet].atk);
                wingmanAtk += 20;
                wingmanAtkSpan.innerText = '僚机' + wingmanAtk;
                setTimeout(() => {
                    myAtk -= 50;
                    myAtkSpan.innerText = '攻击力' + (myAtk + bulletList[currentBullet].atk);
                    wingmanAtk -= 20;
                    wingmanAtkSpan.innerText = '僚机' + wingmanAtk;
                }, 6000);
            }
        }, {
            introduce: '防御力+60,持续6s',
            index: 1,
            BGX: -60,
            propsFn() {
                myDefense += 60;
                myDefenseSpan.innerText = '防御力' + myDefense;
                setTimeout(() => {
                    myDefense -= 60;
                    myDefenseSpan.innerText = '防御力' + myDefense;
                }, 6000);
            }
        }, {
            introduce: '血量 +200',
            index: 2,
            BGX: -120,
            propsFn() {
                changeMyBlood(200);
            }
        }, {
            introduce: '得分计算×2,持续8秒',
            index: 3,
            BGX: -180,
            propsFn() {
                multipleScore *= 2;
                setTimeout(() => multipleScore /= 2, 8000);
            }
        }, {
            introduce: '连射子弹，持续6秒',
            index: 4,
            BGX: -240,
            propsFn() {
                propsFnTimer4_1 && clearInterval(propsFnTimer4_1);
                propsFnTimer4_1 = setInterval(() => {
                    const bullet = bulletList[currentBullet];
                    createMyBullet(myPlaneX - bullet.width / 2);
                    createMyBullet(myPlaneX + myPlaneW - bullet.width / 2);
                }, 300);

                propsFnTimer4_2 && clearTimeout(propsFnTimer4_2);
                propsFnTimer4_2 = setTimeout(() => clearInterval(propsFnTimer4_1), 6000);
            }
        }, {
            introduce: '冰冻敌人，持续6秒',
            index: 5,
            BGX: -300,
            propsFn() {
                for (let i = 0; i < 3; i++) {
                    setTimeout(() => {
                        showMagnify('rgba(0, 187, 255, 0.7)');
                        const enemys = document.querySelectorAll('.enemy');
                        enemys.forEach(enemy => enemy.setAttribute('frozen', 'frozen'));
                    }, i * 700);
                }

                propsFnTimer5 && clearTimeout(propsFnTimer5);
                propsFnTimer5 = setTimeout(() => {
                    const frozens = document.querySelectorAll('[frozen]');
                    frozens.forEach(frozen => frozen.removeAttribute('frozen'));
                }, 6000);
            }
        }, {
            introduce: '能量 +1000',
            index: 6,
            BGX: -360,
            propsFn() {
                energy += 1000;
                energyProg.value = energy;
                highBullet.style.display = 'block';
            }
        }
    ]

    const skillList = [
        {
            introduce: '疯狂连射（敌人越多，子弹越多）',
            index: 0,
            time: 0,
            icon: 'dartle',
            skillFn() {
                this.time = 30;
                const enemys = document.querySelectorAll('.enemy');
                enemys.forEach((enemy, index) => {
                    for (let i = 0; i < 15; i++) {
                        setTimeout(() => {
                            const rect = enemy.getBoundingClientRect();
                            if (rect.width <= 0) return;
                            createMyBullet(rect.left + (rect.width - bulletList[currentBullet].width) / 2, WinH);
                        }, index * 100 + i * 100);
                    }
                });
            }
        }, {
            introduce: '消除敌人全部子弹',
            index: 1,
            time: 0,
            icon: 'interference',
            skillFn() {
                this.time = 20;
                for (let i = 0; i < 5; i++) {
                    setTimeout(() => {
                        showMagnify('rgba(255, 179, 0, 0.7)');
                        const enemyBullets = document.querySelectorAll('.enemyBullet');
                        enemyBullets.forEach((enemyBullet, index) => {
                            const rect = enemyBullet.getBoundingClientRect();
                            createExplosion(rect.top, rect.left + rect.width / 2 - 30);
                            createdAudio('explosion');
                            enemyBullet.remove();
                        });
                    }, i * 700);
                }
            }
        }, {
            introduce: '提升僚机攻击速度',
            index: 3,
            time: 0,
            icon: 'wingmanDartle',
            skillFn() {
                this.time = 20;
                wingmanDartle = 100;
                setTimeout(() => wingmanDartle = 2, 6000);
            }
        }
    ]

    // 展示提示
    function hint(str, time) {
        const hint = document.createElement('div');
        hint.classList.add('hint');
        hint.innerText = str;
        game.appendChild(hint);
        setTimeout(() => hint.remove(), time || 2000);
    }

    // 画面效果
    function showMagnify(color) {
        const magnify = document.createElement('div');
        magnify.classList.add('magnify');
        magnify.style.display = 'block';
        magnify.style.top = myPlaneY - myPlaneH / 2 + 'px';
        magnify.style.left = myPlaneX - myPlaneW / 2 + 'px';
        magnify.style.backgroundColor = color;
        magnify.addEventListener('animationend', () => magnify.remove());
        game.appendChild(magnify);
    }

    // 创建自己的子弹
    function createMyBullet(left, top = myPlaneY) {
        const bullet = document.createElement('div');
        bullet.style.top = top + 'px';
        bullet.classList.add('bullet');

        const { width, height, atk, color, polygon, effect } = bulletList[currentBullet];
        bullet.style.width = width + 'px';
        bullet.style.height = height + 'px';
        bullet.style.backgroundColor = color;
        bullet.style.clipPath = `polygon(${polygon})`;

        effect.forEach(eff => bullet.setAttribute(eff, eff));
        bullet.setAttribute('atk', atk + myAtk);

        left = left || myPlaneX + (myPlaneW - width) / 2;
        bullet.style.left = left + 'px';

        game.appendChild(bullet);
        bullet.addEventListener('animationend', e => e.target.remove());
    }

    // 创建僚机的子弹
    function createWingmanBullet(x1, y1, x2, y2) {
        const bullet = document.createElement('img');
        bullet.classList.add('bullet', 'wingmanBullet');
        // 设置起点
        bullet.style.top = y1 + 'px';
        bullet.style.left = x1 + 'px';
        game.appendChild(bullet);
        bullet.setAttribute('src', 'resource/img/wingmanBullet.png');
        bullet.setAttribute('atk', wingmanAtk);
        bullet.addEventListener('transitionend', e => e.target.remove());

        // 延时
        setTimeout(() => {
            // 计算过渡时间（子弹速度）
            const speed = Math.abs(y1 - y2) / WinH;
            bullet.style.transition = `top ${speed}s, left ${speed}s`;

            // 设置终点
            bullet.style.top = y2 * 2 - y1 + 'px';
            bullet.style.left = x2 * 2 - x1 + 'px';
        }, 100);
    }

    // 创建敌机
    function createEnemy(enemyType) {
        const enemy = document.createElement('img');
        enemy.classList.add('enemy');
        enemy.style.top = '-100px';
        enemy.setAttribute('ttop', -100);
        enemy.style.left = randomNumZero(WinW - 100) + 'px';

        const { src, blood, atk, defense, speed, gold, hue } = enemyType;
        enemy.setAttribute('src', src);
        enemy.setAttribute('blood', blood);
        enemy.setAttribute('atk', atk);
        enemy.setAttribute('defense', defense);
        enemy.setAttribute('gold', gold);
        enemy.setAttribute('hue', hue);

        enemy.style.animation = `enemy ${speed}s linear forwards`;
        game.appendChild(enemy);
        // 动画结束，代表敌机逃跑
        enemy.addEventListener('animationend', e => {
            e.target.remove();
            changeMyBlood(-100);
        });
    }

    // 创建boss
    function createBoss(bossType) {
        // 弹出警告
        createdAudio('warn1');
        warn.style.display = 'block';

        const boss = document.createElement('div');
        boss.classList.add('enemy', 'boss');
        boss.setAttribute('boss', 'boss');
        boss.style.left = randomNumZero(WinW - 300) + 'px';

        const { BGX, blood, atk, defense, gold } = bossType;
        boss.style.backgroundPositionX = BGX + 'px';
        boss.setAttribute('blood', blood);
        boss.setAttribute('atk', atk);
        boss.setAttribute('defense', defense);
        boss.setAttribute('gold', gold);

        game.appendChild(boss);
        boss.addEventListener('animationend', e => {
            e.target.remove();
            changeMyBlood(-1000);
        });
    }

    // 创建敌人子弹
    function createEnemyBullet(enemy, left) {
        if (enemy.getAttribute('frozen')) return;
        const rect = enemy.getBoundingClientRect();

        // 由于是延时创建子弹，所以要在创建前，判断敌机还是否存在，宽度小于零代表敌机不存在
        if (rect.width <= 0) return;

        const bullet = document.createElement('img');
        bullet.classList.add('enemyBullet');

        bullet.style.top = rect.top + rect.height / 2 + 'px';
        left = left || rect.left + rect.width / 2 - 10;
        bullet.style.left = left + 'px';

        bullet.setAttribute('atk', enemy.getAttribute('atk'));
        bullet.setAttribute('src', 'resource/img/bullet1.png');

        game.appendChild(bullet);
        bullet.addEventListener('animationend', e => e.target.remove());

        if (enemy.getAttribute('boss')) {
            bullet.setAttribute('src', 'resource/img/bullet2.png');
            bullet.style.width = '25px';
        } else {
            bullet.style.filter = `hue-rotate(${enemy.getAttribute('hue')}deg)`;
        }
    }

    // 创建道具
    function createProps(top, left) {
        const props = document.createElement('div');
        props.classList.add('props');
        props.style.top = top + 'px';
        props.style.left = left + 'px';

        const random = randomNumZero(propsList.length - 1);
        props.style.backgroundPositionX = propsList[random].BGX + 'px';
        props.setAttribute('index', propsList[random].index);
        props.setAttribute('introduce', propsList[random].introduce);

        game.appendChild(props);
        props.addEventListener('animationend', e => e.target.remove());
    }

    // 判断是否碰撞
    function rectIntersect(el1, el2) {
        const rect1 = el1.getBoundingClientRect(),
            rect2 = el2.getBoundingClientRect();
        return rect1.right > rect2.left && rect1.left < rect2.right && rect1.bottom > rect2.top && rect1.top < rect2.bottom;
    }

    // 判断敌人的子弹和自己是否碰撞
    function intersect_enemyBullet_my() {
        const enemyBullets = document.querySelectorAll('.enemyBullet');
        enemyBullets.forEach(enemyBullet => {
            if (rectIntersect(enemyBullet, myPlane)) {
                const calc = -(parseInt(enemyBullet.getAttribute('atk') - myDefense));
                // 防止由于自己防御力太高，出现正数
                if (calc < 0) {
                    changeMyBlood(calc);
                    const rect = enemyBullet.getBoundingClientRect();
                    createExplosion(rect.top + 15, rect.left - 25);
                }
                enemyBullet.remove();
            }
        });
    }

    // 判断敌人的子弹和自己的子弹是否碰撞
    function intersect_enemyBullet_myBullet() {
        const enemyBullets = document.querySelectorAll('.enemyBullet');
        const myBullets = document.querySelectorAll('[clearBullet].bullet');
        enemyBullets.forEach(enemyBullet => {
            myBullets.forEach(myBullet => {
                if (rectIntersect(enemyBullet, myBullet)) {
                    const rect = myBullet.getBoundingClientRect();
                    createExplosion(rect.top - 50, rect.left - rect.width / 2);
                    createdAudio('explosion');

                    enemyBullet.remove();
                    myBullet.remove();
                }
            });
        });
    }

    // 判断自己的子弹和敌机是否碰撞
    function intersect_bullet_enemy() {
        const bullets = document.querySelectorAll('.bullet');
        const enemys = document.querySelectorAll('.enemy');

        bullets.forEach(bullet => {
            enemys.forEach(enemy => {
                if (rectIntersect(bullet, enemy)) {
                    const rect = bullet.getBoundingClientRect();
                    createExplosion(rect.top - 50, rect.left - rect.width / 2);

                    // 击退敌人逻辑
                    const isBoss = enemy.getAttribute('boss');
                    if (bullet.getAttribute('repel') && !isBoss) {
                        const ttop = parseInt(enemy.getAttribute('ttop'));
                        enemy.style.top = ttop - 50 + 'px';
                        enemy.setAttribute('ttop', ttop - 50);

                        const duration = parseFloat(getComputedStyle(enemy).animationDuration);
                        enemy.style.animationDuration = duration + duration * 0.03 + 's';
                    }

                    // 穿甲子弹逻辑
                    if (bullet.getAttribute('penetrate')) {
                        const num = parseInt(bullet.getAttribute('num'));
                        if (num) {
                            const calc = num - 1;
                            calc ? bullet.setAttribute('num', calc) : bullet.remove();
                        } else {
                            bullet.setAttribute('num', 2);
                        }
                    } else {
                        bullet.remove();
                    }

                    const atk = bullet.getAttribute('atk');
                    const blood = enemy.getAttribute('blood');
                    const defense = enemy.getAttribute('defense');

                    const calc = blood - (atk - defense);

                    if (calc > 0) {
                        enemy.setAttribute('blood', calc);
                    } else {
                        // 击败了敌人
                        createdAudio('explosion');
                        const rect = enemy.getBoundingClientRect();
                        enemy.remove();

                        // 增加得分
                        const gold = parseInt(enemy.getAttribute('gold'));
                        myGold += multipleScore * gold;
                        myGoldSpan.innerText = '得分 ' + myGold;

                        // 增加能量
                        energy += gold;
                        energyProg.value = energy;
                        if (energy >= 1000) {
                            highBullet.style.display = 'block';
                        }

                        // 有概率掉落道具
                        if (lucky > Math.random()) {
                            createProps(rect.top, rect.left + rect.width / 2 - 30);
                        }

                        if (isBoss) {
                            console.log('你击败了boss!');
                            if (currentBoss >= bossList.length) {
                                gameOver(true);
                            }
                        }
                    }
                }
            });
        });
    }

    // 判断是否碰撞到道具
    function intersect_myPlane_props() {
        const propss = document.querySelectorAll('.props');
        propss.forEach(props => {
            if (rectIntersect(myPlane, props)) {
                createdAudio('joy1');
                hint(props.getAttribute('introduce'));

                propsList[props.getAttribute('index')].propsFn();
                props.remove();
            }
        });
    }

    // 改变自己的血量
    function changeMyBlood(num) {
        myBlood += num;
        if (myBlood <= 0) {
            gameOver(false);
        } else if (myBlood > 1000) {
            myBlood = 1000;
        }
        myBloodProg.value = myBlood;
    }

    // 游戏结束
    function gameOver(flag) {
        // 每局只能触发一次
        if (gameFlag) return;
        gameFlag = true;

        createdAudio(flag ? 'win' : 'fail');

        setTimeout(() => {
            const msg = flag ? '你胜利了' : '你已阵亡';
            alert(msg + '\n最终得分: ' + myGold);
            bgmAudio.pause();
            init();
        }, 200);
    }

    // 创建爆炸效果
    function createExplosion(top, left) {
        const explosion = document.createElement('div');
        explosion.classList.add('explosion');
        explosion.style.top = `${top}px`;
        explosion.style.left = `${left}px`;
        game.appendChild(explosion);
        explosion.addEventListener('animationend', e => e.target.remove());
    }

    // 获取零开头的随机整数
    function randomNumZero(num) {
        return Math.floor(Math.random() * (num + 1));
    }

    // 浏览器下次重绘之前调用
    function requestAnimationFrame_() {
        intersect_bullet_enemy();
        intersect_myPlane_props();
        intersect_enemyBullet_my();
        intersect_enemyBullet_myBullet();
        requestAnimationFrame(requestAnimationFrame_);
    }

    // 创建音频
    function createdAudio(src) {
        const audio = document.createElement('audio');
        audio.setAttribute('src', `resource/audio/${src}.mp3`);
        game.appendChild(audio);
        audio.addEventListener('ended', e => e.target.remove());
        audio.autoplay = true;
        audio.play();
    }

    // 僚机的移动
    function wingmanMove() {
        wingman1.style.top = myPlaneY + 30 + 'px';
        wingman1.style.left = myPlaneX - 35 - 10 + 'px';
        wingman2.style.top = myPlaneY + 30 + 'px';
        wingman2.style.left = myPlaneX + myPlaneW + 10 + 'px';
    }

    // 飞机的移动
    function myPlaneMove() {
        const touchEvent = ['touchstart', 'touchmove'];

        touchEvent.forEach(evt => {
            document.addEventListener(evt, e => {
                // 防止游戏中点击按钮时，飞机移动到按钮位置
                if (e.target.getAttribute('invalid') || gamePause) return;
                isTouch = true;

                // 通过事件对象获取手指坐标，控制飞机移动
                const { clientY, clientX } = e.targetTouches[0];
                myPlaneY = clientY - myPlaneH / 2;
                myPlaneX = clientX - myPlaneW / 2;
                myPlane.style.top = myPlaneY + 'px';
                myPlane.style.left = myPlaneX + 'px';

                wingmanMove();
            });
        });

        document.addEventListener('touchend', () => isTouch = false);

        // 陀螺仪控制飞机移动
        window.addEventListener('deviceorientation', e => {
            if (isTouch || gamePause) return;

            const x = e.gamma.toFixed(2);
            const y = e.beta.toFixed(2);
            // const z = e.alpha.toFixed(2);

            myPlaneY = y * moveSpeedY + WinH / 2 - myPlaneW / 2;
            myPlaneX = x * moveSpeedX + WinW / 2 - myPlaneH / 2;

            // 阻止飞机超出屏幕
            if (myPlaneY <= 0) myPlaneY = 0;
            else if (myPlaneY >= WinH - myPlaneH) myPlaneY = WinH - myPlaneH;

            if (myPlaneX <= 0) myPlaneX = 0;
            else if (myPlaneX >= WinW - myPlaneW) myPlaneX = WinW - myPlaneW;

            myPlane.style.top = myPlaneY + 'px';
            myPlane.style.left = myPlaneX + 'px';

            wingmanMove();
        });
    }

    // 初始化
    function init() {
        myPlaneY = WinH - myPlaneH * 2;
        myPlaneX = (WinW - myPlaneW) / 2;
        myBlood = 1000;
        myAtk = 30;
        myDefense = 30;
        myGold = 0;
        lucky = 0.3;
        currentBullet = 0;
        energy = 0;
        currentBoss = 0;
        wingmanAtk = 30;
        wingmanDartle = 2;
        multipleScore = 1;

        myPlane.style.top = myPlaneY + 'px';
        myPlane.style.left = myPlaneX + 'px';
        myPlane.style.width = myPlaneW + 'px';
        myPlane.style.height = myPlaneH + 'px';
        wingmanMove();

        myBloodProg.value = myBlood;
        myBloodProg.setAttribute('max', myBlood);
        myAtkSpan.innerText = '攻击力' + (myAtk + bulletList[currentBullet].atk);
        myDefenseSpan.innerText = '防御力' + myDefense;
        myGoldSpan.innerText = '得分 ' + myGold;
        wingmanAtkSpan.innerText = '僚机' + wingmanAtk;
        energyProg.value = energy;

        play.style.display = 'block';
        show.style.display = 'none';
        energyProg.style.display = 'none';
        highBullet.style.display = 'none';
        skills.style.display = 'none';

        // 清除创建元素的定时器
        createMyBulletTimer && clearInterval(createMyBulletTimer);
        createEnemyTimer && clearInterval(createEnemyTimer);
        createEnemyBulletTimer && clearInterval(createEnemyBulletTimer);
        createBossTimer && clearInterval(createBossTimer);
        createWingmanTimer && clearInterval(createWingmanTimer);

        // 清除所有子弹、敌机、道具等
        const bullets = document.querySelectorAll('.bullet');
        bullets.forEach(bullet => bullet.remove());
        const enemys = document.querySelectorAll('.enemy');
        enemys.forEach(enemy => enemy.remove());
        const propss = document.querySelectorAll('.props');
        propss.forEach(props => props.remove());
        const enemyBullets = document.querySelectorAll('.enemyBullet');
        enemyBullets.forEach(enemyBullet => enemyBullet.remove());

        // 恢复技能冷却时间
        const forbids = document.querySelectorAll('[forbid]');
        forbids.forEach(forbid => forbid.removeAttribute('forbid'));
        skillList.forEach(skill => skill.time = 0);

        menuAudio.play();
    }

    // 游戏开始
    function gameStart() {
        // 持续创建子弹
        createMyBulletTimer = setInterval(() => {
            if (gamePause) return;

            createMyBullet();
        }, 150);

        // 持续创建敌机
        createEnemy(enemyList[0]);
        createEnemyTimer = setInterval(() => {
            if (gamePause) return;

            const num = randomNumZero(enemyList.length - 1);
            createEnemy(enemyList[num]);
        }, 1500);

        // 创建boss
        createBossTimer = setInterval(() => {
            if (gamePause) return;

            if (currentBoss < bossList.length) {
                createBoss(bossList[currentBoss]);
                currentBoss++;
            }
        }, 60000);

        // 创建敌人的子弹
        createEnemyBulletTimer = setInterval(() => {
            if (gamePause) return;

            const enemys = document.querySelectorAll('.enemy');
            enemys.forEach(enemy => {
                if (enemy.getAttribute('boss')) {
                    const rect = enemy.getBoundingClientRect();
                    setTimeout(() => {
                        if (gamePause) return;

                        createEnemyBullet(enemy, rect.left);
                        createEnemyBullet(enemy, rect.left + rect.width - 25);
                    }, randomNumZero(10) * 200);
                }

                setTimeout(() => {
                    if (gamePause) return;

                    createEnemyBullet(enemy);
                }, randomNumZero(10) * 200);
            });
        }, 3000);

        // 创建僚机的子弹
        createWingmanTimer = setInterval(() => {
            if (gamePause) return;

            const enemys = document.querySelectorAll('.enemy');
            enemys.forEach((enemy, index) => {
                if (index > wingmanDartle) return;
                setTimeout(() => {
                    const enemyRect = enemy.getBoundingClientRect();
                    const enemyLeft = enemyRect.left + enemyRect.width / 2 - 10;
                    const enemyTop = enemyRect.top + enemyRect.height / 2;

                    const wingmanRect1 = wingman1.getBoundingClientRect();
                    createWingmanBullet(
                        wingmanRect1.left + 5,
                        wingmanRect1.top,
                        enemyLeft,
                        enemyTop
                    );

                    const wingmanRect2 = wingman2.getBoundingClientRect();
                    createWingmanBullet(
                        wingmanRect2.left + 5,
                        wingmanRect2.top,
                        enemyLeft,
                        enemyTop
                    );
                }, index * 300);
            });
        }, 1000);

        // 其它
        play.style.display = 'none';
        show.style.display = 'block';
        energyProg.style.display = 'block';
        skills.style.display = 'block';
        gameFlag = false;
        gamePause = false;

        setTimeout(() => {
            bgmAudio.play();
            bgmAudio.currentTime = 0;
            menuAudio.pause();
            createdAudio('warn2');
        }, 100);
    }

    // 准备
    function prepare() {
        window.addEventListener('error', e => {
            console.log('捕获错误', e);
            localStorage.setItem('plane_wars_error', e.error.stack + '---' + (localStorage.getItem('plane_wars_error') || ''));
        });

        // 暂停或继续游戏
        pauseBtn.addEventListener('touchstart', () => {
            gamePause = !gamePause;
            const enemys = document.querySelectorAll('.enemy');
            const enemyBullets = document.querySelectorAll('.enemyBullet');
            const bullets = document.querySelectorAll('.bullet');
            const props = document.querySelectorAll('.props');
            const flag = gamePause ? 'paused' : 'running';
            enemys.forEach(enemy => enemy.style.animationPlayState = flag);
            enemyBullets.forEach(enemyBullet => enemyBullet.style.animationPlayState = flag);
            bullets.forEach(bullet => bullet.style.animationPlayState = flag);
            props.forEach(prop => prop.style.animationPlayState = flag);
            pauseBtn.setAttribute('src', `resource/img/${flag}.png`);
        });

        // 高级子弹列表
        bulletList.forEach((bullet, index) => {
            if (!index) return;
            const highBull = document.createElement('div');
            highBull.style.width = bullet.width + 'px';
            highBull.style.height = bullet.height + 'px';
            highBull.style.backgroundColor = bullet.color;
            highBull.style.clipPath = `polygon(${bullet.polygon})`;
            highBull.setAttribute('invalid', 'invalid');
            highBullet.appendChild(highBull);

            // 改变当前子弹的类型
            highBull.addEventListener('touchstart', function () {
                if (energy < 1000 || gamePause) return;
                createdAudio('click');
                hint(bullet.introduce);

                highBullet.style.display = 'none';
                currentBullet = index;
                myAtkSpan.innerText = '攻击力' + (myAtk + bulletList[currentBullet].atk);

                changeBulletTimer && clearTimeout(changeBulletTimer);
                changeBulletTimer = setTimeout(() => {
                    currentBullet = 0;
                    myAtkSpan.innerText = '攻击力' + (myAtk + bulletList[currentBullet].atk);
                }, energy * 6);

                energy = 0;
                energyProg.value = energy;
            });
        });

        // 技能列表
        skillList.forEach(skill => {
            const skillImg = document.createElement('img');
            skillImg.setAttribute('src', `resource/img/${skill.icon}.png`);
            skillImg.setAttribute('invalid', 'invalid');
            skills.appendChild(skillImg);

            skillImg.addEventListener('touchstart', () => {
                if (skill.time > 0 || gamePause) return createdAudio('prevent');
                createdAudio('click');
                hint(skill.introduce);

                skillList[skill.index].skillFn();
                skillImg.setAttribute('forbid', 'forbid');

                // 冷却时间定时器
                setTimeout(() => {
                    skill.time = 0;
                    skillImg.removeAttribute('forbid');
                    createdAudio('recover');
                }, skill.time * 1000);
            });
        });

        // 操作飞机
        myPlaneMove();

        // 碰撞检测
        requestAnimationFrame_();

        // 警告
        warn.addEventListener('animationend', () => warn.style.display = 'none');

        init();

        // 调试模式
        myBloodProg.addEventListener('click', () => {
            if (+new Date() - debugMode.record < 300) {
                debugMode.count++;
                if (debugMode.count > 5) {
                    myAtk = 999;
                    myAtkSpan.innerText = '攻击力?????';
                    wingmanAtk = 999;
                    wingmanAtkSpan.innerText = '僚机?????';
                }
            } else {
                debugMode.count = 0;
            }

            debugMode.record = +new Date();
        });

        // 开始游戏
        play.addEventListener('touchstart', gameStart);
        play.setAttribute('src', 'resource/img/play.png');
    }

    prepare();

})();
