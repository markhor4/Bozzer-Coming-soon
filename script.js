// Wheel Game Variables
const canvas = document.getElementById('wheel-canvas');
const ctx = canvas?.getContext('2d');
const spinButton = document.getElementById('spin-button');
const resultElement = document.getElementById('result');
const timerElement = document.getElementById('timer');
const rewards = ['25 BOOZ', 'Cheers', '50 BOOZ', 'Try Again', '100 BOOZ', '0 BOOZ', '250 BOOZ', 'Come Again', '500 BOOZ', 'Free Spin'];
const colors = ['#FFB300', '#FF4081', '#FFC107', '#FF80AB', '#FF9800', '#F06292', '#FFD54F', '#E91E63', '#FFCA28', '#F48FB1'];

let spinning = false;
let currentAngle = 0;

// Timer Logic
const targetDate = new Date('2025-07-05T14:00:00Z').getTime(); // July 5, 2025, 14:00 UTC

function updateTimer() {
    if (!timerElement) {
        console.error('Timer element not found');
        return;
    }
    const now = new Date().getTime();
    const distance = targetDate - now;

    if (distance < 0) {
        timerElement.textContent = 'Presale Live!';
        return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    timerElement.textContent = `${days} d ${hours.toString().padStart(2, '0')} h ${minutes.toString().padStart(2, '0')} m ${seconds.toString().padStart(2, '0')} s`;
}

setInterval(updateTimer, 1000);
updateTimer(); // Initial call

function easeOutQuad(t) {
    return t * (2 - t); // Smooth easing
}

function drawWheel(angle) {
    if (!ctx) {
        console.error('Canvas context not available');
        return;
    }
    const segmentAngle = (2 * Math.PI) / rewards.length;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(200, 200);
    ctx.rotate(-angle * (Math.PI / 180));
    for (let i = 0; i < rewards.length; i++) {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, 180, i * segmentAngle, (i + 1) * segmentAngle);
        ctx.fillStyle = colors[i % colors.length];
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 5;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(180 * Math.cos(i * segmentAngle - Math.PI / 2), 180 * Math.sin(i * segmentAngle - Math.PI / 2), 5, 0, 2 * Math.PI);
        ctx.fillStyle = '#FFD700';
        ctx.fill();

        ctx.save();
        ctx.rotate((i + 0.5) * segmentAngle);
        ctx.fillStyle = '#FFF';
        ctx.font = '14px Poppins';
        ctx.fillText(rewards[i], 90, 5);
        ctx.restore();
    }

    ctx.beginPath();
    ctx.arc(0, 0, 20, 0, 2 * Math.PI);
    ctx.fillStyle = '#000';
    ctx.fill();

    ctx.restore();
}

function spinWheel() {
    if (!ctx) {
        resultElement.textContent = 'Error: Canvas not supported!';
        return;
    }
    if (spinning) {
        resultElement.textContent = 'Wheel is already spinning!';
        return;
    }

    spinning = true;
    spinButton.disabled = true;
    const targetSegment = Math.floor(Math.random() * rewards.length);
    const segmentAngle = 360 / rewards.length;
    const targetAngle = targetSegment * segmentAngle;
    const spins = 5 * 360;
    const finalAngle = spins + targetAngle + (Math.random() * segmentAngle);
    const duration = 5000;
    const startAngle = currentAngle;
    const startTime = performance.now();

    function animate(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeOutQuad(progress);
        const angle = startAngle + (finalAngle - startAngle) * easedProgress;

        drawWheel(angle);

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            currentAngle = angle % 360;
            const segment = Math.floor(((currentAngle % 360) + 360) % 360 / segmentAngle);
            resultElement.textContent = `You won: ${rewards[segment]}!`;
            spinning = false;
            spinButton.disabled = false; // Ensured this line is complete
            console.log('Target Segment:', targetSegment, 'Final Angle:', currentAngle, 'Result Segment:', segment);
        }
    }

    requestAnimationFrame(animate);
    console.log('Spin started');
}

// Initialize wheel and attach event listener
if (canvas && ctx) {
    drawWheel(0);
    spinButton.addEventListener('click', spinWheel);
    console.log('Event listener attached');
} else {
    console.error('Canvas or context not found');
}