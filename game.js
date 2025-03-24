// Khai báo các biến toàn cục
let canvas, ctx;
let player;
let prey = [];
let obstacles = [];
let bubbles = [];
let ripples = [];
let score = 0;
let size = 1;
let gameTime = 0;
let gameActive = false;
let gameInterval;
let lastTimestamp = 0;
let keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false
};

// Các âm thanh
const eatSound = document.getElementById('eatSound');
const hitSound = document.getElementById('hitSound');
const gameOverSound = document.getElementById('gameOverSound');
const backgroundMusic = document.getElementById('backgroundMusic');

// Các phần tử DOM
const gameOverScreen = document.getElementById('gameOver');
const startScreen = document.getElementById('startScreen');
const startButton = document.getElementById('startButton');
const restartButton = document.getElementById('restartButton');
const scoreElement = document.getElementById('score');
const timeElement = document.getElementById('time');
const sizeElement = document.getElementById('size');
const finalScoreElement = document.getElementById('finalScore');
const survivalTimeElement = document.getElementById('survivalTime');

// Chữ cái tiếng Việt để làm vật cản
const vietnameseLetters = [
    'a', 'á', 'à', 'ả', 'ã', 'ạ',
    'ă', 'ắ', 'ằ', 'ẳ', 'ẵ', 'ặ',
    'â', 'ấ', 'ầ', 'ẩ', 'ẫ', 'ậ',
    'e', 'é', 'è', 'ẻ', 'ẽ', 'ẹ',
    'ê', 'ế', 'ề', 'ể', 'ễ', 'ệ',
    'i', 'í', 'ì', 'ỉ', 'ĩ', 'ị',
    'o', 'ó', 'ò', 'ỏ', 'õ', 'ọ',
    'ô', 'ố', 'ồ', 'ổ', 'ỗ', 'ộ',
    'ơ', 'ớ', 'ờ', 'ở', 'ỡ', 'ợ',
    'u', 'ú', 'ù', 'ủ', 'ũ', 'ụ',
    'ư', 'ứ', 'ừ', 'ử', 'ữ', 'ự',
    'y', 'ý', 'ỳ', 'ỷ', 'ỹ', 'ỵ',
    'd', 'đ'
];

// Màu sắc ngẫu nhiên
const colors = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
    '#9966FF', '#FF9F40', '#C9CBCF', '#7CFC00',
    '#FF1493', '#00BFFF', '#FFD700', '#32CD32'
];

