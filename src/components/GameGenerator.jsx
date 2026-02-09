import React, { useState } from 'react';
import { generateGame } from '../utils/gameLogic';
import { Trash2 } from 'lucide-react';

export const GameGenerator = ({ data }) => {
    const { jogos, addJogo, removeJogo, clearJogos } = data;
    const [numGames, setNumGames] = useState(10);
    const [numPerGame, setNumPerGame] = useState(15);
    const [fixedNumbers, setFixedNumbers] = useState('');
    const [estrategia, setEstrategia] = useState('aleatorio');

    const handleGenerate = () => {
        let fixos = [];
        if (fixedNumbers.trim()) {
            fixos = fixedNumbers.split(',')
                .map(n => parseInt(n.trim()))
                .filter(n => !isNaN(n) && n >= 1 && n <= 25);

            if (fixos.length > numPerGame) {
                alert(`Erro: Você escolheu ${fixos.length} números fixos, mas o jogo só tem ${numPerGame}!`);
                return;
            }
        }

        for (let i = 0; i < numGames; i++) {
            const nums = generateGame(numPerGame, fixos, estrategia);
            addJogo({
                id: Date.now() + Math.random(),
                numeros: nums,
                date: new Date().toISOString(),
                config: { numPerGame, fixos, estrategia }
            });
        }
    };

    return (
        <div className="space-y-8 fade-in">
            <div className="card">
                <h2 className="text-2xl font-bold mb-4">Configurações do Jogo</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="input-group">
                        <label>🎯 Quantidade de Jogos</label>
                        <input type="number" className="input-control" min="1" max="100"
                            value={numGames} onChange={e => setNumGames(parseInt(e.target.value))} />
                    </div>
                    <div className="input-group">
                        <label>🔢 Números por Jogo</label>
                        <select className="input-control" value={numPerGame} onChange={e => setNumPerGame(parseInt(e.target.value))}>
                            {[15, 16, 17, 18].map(n => <option key={n} value={n}>{n} números</option>)}
                        </select>
                    </div>
                    <div className="input-group">
                        <label>⭐ Fixos (opcional)</label>
                        <input type="text" className="input-control" placeholder="Ex: 1,5,10"
                            value={fixedNumbers} onChange={e => setFixedNumbers(e.target.value)} />
                    </div>
                    <div className="input-group">
                        <label>🎲 Estratégia</label>
                        <select className="input-control" value={estrategia} onChange={e => setEstrategia(e.target.value)}>
                            <option value="aleatorio">Aleatória</option>
                            <option value="pares-impares">Pares e Ímpares</option>
                            <option value="distribuida">Distribuída</option>
                            <option value="mais-sorteados">Mais Sorteados</option>
                        </select>
                    </div>
                </div>
                <button onClick={handleGenerate} className="btn btn-success w-full text-lg">
                    🎯 Gerar Novos Jogos
                </button>
            </div>

            <div className="card">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Seus Jogos Gerados ({jogos.length})</h2>
                    {jogos.length > 0 &&
                        <button onClick={clearJogos} className="text-red-400 hover:text-red-300 flex items-center gap-1">
                            <Trash2 size={16} /> Limpar Tudo
                        </button>
                    }
                </div>

                {jogos.length === 0 ? (
                    <div className="text-center py-10 text-gray-400 border-2 border-dashed border-gray-700 rounded-xl">
                        Nenhum jogo gerado ainda. Gere alguns jogos acima!
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {jogos.map((jogo, idx) => (
                            <div key={jogo.id} className="bg-white/5 p-4 rounded-xl border border-white/10 hover:border-pink-500/50 transition-all relative group">
                                <button onClick={() => removeJogo(jogo.id)}
                                    className="absolute top-2 right-2 text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Trash2 size={16} />
                                </button>
                                <div className="text-sm text-purple-300 mb-2">Jogo {idx + 1}</div>
                                <div className="flex flex-wrap gap-2">
                                    {jogo.numeros.map(n => (
                                        <span key={n} className="w-8 h-8 flex items-center justify-center bg-blue-600 rounded-full font-bold text-sm shadow-sm">
                                            {String(n).padStart(2, '0')}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
