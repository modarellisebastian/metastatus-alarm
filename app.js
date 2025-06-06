const SHEET_ENDPOINT = 'https://script.google.com/macros/s/AKfycby0wKSPUkCtTY9aXRZapXlrcbnkXERVpqWeDCGRXtzV9hRLX1uDicYasyMgzYRkt2c/exec';
const SLACK_PROXY = 'https://script.google.com/macros/s/AKfycbzeVJHxItDkHk4zhzvq1KtaP4R31G3C4m7Mte7W5AnyCBl43AJPNSUKE5qOTgzSTivt/exec';

async function getChannels() {
  try {
    const res = await fetch(SHEET_ENDPOINT);
    if (!res.ok) throw new Error('No se pudieron cargar los canales');
    const data = await res.json();
    renderChannels(data);
  } catch (error) {
    alert('Error al cargar los canales: ' + error.message);
  }
}

function renderChannels(channels) {
  const list = document.getElementById('channelList');
  list.innerHTML = '';

  channels.forEach((channel, i) => {
    const col = document.createElement('div');
    col.className = 'col-md-6 mb-2';
    col.innerHTML = `
      <div class="form-check">
        <input class="form-check-input channel-checkbox" type="checkbox"
          value="${channel.id_canal_slack}" data-tipo="${channel.tipo}" id="check${i}">
        <label class="form-check-label" for="check${i}">
          ${channel.nombre} <span class="badge bg-secondary">${channel.tipo}</span>
        </label>
      </div>
    `;
    list.appendChild(col);
  });

  document.getElementById('selectAll').checked = false;
}

async function sendToSlack(id, message) {
  try {
    await fetch(SLACK_PROXY, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channel_id: id, text: message })
    });
    // En modo "no-cors" no podemos leer la respuesta, asumimos exito
    console.log(`✅ Enviado a Slack (sin verificacion): ${id}`);
    return;
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

  document.getElementById('sendBtn').addEventListener('click', sendMessages);
  getChannels();
});
