export const fetchLatestDraw = async () => {
    try {
        const response = await fetch('https://loteriascaixa-api.herokuapp.com/api/lotofacil');
        if (!response.ok) throw new Error('API Error');
        const data = await response.json();
        const latest = Array.isArray(data) ? data[0] : data;
        return formatApiData(latest);
    } catch (error) {
        console.warn('API fetch failed, using fallback:', error);
        return generateMockDraw();
    }
};

export const fetchSpecificDraw = async (concursoNumber) => {
    try {
        const response = await fetch(`https://loteriascaixa-api.herokuapp.com/api/lotofacil/${concursoNumber}`);
        if (!response.ok) throw new Error('API Error');
        const data = await response.json();
        return formatApiData(data);
    } catch (error) {
        console.warn('API specific fetch failed:', error);
        return generateMockDraw(concursoNumber);
    }
}

// Helper to parse DD/MM/YYYY to Date object
const parseDate = (dateStr) => {
    if (!dateStr) return new Date();
    const [day, month, year] = dateStr.split('/');
    return new Date(`${year}-${month}-${day}`);
}

export const fetchDrawsByDateRange = async (startDateStr, endDateStr) => {
    try {
        const latest = await fetchLatestDraw();
        const results = [];

        const start = new Date(startDateStr);
        const end = new Date(endDateStr);
        end.setHours(23, 59, 59);

        let currentDraw = latest;
        let currentId = latest.numero;
        const maxdraws = 500; // Allow deeper search but break if too many
        let count = 0;

        // Ensure we check the latest draw first if it matches
        const latestDate = parseDate(currentDraw.data);
        if (latestDate >= start && latestDate <= end) {
            results.push(currentDraw);
        } else if (latestDate < start) {
            // Latest is already too old, range is in future? or invalid
            return [];
        }

        // Loop backwards from latest-1
        currentId--;

        while (count < maxdraws) {
            // Sequential fetching is safer for public APIs rate limits
            let draw;
            try {
                draw = await fetchSpecificDraw(currentId);
            } catch (e) {
                break;
            }

            const drawDate = parseDate(draw.data);

            // Optimization: If draw is newer than End Date, just skip (keep going back)
            // If draw is older than Start Date, we are done
            if (drawDate < start) break;

            if (drawDate <= end) {
                results.push(draw);
            }

            currentId--;
            count++;
        }

        return results;

    } catch (error) {
        console.error("Error fetching range:", error);
        // Fallback for demo
        return generateMockRange(startDateStr, endDateStr);
    }
};

const generateMockRange = (startStr, endStr) => {
    const list = [];
    const start = new Date(startStr);
    const end = new Date(endStr);
    let current = new Date(end);
    let id = 3000;

    while (current >= start) {
        if (Math.random() > 0.2) {
            const mock = generateMockDraw(id--);
            mock.data = current.toLocaleDateString('pt-BR');
            list.push(mock);
        }
        current.setDate(current.getDate() - 1);
    }
    return list;
};

const formatApiData = (data) => ({
    numero: data.concurso,
    data: data.data,
    numeros: data.dezenas.map(d => parseInt(d)),
    premiacoes: data.premiacoes || []
});

export const generateMockDraw = (number = null) => {
    const numeros = [];
    while (numeros.length < 15) {
        const n = Math.floor(Math.random() * 25) + 1;
        if (!numeros.includes(n)) numeros.push(n);
    }
    numeros.sort((a, b) => a - b);

    return {
        numero: number || 3000,
        data: new Date().toLocaleDateString('pt-BR'),
        numeros,
        isMock: true
    };
};
