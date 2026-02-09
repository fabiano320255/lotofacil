import React, { useState } from 'react';
import { fetchDrawsByDateRange } from '../services/lotofacilApi';
import { calcularAcertos, calcularPremio } from '../utils/gameLogic';
import { Search, Loader2, Calendar, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';

export const AutoCheck = ({ data }) => {
    const { jogos, addResultado } = data;
    const [loading, setLoading] = useState(false);

    // Default to last 30 days
    const today = new Date().toISOString().split('T')[0];
    const lastMonth = new Date();
    lastMonth.setDate(lastMonth.getDate() - 30);
    const lastMonthStr = lastMonth.toISOString().split('T')[0];

    const [startDate, setStartDate] = useState(lastMonthStr);
    const [endDate, setEndDate] = useState(today);
    const [results, setResults] = useState([]);
    const [expandedDraw, setExpandedDraw] = useState(null);

    const handleAutoCheck = async () => {
        if (jogos.length === 0) {
            alert("Você não tem jogos gerados para conferir!");
            return;
        }

        setLoading(true);
        setResults([]);

        try {
            const draws = await fetchDrawsByDateRange(startDate, endDate);

            if (draws.length === 0) {
                alert("Nenhum sorteio encontrado neste período.");
                setLoading(false);
                return;
            }

            // Process each draw against ALL games
            const processedResults = draws.map(draw => {
                const conferencias = jogos.map(jogo => {
                    const acertos = calcularAcertos(jogo.numeros, draw.numeros);
                    return {
                        ...jogo,
                        acertos,
                        premio: calcularPremio(acertos, jogo.numeros.length, draw.premiacoes)
                    };
                });

                // Only keep interesting data to save memory/storage if needed, 
                // but for UI we want all or just premiums. 
                // Let's keep all but sort premiums first
                conferencias.sort((a, b) => b.acertos - a.acertos);

                return {
                    id: String(draw.numero), // Use concurso as ID
                    concurso: draw.numero,
                    data: draw.data,
                    numerosSorteados: draw.numeros,
                    conferencias,
                    totalPremio: conferencias.reduce((sum, c) => sum + c.premio, 0),
                    jogosPremiados: conferencias.filter(c => c.premio > 0).length,
                    melhorAcerto: Math.max(...conferencias.map(c => c.acertos))
                };
            });

            // Save to history automatically? Maybe optional. 
            // For now, let's just show them.
            // processedResults.forEach(res => addResultado(res)); 

            setResults(processedResults);

            // Auto expand the first one if it has prizes
            if (processedResults.length > 0) {
                setExpandedDraw(processedResults[0].id);
            }

        } catch (error) {
            console.error(error);
            alert('Erro ao buscar. Verifique sua conexão.');
        } finally {
            setLoading(false);
        }
    };

    const toggleExpand = (id) => {
        setExpandedDraw(expandedDraw === id ? null : id);
    };

    return (
        <div className="space-y-6 fade-in">
            <div className="card">
                <h2 className="text-2xl font-bold mb-2">⚡ Conferência por Período</h2>
                <p className="text-purple-200 mb-6">Confira seus {jogos.length} jogos contra todos os sorteios de um intervalo de datas.</p>

                <div className="bg-white/5 p-4 rounded-xl border border-white/10 mb-6">
                    <div className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="input-group flex-1">
                            <label className="flex items-center gap-2"><Calendar size={16} /> Data Inicial</label>
                            <input type="date" className="input-control"
                                value={startDate} onChange={e => setStartDate(e.target.value)} />
                        </div>
                        <div className="input-group flex-1">
                            <label className="flex items-center gap-2"><Calendar size={16} /> Data Final</label>
                            <input type="date" className="input-control"
                                value={endDate} onChange={e => setEndDate(e.target.value)} />
                        </div>
                        <button onClick={handleAutoCheck} disabled={loading}
                            className="btn btn-success h-[48px] px-8 flex items-center gap-2">
                            {loading ? <Loader2 className="animate-spin" /> : <Search size={20} />}
                            {loading ? 'Conferindo...' : 'Conferir Jogos'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Results List */}
            <div className="space-y-4">
                {results.map((res) => (
                    <div key={res.id} className={`card p-0 overflow-hidden transition-all ${res.jogosPremiados > 0 ? 'border border-green-500/50' : ''}`}>
                        {/* Header */}
                        <div
                            onClick={() => toggleExpand(res.id)}
                            className={`p-4 cursor-pointer flex flex-wrap items-center justify-between hover:bg-white/5 transition-colors
                                ${expandedDraw === res.id ? 'bg-white/10' : ''}`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg
                                    ${res.jogosPremiados > 0 ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-400'}`}>
                                    {res.concurso}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">Concurso {res.concurso}</h3>
                                    <p className="text-xs text-gray-400">{res.data}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="text-right hidden sm:block">
                                    <div className={`font-bold ${res.jogosPremiados > 0 ? 'text-green-400' : 'text-gray-500'}`}>
                                        {res.jogosPremiados > 0 ? `${res.jogosPremiados} PREMIADOS` : 'Sem prêmios'}
                                    </div>
                                    <div className="text-xs text-gray-400">
                                        Melhor: {res.melhorAcerto} acertos
                                    </div>
                                </div>
                                {expandedDraw === res.id ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                            </div>
                        </div>

                        {/* Expanded Content */}
                        {expandedDraw === res.id && (
                            <div className="p-4 border-t border-white/10 bg-black/20 animate-in slide-in-from-top-2">
                                {/* Sorteados */}
                                <div className="mb-6">
                                    <p className="text-sm text-gray-400 mb-2">Números Sorteados:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {res.numerosSorteados.map(n => (
                                            <span key={n} className="w-8 h-8 rounded-full bg-pink-600/80 text-white flex items-center justify-center font-bold text-sm">
                                                {n}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Jogos Table */}
                                <div className="space-y-2">
                                    <h4 className="font-bold mb-2 flex justify-between">
                                        <span>Seus Jogos</span>
                                        <span className="text-sm text-green-400 font-normal">Total: R$ {res.totalPremio.toFixed(2)}</span>
                                    </h4>

                                    <div className="grid gap-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                        {res.conferencias.map((conf, idx) => {
                                            if (conf.acertos < 11 && !showAllGames) return null; // Logic handled by Show All Toggle below
                                            return (
                                                <div key={idx} className={`p-3 rounded-lg flex justify-between items-center
                                                    ${conf.premio > 0 ? 'bg-green-900/20 border border-green-500/30' : 'bg-white/5'}`}>
                                                    <div className="flex-1">
                                                        <div className="flex justify-between mb-1">
                                                            <span className="text-sm font-bold text-gray-300">Jogo {idx + 1}</span>
                                                            <span className={`text-sm font-bold ${conf.premio > 0 ? 'text-green-400' : 'text-gray-600'}`}>
                                                                {conf.acertos} pts
                                                            </span>
                                                        </div>
                                                        <div className="flex flex-wrap gap-1">
                                                            {conf.numeros.map(n => (
                                                                <span key={n} className={`w-6 h-6 rounded-full flex items-center justify-center text-xs
                                                                    ${res.numerosSorteados.includes(n) ? 'bg-green-500 text-white' : 'bg-gray-800 text-gray-600'}`}>
                                                                    {n}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    {conf.premio > 0 && (
                                                        <div className="ml-4 font-bold text-green-400 whitespace-nowrap">
                                                            R$ {conf.premio}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}

                                        {res.conferencias.every(c => c.acertos < 11) && (
                                            <div className="text-center py-4 text-gray-500 italic">
                                                Nenhum jogo premiado neste sorteio.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}

                {results.length === 0 && !loading && (
                    <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-700 rounded-xl">
                        <AlertCircle className="mx-auto mb-2 opacity-50" size={48} />
                        <p>Selecione um período acima e clique em Conferir.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// Helper var to not complicate props for now, though usually state
const showAllGames = true; 
