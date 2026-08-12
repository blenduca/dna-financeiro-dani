/* ==========================================================================
   atribuicao.js — primeiro toque imutável + último toque por visita
   --------------------------------------------------------------------------
   ⚠️ ARQUIVO ESPELHADO — E AGORA ENTRE REPOS DIFERENTES.
   Origem desta cópia: `cliente-sabina-deweik/2-motor-de-crescimento/marketing/
   lp-comunidade-gratuita/assets/atribuicao.js`, commit `d4d2f2c` (2026-07-20).
   Gêmeas conhecidas: a da Sabina (LP da comunidade) e a do funil do curso dela.

   ⚠️ A regra da casa manda editar as gêmeas no MESMO commit — impossível aqui,
   porque agora as cópias vivem em repos de clientes diferentes. Dívida declarada
   em 2026-07-29: o lugar certo deste arquivo é o `map-client-template`, descendo
   por cópia como as `padrao-*.md` e o `.gitleaks.toml`; ou um pacote, quando a
   plataforma tiver build. Até então: ao mexer aqui, conferir a divergência com a
   origem antes de assumir que são iguais.

   Por que existe: sem persistir a atribuição, quem chega por anúncio, sai e
   volta pelo Instagram no dia seguinte é gravado como orgânico — e o anúncio
   que pagou pelo lead fica sem crédito. Atribuição não é retroativa: o que não
   for capturado no momento da visita está perdido para sempre.


   Dialeto: script clássico que publica `window.pzAtribuicao`. É o único
   formato que roda nos dois ativos sem tocar em build — o funil do curso
   importa por efeito colateral (`import './atribuicao.js'`, o Vite empacota) e
   a LP da comunidade carrega por <script src>.
   ========================================================================== */

(function (janela) {
  'use strict';

  var CHAVE_FT = 'pz_ft';    /* primeiro toque — gravado uma vez, nunca mais */
  var CHAVE_LT = 'pz_lt';    /* último toque — sobrescrito quando há UTM nova */
  var CHAVE_VID = 'pz_vid';  /* visitor_id — liga visitas anônimas ao lead    */

  var CAMPOS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content',
                'utm_term', 'gclid', 'fbclid'];

  /* Navegação privada e storage bloqueado não podem derrubar o formulário:
     sem atribuição o lead ainda entra, só que sem origem. */
  function ler(chave) {
    try { return janela.localStorage.getItem(chave); } catch (e) { return null; }
  }
  function gravar(chave, valor) {
    try { janela.localStorage.setItem(chave, valor); } catch (e) { /* segue o jogo */ }
  }

  function uuid() {
    try {
      if (janela.crypto && janela.crypto.randomUUID) return janela.crypto.randomUUID();
    } catch (e) { /* abaixo */ }
    return 'v-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
  }

  function tocoAtual() {
    var q = new URLSearchParams(janela.location.search);
    var t = { referrer: janela.document.referrer || '', em: new Date().toISOString() };
    CAMPOS.forEach(function (c) {
      var v = q.get(c);
      if (v) t[c] = v;
    });
    return t;
  }

  function json(bruto) {
    if (!bruto) return null;
    try { return JSON.parse(bruto); } catch (e) { return null; }
  }

  janela.pzAtribuicao = function () {
    var atual = tocoAtual();
    var temUtm = CAMPOS.some(function (c) { return atual[c]; });

    /* Primeiro toque: só grava se ainda não existe. É ele que dá crédito à
       mídia que realmente trouxe a pessoa. */
    if (!ler(CHAVE_FT)) gravar(CHAVE_FT, JSON.stringify(atual));

    /* Último toque: sobrescreve, mas SÓ quando a visita traz atribuição nova.
       Sem essa condição, uma volta digitando o endereço direto apagaria o
       crédito da campanha que trouxe a pessoa da primeira vez. */
    if (temUtm) gravar(CHAVE_LT, JSON.stringify(atual));

    var vid = ler(CHAVE_VID);
    if (!vid) { vid = uuid(); gravar(CHAVE_VID, vid); }

    var ft = json(ler(CHAVE_FT)) || atual;
    var lt = json(ler(CHAVE_LT)) || ft;

    return { visitor_id: vid, ft: ft, lt: lt };
  };

  /* Achata o PRIMEIRO toque nas colunas da Expert List. O artefato define as
     seis colunas de atribuição como imutáveis e de primeiro toque — por isso
     é `ft` que vai aqui, e não `lt`. Assim o n8n grava direto no CSV sem
     precisar entender o objeto `attr`. */
  janela.pzAtribuicaoPlana = function (attr) {
    var ft = (attr && attr.ft) || {};
    return {
      utm_source: ft.utm_source || '',
      utm_medium: ft.utm_medium || '',
      utm_campaign: ft.utm_campaign || '',
      utm_content: ft.utm_content || '',
      utm_term: ft.utm_term || '',
      referrer: ft.referrer || ''
    };
  };

  /* Captura já no carregamento: se a pessoa navegar antes de abrir o modal,
     o primeiro toque já está salvo. */
  try { janela.pzAtribuicao(); } catch (e) { /* nunca quebrar a página */ }

})(window);
