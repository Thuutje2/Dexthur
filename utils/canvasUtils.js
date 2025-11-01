const Canvas = require('canvas');
const path = require('path');

async function createCanvas(width, height) {
    const canvas = Canvas.createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    return { canvas, ctx };
}

async function loadBackground(ctx, canvas) {
    try {
        const imagePath = path.join(__dirname, '..', 'images', 'levelcardbg.png');
        const background = await Canvas.loadImage(imagePath);
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
        
        // Add overlay
        ctx.fillStyle = 'rgba(196, 208, 255, 0.40)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    } catch (error) {
        console.error('Error loading background:', error);
        throw error;
    }
}

async function drawAvatar(ctx, user) {
    try {
        const avatar = await Canvas.loadImage(user.displayAvatarURL({ extension: 'png', size: 256 }));
        
        // Center the avatar vertically and horizontally
        const avatarSize = 150; 
        const x = 40;
        const y = (300 - avatarSize) / 2;
        
        // Draw circular avatar
        ctx.save();
        ctx.beginPath();
        ctx.arc(x + avatarSize/2, y + avatarSize/2, avatarSize/2, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();
        
        // Draw the avatar image
        ctx.drawImage(avatar, x, y, avatarSize, avatarSize);
        
        // Restore context
        ctx.restore();
        
        // Add circular border
        ctx.beginPath();
        ctx.arc(x + avatarSize/2, y + avatarSize/2, avatarSize/2, 0, Math.PI * 2, true);
        ctx.strokeStyle = '#37357eff';
        ctx.lineWidth = 6;
        ctx.stroke();
    } catch (error) {
        console.error('Error drawing avatar:', error);
        throw error;
    }
}

module.exports = { createCanvas, loadBackground, drawAvatar };