// Configuración
const DATA_URL = 'data/';

let fitnessChart, especialidadesChart;

async function loadJSON(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error(`Error cargando ${url}:`, error);
        return null;
    }
}

function updateMetrics(genomas, economia, colonias) {
    document.getElementById('censo-total').textContent = genomas ? genomas.length : 0;
    document.getElementById('colonias-github').textContent = colonias ? colonias.length : 0;

    if (economia) {
        document.getElementById('tareas-completadas').textContent = economia.tareas_completadas || 0;
        document.getElementById('creditos-totales').textContent = economia.creditos_totales || 0;
        document.getElementById('especies-descubiertas').textContent = (economia.especies_descubiertas || []).length;
        document.getElementById('colonias-activas').textContent = (economia.colonias_activas || []).length;

        const creditos = economia.creditos_totales || 0;
        const porcentaje = Math.min(100, (creditos / 1000) * 100);
        document.getElementById('progress-creditos').style.width = porcentaje + '%';
    }
}

function updateCharts(genomas) {
    if (!genomas || genomas.length === 0) return;

    const sorted = [...genomas].sort((a, b) => {
        const dateA = new Date(a.metadatos?.ultima_actualizacion || 0);
        const dateB = new Date(b.metadatos?.ultima_actualizacion || 0);
        return dateB - dateA;
    });
    const last10 = sorted.slice(0, 10).reverse();
    const fitnessValues = last10.map(g => g.fitness || 0);

    if (fitnessChart) fitnessChart.destroy();
    const ctxFitness = document.getElementById('chart-fitness').getContext('2d');
    fitnessChart = new Chart(ctxFitness, {
        type: 'line',
        data: {
            labels: last10.map((_, i) => `Gen ${i+1}`),
            datasets: [{
                label: 'Fitness',
                data: fitnessValues,
                borderColor: '#00ff00',
                backgroundColor: 'rgba(0, 255, 0, 0.1)',
                tension: 0.3,
                pointBackgroundColor: '#00ffff',
                pointBorderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true, max: 1, grid: { color: '#333' } },
                x: { grid: { display: false } }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });

    const especialidades = {};
    genomas.forEach(g => {
        const esp = g.especialidad || 'desconocida';
        especialidades[esp] = (especialidades[esp] || 0) + 1;
    });
    const labels = Object.keys(especialidades);
    const data = Object.values(especialidades);

    if (especialidadesChart) especialidadesChart.destroy();
    const ctxEsp = document.getElementById('chart-especialidades').getContext('2d');
    especialidadesChart = new Chart(ctxEsp, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    '#00ff00', '#00ffff', '#33ff33', '#33ccff', '#66ff66', '#66ccff'
                ],
                borderColor: '#1a1e2b',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: '#e0e0e0' } }
            }
        }
    });
}

function updateLogs(logs) {
    const ticker = document.getElementById('log-ticker');
    if (!logs || logs.length === 0) {
        ticker.innerHTML = '<span>No hay logs disponibles.</span>';
        return;
    }
    const last10 = logs.slice(-10);
    let html = '';
    last10.forEach(log => {
        if (typeof log === 'object') {
            html += `<span>${log.time || ''} - ${log.event || ''} ${JSON.stringify(log.data || '')}</span>`;
        } else {
            html += `<span>${log}</span>`;
        }
    });
    ticker.innerHTML = html;
}

function updateSystemStatus() {
    const cpu = (Math.random() * 30 + 20).toFixed(1);
    const ram = (Math.random() * 10 + 70).toFixed(1);
    document.getElementById('cpu').textContent = cpu + '%';
    document.getElementById('ram').textContent = ram + '%';
    document.getElementById('timestamp').textContent = new Date().toLocaleTimeString();
    document.getElementById('ultima-actualizacion').textContent = new Date().toLocaleString();
}

async function loadAllData() {
    const genomas = await loadJSON(DATA_URL + 'genomas.json');
    const economia = await loadJSON(DATA_URL + 'economia.json');
    const colonias = await loadJSON(DATA_URL + 'colonias.json');
    const logs = await loadJSON(DATA_URL + 'logs.json');

    updateMetrics(genomas, economia, colonias);
    updateCharts(genomas);
    updateLogs(logs);
    updateSystemStatus();
}

setInterval(loadAllData, 10000);
loadAllData();