// Lớp đối tượng Player (con cá của người chơi)
class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 20; // Kích thước ban đầu
        this.speed = 5;
        this.color = '#FF6384';
        this.isStunned = false;
        this.stunTime = 0;
        this.direction = 1; // 1 cho phải, -1 cho trái
    }

    update(deltaTime) {
        // Xử lý thời gian choáng
        if (this.isStunned) {
            this.stunTime -= deltaTime;
            if (this.stunTime <= 0) {
                this.isStunned = false;
            }
            return;
        }

        // Di chuyển theo phím
        if (keys.ArrowUp && this.y - this.speed - this.size / 2 > 0) {
            this.y -= this.speed;
            // Tạo bong bóng khi di chuyển
            if (Math.random() > 0.9) {
                createBubble(this.x, this.y + this.size / 2);
            }
        }
        if (keys.ArrowDown && this.y + this.speed + this.size / 2 < canvas.height) {
            this.y += this.speed;
        }
        if (keys.ArrowLeft && this.x - this.speed - this.size / 2 > 0) {
            this.x -= this.speed;
            this.direction = -1;
        }
        if (keys.ArrowRight && this.x + this.speed + this.size / 2 < canvas.width) {
            this.x += this.speed;
            this.direction = 1;
        }
    }

    draw() {
        ctx.save();
        
        // Vẽ hiệu ứng choáng
        if (this.isStunned) {
            ctx.globalAlpha = 0.5 + Math.sin(Date.now() / 100) * 0.5;
        }

        // Vẽ thân cá
        ctx.fillStyle = this.color;
        ctx.beginPath();
        
        // Hướng mặt theo hướng di chuyển
        if (this.direction > 0) {
            // Hướng phải
            ctx.ellipse(this.x, this.y, this.size, this.size / 2, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Vẽ đuôi cá
            ctx.beginPath();
            ctx.moveTo(this.x - this.size, this.y);
            ctx.lineTo(this.x - this.size - this.size / 2, this.y - this.size / 3);
            ctx.lineTo(this.x - this.size - this.size / 2, this.y + this.size / 3);
            ctx.closePath();
            ctx.fill();
            
            // Vẽ mắt
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(this.x + this.size / 2, this.y - this.size / 6, this.size / 6, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = 'black';
            ctx.beginPath();
            ctx.arc(this.x + this.size / 2 + this.size / 12, this.y - this.size / 6, this.size / 12, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Hướng trái
            ctx.ellipse(this.x, this.y, this.size, this.size / 2, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Vẽ đuôi cá
            ctx.beginPath();
            ctx.moveTo(this.x + this.size, this.y);
            ctx.lineTo(this.x + this.size + this.size / 2, this.y - this.size / 3);
            ctx.lineTo(this.x + this.size + this.size / 2, this.y + this.size / 3);
            ctx.closePath();
            ctx.fill();
            
            // Vẽ mắt
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(this.x - this.size / 2, this.y - this.size / 6, this.size / 6, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = 'black';
            ctx.beginPath();
            ctx.arc(this.x - this.size / 2 - this.size / 12, this.y - this.size / 6, this.size / 12, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }

    stun() {
        this.isStunned = true;
        this.stunTime = 2000; // Choáng trong 2 giây
    }

    grow() {
        this.size += 2;
        size = Math.floor(this.size / 20 * 10) / 10;
        sizeElement.textContent = size.toFixed(1);
    }

    shrink() {
        this.size -= 5;
        if (this.size < 10) {
            gameOver();
            return;
        }
        size = Math.floor(this.size / 20 * 10) / 10;
        sizeElement.textContent = size.toFixed(1);
    }
}

// Lớp đối tượng Prey (con cá mồi)
class Prey {
    constructor() {
        this.size = Math.random() * 15 + 5;
        this.x = Math.random() * (canvas.width - this.size * 2) + this.size;
        this.y = Math.random() * (canvas.height - this.size * 2) + this.size;
        this.speedX = (Math.random() - 0.5) * 3;
        this.speedY = (Math.random() - 0.5) * 3;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.direction = this.speedX > 0 ? 1 : -1;
    }

    update() {
        // Di chuyển cá mồi
        this.x += this.speedX;
        this.y += this.speedY;

        // Xử lý va chạm biên
        if (this.x < this.size || this.x > canvas.width - this.size) {
            this.speedX *= -1;
            this.direction = this.speedX > 0 ? 1 : -1;
        }
        if (this.y < this.size || this.y > canvas.height - this.size) {
            this.speedY *= -1;
        }
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        
        // Vẽ thân cá theo hướng di chuyển
        if (this.direction > 0) {
            // Hướng phải
            ctx.ellipse(this.x, this.y, this.size, this.size / 1.5, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Đuôi cá
            ctx.beginPath();
            ctx.moveTo(this.x - this.size, this.y);
            ctx.lineTo(this.x - this.size - this.size / 2, this.y - this.size / 3);
            ctx.lineTo(this.x - this.size - this.size / 2, this.y + this.size / 3);
            ctx.closePath();
            ctx.fill();
            
            // Mắt
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(this.x + this.size / 2, this.y - this.size / 6, this.size / 6, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = 'black';
            ctx.beginPath();
            ctx.arc(this.x + this.size / 2 + this.size / 12, this.y - this.size / 6, this.size / 12, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Hướng trái
            ctx.ellipse(this.x, this.y, this.size, this.size / 1.5, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Đuôi cá
            ctx.beginPath();
            ctx.moveTo(this.x + this.size, this.y);
            ctx.lineTo(this.x + this.size + this.size / 2, this.y - this.size / 3);
            ctx.lineTo(this.x + this.size + this.size / 2, this.y + this.size / 3);
            ctx.closePath();
            ctx.fill();
            
            // Mắt
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(this.x - this.size / 2, this.y - this.size / 6, this.size / 6, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = 'black';
            ctx.beginPath();
            ctx.arc(this.x - this.size / 2 - this.size / 12, this.y - this.size / 6, this.size / 12, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

// Lớp đối tượng Obstacle (chữ cái rơi)
class Obstacle {
    constructor() {
        this.letter = vietnameseLetters[Math.floor(Math.random() * vietnameseLetters.length)];
        this.size = Math.random() * 20 + 20;
        this.x = Math.random() * (canvas.width - this.size * 2) + this.size;
        this.y = -this.size;
        this.speed = Math.random() * 2 + 1;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.05;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.hasCreatedRipple = false;
    }

    update() {
        this.y += this.speed;
        this.rotation += this.rotationSpeed;
        
        // Tạo hiệu ứng gợn sóng khi chữ chạm mặt nước (khoảng 100px từ trên xuống)
        if (!this.hasCreatedRipple && this.y > 100 && this.y < 105) {
            createRipple(this.x, 100);
            this.hasCreatedRipple = true;
        }
        
        // Xóa chữ cái khi ra khỏi màn hình
        return this.y > canvas.height + this.size;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.font = `${this.size}px Arial`;
        ctx.fillStyle = this.color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.letter, 0, 0);
        ctx.restore();
    }
}

// Lớp đối tượng Bubble (bong bóng nước)
class Bubble {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 5 + 2;
        this.speedY = Math.random() * 2 + 1;
        this.speedX = (Math.random() - 0.5) * 1;
        this.opacity = Math.random() * 0.5 + 0.5;
        this.lifetime = Math.random() * 3000 + 2000; // Thời gian tồn tại (ms)
        this.createdAt = Date.now();
    }

    update() {
        this.y -= this.speedY;
        this.x += this.speedX;
        
        // Kiểm tra tuổi thọ
        const age = Date.now() - this.createdAt;
        if (age > this.lifetime) {
            return true; // Xóa bong bóng
        }
        
        // Giảm dần độ trong suốt khi gần hết tuổi thọ
        if (age > this.lifetime * 0.7) {
            this.opacity = Math.max(0, this.opacity - 0.01);
        }
        
        return false;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Hiệu ứng phản chiếu ánh sáng
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.beginPath();
        ctx.arc(this.x - this.size / 3, this.y - this.size / 3, this.size / 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// Lớp đối tượng Ripple (gợn sóng)
class Ripple {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 5;
        this.maxSize = Math.random() * 30 + 20;
        this.speed = Math.random() * 1 + 0.5;
        this.opacity = 1;
    }

    update() {
        this.size += this.speed;
        this.opacity -= 0.02;
        
        return this.opacity <= 0 || this.size >= this.maxSize;
    }

    draw() {
        ctx.save();
        ctx.strokeStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }
}

// Hàm tạo bong bóng
function createBubble(x, y) {
    bubbles.push(new Bubble(x, y));
}

// Hàm tạo gợn sóng
function createRipple(x, y) {
    ripples.push(new Ripple(x, y));
}

// Hàm điều chỉnh kích thước canvas
function resizeCanvas() {
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
}

// Hàm khởi tạo game
function init() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    // Điều chỉnh kích thước canvas theo kích thước container
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Khởi tạo player (con cá người chơi)
    player = new Player(canvas.width / 2, canvas.height / 2);
    
    // Khởi tạo các con cá mồi
    for (let i = 0; i < 10; i++) {
        prey.push(new Prey());
    }
    
    // Thiết lập sự kiện bàn phím
    window.addEventListener('keydown', function(e) {
        if (e.key in keys) {
            keys[e.key] = true;
            e.preventDefault();
        }
    });
    
    window.addEventListener('keyup', function(e) {
        if (e.key in keys) {
            keys[e.key] = false;
            e.preventDefault();
        }
    });
    
    // Thiết lập điều khiển cho thiết bị di động
    const mobileButtons = document.querySelectorAll('.mobile-controls button');
    mobileButtons.forEach(button => {
        button.addEventListener('touchstart', function() {
            keys[`Arrow${this.id.charAt(0).toUpperCase() + this.id.slice(1)}`] = true;
        });
        
        button.addEventListener('touchend', function() {
            keys[`Arrow${this.id.charAt(0).toUpperCase() + this.id.slice(1)}`] = false;
        });
    });
    
    // Thiết lập sự kiện nút bắt đầu
    startButton.addEventListener('click', startGame);
    
    // Thiết lập sự kiện nút chơi lại
    restartButton.addEventListener('click', function() {
        gameOverScreen.style.display = 'none';
        startGame();
    });
}

// Hàm bắt đầu game
function startGame() {
    // Ẩn màn hình bắt đầu
    startScreen.style.display = 'none';
    
    // Reset các biến
    score = 0;
    gameTime = 0;
    size = 1;
    prey = [];
    obstacles = [];
    bubbles = [];
    ripples = [];
    
    // Cập nhật hiển thị
    scoreElement.textContent = score;
    timeElement.textContent = gameTime;
    sizeElement.textContent = size.toFixed(1);
    
    // Khởi tạo player
    player = new Player(canvas.width / 2, canvas.height / 2);
    
    // Khởi tạo cá mồi
    for (let i = 0; i < 10; i++) {
        prey.push(new Prey());
    }
    
    // Bắt đầu nhạc nền
    backgroundMusic.currentTime = 0;
    backgroundMusic.play();
    
    // Thiết lập game là active
    gameActive = true;
    
    // Bắt đầu game loop
    lastTimestamp = performance.now();
    requestAnimationFrame(gameLoop);
}

// Hàm kết thúc game
function gameOver() {
    // Dừng game
    gameActive = false;
    
    // Dừng nhạc nền
    backgroundMusic.pause();
    
    // Phát âm thanh kết thúc
    gameOverSound.play();
    
    // Hiển thị màn hình kết thúc
    gameOverScreen.style.display = 'flex';
    finalScoreElement.textContent = score;
    survivalTimeElement.textContent = gameTime;
}

// Hàm kiểm tra va chạm giữa hai đối tượng tròn
function checkCollision(obj1, obj2, radiusMultiplier = 1) {
    const dx = obj1.x - obj2.x;
    const dy = obj1.y - obj2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < (obj1.size + obj2.size) * radiusMultiplier;
}

// Hàm kiểm tra va chạm giữa cá và chữ cái
function checkLetterCollision(player, letter) {
    const dx = player.x - letter.x;
    const dy = player.y - letter.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < player.size + letter.size / 2;
}

// Game loop chính
function gameLoop(timestamp) {
    if (!gameActive) return;
    
    // Tính toán delta time
    const deltaTime = timestamp - lastTimestamp;
    lastTimestamp = timestamp;
    
    // Cập nhật thời gian
    gameTime += deltaTime / 1000;
    timeElement.textContent = Math.floor(gameTime);
    
    // Xóa canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Cập nhật và vẽ player
    player.update(deltaTime);
    
    // Cập nhật và vẽ bong bóng
    for (let i = bubbles.length - 1; i >= 0; i--) {
        if (bubbles[i].update()) {
            bubbles.splice(i, 1);
        }
    }
    
    // Cập nhật và vẽ gợn sóng
    for (let i = ripples.length - 1; i >= 0; i--) {
        if (ripples[i].update()) {
            ripples.splice(i, 1);
        }
    }
    
    // Cập nhật và vẽ cá mồi
    for (let i = prey.length - 1; i >= 0; i--) {
        prey[i].update();
        
        // Kiểm tra va chạm với player
        if (checkCollision(player, prey[i], 0.8)) {
            // Nếu player lớn hơn prey
            if (player.size > prey[i].size * 1.2) {
                // Tăng kích thước và điểm
                player.grow();
                score += Math.floor(prey[i].size);
                scoreElement.textContent = score;
                
                // Phát âm thanh
                eatSound.currentTime = 0;
                eatSound.play();
                
                // Tạo bong bóng tại vị trí ăn
                for (let j = 0; j < 5; j++) {
                    createBubble(prey[i].x, prey[i].y);
                }
                
                // Xóa prey và tạo mới
                prey.splice(i, 1);
                prey.push(new Prey());
            }
        }
    }
    
    // Cập nhật và vẽ chữ cái rơi
    for (let i = obstacles.length - 1; i >= 0; i--) {
        const isOutOfScreen = obstacles[i].update();
        
        // Kiểm tra va chạm với player
        if (checkLetterCollision(player, obstacles[i])) {
            // Player bị choáng hoặc giảm kích thước
            if (Math.random() > 0.5) {
                player.stun();
            } else {
                player.shrink();
            }
            
            // Phát âm thanh
            hitSound.currentTime = 0;
            hitSound.play();
            
            // Tạo gợn sóng
            createRipple(obstacles[i].x, obstacles[i].y);
            
            // Xóa chữ cái
            obstacles.splice(i, 1);
            continue;
        }
        
        // Xóa chữ cái nếu ra khỏi màn hình
        if (isOutOfScreen) {
            obstacles.splice(i, 1);
        }
    }
    
    // Thêm chữ cái mới theo tỷ lệ ngẫu nhiên
    if (Math.random() > 0.98) {
        obstacles.push(new Obstacle());
    }
    
    // Thêm cá mồi mới nếu không đủ số lượng
    if (prey.length < 10 + Math.floor(gameTime / 20)) {
        prey.push(new Prey());
    }
    
    // Vẽ tất cả các đối tượng
    // Vẽ theo thứ tự: gợn sóng, bong bóng, cá mồi, chữ cái, player
    ripples.forEach(ripple => ripple.draw());
    bubbles.forEach(bubble => bubble.draw());
    prey.forEach(p => p.draw());
    obstacles.forEach(obstacle => obstacle.draw());
    player.draw();
    
    // Tiếp tục game loop
    requestAnimationFrame(gameLoop);
}

// Khởi tạo game khi trang đã tải xong
window.addEventListener('load', init);