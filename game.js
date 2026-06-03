// ========== 游戏常量 ==========
const GRID_COLS = 8;
const GRID_ROWS = 5;
const TOTAL_ITEMS = GRID_COLS * GRID_ROWS;
const ICONS = ['🌟', '🎨', '🎭', '🎪', '🎯', '🎲', '🎸', '🎺', '🎻', '🎬', '🎤', '🎧', '🎮', '🎰', '🧩', '🎨'];
const GAME_TIME = 60;
const MATCH_REWARD = 10;

// ========== 游戏状态 ==========
let gameState = {
    items: [],
    selected: [],
    score: 0,
    remaining: 0,
    gameActive: false,
    gameStarted: false,
    timeLeft: GAME_TIME,
    timerInterval: null,
    gridSize: { cols: GRID_COLS, rows: GRID_ROWS }
};

// ========== 初始化游戏 ==========
function initGame() {
    gameState.items = generateItems();
    gameState.score = 0;
    gameState.remaining = gameState.items.filter(item => item.icon !== null).length;
    gameState.selected = [];
    gameState.timeLeft = GAME_TIME;
    gameState.gameActive = false;
    gameState.gameStarted = false;
    
    renderBoard();
    updateUI();
}

// ========== 生成游戏项 ==========
function generateItems() {
    const items = [];
    const itemCount = (TOTAL_ITEMS / 2);
    
    // 生成配对的图标
    const selectedIcons = ICONS.slice(0, itemCount);
    const allItems = [...selectedIcons, ...selectedIcons].sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < TOTAL_ITEMS; i++) {
        items.push({
            id: i,
            icon: i < allItems.length ? allItems[i] : null,
            matched: false,
            row: Math.floor(i / GRID_COLS),
            col: i % GRID_COLS
        });
    }
    
    return items;
}

// ========== 渲染棋盘 ==========
function renderBoard() {
    const gameBoard = document.getElementById('gameBoard');
    gameBoard.innerHTML = '';
    
    gameState.items.forEach(item => {
        const element = document.createElement('div');
        element.className = 'game-item';
        element.id = `item-${item.id}`;
        element.dataset.id = item.id;
        
        if (item.matched) {
            element.classList.add('matched');
            element.innerHTML = '<span class="icon">✓</span>';
        } else if (item.icon) {
            element.innerHTML = item.icon;
        } else {
            element.classList.add('empty');
            element.innerHTML = '<span class="icon">✕</span>';
        }
        
        if (gameState.selected.some(s => s.id === item.id)) {
            element.classList.add('selected');
        }
        
        element.addEventListener('click', () => selectItem(item.id));
        gameBoard.appendChild(element);
    });
}

// ========== 选择项 ==========
function selectItem(itemId) {
    if (!gameState.gameActive) return;
    
    const item = gameState.items.find(i => i.id === itemId);
    if (!item || item.matched) return;
    
    // 如果点击已选择的项，取消选择
    if (gameState.selected.some(s => s.id === itemId)) {
        gameState.selected = gameState.selected.filter(s => s.id !== itemId);
    } else if (gameState.selected.length < 2) {
        gameState.selected.push(item);
        
        // 如果选择了两个项，检查是否匹配
        if (gameState.selected.length === 2) {
            checkMatch();
        }
    }
    
    renderBoard();
}

// ========== 检查匹配 ==========
function checkMatch() {
    const [item1, item2] = gameState.selected;
    
    if (item1.icon === item2.icon) {
        // 匹配成功
        setTimeout(() => {
            item1.matched = true;
            item2.matched = true;
            gameState.score += MATCH_REWARD;
            gameState.remaining -= 2;
            gameState.selected = [];
            
            renderBoard();
            updateUI();
            
            if (gameState.remaining === 0) {
                endGame(true);
            }
        }, 300);
    } else {
        // 匹配失败，延迟后取消选择
        setTimeout(() => {
            gameState.selected = [];
            renderBoard();
        }, 800);
    }
}

// ========== 开始游戏 ==========
function startGame() {
    gameState.gameActive = true;
    gameState.gameStarted = true;
    document.getElementById('startBtn').disabled = true;
    
    startTimer();
}

