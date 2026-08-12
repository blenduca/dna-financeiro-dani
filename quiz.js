/* ==========================================================================
   quiz.js — o percurso do instrumento.
   --------------------------------------------------------------------------
   Só renderização e navegação. TODO cálculo mora em `metodologia/scoring.js`,
   que é puro e testado por `node --test` — o defeito de um instrumento não
   aparece na tela, aparece no número, e a v1 provou isso rodando meses com o
   piso da escala em 20%.

   TRÊS CONSERTOS DE UX QUE ESTE ARQUIVO CARREGA

   1. 🔴 TECLADO. Na v1 as opções eram <div> com onclick: sem role, sem foco,
      sem teclado. Quem navega por teclado não conseguia responder. Aqui são
      <input type="radio"> dentro de <fieldset>/<legend>, então seta, Tab e
      leitor de tela funcionam de graça.
   2. PROGRESSO HONESTO. A v1 calculava (questão atual / total) e parava em
      91,7% na última pergunta. Aqui o denominador é fixo (31) e a última
      resposta leva a 100%.
   3. PERSISTÊNCIA. Recarregar a página não pode custar 31 respostas.
      localStorage sempre em try/catch: navegação privada não derruba o teste.
   ========================================================================== */

import { ITENS_BIGFIVE, PARES_CENTRO, DESEMPATES, ESCALA, QUALIFICACAO, DIMENSOES } from './metodologia/itens.js';
import { calcularCentro, calcularResultado } from './metodologia/scoring.js';
import { CENTROS, leituraDaDimensao } from './metodologia/arquetipos.js';
import { validarCaptura, montarPayload, enviar, ligarLimpezaDeErro, WHATSAPP } from './captacao.js';

const CHAVE = 'pz_dna_progresso';
const TOTAL = ITENS_BIGFIVE.length + PARES_CENTRO.length + 3 + QUALIFICACAO.length; // 31

/* ---------- estado ---------- */

const estado = {
  indice: 0,
  likert: {},       // id do item -> 1..5
  pares: {},        // id do par  -> 'a' | 'b'
  desempates: {},   // id da pergunta -> tipo
  qualificacao: {}, // id -> valor
};

/* ---------- persistência (nunca derruba a página) ---------- */

function salvar() {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(estado));
  } catch (_) { /* navegação privada, cota cheia: seguir sem persistir */ }
}

function carregar() {
  try {
    const cru = localStorage.getItem(CHAVE);
    if (!cru) return false;
    const salvo = JSON.parse(cru);
    if (!salvo || typeof salvo.indice !== 'number') return false;
    Object.assign(estado, salvo);
    return estado.indice > 0;
  } catch (_) { return false; }
}

function limpar() {
  try { localStorage.removeItem(CHAVE); } catch (_) { /* idem */ }
}

/* ---------- que passo é este ---------- */

const FIM_LIKERT = ITENS_BIGFIVE.length;                 // 20
const FIM_PARES = FIM_LIKERT + PARES_CENTRO.length;      // 26
const FIM_DESEMPATES = FIM_PARES + 3;                    // 29

/** O centro só é conhecido depois dos 6 pares — por isso os desempates são
 *  resolvidos sob demanda, e não numa lista montada de uma vez. */
function centroAtual() {
  return calcularCentro(estado.pares).centro || 'mental';
}

