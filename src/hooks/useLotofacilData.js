import { useState, useEffect } from 'react';

const STORAGE_KEYS = {
    JOGOS: 'lotofacil_jogos',
    RESULTADOS: 'lotofacil_resultados',
    ESTATISTICAS: 'lotofacil_estatisticas',
    ULTIMOS_SORTEIOS: 'lotofacil_ultimos_sorteios'
};

export function useLotofacilData() {
    const [jogos, setJogos] = useState([]);
    const [resultados, setResultados] = useState([]);
    const [estatisticas, setEstatisticas] = useState({});
    const [ultimosSorteios, setUltimosSorteios] = useState([]);

    // Load initial data
    useEffect(() => {
        const load = (key, setter) => {
            const data = localStorage.getItem(key);
            if (data) setter(JSON.parse(data));
        };
        load(STORAGE_KEYS.JOGOS, setJogos);
        load(STORAGE_KEYS.RESULTADOS, setResultados);
        load(STORAGE_KEYS.ESTATISTICAS, setEstatisticas);
        load(STORAGE_KEYS.ULTIMOS_SORTEIOS, setUltimosSorteios);
    }, []);

    // Save data whenever it changes
    useEffect(() => localStorage.setItem(STORAGE_KEYS.JOGOS, JSON.stringify(jogos)), [jogos]);
    useEffect(() => localStorage.setItem(STORAGE_KEYS.RESULTADOS, JSON.stringify(resultados)), [resultados]);
    useEffect(() => localStorage.setItem(STORAGE_KEYS.ESTATISTICAS, JSON.stringify(estatisticas)), [estatisticas]);
    useEffect(() => localStorage.setItem(STORAGE_KEYS.ULTIMOS_SORTEIOS, JSON.stringify(ultimosSorteios)), [ultimosSorteios]);

    const addJogo = (novoJogo) => {
        setJogos(prev => [...prev, novoJogo]);
    };

    const removeJogo = (id) => {
        setJogos(prev => prev.filter(j => j.id !== id));
    };

    const clearJogos = () => setJogos([]);

    const addResultado = (novoResultado) => {
        setResultados(prev => {
            // Avoid duplicates
            if (prev.some(r => r.concurso === novoResultado.concurso)) return prev;
            return [...prev, novoResultado].sort((a, b) => b.concurso - a.concurso);
        });
    };

    return {
        jogos,
        resultados,
        estatisticas,
        ultimosSorteios,
        addJogo,
        removeJogo,
        clearJogos,
        addResultado,
        setUltimosSorteios
    };
}
