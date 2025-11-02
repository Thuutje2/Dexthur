const { Canvas, loadImage } = require('skia-canvas');
const path = require('path');

async function createCanvas(width, height) {
    const canvas = new Canvas(width, height);
    const ctx = canvas.getContext('2d');
    return { canvas, ctx };
}

async function loadBackground(ctx, canvas) {
    try {
        const imagePath = path.join(__dirname, '..', 'images', 'levelcardbg.png');
        const background = await loadImage(imagePath);
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'rgba(196, 208, 255, 0.40)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    } catch (error) {
        console.error('Error loading background:', error);
        throw error;
    }
}

async function drawAvatar(ctx, user) {
    try {
        const avatar = await loadImage(user.displayAvatarURL({ extension: 'png', size: 256 }));

        const avatarSize = 150;
        const x = 40;
        const y = (300 - avatarSize) / 2;

        ctx.save();
        ctx.beginPath();
        ctx.arc(x + avatarSize / 2, y + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2, true);
        ctx.clip();
        ctx.drawImage(avatar, x, y, avatarSize, avatarSize);
        ctx.restore();

        ctx.beginPath();
        ctx.arc(x + avatarSize / 2, y + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2, true);
        ctx.strokeStyle = '#37357eff';
        ctx.lineWidth = 6;
        ctx.stroke();
    } catch (error) {
        console.error('Error drawing avatar:', error);
        throw error;
    }
}

module.exports = { createCanvas, loadBackground, drawAvatar };