function passoEm(i) {
  if (i < FIM_LIKERT) {
    const item = ITENS_BIGFIVE[i];
    return {
      tipo: 'likert', chave: item.id, pergunta: item.texto,
      dica: 'Responda pelo seu comportamento real, não pelo que você gostaria que fosse.',
      opcoes: ESCALA.map((e) => ({ valor: e.valor, texto: e.rotulo })),
      respondido: () => estado.likert[item.id] != null,
      valor: () => estado.likert[item.id],
      grava: (v) => { estado.likert[item.id] = Number(v); },
    };
  }

  if (i < FIM_PARES) {
    const par = PARES_CENTRO[i - FIM_LIKERT];
    return {
      tipo: 'par', chave: par.id, pergunta: 'Qual das duas pesa mais para você?',
      dica: 'As duas podem ser verdadeiras. Escolha a que pesa mais.',
      opcoes: [{ valor: 'a', texto: par.a.texto }, { valor: 'b', texto: par.b.texto }],
      respondido: () => estado.pares[par.id] != null,
      valor: () => estado.pares[par.id],
      grava: (v) => { estado.pares[par.id] = v; },
    };
  }

  if (i < FIM_DESEMPATES) {
    const pergunta = DESEMPATES[centroAtual()][i - FIM_PARES];
    return {
      tipo: 'par', chave: pergunta.id, pergunta: pergunta.pergunta,
      dica: 'Escolha a que mais parece com você.',
      opcoes: pergunta.opcoes.map((o) => ({ valor: String(o.tipo), texto: o.texto })),
      respondido: () => estado.desempates[pergunta.id] != null,
      /* ⚠️ Devolve o valor CRU, sem String(): `String(undefined)` vira a string
         "undefined", que não é null — e a checagem `atual == null` do avanço
         automático passava a ser falsa, matando o avanço só nestes 3 passos.
         Quem compara faz o String() na hora da comparação. */
      valor: () => estado.desempates[pergunta.id],
      grava: (v) => { estado.desempates[pergunta.id] = Number(v); },
    };
  }

  const q = QUALIFICACAO[i - FIM_DESEMPATES];
  return {
    tipo: 'likert', chave: q.id, pergunta: q.pergunta, dica: q.nota,
    opcoes: q.opcoes.map((o) => ({ valor: o.valor, texto: o.texto })),
    respondido: () => estado.qualificacao[q.id] != null,
    valor: () => estado.qualificacao[q.id],
    grava: (v) => { estado.qualificacao[q.id] = v; },
  };
}

/* ---------- telas ---------- */

const telas = {
  intro: document.getElementById('tela-intro'),
  percurso: document.getElementById('tela-percurso'),
  captura: document.getElementById('tela-captura'),
  resultado: document.getElementById('tela-resultado'),
};
const barraProgresso = document.getElementById('progresso');

