/* ==========================================================================
   captacao.js — validação, payload e envio do lead do DNA Financeiro.
   --------------------------------------------------------------------------
   O QUE MUDA EM RELAÇÃO À v1 (`dna-financeiro/quiz.js`)

   1. 🔴 CONSENTIMENTO. A v1 coletava nome, e-mail, telefone, profissão, RENDA
      MENSAL e um teste de personalidade completo sem checkbox e sem
      `consent_texto`. Perfil psicométrico + renda é o dado mais sensível desta
      conta inteira. Aqui o consentimento é obrigatório e o texto exibido vai
      LITERAL no payload — é o que prova o que a pessoa leu.

   2. 🔴 A FALHA APARECE. A v1 fazia `console.error` e seguia para o resultado:
      o lead sumia sem ninguém saber. Aqui o cadastro É a conversão, então erro
      de POST aparece na tela com o botão restaurado e saída por WhatsApp
      (`padrao-ativos-web.md` §Captação).

   3. CONTRATO DA CASA: `tenant_slug`, `origem`, `cta`, `event_id`, honeypot e
      atribuição `pz_*` — nada disso existia.

   4. MINIMIZAÇÃO: vão os SCORES e o arquétipo, não as 31 respostas item a item.
      O que a conversa comercial e a futura norma precisam são os scores; guardar
      a resposta crua de cada afirmação é sensibilidade extra sem uso definido.
   ========================================================================== */

/* Porta de entrada: Core | Lead | Webhook no bn8n (a instância que operamos).
   ⚠️ NÃO é `automacao.bagents.cloud`, onde vivem os dois webhooks antigos deste
   funil. Publicar num host e apontar a página para o outro dá 404 em produção. */
export const WEBHOOK = 'https://bn8n.bagents.cloud/webhook/lead';

export const WHATSAPP = 'https://wa.me/5511941335119';

/* ---------- validação (UX, não segurança — quem valida de verdade é o servidor) ---------- */

function soDigitos(valor) { return (valor || '').replace(/\D/g, ''); }

/** Normaliza para DDD + número, sem o 55. Quem cola o número internacional e quem
 *  digita só o DDD precisam virar a MESMA string — senão "procurar pelo telefone"
 *  não acha metade das linhas. */
export function telefoneNormalizado(valor) {
  let d = soDigitos(valor);
  if (d.indexOf('55') === 0 && (d.length === 12 || d.length === 13)) d = d.slice(2);
  return d;
}

export function telefoneValido(valor) {
  let d = soDigitos(valor);
  if ((d.length === 12 || d.length === 13) && d.indexOf('55') === 0) d = d.slice(2);
  if (d.length !== 10 && d.length !== 11) return false;
  const ddd = parseInt(d.slice(0, 2), 10);
  if (ddd < 11 || ddd > 99) return false;                    // não existe DDD < 11
  if (d.length === 11 && d.charAt(2) !== '9') return false;  // celular começa com 9
  return true;
}

/** Formato, não existência. */
export function emailValido(valor) {
  return /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test((valor || '').trim());
}

const CAMPOS = ['nome', 'email', 'whatsapp', 'consentimento'];

function marcarErro(id, mensagem) {
  document.getElementById('campo-' + id).classList.add('campo--invalido');
  const caixa = document.getElementById('erro-' + id);
  if (caixa) caixa.textContent = mensagem;
  document.getElementById(id).setAttribute('aria-invalid', 'true');
}

function limparErro(id) {
  document.getElementById('campo-' + id).classList.remove('campo--invalido');
  const caixa = document.getElementById('erro-' + id);
  if (caixa) caixa.textContent = '';
  document.getElementById(id).removeAttribute('aria-invalid');
}

/** Limpa o erro assim que a pessoa corrige — erro que fica na tela depois de
 *  resolvido faz a pessoa achar que ainda está errado. */
export function ligarLimpezaDeErro() {
  for (const id of CAMPOS) {
    const el = document.getElementById(id);
    if (!el) continue;
    el.addEventListener('input', () => limparErro(id));
    el.addEventListener('change', () => limparErro(id));
  }
}

