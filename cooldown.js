const cooldown = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const hour = 60 * 60 * 1000; // 1 hour in milliseconds

function getCooldownTime(lastGuessDate) {
    const currentTime = new Date();
    const nextAvailableGuessDate = new Date(lastGuessDate);
    // uur voor volgende gok
    nextAvailableGuessDate.setTime(nextAvailableGuessDate.getTime() + hour);

    // nextAvailableGuessDate.setHours(24, 0, 0, 0); // Zet de tijd op middernacht van de volgende dag

    const timeDifference = nextAvailableGuessDate - currentTime;
    const timeRemaining = Math.max(timeDifference, 0); // Zorg ervoor dat we geen negatieve waarden krijgen

    if (timeRemaining > 0) {
        const remainingHours = Math.floor(timeRemaining / (1000 * 60 * 60));
        const remainingMinutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
        return { remainingHours, remainingMinutes, timeRemaining };
    }
    return { remainingHours: 0, remainingMinutes: 0, timeRemaining: 0 };
}

module.exports = { getCooldownTime, hour };
