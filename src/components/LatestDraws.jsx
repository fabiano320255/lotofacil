import React, { useState, useEffect } from 'react';
import { fetchLatestDraw, fetchSpecificDraw, fetchDrawsByDateRange } from '../services/lotofacilApi';
import { Loader2, RefreshCw, Search, Calendar } from 'lucide-react';

export const LatestDraws = ({ data }) => {
    const { ultimosSorteios, setUltimosSorteios } = data;
    const [loading, setLoading] = useState(false);
    const [qtd, setQtd] = useState(10); // Number of draws to fetch
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const loadDraws = async () => {
        setLoading(true);
        try {
            // If dates are selected, use date range search
            if (startDate && endDate) {
                const rangeResults = await fetchDrawsByDateRange(startDate, endDate);
                if (rangeResults.length === 0) {
                    alert('Nenhum sorteio encontrado neste período.');
                } else {
                    setUltimosSorteios(rangeResults);
                }
            } else {
                // Default behavior: Fetch latest + previous X
                const latest = await fetchLatestDraw();
                const list = [latest];
                let currentId = latest.numero - 1;

                for (let i = 1; i < qtd; i++) {
                    try {
                        const prevDraw = await fetchSpecificDraw(currentId);
                        list.push(prevDraw);
                        currentId--;
                        await new Promise(r => setTimeout(r, 200));
                    } catch (err) {
                        console.warn(`Error fetching draw ${currentId}`, err);
                        break;
                    }
                }
                setUltimosSorteios(list);
            }
        } catch (e) {
            console.error(e);
            alert('Erro ao atualizar sorteios. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    // Initial load if empty
    useEffect(() => {
        if (ultimosSorteios.length === 0) loadDraws();
    }, []);

    return (
        <div className="space-y-8 fade-in">
            <div className="card">
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        📅 Últimos Sorteios
                    </h2>

                    <div className="flex flex-wrap items-center gap-3 bg-white/5 p-2 rounded-xl border border-white/10">
                        <div className="flex items-center gap-2">
                            <Calendar size={16} className="text-purple-300" />
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="bg-black/20 border border-white/10 rounded-lg px-2 py-1 text-sm text-white focus:outline-none focus:border-purple-400"
                            />
                            <span className="text-gray-400">até</span>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="bg-black/20 border border-white/10 rounded-lg px-2 py-1 text-sm text-white focus:outline-none focus:border-purple-400"
                            />
                        </div>
                        <button
                            onClick={loadDraws}
                            disabled={loading}
                            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm flex items-center gap-2 transition-all disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin" size={16} /> : <Search size={16} />}
                            {startDate && endDate ? 'Buscar por Data' : 'Atualizar Recentes'}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {ultimosSorteios.map(draw => (
                        <div key={draw.numero} className="bg-white/5 p-4 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                            <div className="flex justify-between items-center mb-3">
                                <div>
                                    <span className="font-bold text-yellow-300 text-lg">Concurso {draw.numero}</span>
                                    <div className="text-xs text-gray-400">{draw.data} {draw.isMock && '(Simulado - Offline)'}</div>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {draw.numeros.map(n => (
                                    <span key={n} className="w-8 h-8 flex items-center justify-center rounded-full bg-pink-600 text-white font-bold text-sm shadow-sm">
                                        {String(n).padStart(2, '0')}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}

                    {ultimosSorteios.length === 0 && !loading && (
                        <div className="col-span-2 text-center py-8 text-gray-400">
                            Nenhum sorteio carregado. Clique em Atualizar.
                        </div>
                    )}
                </div>
            </div>

            <div className="text-center text-gray-500 text-sm">
                * Dados obtidos via API pública.
            </div>
        </div>
    );
};
