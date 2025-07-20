
// functie om deck te genereren
function generateDeck() {
    const deck = [];

    for (let i=1;i<=12; i++) {
        for (let j = 0; j < 1; j++){
            deck.push({type: 'number', value: i});
        }
    }

    const specialCards = [
        { type: 'secondChance' },
        { type: 'secondChance' },
        { type: 'secondChance' },
        { type: 'freeze' },
        { type: 'freeze' },
        { type: 'flipThree' },
        { type: 'flipThree' },
        { type: 'bonus' },
        { type: 'bonus' },
        { type: 'bonus' },
        { type: 'bonus' },
    ]

    deck.push(...specialCards);

    // Deck schudden
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    return deck;
}

module.exports = generateDeck;