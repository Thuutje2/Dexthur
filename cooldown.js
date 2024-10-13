const fifteenMinutes = 15 * 60 * 1000; // 15 minutes in milliseconds

function getCooldownTime(lastGuessDate) {
    const currentTime = new Date();
    const nextAvailableGuessDate = new Date(lastGuessDate);

    // Voeg 15 minuten toe aan de laatste gok tijd
    nextAvailableGuessDate.setTime(nextAvailableGuessDate.getTime() + fifteenMinutes);

    console.log("Current Time:", currentTime);
    console.log("Last Guess Date:", lastGuessDate);
    console.log("Next Available Guess Time:", nextAvailableGuessDate);

    const timeDifference = nextAvailableGuessDate - currentTime;
    const timeRemaining = Math.max(timeDifference, 0); // Zorg ervoor dat we geen negatieve waarden krijgen

    if (timeRemaining > 0) {
        const remainingMinutes = Math.floor(timeRemaining / (1000 * 60));
        console.log("Remaining minutes:", remainingMinutes);
        return { remainingMinutes, timeRemaining };
    }
    return { remainingMinutes: 0, timeRemaining: 0 };
}

module.exports = { getCooldownTime, fifteenMinutes };


