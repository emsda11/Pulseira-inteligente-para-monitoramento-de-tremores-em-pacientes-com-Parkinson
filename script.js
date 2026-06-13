const TOPICO_DADOS = "parkinson/paciente01/dados";
const TOPICO_ALERTA = "parkinson/paciente01/alerta";

let leituras = [];
let eventosTremor = 0;
let maiorVariacao = 0;
let client = null;

let contagemIntensidade = {
  "SEM TREMOR": 0,
  "FRACO": 0,
  "MÉDIO": 0,
  "FORTE": 0
};

const grafico = new Chart(document.getElementById('grafico'), {
  type: 'line',
  data: {
    labels: [],
    datasets: [{
      label: 'Variação do Movimento',
      data: [],
      borderWidth: 2,
      tension: 0.3
    }]
  },
  options: {
    responsive: true,
    scales: {
      y: { beginAtZero: true, title: { display: true, text: 'Variação' } },
      x: { title: { display: true, text: 'Tempo' } }
    }
  }
});

const graficoIntensidade = new Chart(document.getElementById('graficoIntensidade'), {
  type: 'bar',
  data: {
    labels: ['SEM TREMOR', 'FRACO', 'MÉDIO', 'FORTE'],
    datasets: [{
      label: 'Quantidade de leituras',
      data: [0, 0, 0, 0],
      borderWidth: 1
    }]
  },
  options: {
    responsive: true,
    scales: {
      y: { beginAtZero: true, ticks: { precision: 0 } }
    }
  }
});

function classificarIntensidade(variacao, tremor) {
  if (tremor !== 'SIM') return 'SEM TREMOR';
  if (variacao < 3.5) return 'FRACO';
  if (variacao < 5.0) return 'MÉDIO';
  return 'FORTE';
}

function classeIntensidade(intensidade) {
  if (intensidade === 'FRACO') return 'fraco';
  if (intensidade === 'MÉDIO') return 'medio';
  if (intensidade === 'FORTE') return 'forte';
  return 'sem-tremor';
}

function conectarMQTT() {
  if (client && client.connected) {
    return;
  }

  const clientId =
    'dashboard_medico_' +
    Math.random().toString(16).substring(2, 8);

  client = mqtt.connect('wss://broker.hivemq.com:8884/mqtt', {
    clientId: clientId,
    clean: true,
    reconnectPeriod: 3000,
    connectTimeout: 8000
  });

  client.on('connect', () => {
    document.getElementById('mqttStatus').innerText = 'conectado';
    document.getElementById('mqttStatus').className = 'ok';

    client.subscribe(TOPICO_DADOS);
    client.subscribe(TOPICO_ALERTA);
  });

  client.on('close', () => {
    document.getElementById('mqttStatus').innerText = 'reconectando...';
    document.getElementById('mqttStatus').className = 'erro';
  });

  client.on('message', (topic, message) => {
    if (topic === TOPICO_DADOS) {
      try {
        atualizarDashboard(JSON.parse(message.toString()));
      } catch (e) {
        console.log('Mensagem não JSON:', message.toString());
      }
    }
  });

  client.on('error', (err) => {
    console.error(err);
    document.getElementById('mqttStatus').innerText = 'erro na conexão';
    document.getElementById('mqttStatus').className = 'erro';
  });
}

function atualizarDashboard(dado) {
  const agora = new Date().toLocaleString('pt-BR');
  const variacao = Number(dado.variacao || 0);
  const tremor = dado.tremor || 'NAO';
  const intensidade = classificarIntensidade(variacao, tremor);

  dado.horario = agora;
  dado.intensidade = intensidade;
  leituras.push(dado);

  if (variacao > maiorVariacao) maiorVariacao = variacao;

  document.getElementById('paciente').innerText = dado.paciente || 'Paciente 01';
  document.getElementById('variacao').innerText = variacao.toFixed(2);

  const statusCard = document.getElementById('statusCard');
  const status = document.getElementById('status');
  const intensidadeCard = document.getElementById('intensidadeCard');
  const intensidadeTexto = document.getElementById('intensidade');

  if (tremor === 'SIM') {
    status.innerText = 'TREMOR';
    statusCard.className = 'card alerta';
    eventosTremor++;
  } else {
    status.innerText = 'NORMAL';
    statusCard.className = 'card normal';
  }

  intensidadeTexto.innerText = intensidade;
  intensidadeCard.className = 'card ' + classeIntensidade(intensidade);

  contagemIntensidade[intensidade]++;

  document.getElementById('eventos').innerText = eventosTremor;
  document.getElementById('totalLeituras').innerText = leituras.length;
  document.getElementById('maiorVariacao').innerText = maiorVariacao.toFixed(2);
  document.getElementById('ultimaIntensidade').innerText = intensidade;

  grafico.data.labels.push(new Date().toLocaleTimeString('pt-BR'));
  grafico.data.datasets[0].data.push(variacao);

  if (grafico.data.labels.length > 20) {
    grafico.data.labels.shift();
    grafico.data.datasets[0].data.shift();
  }

  grafico.update();

  graficoIntensidade.data.datasets[0].data = [
    contagemIntensidade['SEM TREMOR'],
    contagemIntensidade['FRACO'],
    contagemIntensidade['MÉDIO'],
    contagemIntensidade['FORTE']
  ];

  graficoIntensidade.update();

  const tr = document.createElement('tr');
  const classe = classeIntensidade(intensidade);

  tr.innerHTML = `
    <td>${agora}</td>
    <td>${Number(dado.ax || 0).toFixed(2)}</td>
    <td>${Number(dado.ay || 0).toFixed(2)}</td>
    <td>${Number(dado.az || 0).toFixed(2)}</td>
    <td>${Number(dado.gx || 0).toFixed(2)}</td>
    <td>${Number(dado.gy || 0).toFixed(2)}</td>
    <td>${Number(dado.gz || 0).toFixed(2)}</td>
    <td>${variacao.toFixed(2)}</td>
    <td><strong>${tremor}</strong></td>
    <td><span class="tag ${classe}">${intensidade}</span></td>
  `;

  document.getElementById('tabela').prepend(tr);
}

function baixarCSV() {
  let csv = 'Data/Hora,Paciente,AX,AY,AZ,GX,GY,GZ,Variacao,Tremor,Intensidade\n';

  leituras.forEach(d => {
    csv += `${d.horario},${d.paciente || 'Paciente 01'},${d.ax},${d.ay},${d.az},${d.gx},${d.gy},${d.gz},${d.variacao},${d.tremor},${d.intensidade}\n`;
  });

  const blob = new Blob([csv], {
    type: 'text/csv;charset=utf-8;'
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');

  a.href = url;
  a.download = 'relatorio_medico_parkinson.csv';
  a.click();

  URL.revokeObjectURL(url);
}

// Conecta automaticamente ao MQTT quando o dashboard abrir
window.addEventListener("load", () => {
  setTimeout(() => {
    conectarMQTT();
  }, 1000);
});
