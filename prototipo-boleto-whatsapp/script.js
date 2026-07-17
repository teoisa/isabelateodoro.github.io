// ============================================================================
// MOTOR DA CONVERSA — lê o roteiro em conversationFlow.js e renderiza o chat.
// Não tem copy nem ramificações aqui: tudo isso vive em conversationFlow.js.
// ============================================================================

(function () {
  var flow = window.conversationFlow;

  var chatLog = document.getElementById('chat-log');
  var quickReplies = document.getElementById('quick-replies');
  var textInput = document.getElementById('chat-text-input');
  var sendBtn = document.getElementById('send-btn');
  var restartBtn = document.getElementById('restart-btn');
  var scenarioTag = document.getElementById('scenario-tag');
  var scenarioLabel = document.getElementById('scenario-label');

  var currentNodeId = flow.startNode;
  var awaitingInput = null; // { placeholder, specialResponses, next } quando o nó atual espera texto livre
  var isBusy = false; // true enquanto o bot está "digitando", pra evitar cliques/envios fora de hora
  var counters = {}; // contadores de tentativas (ex.: counters.leitura, counters.cpfInvalido)

  // ── UTILITÁRIOS ──────────────────────────────────────────────────────────

  function interpolate(text) {
    return text.replace(/\{(\w+)\}/g, function (match, key) {
      return flow.constants.hasOwnProperty(key) ? flow.constants[key] : match;
    });
  }

  function isCombiningDiacritic(charCode) {
    // Bloco Unicode "Combining Diacritical Marks" (U+0300–U+036F), usado
    // para remover acentos depois de normalizar a string em NFD.
    return charCode >= 768 && charCode <= 879;
  }

  function normalize(str) {
    var withoutAccents = str
      .toLowerCase()
      .normalize('NFD')
      .split('')
      .filter(function (ch) {
        return !isCombiningDiacritic(ch.charCodeAt(0));
      })
      .join('');
    return withoutAccents.trim();
  }

  function currentTime() {
    var now = new Date();
    var hh = String(now.getHours()).padStart(2, '0');
    var mm = String(now.getMinutes()).padStart(2, '0');
    return hh + ':' + mm;
  }

  function scrollToBottom() {
    chatLog.scrollTop = chatLog.scrollHeight;
  }

  function matchKeyword(text) {
    var normalized = normalize(text);
    for (var key in flow.keywordMap) {
      if (flow.keywordMap.hasOwnProperty(key) && normalized.indexOf(normalize(key)) !== -1) {
        return flow.keywordMap[key];
      }
    }
    return null;
  }

  // ── RENDERIZAÇÃO DE MENSAGENS ────────────────────────────────────────────

  function appendBubble(text, who, receipt) {
    var row = document.createElement('div');
    row.className = 'bubble-row ' + who;

    var bubble = document.createElement('div');
    bubble.className = 'bubble ' + who;

    var textEl = document.createElement('div');
    textEl.className = 'bubble-text';
    textEl.textContent = text;
    bubble.appendChild(textEl);

    if (receipt) {
      bubble.appendChild(buildReceiptCard());
    }

    var timeEl = document.createElement('span');
    timeEl.className = 'bubble-time';
    timeEl.textContent = currentTime();
    bubble.appendChild(timeEl);

    row.appendChild(bubble);
    chatLog.appendChild(row);
    scrollToBottom();
  }

  function buildReceiptCard() {
    var card = document.createElement('div');
    card.className = 'receipt-card';

    var title = document.createElement('div');
    title.className = 'receipt-card-title';
    title.innerHTML = '<span class="receipt-check">&#10003;</span> Pagamento aprovado';
    card.appendChild(title);

    var rows = [
      ['Beneficiário', flow.constants.beneficiario],
      ['Valor', 'R$ ' + flow.constants.valor],
      ['Data do pagamento', new Date().toLocaleDateString('pt-BR')]
    ];

    rows.forEach(function (pair) {
      var rowEl = document.createElement('div');
      rowEl.className = 'receipt-row';
      var k = document.createElement('span');
      k.textContent = pair[0];
      var v = document.createElement('span');
      v.textContent = pair[1];
      rowEl.appendChild(k);
      rowEl.appendChild(v);
      card.appendChild(rowEl);
    });

    return card;
  }

  function showTyping(callback) {
    var row = document.createElement('div');
    row.className = 'bubble-row bot';

    var bubble = document.createElement('div');
    bubble.className = 'bubble bot';
    bubble.innerHTML = '<span class="typing-dots"><span></span><span></span><span></span></span>';

    row.appendChild(bubble);
    chatLog.appendChild(row);
    scrollToBottom();

    var delay = 800 + Math.random() * 700; // 800ms a 1.5s, conforme especificação
    setTimeout(function () {
      row.remove();
      callback();
    }, delay);
  }

  function playMessages(messages, index, done) {
    if (!messages || index >= messages.length) {
      done();
      return;
    }
    showTyping(function () {
      var msg = messages[index];
      appendBubble(interpolate(msg.text), 'bot', !!msg.receipt);
      playMessages(messages, index + 1, done);
    });
  }

  // ── RENDERIZAÇÃO DE OPÇÕES / CAMPO DE TEXTO ─────────────────────────────

  function renderOptions(options) {
    quickReplies.innerHTML = '';
    var card = document.createElement('div');
    card.className = 'quick-replies-card';

    options.forEach(function (opt) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'quick-reply-btn';
      btn.textContent = opt.label;
      btn.addEventListener('click', function () {
        if (isBusy) return;
        handleOptionClick(opt);
      });
      card.appendChild(btn);
    });

    quickReplies.appendChild(card);
  }

  function clearOptions() {
    quickReplies.innerHTML = '';
  }

  // ── NAVEGAÇÃO ENTRE NÓS ──────────────────────────────────────────────────
  // `nodeOrId` pode ser o id de um nó do flow, ou um objeto de nó "avulso"
  // (usado para a resposta dinâmica de palavra-chave fora de escopo).

  function goTo(nodeOrId, idForState) {
    var node = typeof nodeOrId === 'string' ? flow.nodes[nodeOrId] : nodeOrId;
    if (!node) return;

    currentNodeId = typeof nodeOrId === 'string' ? nodeOrId : (idForState || null);
    awaitingInput = null;
    clearOptions();
    updateScenarioTag(node.scenario);

    isBusy = true;
    textInput.disabled = true;

    playMessages(node.messages, 0, function () {
      isBusy = false;
      textInput.disabled = false;
      textInput.focus();

      if (node.input) {
        awaitingInput = node.input;
        textInput.placeholder = node.input.placeholder || 'Digite uma mensagem';
      } else {
        textInput.placeholder = 'Digite uma mensagem';
      }

      if (node.options) {
        renderOptions(node.options);
      } else if (node.next) {
        goTo(node.next);
      }
    });
  }

  function handleOptionClick(opt) {
    appendBubble(opt.label, 'user', false);
    clearOptions();
    goTo(opt.next);
  }

  // ── ENVIO DE TEXTO LIVRE ─────────────────────────────────────────────────
  // `resumeNodeId` é o nó em que o usuário estava quando a mensagem foi
  // enviada — os nós dinâmicos de "fora de escopo" usam isso para oferecer
  // "continuar" (retomar exatamente de onde parou) em vez de só voltar ao menu.

  function buildKeywordNode(assunto, resumeNodeId) {
    return {
      scenario: 'Fora de escopo',
      messages: [
        { text: interpolate(flow.oosKeywordTemplate).replace('{assunto}', assunto) }
      ],
      options: [
        { label: 'Sim, voltar ao menu', next: 'greeting' },
        { label: 'Não, continuar pagamento', next: resumeNodeId }
      ]
    };
  }

  function buildUnrecognizedNode(resumeNodeId) {
    return {
      scenario: 'Fora de escopo',
      messages: [
        { text: flow.oosUnrecognizedText }
      ],
      options: [
        { label: 'Tentar novamente', next: resumeNodeId },
        { label: 'Voltar ao menu principal', next: 'greeting' },
        { label: 'Falar com atendente', next: 'transfer_agent' }
      ]
    };
  }

  // Resolve um valor de `specialResponses`: ou é o id de um nó (string), ou
  // um objeto { onFail, counterId, max, onMax } para cenários com contador
  // de tentativas (ex.: transferência automática após 3 falhas de leitura).
  function resolveSpecialResponse(response) {
    if (typeof response === 'string') {
      goTo(response);
      return;
    }
    counters[response.counterId] = (counters[response.counterId] || 0) + 1;
    if (counters[response.counterId] >= response.max) {
      counters[response.counterId] = 0;
      goTo(response.onMax);
    } else {
      goTo(response.onFail);
    }
  }

  // Validação especial do campo de CPF: identifica CPF não localizado
  // (valor de teste fixo), formato inválido (contagem de dígitos, com
  // transferência automática após N tentativas) e texto sem nenhum dígito
  // (tratado como mensagem não reconhecida).
  function handleCpfSubmit(text, inputConfig, resumeNodeId) {
    if (text === inputConfig.notFoundValue) {
      goTo(inputConfig.notFoundNext);
      return;
    }

    if (text === inputConfig.recognizedValue) {
      goTo(inputConfig.recognizedNext);
      return;
    }

    var digits = text.replace(/\D/g, '');

    if (digits.length === 0) {
      goTo(buildUnrecognizedNode(resumeNodeId), 'oos_unrecognized_dynamic');
      return;
    }

    if (digits.length !== 11) {
      counters.cpfInvalido = (counters.cpfInvalido || 0) + 1;
      if (counters.cpfInvalido >= inputConfig.invalidMax) {
        counters.cpfInvalido = 0;
        goTo(inputConfig.invalidMaxNext);
      } else {
        goTo(inputConfig.invalidNext);
      }
      return;
    }

    counters.cpfInvalido = 0;
    goTo(inputConfig.next);
  }

  function handleTextSubmit() {
    if (isBusy) return;
    var raw = textInput.value;
    var text = raw.trim();
    if (!text) return;

    var resumeNodeId = currentNodeId;

    appendBubble(text, 'user', false);
    textInput.value = '';
    clearOptions();

    var node = flow.nodes[currentNodeId];

    // 1. Campo de CPF é o único ponto de texto livre não estruturado do
    //    fluxo — por isso é o único lugar com reconhecimento de "fora de
    //    escopo" (palavra-chave e mensagem não reconhecida), além da
    //    validação de formato/CPF não encontrado (ver handleCpfSubmit).
    if (awaitingInput && awaitingInput.cpfValidation) {
      var assunto = matchKeyword(text);
      if (assunto) {
        goTo(buildKeywordNode(assunto, resumeNodeId), 'oos_keyword_dynamic');
        return;
      }
      handleCpfSubmit(text, awaitingInput, resumeNodeId);
      return;
    }

    // 2. Campo de código do boleto (colar/digitar): atalhos de demonstração,
    //    com contador de tentativas quando aplicável (ver resolveSpecialResponse).
    if (awaitingInput && awaitingInput.specialResponses && awaitingInput.specialResponses.hasOwnProperty(text)) {
      resolveSpecialResponse(awaitingInput.specialResponses[text]);
      return;
    }

    // 3. Qualquer outro texto no campo de código do boleto é aceito como
    //    válido — não há "fora de escopo" nesse campo (seria redundante com
    //    a falha de leitura, ver conversationFlow.js).
    if (awaitingInput) {
      if (currentNodeId === 'paste_input' || currentNodeId === 'manual_input') {
        counters.leitura = 0; // captura bem-sucedida encerra a sequência de falhas
      }
      goTo(awaitingInput.next);
      return;
    }

    // 4. Nó guiado só por botão: tenta casar o texto digitado com algum
    //    rótulo (permite digitar em vez de clicar); se não bater, apenas
    //    repete as opções — esses passos são 100% botão.
    if (node && node.options) {
      var matched = node.options.filter(function (opt) {
        return normalize(opt.label) === normalize(text);
      })[0];
      goTo(matched ? matched.next : currentNodeId);
    }
  }

  // ── TAG DE CENÁRIO ───────────────────────────────────────────────────────

  function updateScenarioTag(scenario) {
    if (scenario) {
      scenarioLabel.textContent = scenario;
    }
  }

  scenarioTag.addEventListener('click', function () {
    scenarioTag.classList.toggle('collapsed');
  });

  // ── EVENTOS DE ENTRADA ───────────────────────────────────────────────────

  sendBtn.addEventListener('click', handleTextSubmit);

  textInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleTextSubmit();
    }
  });

  restartBtn.addEventListener('click', function () {
    chatLog.innerHTML = '';
    clearOptions();
    textInput.value = '';
    textInput.disabled = false;
    isBusy = false;
    counters = {};
    goTo(flow.startNode);
  });

  // ── INÍCIO ───────────────────────────────────────────────────────────────

  goTo(flow.startNode);
})();
