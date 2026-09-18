/* DNA Financeiro — motor de cálculo.
   ESPECIFICAÇÃO: 1-modelo-de-negocio/artefatos/2026-07-31-metodologia-dna-financeiro.md §5

   FUNÇÕES PURAS, SEM DOM — é o que permite testar o instrumento antes de existir tela.
   Foi exatamente aqui que a v1 falhou em silêncio: o defeito de um instrumento não
   aparece na interface, aparece no número. Toda alteração deste arquivo roda
   `node --test metodologia/scoring.test.mjs` antes de subir. */

import { ITENS_BIGFIVE, PARES_CENTRO, DESEMPATES, DIMENSOES } from './itens.js';
import { ARQUETIPOS } from './arquetipos.js';

/* ===================== BIG FIVE ===================== */

/**
 * Score de 0 a 100 por dimensão.
 *
 * 🔴 `(media - 1) / 4` é o conserto do defeito mais visível da v1, que usava
 * `(media / 5) * 100`: quem discordava de tudo via 20% e uma barra 1/5 cheia.
 * O piso real passa a ser 0 e o teto, 100.
 *
 * Item reverso vale `6 - resposta`. Sem ele o score mede o quanto a pessoa
 * concorda (viés de aquiescência), que era o caso dos 12 itens da v1.
 *
 * @param {Record<string, number>} respostas  id do item -> 1..5
 * @returns {Record<string, number>} dimensão -> 0..100 (inteiro)
 */
export function calcularBigFive(respostas) {
  const soma = {};
  const contagem = {};

  for (const item of ITENS_BIGFIVE) {
    const bruta = respostas[item.id];
    if (!Number.isFinite(bruta)) continue;          // item não respondido não entra na média
    const valor = item.reverso ? 6 - bruta : bruta;
    soma[item.dimensao] = (soma[item.dimensao] || 0) + valor;
    contagem[item.dimensao] = (contagem[item.dimensao] || 0) + 1;
  }

  const scores = {};
  for (const { id } of DIMENSOES) {
    /* Dimensão sem nenhuma resposta devolve null, não 0 — "não medido" e "medido
       no piso" são coisas diferentes, e a tela precisa distinguir as duas. */
    if (!contagem[id]) { scores[id] = null; continue; }
    const media = soma[id] / contagem[id];
    scores[id] = Math.round(((media - 1) / 4) * 100);
  }
  return scores;
}

/* ===================== ENEAGRAMA ===================== */

/**
 * Centro dominante a partir dos 6 pares de escolha forçada.
 * Empate é desfeito pelo par 5, que opõe as duas definições de segurança
 * (autonomia x informação) — é o par mais discriminante do conjunto.
 *
 * @param {Record<string, 'a'|'b'>} escolhas  id do par -> lado escolhido
 * @returns {{centro: string|null, contagem: object, confianca: 'clara'|'provavel'|'leve'|null}}
 */
export function calcularCentro(escolhas) {
  const contagem = { instintivo: 0, emocional: 0, mental: 0 };

  for (const par of PARES_CENTRO) {
    const lado = escolhas[par.id];
    if (lado !== 'a' && lado !== 'b') continue;
    contagem[par[lado].centro] += 1;
  }

  const total = contagem.instintivo + contagem.emocional + contagem.mental;
  if (total === 0) return { centro: null, contagem, confianca: null };

  const maximo = Math.max(contagem.instintivo, contagem.emocional, contagem.mental);
  const empatados = Object.keys(contagem).filter((c) => contagem[c] === maximo);

  let centro = empatados[0];
  let empateDesfeito = false;
  if (empatados.length > 1) {
    const lado = escolhas.p5;
    const preferido = lado === 'a' || lado === 'b' ? PARES_CENTRO[4][lado].centro : null;
    if (preferido && empatados.includes(preferido)) centro = preferido;
    empateDesfeito = true;
  }

  /* A confiança é REPORTADA na tela. Um instrumento honesto diz quando não sabe. */
  const confianca = empateDesfeito ? 'leve' : maximo >= 4 ? 'clara' : maximo === 3 ? 'provavel' : 'leve';

  return { centro, contagem, confianca };
}

/**
 * Tipo provável dentro do centro dominante, pelos 3 desempates.
 * Empate devolve `null` — a tela mostra o centro sem tipo, que é a leitura honesta.
 *
 * @returns {{tipo: number|null, contagem: Record<number, number>}}
 */
export function calcularTipo(centro, escolhas) {
  const perguntas = DESEMPATES[centro];
  const contagem = {};
  if (!perguntas) return { tipo: null, contagem };

  for (const pergunta of perguntas) {
    const tipo = escolhas[pergunta.id];
    if (!Number.isFinite(tipo)) continue;
    contagem[tipo] = (contagem[tipo] || 0) + 1;
  }

  const tipos = Object.keys(contagem);
  if (tipos.length === 0) return { tipo: null, contagem };

  const maximo = Math.max(...tipos.map((t) => contagem[t]));
  const vencedores = tipos.filter((t) => contagem[t] === maximo);
  return { tipo: vencedores.length === 1 ? Number(vencedores[0]) : null, contagem };
}

/* ===================== ARQUÉTIPO ===================== */

/**
 * Perfil de execução a partir do Big Five.
 *
 * A ORDEM DOS TESTES IMPORTA e não é arbitrária: `reativo` vem primeiro porque
 * estabilidade baixa muda a leitura de todo o resto — um perfil organizado que
 * decide em pânico sangra pela decisão, não pela desorganização.
 * O desempate final é pela conscienciosidade, a dimensão do Big Five com relação
 * mais consistente com comportamento financeiro.
 */
export function perfilDeExecucao(bigFive) {
  const c = bigFive.conscienciosidade ?? 50;
  const e = bigFive.estabilidade ?? 50;
  const a = bigFive.abertura ?? 50;
  const x = bigFive.extroversao ?? 50;

  if (e < 40) return 'reativo';
  if (c >= 60 && e >= 60) return 'estruturado';
  if ((a >= 60 || x >= 60) && c < 60) return 'expansivo';
  return c >= 50 ? 'estruturado' : 'expansivo';
}

/** Célula da matriz. Nunca devolve undefined: é o que impede `undefined` na tela. */
export function resolverArquetipo(bigFive, centro) {
  const perfil = perfilDeExecucao(bigFive);
  const porCentro = ARQUETIPOS[centro];
  if (!porCentro) return null;
  return { ...porCentro[perfil], centro, perfil };
}

/* ===================== ENTRADA ÚNICA ===================== */

/**
 * Resultado completo. É o que a tela consome e o que vai no payload.
 * @param {{likert: object, pares: object, desempates: object}} respostas
 */
export function calcularResultado(respostas) {
  const bigFive = calcularBigFive(respostas.likert || {});
  const { centro, contagem, confianca } = calcularCentro(respostas.pares || {});
  const { tipo } = centro ? calcularTipo(centro, respostas.desempates || {}) : { tipo: null };
  const arquetipo = centro ? resolverArquetipo(bigFive, centro) : null;

  return {
    bigFive,
    centro,
    centroContagem: contagem,
    centroConfianca: confianca,
    tipo,
    perfil: arquetipo ? arquetipo.perfil : null,
    arquetipo,
  };
}
