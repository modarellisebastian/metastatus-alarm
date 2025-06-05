const SHEET_ENDPOINT = 'https://script.google.com/macros/s/AKfycby0wKSPUkCtTY9aXRZapXlrcbnkXERVpqWeDCGRXtzV9hRLX1uDicYasyMgzYRkt2c/exec';
const SLACK_PROXY = 'https://script.google.com/macros/s/AKfycbzeVJHxItDkHk4zhzvq1KtaP4R31G3C4m7Mte7W5AnyCBl43AJPNSUKE5qOTgzSTivt/exec';

let channelsData = [];

async function getChannels() {
  try {
    const res = await fetch(SHEET_ENDPOINT);
    if (!res.ok) throw new Error('No se pudieron cargar los canales');
    channelsData = await res.json();
    filterChannels();
  } catch (error) {
    alert('Error al cargar los canales: ' + error.message);
  }
}

function filterChannels() {
  const filter = document.getElementById('channelFilter').value;
  let filtered = channelsData;
  if (filter === 'slack') {
    filtered = channelsData.filter(c => c.tipo === 'slack');
  } else if (filter === 'telegram') {
    filtered = channelsData.filter(c => c.tipo === 'telegram');
  }
  renderChannels(filtered);
}

function renderChannels(channels) {
  const list = document.getElementById('channelList');
  list.innerHTML = '';

  const slackCol1 = document.createElement('div');
  slackCol1.className = 'col-md-3';
  const slackCol2 = document.createElement('div');
  slackCol2.className = 'col-md-3';
  const teleCol1 = document.createElement('div');
  teleCol1.className = 'col-md-3';
  const teleCol2 = document.createElement('div');
  teleCol2.className = 'col-md-3';

  let sIndex = 0;
  let tIndex = 0;

  channels.forEach((channel, i) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'form-check mb-2';
    wrapper.innerHTML = `
      <input class="form-check-input channel-checkbox" type="checkbox" value="${channel.id_canal_slack}" data-tipo="${channel.tipo}" id="check${i}">
      <label class="form-check-label" for="check${i}">${channel.nombre}</label>
    `;

    if (channel.tipo === 'slack') {
      (sIndex % 2 === 0 ? slackCol1 : slackCol2).appendChild(wrapper);
      sIndex++;
    } else {
      (tIndex % 2 === 0 ? teleCol1 : teleCol2).appendChild(wrapper);
      tIndex++;
    }
  });

  list.appendChild(slackCol1);
  list.appendChild(slackCol2);
  list.appendChild(teleCol1);
  list.appendChild(teleCol2);

  document.getElementById('selectAll').checked = false;
}

async function sendToSlack(id, message) {
  try {
    const res = await fetch(SLACK_PROXY, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channel_id: id, text: message })
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.error) {
      throw new Error(data.error || 'Respuesta inesperada del proxy');
    }

    console.log(`✅ Enviado a Slack: ${id}`);
  } catch (error) {
    console.error(`❌ Error en Slack (${id}):`, error.message);
  }
}

function sendToTelegram(id) {
  console.log(`(Simulado) Enviando a Telegram: ${id}`);
}

async function sendMessages() {
  const message = document.getElementById('message').value.trim();
  if (!message) {
    alert('Por favor escribí un mensaje.');
    return;
  }

  const selected = document.querySelectorAll('.channel-checkbox:checked');
  if (selected.length === 0) {
    alert('Seleccioná al menos un canal.');
    return;
  }

  for (const check of selected) {
    const tipo = check.dataset.tipo;
    const id = check.value;

    if (tipo === 'slack') {
      await sendToSlack(id, message);
    } else if (tipo === 'telegram') {
      sendToTelegram(id);
    }
  }

  alert('Mensajes enviados. Ver consola para más detalles.');
  document.getElementById('message').value = '';
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('selectAll').addEventListener('change', e => {
    document.querySelectorAll('.channel-checkbox').forEach(cb => cb.checked = e.target.checked);
  });

  document.getElementById('channelFilter').addEventListener('change', filterChannels);

  document.getElementById('sendBtn').addEventListener('click', sendMessages);
  getChannels();
});