function mostrar(nome) {
  for (const [id, el] of Object.entries(telas)) el.hidden = id !== nome;
  barraProgresso.hidden = nome !== 'percurso';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ---------- render do percurso ---------- */

const elPergunta = document.getElementById('percurso-pergunta');
const elDica = document.getElementById('percurso-dica');
const elOpcoes = document.getElementById('percurso-opcoes');
const btnVoltar = document.getElementById('btn-voltar');
const btnAvancar = document.getElementById('btn-avancar');

function renderProgresso() {
  /* Denominador FIXO. A v1 usava a questão atual sobre o total e nunca chegava
     a 100% antes de finalizar. */
  const respondidas = Math.min(estado.indice, TOTAL);
  const pct = Math.round((respondidas / TOTAL) * 100);
  document.getElementById('progresso-rotulo').textContent =
    'Pergunta ' + Math.min(estado.indice + 1, TOTAL) + ' de ' + TOTAL;
  document.getElementById('progresso-pct').textContent = pct + '%';
  const preenche = document.getElementById('progresso-preenche');
  preenche.style.width = pct + '%';
  preenche.setAttribute('aria-valuenow', String(pct));
}

function renderPasso() {
  const passo = passoEm(estado.indice);

  elPergunta.textContent = passo.pergunta;
  elDica.textContent = passo.dica || '';
  elDica.hidden = !passo.dica;

  elOpcoes.className = passo.tipo === 'par' ? 'par' : 'escala';
  elOpcoes.innerHTML = '';

  const atual = passo.valor();
  for (const opcao of passo.opcoes) {
    const id = 'op-' + passo.chave + '-' + opcao.valor;
    const div = document.createElement('div');
    div.className = 'opcao';

    const input = document.createElement('input');
    input.type = 'radio';
    input.name = passo.chave;
    input.id = id;
    input.value = String(opcao.valor);
    if (atual != null && String(atual) === String(opcao.valor)) input.checked = true;

    const label = document.createElement('label');
    label.setAttribute('for', id);
    const marca = document.createElement('span');
    marca.className = 'opcao__marca';
    marca.setAttribute('aria-hidden', 'true');
    label.appendChild(marca);
    label.appendChild(document.createTextNode(opcao.texto));

    /* Registrar a resposta e liberar o botão vale para QUALQUER interação. */
    input.addEventListener('change', () => {
      passo.grava(input.value);
      salvar();
      btnAvancar.disabled = false;
    });

    /* Responder NÃO avança de tela sozinho — só registra a resposta e libera o
       botão (feito no `change` acima). A pessoa decide quando seguir clicando
       em "Continuar"/"Ver o meu diagnóstico". Isto evita duas dores: quem
       clica pensando em revisar a opção acaba arremessado para a próxima
       pergunta antes de conseguir mudar de ideia, e quem usa teclado perde o
       controle do radiogroup no mesmo instante em que a seta seleciona. */

    div.appendChild(input);
    div.appendChild(label);
    elOpcoes.appendChild(div);
  }

  btnVoltar.disabled = estado.indice === 0;
  btnAvancar.disabled = !passo.respondido();
  btnAvancar.textContent = estado.indice === TOTAL - 1 ? 'Ver o meu diagnóstico' : 'Continuar';

  renderProgresso();
  /* Foco na pergunta a cada passo: sem isto o leitor de tela não anuncia a troca
     e quem usa teclado volta ao topo do documento. */
  elPergunta.focus();
}

function avancar() {
  if (!passoEm(estado.indice).respondido()) return;
  if (estado.indice >= TOTAL - 1) { estado.indice = TOTAL; salvar(); renderProgresso(); irParaCaptura(); return; }
  estado.indice += 1;
  salvar();
  renderPasso();
}

function voltar() {
  if (estado.indice === 0) return;
  estado.indice -= 1;
  salvar();
  renderPasso();
}

btnAvancar.addEventListener('click', avancar);
btnVoltar.addEventListener('click', voltar);

/* ---------- captura ---------- */

let resultado = null;

function irParaCaptura() {
  resultado = calcularResultado(estado);
  mostrar('captura');
  document.getElementById('nome').focus();
}

const formCaptura = document.getElementById('form-captura');
const btnEnviar = document.getElementById('btn-enviar');
const avisoEnvio = document.getElementById('aviso-envio');
const rotuloEnviar = btnEnviar.textContent;

ligarLimpezaDeErro();

formCaptura.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  avisoEnvio.hidden = true;

  const erros = validarCaptura();
  if (erros.length) {
    const primeiro = document.getElementById(erros[0]);
    primeiro.focus();
    primeiro.scrollIntoView({ block: 'center', behavior: 'smooth' });
    return;
  }

  const payload = montarPayload(resultado, estado.qualificacao);

  /* Honeypot preenchido: finge que deu certo e não envia. Nunca avisar o bot —
     responder 4xx ensina que o campo é armadilha. */
  if (payload.empresa_site.trim() !== '') { renderResultado(); return; }

  btnEnviar.disabled = true;
  btnEnviar.textContent = 'Enviando…';

  try {
    await enviar(payload);
    limpar();               // percurso concluído: o rascunho não serve mais
    renderResultado();
  } catch (erro) {
    /* 🔴 A v1 fazia console.error e mostrava o resultado assim mesmo: o lead
       sumia sem ninguém saber. Aqui a falha APARECE e o botão volta. O resultado
       continua acessível por um link — a pessoa respondeu 31 perguntas e não
       pode ficar refém de uma falha nossa. */
    btnEnviar.disabled = false;
    btnEnviar.textContent = rotuloEnviar;
    avisoEnvio.hidden = false;
    avisoEnvio.innerHTML =
      'Não conseguimos registrar os seus dados agora. Tente de novo em alguns instantes — ' +
      'ou fale direto pelo <a href="' + WHATSAPP + '">WhatsApp</a>. ' +
      '<a href="#" id="ver-mesmo-assim">Ver o meu diagnóstico agora</a>.';
    document.getElementById('ver-mesmo-assim').addEventListener('click', (e) => {
      e.preventDefault();
      renderResultado();
    });
    if (window.console) console.error('[DNA] falha no envio do lead:', erro);
  }
});