// ========== 计时器 ==========
function startTimer() {
    gameState.timerInterval = setInterval(() => {
        gameState.timeLeft--;
        document.getElementById('timer').textContent = gameState.timeLeft;
        
        if (gameState.timeLeft <= 0) {
            endGame(false);
        }
    }, 1000);
}

// ========== 结束游戏 ==========
function endGame(won) {
    gameState.gameActive = false;
    clearInterval(gameState.timerInterval);
    document.getElementById('startBtn').disabled = false;
    
    const modal = document.getElementById('gameOverModal');
    const title = document.getElementById('gameOverTitle');
    const message = document.getElementById('gameOverMessage');
    const finalScore = document.getElementById('finalScore');
    
    if (won) {
        title.textContent = '🎉 恭喜！';
        message.textContent = `你成功消除了所有的方块！用时：${GAME_TIME - gameState.timeLeft}秒`;
    } else {
        title.textContent = '⏱️ 时间到！';
        message.textContent = `游戏结束。还剩 ${gameState.remaining} 个方块未消除。`;
    }
    
    finalScore.textContent = gameState.score;
    modal.classList.add('show');
}

// ========== 更新UI ==========
function updateUI() {
    document.getElementById('score').textContent = gameState.score;
    document.getElementById('remaining').textContent = gameState.remaining;
}

// ========== 重置游戏 ==========
function resetGame() {
    gameState.gameActive = false;
    clearInterval(gameState.timerInterval);
    document.getElementById('gameOverModal').classList.remove('show');
    document.getElementById('startBtn').disabled = false;
    initGame();
}

// ========== 提示功能 ==========
function showTip() {
    if (!gameState.gameActive) return;
    
    const unmatched = gameState.items.filter(item => !item.matched && item.icon);
    if (unmatched.length < 2) return;
    
    // 查找第一对相同的图标
    const firstIcon = unmatched[0].icon;
    const secondItem = unmatched.find((item, index) => item.icon === firstIcon && index > 0);
    
    if (secondItem) {
        // 高亮显示这一对
        gameState.selected = [unmatched[0], secondItem];
        renderBoard();
        
        setTimeout(() => {
            gameState.selected = [];
            renderBoard();
        }, 1500);
    }
}

// ========== 事件监听 ==========
document.addEventListener('DOMContentLoaded', () => {
    initGame();
    
    document.getElementById('startBtn').addEventListener('click', startGame);
    document.getElementById('resetBtn').addEventListener('click', resetGame);
    document.getElementById('tipsBtn').addEventListener('click', showTip);
    
    // 添加键盘快捷键
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !gameState.gameStarted) {
            startGame();
        } else if (e.key === 'r' || e.key === 'R') {
            resetGame();
        } else if (e.key === ' ') {
            e.preventDefault();
            showTip();
        }
    });
});

// ========== 辅助函数：计算两点间距离 ==========
function calculateDistance(pos1, pos2) {
    return Math.sqrt(Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2));
}

// ========== 辅助函数：检查是否可以连接 ==========
function canConnect(item1, item2) {
    // 检查是否有可达的直线路径（最多两条转折）
    const paths = [
        // 直线路径
        { row: item1.row, col: item2.col },
        { row: item2.row, col: item1.col }
    ];
    
    for (let path of paths) {
        if (isPathClear(item1, path) && isPathClear(path, item2)) {
            return true;
        }
    }
    
    return false;
}

// ========== 辅助函数：检查路径是否清晰 ==========
function isPathClear(from, to) {
    const minRow = Math.min(from.row, to.row);
    const maxRow = Math.max(from.row, to.row);
    const minCol = Math.min(from.col, to.col);
    const maxCol = Math.max(from.col, to.col);
    
    for (let i = minRow; i <= maxRow; i++) {
        for (let j = minCol; j <= maxCol; j++) {
            const item = gameState.items.find(it => it.row === i && it.col === j);
            if (item && !item.matched && item.icon && !(item.row === from.row && item.col === from.col) && !(item.row === to.row && item.col === to.col)) {
                return false;
            }
        }
    }
    
    return true;
}
