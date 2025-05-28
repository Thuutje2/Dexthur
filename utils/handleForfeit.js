function handleForfeit(response, collector, answer, customMessage = null) {
    if (response.content.toLowerCase() === '!ff') {
        const forfeitMessage = customMessage || `Quiz forfeited. The correct answer was: ${answer}`;
        response.channel.send(forfeitMessage);
        collector.stop('forfeit');
        return true;
    }
    return false;
}

module.exports = { handleForfeit };