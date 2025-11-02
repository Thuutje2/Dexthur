function drawProgressBar(ctx, x, y, width, height, progress, cornerRadius = 15) {
    drawRoundedRect(ctx, x, y, width, height, cornerRadius, 'hsla(242, 41%, 35%, 0.30)');

    if (progress > 0) {
        const progressWidth = width * progress;
        drawRoundedRect(ctx, x, y, progressWidth, height, cornerRadius, '#37357eff');
    }

    const percentage = Math.round(progress * 100);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${percentage}%`, x + width / 2, y + 22);
}

function drawRoundedRect(ctx, x, y, width, height, radius, color) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.fillStyle = color;
    ctx.fill();
}

module.exports = { drawProgressBar };