export function validarCaptura() {
  const erros = [];
  const v = (id) => (document.getElementById(id).value || '').trim();

  CAMPOS.forEach(limparErro);

  if (v('nome').length < 2) {
    marcarErro('nome', 'Informe o seu nome.'); erros.push('nome');
  }
  if (!emailValido(v('email'))) {
    marcarErro('email', 'Confira o e-mail: parece estar incompleto.'); erros.push('email');
  }
  if (!v('whatsapp')) {
    marcarErro('whatsapp', 'O WhatsApp é obrigatório — é por ele que a equipe responde.');
    erros.push('whatsapp');
  } else if (!telefoneValido(v('whatsapp'))) {
    marcarErro('whatsapp', 'Informe DDD + número (10 ou 11 dígitos).'); erros.push('whatsapp');
  }
  if (!document.getElementById('consentimento').checked) {
    marcarErro('consentimento', 'Precisamos da sua autorização para guardar as respostas.');
    erros.push('consentimento');
  }
  return erros;
}

/* ---------- payload ---------- */

/**
 * Contrato compartilhado com a plataforma (`padrao-ativos-web.md` §Captação).
 * Campo que não se aplica vai '' em vez de sumir, para não quebrar o fluxo n8n
 * a jusante.
 */
export function montarPayload(resultado, qualificacao) {
  const attr = window.pzAtribuicao ? window.pzAtribuicao() : null;
  const utms = window.pzAtribuicaoPlana ? window.pzAtribuicaoPlana(attr) : {};

  return {
    tenant_slug: 'daniele-meger',
    ativo_slug: 'lp-dna-financeiro',
    formulario: 'dna-financeiro',
    origem: 'lp-dna-financeiro',
    cta: 'ver-diagnostico',

    nome: document.getElementById('nome').value.trim(),
    email: document.getElementById('email').value.trim().toLowerCase(),
    whatsapp: telefoneNormalizado(document.getElementById('whatsapp').value),

    consentimento: document.getElementById('consentimento').checked,
    /* Literal, com os espaços colapsados. Reescrever exige versionar. */
    consent_texto: (document.getElementById('texto-consentimento').textContent || '')
      .replace(/\s+/g, ' ').trim(),

    empresa_site: document.getElementById('empresa_site').value,
    spam_score: 0,

    custom: {
      /* Vão os SCORES, não as 31 respostas cruas — ver cabeçalho, item 4. */
      arquetipo: resultado.arquetipo ? resultado.arquetipo.nome : '',
      centro: resultado.centro || '',
      centro_confianca: resultado.centroConfianca || '',
      tipo_provavel: resultado.tipo || '',
      perfil_execucao: resultado.perfil || '',
      big_five: resultado.bigFive,
      faturamento: qualificacao.faturamento || '',
      desafio: qualificacao.desafio || '',
      instrumento_versao: 'dna-v2.0'
    },

    attr: attr,
    utm_source: utms.utm_source || '',
    utm_medium: utms.utm_medium || '',
    utm_campaign: utms.utm_campaign || '',
    utm_content: utms.utm_content || '',
    utm_term: utms.utm_term || '',
    referrer: utms.referrer || '',

    /* Deduplicação: reenvio por dedo nervoso não vira dois leads, e a mesma
       conversão chegando por browser + CAPI conta uma vez. */
    event_id: (window.crypto && window.crypto.randomUUID)
      ? window.crypto.randomUUID()
      : 'e-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10)
  };
}

/** POST. Rejeita em erro para o chamador decidir o que mostrar. */
export async function enviar(payload) {
  /* ── CÓPIA DE VALIDAÇÃO · TRECHO GERADO ──────────────────────────────────
     No repo do cliente aqui vai um POST real para o n8n. Nesta cópia o envio
     está DESLIGADO de propósito: os fluxos de captação ainda não foram
     ativados e o endpoint devolve 404.
     Resolve como se tivesse dado certo para o percurso chegar ao resultado —
     que é o que se está validando. Quem completa vê, na tela do diagnóstico,
     um aviso dizendo que nada foi registrado.
     A validação dos campos acima continua inteira.
     Corrigir na origem e republicar; não editar aqui. */
  if (window.console) console.info('[DNA] prévia de validação: envio desligado.', payload);
  return true;
}
