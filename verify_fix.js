
// Verification script for 18 numbers

const fileContent = `
Jogo 18 numbers: [01, 02, 03, 04, 05, 06, 07, 08, 09, 10, 11, 12, 13, 14, 15, 16, 17, 18]
`;

const lines = fileContent.split('\n');
let importedCount = 0;
const games = [];

lines.forEach(line => {
    const match = line.match(/\[(.*?)\]/);
    if (match && match[1]) {
        const numbersStr = match[1];
        const numeros = numbersStr.split(',')
            .map(n => parseInt(n.trim()))
            .filter(n => !isNaN(n) && n >= 1 && n <= 25);

        // Updated logic being tested
        if (numeros.length >= 15 && numeros.length <= 20) {
            games.push({
                numeros: numeros.sort((a, b) => a - b),
                tipo: 'Importado'
            });
            importedCount++;
        } else {
            console.log(`Rejected game with ${numeros.length} numbers`);
        }
    }
});

console.log(`Imported: ${importedCount}`);
console.log('Games:', games);
