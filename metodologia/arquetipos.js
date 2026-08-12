/* DNA Financeiro — os 9 arquétipos (a matriz que É o método).
   FONTE DA VERDADE DA REDAÇÃO: 1-modelo-de-negocio/artefatos/2026-07-31-metodologia-dna-financeiro.md §2
   🔴 RASCUNHO até a Dani validar. Nada aqui é material institucional ainda.

   Três regras de redação, e nenhuma é estilo:
   1. O nome descreve o PADRÃO, nunca julga a pessoa — quem lê é o próprio médico.
   2. A leitura abre pela FORÇA. Diagnóstico que começa pela falha não é lido até o fim.
   3. 🔴 `movimento` é SEMPRE organizacional, NUNCA recomendação de investimento.
      "Separar PF/PJ", "apurar lucro por frente", "mapear a sangria" — sim.
      "Invista em X", "resgate Y" — não: é atividade regulada (CVM) e contradiz a
      recusa da marca a prometer retorno. Redação nova passa por este teste antes de entrar. */

export const CENTROS = {
  instintivo: { rotulo: 'Instintivo', tipos: [8, 9, 1], nucleo: 'autonomia e controle',    medo: 'perder autonomia' },
  emocional:  { rotulo: 'Emocional',  tipos: [2, 3, 4], nucleo: 'imagem e valor',          medo: 'não valer aos olhos dos outros' },
  mental:     { rotulo: 'Mental',     tipos: [5, 6, 7], nucleo: 'segurança e antecipação', medo: 'ser pego despreparado' },
};

export const PERFIS = {
  estruturado: { rotulo: 'Estruturado', assinatura: 'organização e estabilidade altas' },
  reativo:     { rotulo: 'Reativo',     assinatura: 'a decisão sai sob pressão' },
  expansivo:   { rotulo: 'Expansivo',   assinatura: 'abre frentes mais rápido do que consolida' },
};

/** matriz[centro][perfil] — as 9 células. Nenhuma pode ficar inalcançável
 *  (é um dos testes de scoring.test.mjs). */
export const ARQUETIPOS = {
  instintivo: {
    estruturado: {
      nome: 'O Construtor Soberano',
      forca: 'Disciplina e consistência que a maioria dos seus pares não tem. O que você decide fazer, você faz.',
      sangria: 'Tudo depende de você. A operação inteira mora na sua cabeça, e recusar assessoria para não ser controlado sai caro em decisão tomada sem especialista. Se você parar trinta dias, ninguém consegue tomar as suas decisões financeiras.',
      movimento: 'Listar as três decisões financeiras que hoje só você consegue tomar — e escrever, para cada uma, o critério que você usa.',
    },
    reativo: {
      nome: 'O Guardião em Alerta',
      forca: 'Você age quando os outros travam. Em situação que exige decisão, você decide.',
      sangria: 'As decisões de “resolver isso de uma vez” saem no pico da tensão: trocar de contador, resgatar investimento, cortar estrutura. O custo não aparece no mês — aparece um ano depois.',
      movimento: 'Instituir uma regra de 72 horas para toda decisão financeira acima de um valor que você mesmo define. Nada além disso.',
    },
    expansivo: {
      nome: 'O Expansor Independente',
      forca: 'Você constrói o que imagina, e rápido. Autonomia, para você, é ter mais de uma fonte.',
      sangria: 'Frentes novas abertas antes de a anterior ser lucrativa — outra unidade, outro sócio, outro investimento. O capital se dispersa e nenhuma frente tem lucro apurado sozinha.',
      movimento: 'Apurar o resultado de cada frente separadamente antes de abrir a próxima.',
    },
  },
  emocional: {
    estruturado: {
      nome: 'O Construtor de Reputação',
      forca: 'O hábito de registro já existe. Você é organizado, e é lido como referência no seu meio.',
      sangria: 'O padrão que sustenta a imagem profissional — consultório, carro, escola, viagens — é tratado como custo fixo inegociável e nunca entra na conta. A organização é impecável em tudo, menos onde dói.',
      movimento: 'Separar PF de PJ e nomear o custo de manutenção do padrão de vida como uma linha explícita, com número.',
    },
    reativo: {
      nome: 'O Provedor em Ciclos',
      forca: 'Você percebe a ligação entre o seu estado emocional e o seu dinheiro mais rápido que a média.',
      sangria: 'O ciclo. Mês pesado, gasto compensatório, retração culpada. Ele consome exatamente o excedente que sobraria — e some do extrato como se fosse normal.',
      movimento: 'Uma conta separada só para o excedente, que se move uma vez por mês, em data fixa. Nunca no dia em que a vontade aparece.',
    },
    expansivo: {
      nome: 'O Motor de Receita',
      forca: 'Você gera receita com facilidade e é reconhecido por isso. Faturamento não é o seu problema.',
      sangria: 'O padrão de vida sobe junto com o faturamento, e o lucro nunca aparece. Cada salto de receita é absorvido antes de virar patrimônio.',
      movimento: 'Separar PF de PJ e fixar pró-labore antes de qualquer outra decisão.',
    },
  },
  mental: {
    estruturado: {
      nome: 'O Analista Prudente',
      forca: 'É o perfil que mais rápido executa um plano — quando o plano existe.',
      sangria: 'Excesso de análise. Reserva muito além do necessário parada em produto de baixo rendimento, e decisão de estrutura adiada por anos “até entender melhor”. O custo é invisível porque nada dá errado — só não acontece.',
      movimento: 'Fixar um teto para a reserva e uma data para a decisão que está sendo adiada.',
    },
    reativo: {
      nome: 'O Vigilante',
      forca: 'Você antecipa risco melhor que a média. O que preocupa você costuma ser real.',
      sangria: 'Dinheiro parado por medo de decidir errado — e, quando a decisão sai, ela sai no pico da ansiedade. As duas pontas custam.',
      movimento: 'Mapear a sangria fixa mensal. Número, não sensação: é o que tira a decisão do campo do medo.',
    },
    expansivo: {
      nome: 'O Explorador de Oportunidades',
      forca: 'Você enxerga oportunidade onde os seus pares não enxergam.',
      sangria: 'Entradas em muitas oportunidades novas e nenhuma acompanhada até o fim. O custo de entrada é pago várias vezes e o resultado real nunca é apurado — nem o bom.',
      movimento: 'Inventariar tudo em que já se entrou e apurar o resultado de cada um. Nada novo até a lista estar fechada.',
    },
  },
};

