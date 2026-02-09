import React, { useState } from 'react';
import { Settings, CheckCircle, Search, Calendar } from 'lucide-react';
import { calcularAcertos, calcularPremio } from '../utils/gameLogic';

export function ManualCheck({ data }) {
    const [manualDraw, setManualDraw] = useState(Array(15).fill(''));
    const [checkResult, setCheckResult] = useState(null);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const handleInputChange = (index, value) => {
        const newValue = value.replace(/[^0-9]/g, '');
        if (newValue.length > 2) return;

        const newDraw = [...manualDraw];
        newDraw[index] = newValue;
        setManualDraw(newDraw);

        // Auto-focus next input if filled
        if (newValue.length === 2 && index < 14) {
            const nextInput = document.getElementById(`manual-input-${index + 1}`);
            if (nextInput) nextInput.focus();
        }
    };

    const handleCheck = () => {
        const numbers = manualDraw.map(n => parseInt(n)).filter(n => !isNaN(n));
        if (numbers.length !== 15) {
            alert('Por favor, preencha todos os 15 números.');
            return;
        }

        // Filter games by date if dates are selected
        let gamescheck = data.jogos;
        if (startDate || endDate) {
            // Fix date parsing to be local time (append T00:00:00 generally works well for local, or using split)
            // Using split avoids timezone confusion entirely
            const getStartOfDay = (dateStr) => {
                if (!dateStr) return 0;
                const [y, m, d] = dateStr.split('-').map(Number);
                return new Date(y, m - 1, d, 0, 0, 0, 0).getTime();
            };
            const getEndOfDay = (dateStr) => {
                if (!dateStr) return Infinity;
                const [y, m, d] = dateStr.split('-').map(Number);
                return new Date(y, m - 1, d, 23, 59, 59, 999).getTime();
            };

            const start = getStartOfDay(startDate);
            const end = getEndOfDay(endDate);

            gamescheck = data.jogos.filter(jogo => {
                const gameDate = parseInt(jogo.id); // id is timestamp
                return gameDate >= start && gameDate <= end;
            });
        }

        if (gamescheck.length === 0) {
            alert('Nenhum jogo encontrado no intervalo de datas selecionado.');
            return;
        }

        // Correctly calculate for EACH game
        const resultsWithPrizes = gamescheck.map(game => {
            const acertos = calcularAcertos(game.numeros, numbers);
            const premio = calcularPremio(acertos, game.numeros.length);
            return {
                ...game,
                acertos,
                premio
            };
        }).sort((a, b) => {
            // Sort by hits (descending) then by prize (descending)
            if (b.acertos !== a.acertos) return b.acertos - a.acertos;
            return b.premio - a.premio;
        });

        setCheckResult(resultsWithPrizes);
    };

    const clearInputs = () => {
        setManualDraw(Array(15).fill(''));
        setCheckResult(null);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/20">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-green-500/20 rounded-xl">
                        <Settings className="text-green-300" size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">Conferência Manual</h2>
                        <p className="text-purple-200">Digite os números sorteados para conferir seus jogos</p>
                    </div>
                </div>

                {/* Date Filter Section */}
                <div className="mb-6 p-4 bg-black/20 rounded-xl border border-white/10">
                    <div className="flex items-center gap-2 mb-3 text-purple-200">
                        <Calendar size={18} />
                        <span className="font-semibold">Filtrar Jogos Criados em:</span>
                    </div>
                    <div className="flex flex-wrap gap-4">
                        <div className="flex-1 min-w-[150px]">
                            <label className="block text-sm text-purple-300 mb-1">De:</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full bg-white/5 border border-purple-500/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400 transition-all"
                            />
                        </div>
                        <div className="flex-1 min-w-[150px]">
                            <label className="block text-sm text-purple-300 mb-1">Até:</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full bg-white/5 border border-purple-500/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400 transition-all"
                            />
                        </div>
                    </div>
                    <p className="text-xs text-purple-300/60 mt-2">
                        Deixe em branco para conferir todos os {data.jogos.length} jogos salvos.
                    </p>
                </div>

                {/* Input Grid */}
                <div className="grid grid-cols-5 md:grid-cols-8 lg:grid-cols-15 gap-2 mb-6 justify-center">
                    {manualDraw.map((num, index) => (
                        <input
                            key={index}
                            id={`manual-input-${index}`}
                            type="text"
                            value={num}
                            onChange={(e) => handleInputChange(index, e.target.value)}
                            className="w-10 h-10 md:w-12 md:h-12 text-center text-lg font-bold rounded-lg bg-white/20 border-2 border-transparent focus:border-yellow-400 focus:bg-white/30 text-white outline-none transition-all placeholder-white/30"
                            placeholder={(index + 1).toString().padStart(2, '0')}
                            maxLength={2}
                        />
                    ))}
                </div>

                <div className="flex gap-4 justify-center">
                    <button
                        onClick={clearInputs}
                        className="px-6 py-2 rounded-xl bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/30 transition-all font-semibold"
                    >
                        Limpar
                    </button>
                    <button
                        onClick={handleCheck}
                        className="px-8 py-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold hover:shadow-lg hover:shadow-green-500/30 transform hover:-translate-y-0.5 transition-all flex items-center gap-2"
                    >
                        <CheckCircle size={20} />
                        Conferir Agora
                    </button>
                </div>
            </div>

            {checkResult && (
                <div className="animate-slide-up">
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/20">
                        <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                            <Search className="text-yellow-400" />
                            Resultado da Conferência
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div className="bg-blue-500/20 p-4 rounded-xl border border-blue-500/30 text-center">
                                <div className="text-3xl font-bold text-blue-300">{checkResult.length}</div>
                                <div className="text-sm text-blue-200">Jogos Conferidos</div>
                            </div>
                            <div className="bg-green-500/20 p-4 rounded-xl border border-green-500/30 text-center">
                                <div className="text-3xl font-bold text-green-300">
                                    {checkResult.filter(r => r.acertos >= 11).length}
                                </div>
                                <div className="text-sm text-green-200">Jogos Premiados</div>
                            </div>
                            <div className="bg-yellow-500/20 p-4 rounded-xl border border-yellow-500/30 text-center">
                                <div className="text-3xl font-bold text-yellow-300">
                                    R$ {checkResult.reduce((acc, curr) => acc + (curr.premio || 0), 0).toFixed(2)}
                                </div>
                                <div className="text-sm text-yellow-200">Estimativa de Prêmio</div>
                            </div>
                        </div>

                        <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar">
                            {checkResult.map((game, idx) => (
                                <div
                                    key={idx}
                                    className={`p-4 rounded-xl border transition-all ${game.acertos >= 11
                                        ? 'bg-green-500/20 border-green-500/50 shadow-md shadow-green-900/20'
                                        : 'bg-white/5 border-white/10'
                                        }`}
                                >
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-bold text-white">Jogo {idx + 1}</span>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs text-purple-300">
                                                {new Date(parseInt(game.id)).toLocaleDateString('pt-BR')}
                                            </span>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${game.acertos >= 11 ? 'bg-green-500 text-white' : 'bg-gray-600 text-gray-300'
                                                }`}>
                                                {game.acertos} acertos
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {game.numeros.map(n => (
                                            <div
                                                key={n}
                                                className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold ${manualDraw.includes(String(n).padStart(2, '0')) || manualDraw.includes(String(n)) // Check match
                                                    ? 'bg-yellow-400 text-black transform scale-110 shadow-lg'
                                                    : 'bg-white/10 text-white'
                                                    }`}
                                            >
                                                {String(n).padStart(2, '0')}
                                            </div>
                                        ))}
                                    </div>
                                    {game.premio > 0 && (
                                        <div className="mt-2 text-right">
                                            <span className="text-yellow-300 font-bold">
                                                Prêmio: R$ {game.premio.toFixed(2)}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