/* ---------- resultado ---------- */

function renderResultado() {
  const a = resultado.arquetipo;
  mostrar('resultado');

  document.getElementById('res-nome').textContent = a ? a.nome : 'Perfil não determinado';
  document.getElementById('res-forca').textContent = a ? a.forca : '';
  document.getElementById('res-sangria').textContent = a ? a.sangria : '';
  document.getElementById('res-movimento').textContent = a ? a.movimento : '';

  /* A confiança é REPORTADA, e a formulação nunca afirma o tipo — guardrail 1 do
     artefato: eneagrama não tem o mesmo estatuto do Big Five. */
  const centro = resultado.centro ? CENTROS[resultado.centro] : null;
  const grau = { clara: 'com clareza', provavel: 'provavelmente', leve: 'levemente' }[resultado.centroConfianca] || '';
  document.getElementById('res-motivacao').textContent = centro
    ? 'A sua motivação central se parece ' + grau + ' com o centro ' + centro.rotulo.toLowerCase() +
      ' — ' + centro.nucleo + '.' +
      (resultado.tipo ? ' Dentro dele, as suas escolhas apontam para o tipo ' + resultado.tipo + '.' : '')
    : '';

  const alvo = document.getElementById('res-dimensoes');
  alvo.innerHTML = '';
  for (const { id, rotulo } of DIMENSOES) {
    const score = resultado.bigFive[id];
    const bloco = document.createElement('div');

    const topo = document.createElement('div');
    topo.className = 'dimensao__topo';
    const nome = document.createElement('span');
    nome.className = 'dimensao__rotulo';
    nome.textContent = rotulo;
    const valor = document.createElement('span');
    valor.className = 'dimensao__valor';
    /* "não medido" e "medido no piso" são coisas diferentes: 0 desenharia uma
       barra vazia que parece resultado. */
    valor.textContent = score == null ? '—' : score + '%';
    topo.appendChild(nome); topo.appendChild(valor);

    const trilho = document.createElement('div');
    trilho.className = 'dimensao__trilho';
    const preenche = document.createElement('div');
    preenche.className = 'dimensao__preenche';
    trilho.appendChild(preenche);

    const leitura = document.createElement('p');
    leitura.className = 'dimensao__leitura';
    leitura.textContent = score == null ? '' : leituraDaDimensao(id, score);

    bloco.appendChild(topo); bloco.appendChild(trilho); bloco.appendChild(leitura);
    alvo.appendChild(bloco);

    /* Anima no próximo quadro para a transição de largura valer — COM FAILSAFE,
       pela mesma razão do failsafe da revelação: `requestAnimationFrame` NÃO
       dispara em aba de segundo plano, e sem a rede a barra ficaria em 0 ao lado
       de um rótulo dizendo "100%". Medido no navegador: com a aba em background
       as cinco barras saíram vazias. O timeout roda mesmo throttled. */
    if (score != null) {
      const pintar = () => { preenche.style.width = score + '%'; };
      requestAnimationFrame(pintar);
      setTimeout(pintar, 400);
    }
  }

  const email = (document.getElementById('email').value || '').trim();
  document.getElementById('res-email-nota').textContent = email
    ? 'Uma cópia deste diagnóstico fica associada a ' + email + '.'
    : '';

  document.getElementById('res-nome').focus();
}

/* ---------- início ---------- */

const btnComecar = document.getElementById('btn-comecar');
const btnRecomecar = document.getElementById('btn-recomecar');

if (carregar()) {
  document.getElementById('aviso-retomada').hidden = false;
  btnComecar.textContent = 'Retomar de onde parei';
}

btnComecar.addEventListener('click', () => {
  if (estado.indice >= TOTAL) { irParaCaptura(); return; }
  mostrar('percurso');
  renderPasso();
});

btnRecomecar.addEventListener('click', () => {
  limpar();
  estado.indice = 0;
  estado.likert = {}; estado.pares = {}; estado.desempates = {}; estado.qualificacao = {};
  document.getElementById('aviso-retomada').hidden = true;
  btnComecar.textContent = 'Começar';
  btnComecar.focus();
});