/** Leitura por dimensão, exibida ao lado de cada barra.
 *  Sem julgamento: nem alto nem baixo é "melhor". A escala é de perfil, não de nota. */
export const LEITURAS = {
  conscienciosidade: {
    alto:  'Você registra e planeja. A estrutura já existe — a pergunta é se ela cobre onde o dinheiro sai.',
    medio: 'Você organiza o essencial, e o resto fica para quando der. É onde a maior parte do vazamento mora.',
    baixo: 'A rotina financeira acontece por urgência. Não é falta de capacidade: é falta de um lugar fixo na agenda.',
  },
  estabilidade: {
    alto:  'Mês ruim não muda a sua decisão. É o traço que mais protege patrimônio no longo prazo.',
    medio: 'Você sustenta a pressão, mas ela cobra. Decisão grande em semana pesada merece uma noite de espera.',
    baixo: 'O dinheiro mexe com você antes de você mexer com ele. A correção não é emocional — é ter regra pronta antes do aperto.',
  },
  abertura: {
    alto:  'Estrutura nova não te assusta. O risco aqui é começar mais do que consolidar.',
    medio: 'Você aceita mudar quando o argumento é bom. É a condição para eficiência tributária sair do papel.',
    baixo: 'Você prefere o arranjo conhecido. Segurança tem valor — desde que o custo do que não se revisa esteja medido.',
  },
  amabilidade: {
    alto:  'Você cuida de quem está por perto. É a qualidade que mais silenciosamente vira despesa não planejada.',
    medio: 'Você ajuda, mas sabe parar. O ponto de atenção é a cobrança: adiar cobrança é conceder desconto.',
    baixo: 'Você separa vínculo de dinheiro sem culpa. Isso protege o caixa — e costuma incomodar terceiros.',
  },
  extroversao: {
    alto:  'O ambiente influencia o seu padrão. Não é fraqueza: é um custo previsível, que dá para orçar.',
    medio: 'Você acompanha o meio sem se pautar por ele.',
    baixo: 'Você decide dinheiro sozinho. Economiza no gasto social e paga em decisão sem contraditório.',
  },
};

/** Ler o texto certo para um score de 0 a 100. Limiares iguais aos do perfil de execução. */
export function leituraDaDimensao(dimensao, score) {
  const faixa = score >= 60 ? 'alto' : score < 40 ? 'baixo' : 'medio';
  return LEITURAS[dimensao] ? LEITURAS[dimensao][faixa] : '';
}
