import React, { useState } from 'react';
import { useLotofacilData } from './hooks/useLotofacilData';
import { GameGenerator } from './components/GameGenerator';
import { ManualCheck } from './components/ManualCheck';
import { AutoCheck } from './components/AutoCheck';
import { History } from './components/History';
import { LatestDraws } from './components/LatestDraws';
import { Printer, Download, Upload } from 'lucide-react';

function App() {
    const [activeTab, setActiveTab] = useState('gerar');
    const data = useLotofacilData();
    const fileInputRef = React.useRef(null);

    const handleExport = () => {
        let content = `=== BACKUP LOTOFÁCIL ===\n`;
        content += `Data: ${new Date().toLocaleString('pt-BR')}\n\n`;

        content += `--- MEUS JOGOS GERADOS (${data.jogos.length}) ---\n`;
        data.jogos.forEach((jogo, index) => {
            const nums = jogo.numeros.map(n => String(n).padStart(2, '0')).join(', ');
            content += `Jogo ${index + 1}: [${nums}] (${jogo.tipo || 'Gerado'})\n`;
        });

        content += `\n--- HISTÓRICO DE CONFERÊNCIAS (${data.resultados.length}) ---\n`;
        data.resultados.forEach(res => {
            content += `\nConcurso: ${res.concurso} | Data: ${res.data}\n`;
            content += `Sorteados: ${res.numerosSorteados.join(', ')}\n`;
            content += `>> Jogos Premiados: ${res.jogosPremiados} | Total Ganho: R$ ${res.totalPremio.toFixed(2)}\n`;
        });

        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `lotofacil-backup-${new Date().toISOString().slice(0, 10)}.txt`;
        a.click();
    };

    const handleImportClick = () => {
        fileInputRef.current.click();
    };

    const handleFileImport = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target.result;
            const lines = text.split('\n');
            let importedCount = 0;

            lines.forEach(line => {
                // Look for patterns like "Jogo 1: [01, 02, ...]"
                // Regex matches content inside brackets
                const match = line.match(/\[(.*?)\]/);
                if (match && match[1]) {
                    const numbersStr = match[1];
                    const numeros = numbersStr.split(',')
                        .map(n => parseInt(n.trim()))
                        .filter(n => !isNaN(n) && n >= 1 && n <= 25);

                    if (numeros.length >= 15 && numeros.length <= 20) {
                        data.addJogo({
                            id: Date.now() + Math.random(),
                            numeros: numeros.sort((a, b) => a - b),
                            tipo: 'Importado'
                        });
                        importedCount++;
                    }
                }
            });

            if (importedCount > 0) {
                alert(`${importedCount} jogos importados com sucesso! Agora você pode conferi-los.`);
                setActiveTab('conferir-auto');
            } else {
                alert('Nenhum jogo válido encontrado no arquivo.');
            }

            // Reset input
            event.target.value = null;
        };
        reader.readAsText(file);
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'gerar': return <GameGenerator data={data} />;
            // case 'conferir-manual': return <ManualCheck data={data} />; // Disabled by user request
            case 'conferir-auto': return <AutoCheck data={data} />;
            case 'historico': return <History data={data} />;
            case 'ultimos-sorteios': return <LatestDraws data={data} />;
            default: return <GameGenerator data={data} />;
        }
    };

    // Using Emojis as per the original file and user reference image
    const tabs = [
        { id: 'gerar', label: '🎯 Gerar Jogos' },
        // { id: 'conferir-manual', label: '📝 Conferir Manual' }, // Disabled by user request
        { id: 'conferir-auto', label: '⚡ Conferir Auto' },
        { id: 'historico', label: '📈 Histórico & Estatísticas' },
        { id: 'ultimos-sorteios', label: '📅 Últimos Sorteios' }
    ];

    return (
        <div className="container mx-auto px-4 py-8 max-w-[1400px]">
            <header className="text-center mb-8 p-6 bg-white/10 rounded-2xl backdrop-blur-sm no-print">
                <h1 className="text-4xl font-bold text-yellow-300 drop-shadow-md mb-2">
                    🎱 Bolão dos FEFOS-JK Lotofácil
                </h1>
                <p className="text-purple-200 text-lg">Gere jogos e confira automaticamente com os últimos resultados da Caixa</p>

                <div className="flex justify-center gap-4 mt-6">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileImport}
                        accept=".txt"
                        style={{ display: 'none' }}
                    />
                    <button onClick={() => window.print()} className="flex items-center gap-2 px-6 py-2 bg-blue-600 rounded-full hover:bg-blue-700 text-white font-bold transition-transform hover:-translate-y-0.5">
                        <Printer size={18} /> Imprimir
                    </button>
                    <button onClick={handleImportClick} className="flex items-center gap-2 px-6 py-2 bg-purple-600 rounded-full hover:bg-purple-700 text-white font-bold transition-transform hover:-translate-y-0.5">
                        <Upload size={18} /> Importar TXT
                    </button>
                    <button onClick={handleExport} className="flex items-center gap-2 px-6 py-2 bg-green-600 rounded-full hover:bg-green-700 text-white font-bold transition-transform hover:-translate-y-0.5">
                        <Download size={18} /> Backup
                    </button>
                </div>
            </header>

            {/* Tabs matching the reference image */}
            <nav className="flex flex-wrap bg-white/10 rounded-2xl mb-8 overflow-hidden no-print p-1">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`
              flex-1 py-4 px-4 font-bold text-center transition-all duration-300 rounded-xl
              flex items-center justify-center gap-2
              ${activeTab === tab.id
                                ? 'bg-[#ff4081] text-white shadow-lg'
                                : 'text-white hover:bg-white/10'
                            }
            `}
                    >
                        {tab.label}
                    </button>
                ))}
            </nav>

            <main className="fade-in min-h-[500px]">
                {renderContent()}
            </main>

            <footer className="text-center mt-12 text-sm text-gray-400 pb-8 no-print border-t border-white/5 pt-8">
                <p>© 2026 FeFos-JK App</p>
            </footer>
        </div>
    );
}

export default App;
