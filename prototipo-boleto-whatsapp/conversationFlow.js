// ============================================================================
// ROTEIRO DA CONVERSA — Chatbot WhatsApp | Pagamento de boleto (Health Care)
// ============================================================================
// Copy fiel à lista de mensagens finais fornecida (fonte única da copy —
// não parafraseie ao editar; qualquer correção de texto deve vir de uma
// nova lista revisada). Regras de ramificação seguem o documento "Fluxo
// Conversacional — Pagamento de Boleto via WhatsApp" (fonte única da
// lógica/estrutura).
//
// Tom: primeira pessoa do singular, formal, sem coloquialismo, sem emojis.
// Pontuação: todas as mensagens terminam em ponto final ou interrogação,
// exceto duas exceções intencionais com exclamação — "Código lido com
// sucesso!" (validação bem-sucedida) e "Pagamento confirmado!" (pagamento
// aprovado). Não adicione exclamações em nenhuma outra mensagem.
//
// Importante (do documento de fluxo): "fora de escopo" (reconhecimento de
// assunto e mensagem não reconhecida) só existe no campo de CPF — é o único
// ponto de texto livre não estruturado do fluxo. Nos campos de código do
// boleto (colar/digitar), qualquer texto que não seja um dos atalhos de
// teste é tratado como boleto válido (não há "fora de escopo" ali, seria
// redundante com a falha de leitura).
//
// Este arquivo concentra TODA a copy e as ramificações da conversa.
// A lógica de validação de CPF e contagem de tentativas fica em script.js,
// mas é inteiramente configurada a partir dos campos `input` abaixo.
//
// Estrutura de cada nó em `nodes`:
// - scenario: rótulo mostrado na tag de cenário (fins de apresentação)
// - messages: mensagens do bot exibidas em sequência, cada uma com o
//     indicador de "digitando..." antes de aparecer. Aceita placeholders
//     {operadora}, {beneficiario}, {valor}, {vencimento},
//     {vencimentoSegundaVia}, {nomeCliente} — ver `constants` abaixo. Use
//     `receipt: true` numa mensagem para renderizar o cartão de recibo.
// - options: botões de resposta rápida (chips). Cada opção é { label, next }.
// - input: se presente, o bot aguarda texto livre do usuário.
//     - placeholder: texto de apoio do campo
//     - cpfValidation: true → ativa a validação especial de CPF e o
//         reconhecimento de fora de escopo (só acontece neste campo)
//     - specialResponses: respostas exatas que disparam cenários específicos.
//         Cada valor pode ser uma string (id do próximo nó) ou um objeto
//         { onFail, counterId, max, onMax } para cenários com contador de
//         tentativas (ex.: transferência automática após N falhas).
//     - next: nó seguinte para qualquer outra resposta (tratada como válida)
// - next: avança automaticamente para outro nó, sem esperar ação do usuário
// - final: true quando a conversa não tem mais nada programado a seguir
//
// Atalhos de demonstração:
//   Campo de CPF (ask_cpf):
//     "00000000000"     → CPF não encontrado
//     "11111111111"     → cliente reconhecido (boas-vindas de volta)
//     menos/mais de 11 dígitos (ex.: "1") → CPF inválido (3x → transfere)
//     texto sem nenhum dígito e sem palavra-chave → mensagem não reconhecida
//     mencionar "plano", "fatura" ou "agendamento" → assunto diferente
//   Campo de código do boleto (colar/digitar manualmente):
//     999 → falha de leitura (3x seguidas → transfere)
//     000 → boleto vencido
//     111 → boleto já pago / duplicado
//     222 → falha sistêmica na validação
//     qualquer outro valor é aceito normalmente como boleto válido
// ============================================================================

