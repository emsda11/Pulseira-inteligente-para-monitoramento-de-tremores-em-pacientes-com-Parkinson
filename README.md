# ParkinsonCare – Pulseira Inteligente IoT para Monitoramento de Tremores

## 📌 Sobre o Projeto

O ParkinsonCare é uma solução baseada em Internet das Coisas (IoT) desenvolvida para auxiliar no monitoramento de pacientes com Doença de Parkinson.

O sistema utiliza uma pulseira inteligente equipada com sensores de movimento para identificar possíveis episódios de tremor, emitir alertas locais e enviar informações em tempo real para um dashboard médico.

O objetivo é permitir o acompanhamento remoto do paciente, fornecendo dados relevantes para médicos e cuidadores.

---

## 🎯 Problema

Pacientes com Doença de Parkinson apresentam tremores que podem variar ao longo do dia.

Durante as consultas médicas, nem sempre é possível observar todos os episódios ocorridos entre um atendimento e outro.

Além disso, a ausência de monitoramento contínuo dificulta a análise da evolução dos sintomas.

---

## 💡 Solução Proposta

O ParkinsonCare realiza:

* Monitoramento contínuo dos movimentos do paciente;
* Detecção automática de possíveis tremores;
* Emissão de alertas visuais e sonoros;
* Envio dos dados em tempo real via MQTT;
* Exibição das informações em dashboard médico;
* Geração de relatórios para acompanhamento clínico.

---

## 🏗 Arquitetura da Solução

```text
Paciente
   ↓
MPU6050
   ↓
ESP32
   ↓
Wi-Fi
   ↓
MQTT
   ↓
Dashboard
   ↓
Médico / Cuidador
```

---

## 🔧 Tecnologias Utilizadas

### Hardware

* ESP32
* MPU6050 (Acelerômetro e Giroscópio)
* LED
* Buzzer

### Software

* Arduino IDE
* MQTT
* HiveMQ Broker
* HTML
* CSS
* JavaScript
* Chart.js
* Wokwi

---

## 📡 Comunicação MQTT

Broker utilizado:

```text
broker.hivemq.com
```

Tópicos:

```text
parkinson/paciente01/dados
```

```text
parkinson/paciente01/alerta
```

---

## 📊 Dashboard

O dashboard permite:

* Visualização em tempo real dos dados do sensor;
* Exibição da intensidade dos tremores;
* Histórico de eventos;
* Gráficos de monitoramento;
* Relatórios médicos em CSV;
* Exportação para PDF.

Classificação da intensidade:

| Intensidade | Critério             |
| ----------- | -------------------- |
| Sem Tremor  | Tremor = NÃO         |
| Fraco       | Variação < 3.5       |
| Médio       | 3.5 ≤ Variação < 5.0 |
| Forte       | Variação ≥ 5.0       |

---

## ⚙ Funcionamento

O sensor MPU6050 realiza leituras contínuas dos movimentos do paciente.

O ESP32 calcula a variação entre leituras consecutivas:

```cpp
variacao =
abs(ax - axAnterior) +
abs(ay - ayAnterior) +
abs(az - azAnterior);
```

Quando a variação ultrapassa um limite configurado por três leituras consecutivas, o sistema considera a ocorrência de um possível tremor.

Nesse momento:

* O LED é acionado;
* O buzzer emite um alerta;
* Os dados são enviados via MQTT;
* O dashboard é atualizado automaticamente.

---

## 📈 Exemplo de Mensagem JSON

```json
{
  "paciente": "Paciente 01",
  "ax": 1.20,
  "ay": 0.80,
  "az": 9.70,
  "gx": 0.50,
  "gy": 0.30,
  "gz": 0.20,
  "variacao": 4.25,
  "tremor": "SIM"
}
```

---

## 🚀 Como Executar

### Simulação no Wokwi

1. Abrir o projeto no Wokwi.
2. Iniciar a simulação.
3. Movimentar o sensor MPU6050.
4. Observar os alertas e a publicação MQTT.

### Dashboard

1. Abrir o arquivo `index.html`.
2. A conexão MQTT será realizada automaticamente.
3. Acompanhar os dados recebidos em tempo real.

---

## 📚 Aplicação

Este projeto foi desenvolvido para fins acadêmicos como demonstração prática da aplicação de Internet das Coisas na área da saúde.

Embora utilize uma abordagem simplificada para identificação de tremores, a solução demonstra o potencial da IoT para monitoramento remoto de pacientes e apoio à tomada de decisão clínica.

---

## 👩‍💻 Autora

**Edjane Mikaelly Silva de Azevêdo**

Programa de Pós-Graduação em Tecnologia da Informação
Universidade Federal do Rio Grande do Norte (UFRN)

---

## 📄 Licença

Projeto desenvolvido exclusivamente para fins educacionais e acadêmicos.
