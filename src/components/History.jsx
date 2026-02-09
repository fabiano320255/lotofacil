import React from 'react';
import { Trash } from 'lucide-react';

export const History = ({ data }) => {
    const { resultados } = data;

    // Stats Logic
    const totalJogados = resultados.reduce((sum, r) => sum + r.conferencias.length, 0);
    const totalPremiados = resultados.reduce((sum, r) => sum + r.jogosPremiados, 0);
    const valorGanho = resultados.reduce((sum, r) => sum + r.totalPremio, 0);

    // Distribution Chart Data
    const distribution = { 11: 0, 12: 0, 13: 0, 14: 0, 15: 0 };
    resultados.forEach(res => {
        res.conferencias.forEach(conf => {
            if (conf.acertos >= 11) distribution[conf.acertos]++;
        });
    });

    const maxVal = Math.max(...Object.values(distribution), 1);

    return (
        <div className="space-y-8 fade-in">
            <div className="card">
                <h2 className="text-2xl font-bold mb-6">📈 Estatísticas Gerais</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-blue-900/40 p-6 rounded-2xl text-center border border-blue-500/30">
                        <div className="text-4xl font-bold text-blue-300">{totalJogados}</div>
                        <div className="text-gray-400 mt-2">Jogos Conferidos</div>
                    </div>
                    <div className="bg-green-900/40 p-6 rounded-2xl text-center border border-green-500/30">
                        <div className="text-4xl font-bold text-green-300">{totalPremiados}</div>
                        <div className="text-gray-400 mt-2">Jogos Premiados</div>
                    </div>
                    <div className="bg-yellow-900/40 p-6 rounded-2xl text-center border border-yellow-500/30">
                        <div className="text-4xl font-bold text-yellow-300">R$ {valorGanho.toFixed(2)}</div>
                        <div className="text-gray-400 mt-2">Total Ganho</div>
                    </div>
                </div>
            </div>

            <div className="card">
                <h2 className="text-2xl font-bold mb-6">📊 Distribuição de Acertos</h2>
                <div className="space-y-4">
                    {[15, 14, 13, 12, 11].map(acertos => (
                        <div key={acertos} className="flex items-center gap-4">
                            <div className="w-24 font-bold text-right">{acertos} Acertos</div>
                            <div className="flex-1 h-8 bg-white/5 rounded-full overflow-hidden relative">
                                <div className="h-full bg-gradient-to-r from-blue-500 to-pink-500 transition-all duration-1000"
                                    style={{ width: `${(distribution[acertos] / maxVal) * 100}%` }}>
                                </div>
                                <span className="absolute right-2 top-1 text-xs font-bold drop-shadow-md">
                                    {distribution[acertos]}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="card">
                <h2 className="text-2xl font-bold mb-6">🏆 Histórico de Conferências</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/10">
                                <th className="p-4 rounded-tl-lg">Concurso</th>
                                <th className="p-4">Data</th>
                                <th className="p-4">Jogos</th>
                                <th className="p-4">Prêmio</th>
                                <th className="p-4 rounded-tr-lg">Detalhes</th>
                            </tr>
                        </thead>
                        <tbody>
                            {resultados.map(res => (
                                <tr key={res.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                                    <td className="p-4 font-bold text-yellow-300">#{res.concurso}</td>
                                    <td className="p-4">{new Date(res.data).toLocaleDateString('pt-BR')}</td>
                                    <td className="p-4">{res.conferencias.length} conferidos</td>
                                    <td className="p-4 text-green-400 font-bold">R$ {res.totalPremio.toFixed(2)}</td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1 rounded-full text-xs ${res.jogosPremiados > 0 ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-400'}`}>
                                            {res.jogosPremiados} premiados
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {resultados.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-gray-400">Nenhum histórico disponível.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