// Configuração do campo de CPF, compartilhada entre o pedido inicial
// (ask_cpf) e o retry após formato inválido (cpf_invalido) — assim, ao
// errar o CPF, o campo reabre direto para nova tentativa sem repetir a
// pergunta "pode me informar seu CPF?", que já ficou implícita na mensagem
// de erro.
var cpfInputConfig = {
  placeholder: 'Digite seu CPF',
  cpfValidation: true,
  notFoundValue: '00000000000',
  notFoundNext: 'cpf_nao_encontrado',
  recognizedValue: '11111111111',
  recognizedNext: 'cliente_reconhecido',
  invalidNext: 'cpf_invalido',
  invalidMax: 3,
  invalidMaxNext: 'transfer_agent',
  next: 'ask_method'
};

window.conversationFlow = {

  constants: {
    operadora: 'Health Care',
    beneficiario: 'Health Care Operadora de Saúde',
    valor: '189,90',
    vencimento: '22/07/2026',
    vencimentoSegundaVia: '05/08/2026',
    nomeCliente: 'Isabela'
  },

  // Palavras-chave reconhecidas em texto livre no campo de CPF, para o
  // reconhecimento de "assunto diferente detectado".
  keywordMap: {
    plano: 'planos e coberturas',
    planos: 'planos e coberturas',
    cobertura: 'planos e coberturas',
    fatura: 'fatura e cobranças',
    faturas: 'fatura e cobranças',
    cobranca: 'fatura e cobranças',
    agendamento: 'agendamento de consultas',
    consulta: 'agendamento de consultas',
    agendar: 'agendamento de consultas'
  },

  oosKeywordTemplate: 'Percebi que sua mensagem é sobre {assunto}. Deseja voltar ao menu principal?',

  oosUnrecognizedText: 'Não consegui entender sua mensagem. Escolha uma das opções abaixo:',

  // Usada em toda transferência humana, manual ou automática (após 3
  // tentativas de erro).
  transferMessage: 'Vou te transferir para um atendente. Em instantes, alguém continua o atendimento com você.',

  startNode: 'greeting',

  nodes: {

    // ── N0. MENU INICIAL (fora do escopo deste fluxo — ver documento mestre) ──
    greeting: {
      scenario: 'Caminho feliz',
      messages: [
        { text: 'Olá. Sou o assistente virtual {operadora}. Como posso te ajudar?' }
      ],
      options: [
        { label: 'Pagar boleto', next: 'intent_boleto' },
        { label: 'Consultar plano', next: 'oos_plano' },
        { label: 'Agendamento', next: 'oos_agendamento' },
        { label: 'Falar com atendente', next: 'transfer_agent' }
      ]
    },

    // ── 1. ENTRADA E IDENTIFICAÇÃO ───────────────────────────────────────
    intent_boleto: {
      scenario: 'Caminho feliz',
      messages: [
        { text: 'Vou te ajudar a pagar o boleto agora.' }
      ],
      next: 'ask_cpf'
    },

    ask_cpf: {
      scenario: 'Caminho feliz',
      messages: [
        { text: 'Para continuarmos com segurança, pode me informar seu CPF?' }
      ],
      input: cpfInputConfig
    },

    cliente_reconhecido: {
      // N1.3a do documento de fluxo — cliente já identificado (login
      // implícito via WhatsApp cadastrado).
      scenario: 'Caminho feliz',
      messages: [
        { text: 'Bem-vindo de volta, {nomeCliente}. Já localizei seu cadastro.' }
      ],
      next: 'ask_method'
    },

    cpf_invalido: {
      // Sem `next: 'ask_cpf'` de propósito: repetir a pergunta do CPF aqui
      // seria redundante — a mensagem de erro já pede pra reenviar, então o
      // campo reabre direto para a nova tentativa.
      scenario: 'Erro: CPF inválido',
      messages: [
        { text: 'Esse CPF não parece estar correto. Pode conferir os números e enviar novamente?' }
      ],
      input: cpfInputConfig
    },

    cpf_nao_encontrado: {
      scenario: 'Erro: CPF não encontrado',
      messages: [
        { text: 'Não localizei um cadastro com esse CPF. Deseja falar com nosso atendimento?' }
      ],
      options: [
        { label: 'Falar com atendente', next: 'transfer_agent' },
        { label: 'Tentar novamente', next: 'ask_cpf' }
      ]
    },

    // ── 2. CAPTURA DO BOLETO ─────────────────────────────────────────────
    ask_method: {
      scenario: 'Caminho feliz',
      messages: [
        { text: 'Como você prefere me enviar o boleto?' }
      ],
      options: [
        { label: 'Foto do código de barras', next: 'photo_ready' },
        { label: 'Colar linha digitável', next: 'paste_input' },
        { label: 'Digitar manualmente', next: 'manual_input' }
      ]
    },

    photo_ready: {
      // Bridging de demonstração: não há câmera real disponível.
      scenario: 'Caminho feliz',
      messages: [
        { text: 'Toque no botão abaixo para simular o envio da foto do boleto.' }
      ],
      options: [
        { label: 'Simular envio de foto', next: 'photo_processing' }
      ]
    },

    photo_processing: {
      scenario: 'Caminho feliz',
      messages: [
        { text: 'Recebi sua imagem. Estou lendo o código de barras, só um instante.' },
        { text: 'Código lido com sucesso! Estou conferindo as informações do boleto.' }
      ],
      next: 'confirm_data'
    },

    paste_input: {
      scenario: 'Caminho feliz',
      messages: [],
      input: {
        placeholder: 'Cole a linha digitável',
        specialResponses: {
          '999': { onFail: 'error_leitura', counterId: 'leitura', max: 3, onMax: 'transfer_agent' },
          '000': 'error_vencido',
          '111': 'error_duplicado',
          '222': 'error_sistemico'
        },
        next: 'paste_processing'
      }
    },

    paste_processing: {
      scenario: 'Caminho feliz',
      messages: [
        { text: 'Recebi a linha digitável. Vou conferir os dados.' },
        { text: 'Código lido com sucesso! Estou conferindo as informações do boleto.' }
      ],
      next: 'confirm_data'
    },

    manual_input: {
      scenario: 'Caminho feliz',
      messages: [
        { text: 'Você pode digitar o código de barras aos poucos, em blocos, sem pressa.' }
      ],
      input: {
        placeholder: 'Digite o código de barras',
        specialResponses: {
          '999': { onFail: 'error_leitura', counterId: 'leitura', max: 3, onMax: 'transfer_agent' },
          '000': 'error_vencido',
          '111': 'error_duplicado',
          '222': 'error_sistemico'
        },
        next: 'manual_processing'
      }
    },

    manual_processing: {
      scenario: 'Caminho feliz',
      messages: [
        { text: 'Código lido com sucesso! Estou conferindo as informações do boleto.' }
      ],
      next: 'confirm_data'
    },

    // ── 3. VALIDAÇÃO (cenários de erro) ─────────────────────────────────
    error_leitura: {
      scenario: 'Erro: leitura',
      messages: [
        { text: 'Não consegui ler esse código. Deseja tentar novamente ou prefere digitar manualmente?' }
      ],
      options: [
        { label: 'Tentar novamente', next: 'ask_method' },
        { label: 'Digitar manualmente', next: 'manual_input' }
      ]
    },

    error_vencido: {
      scenario: 'Erro: boleto vencido',
      messages: [
        { text: 'Esse boleto está vencido. Deseja que eu emita uma segunda via atualizada?' }
      ],
      options: [
        { label: 'Emitir segunda via', next: 'second_copy_issued' },
        { label: 'Falar com atendente', next: 'transfer_agent' }
      ]
    },

    second_copy_issued: {
      scenario: 'Caminho feliz',
      messages: [
        { text: 'Segunda via emitida com sucesso. Novo vencimento: {vencimentoSegundaVia}.' }
      ],
      next: 'confirm_data_second_copy'
    },

    confirm_data_second_copy: {
      scenario: 'Caminho feliz',
      messages: [
        { text: 'Antes de seguirmos, confirme se está tudo certo: beneficiário {beneficiario}, valor R$ {valor}, vencimento em {vencimentoSegundaVia}.' }
      ],
      options: [
        { label: 'Confirmar', next: 'data_confirmed' },
        { label: 'Corrigir', next: 'data_correction' }
      ]
    },

    error_duplicado: {
      scenario: 'Erro: boleto já pago',
      messages: [
        { text: 'Esse boleto já consta como pago. Você não precisa fazer mais nada.' }
      ],
      options: [
        { label: 'Voltar ao menu', next: 'greeting' }
      ]
    },

    error_sistemico: {
      scenario: 'Erro: falha sistêmica',
      messages: [
        { text: 'No momento não consegui concluir a validação. Você pode tentar novamente em instantes ou falar com nosso atendimento.' }
      ],
      options: [
        { label: 'Tentar novamente', next: 'ask_method' },
        { label: 'Falar com atendente', next: 'transfer_agent' }
      ]
    },

    // ── 4. CONFIRMAÇÃO DOS DADOS ─────────────────────────────────────────
    confirm_data: {
      scenario: 'Caminho feliz',
      messages: [
        { text: 'Antes de seguirmos, confirme se está tudo certo: beneficiário {beneficiario}, valor R$ {valor}, vencimento em {vencimento}.' }
      ],
      options: [
        { label: 'Confirmar', next: 'data_confirmed' },
        { label: 'Corrigir', next: 'data_correction' }
      ]
    },

    data_confirmed: {
      scenario: 'Caminho feliz',
      messages: [
        { text: 'Confirmado. Vou seguir com o pagamento.' }
      ],
      next: 'processing_payment'
    },

    data_correction: {
      scenario: 'Caminho feliz',
      messages: [
        { text: 'Sem problema. Vou te enviar o pedido do boleto novamente.' }
      ],
      next: 'ask_method'
    },

    // ── 5. PAGAMENTO E ENCERRAMENTO ──────────────────────────────────────
    processing_payment: {
      scenario: 'Caminho feliz',
      messages: [
        { text: 'Estou processando o pagamento, só um instante.' },
        { text: 'Pagamento confirmado! O recibo está logo abaixo.', receipt: true }
      ],
      next: 'encerramento'
    },

    encerramento: {
      scenario: 'Caminho feliz',
      messages: [
        { text: 'Por aqui é só isso. Se quiser falar com um atendente a qualquer momento, é só avisar.' }
      ],
      options: [
        { label: 'Falar com atendente', next: 'transfer_agent' }
      ],
      final: true
    },

    // ── 6. TRANSFERÊNCIA HUMANA ───────────────────────────────────────────
    transfer_agent: {
      scenario: 'Atendimento humano',
      messages: [
        { text: 'Vou te transferir para um atendente. Em instantes, alguém continua o atendimento com você.' }
      ],
      final: true
    },

    // Estes dois nós existem porque "Consultar plano" e "Agendamento" são
    // opções do menu inicial (N0), que o documento de fluxo trata como fora
    // do escopo deste exercício — servem só para o clique no botão não cair
    // no vazio dentro do protótipo interativo.
    oos_plano: {
      scenario: 'Fora de escopo',
      messages: [
        { text: 'Esse atendimento ainda não está disponível nesta demonstração. Deseja voltar ao menu principal?' }
      ],
      options: [
        { label: 'Voltar ao menu', next: 'greeting' },
        { label: 'Falar com atendente', next: 'transfer_agent' }
      ]
    },

    oos_agendamento: {
      scenario: 'Fora de escopo',
      messages: [
        { text: 'Esse atendimento ainda não está disponível nesta demonstração. Deseja voltar ao menu principal?' }
      ],
      options: [
        { label: 'Voltar ao menu', next: 'greeting' },
        { label: 'Falar com atendente', next: 'transfer_agent' }
      ]
    }
  }
};
