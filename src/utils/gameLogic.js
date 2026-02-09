export const generateGame = (numPerGame, fixedNumbers, estrategia) => {
    let availableNumbers = Array.from({ length: 25 }, (_, i) => i + 1);
    availableNumbers = availableNumbers.filter(num => !fixedNumbers.includes(num));

    let game = [...fixedNumbers];

    if (estrategia === 'poles-impares') {
        const pares = availableNumbers.filter(n => n % 2 === 0);
        const impares = availableNumbers.filter(n => n % 2 === 1);

        const paresNeeded = Math.max(0, Math.floor((numPerGame - game.length) / 2));
        const imparesNeeded = numPerGame - game.length - paresNeeded;

        shuffleArray(pares);
        shuffleArray(impares);

        game.push(...pares.slice(0, paresNeeded));
        game.push(...impares.slice(0, imparesNeeded));

    } else if (estrategia === 'distribuida') {
        const quadrantes = [
            availableNumbers.filter(n => n <= 6),
            availableNumbers.filter(n => n > 6 && n <= 12),
            availableNumbers.filter(n => n > 12 && n <= 18),
            availableNumbers.filter(n => n > 18)
        ];

        const numsPorQuadrante = Math.floor((numPerGame - game.length) / 4);

        quadrantes.forEach(quadrante => {
            shuffleArray(quadrante);
            game.push(...quadrante.slice(0, numsPorQuadrante));
        });

        const extrasNeeded = numPerGame - game.length;
        if (extrasNeeded > 0) {
            const todosRestantes = availableNumbers.filter(n => !game.includes(n));
            shuffleArray(todosRestantes);
            game.push(...todosRestantes.slice(0, extrasNeeded));
        }

    } else if (estrategia === 'mais-sorteados') {
        // Mock historical data for strategy
        const maisSorteados = [5, 10, 13, 20, 24, 2, 8, 15, 18, 22, 3, 7, 11, 16, 25];
        const disponiveisMaisSorteados = maisSorteados.filter(n => availableNumbers.includes(n));

        const qtdMaisSorteados = Math.min(disponiveisMaisSorteados.length, Math.floor((numPerGame - game.length) * 0.7));
        const qtdRestante = numPerGame - game.length - qtdMaisSorteados;

        shuffleArray(disponiveisMaisSorteados);
        game.push(...disponiveisMaisSorteados.slice(0, qtdMaisSorteados));

        const restantes = availableNumbers.filter(n => !game.includes(n));
        shuffleArray(restantes);
        game.push(...restantes.slice(0, qtdRestante));

    } else {
        shuffleArray(availableNumbers);
        const numbersNeeded = numPerGame - fixedNumbers.length;
        game.push(...availableNumbers.slice(0, numbersNeeded));
    }

    return game.sort((a, b) => a - b);
};

export const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

export const calcularAcertos = (jogo, sorteados) => {
    return jogo.filter(num => sorteados.includes(num)).length;
};

export const calcularPremio = (acertos, numerosNoJogo, premiacoesAPI = null) => {
    // Current fixed values (Updated by user request)
    const premiosFixos = { 11: 7.00, 12: 14.00, 13: 35.00 };

    // If it's a fixed prize, return immediately
    if (acertos >= 11 && acertos <= 13) {
        // Multiplier for >15 numbers not strictly applied to fixed prizes in standard rules 
        // (usually you get multiple fixed prizes), but for simple check we return the base value.
        // For accurate calculated bets (16+ numbers), the logic is complex (multiples prizes).
        // Let's stick to base for now or use a multiplier if needed. 
        // The previous logic had multipliers. Let's try to keep it simple but accurate for 15 numbers first.
        return premiosFixos[acertos];
    }

    // Dynamic prizes (14 and 15)
    if (acertos >= 14) {
        if (premiacoesAPI && Array.isArray(premiacoesAPI)) {
            // Try to find in API array
            // Usually API returns "15 acertos" in description or faixa 1
            const faixa = acertos === 15 ? 1 : 2; // 1 = 15 hits, 2 = 14 hits usually

            // Try matching by description or guesses
            const premioEncontrado = premiacoesAPI.find(p =>
                (p.faixa === faixa) ||
                (p.descricao && p.descricao.includes(acertos.toString()))
            );

            if (premioEncontrado) {
                return parseFloat(premioEncontrado.valorPremio || 0);
            }
        }
        // Fallback checks if API fails or for formatting
        return acertos === 15 ? 0 : 0;
    }

    return 0;
};
