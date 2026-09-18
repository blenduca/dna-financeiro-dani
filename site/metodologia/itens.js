/* DNA Financeiro — banco de itens.
   FONTE DA VERDADE DA REDAÇÃO: 1-modelo-de-negocio/artefatos/2026-07-31-metodologia-dna-financeiro.md
   Este arquivo é DADO, não lógica: existe para ser revisado por quem não programa.
   Ao ajustar redação, ajustar TAMBÉM o artefato — senão o documento que a Dani validou
   deixa de descrever o que está no ar.

   Regras que não se quebram sem revisar o artefato:
   - cada dimensão do Big Five tem 4 itens: 2 com reverso:false e 2 com reverso:true.
     O item reverso é o que controla viés de aquiescência; sem ele o score mede
     "o quanto a pessoa concorda", que foi o defeito da v1.
   - os 6 pares do eneagrama são balanceados: cada centro aparece em 4 pares.
   - todo item é contextualizado em dinheiro/consultório. Item genérico de
     personalidade não pertence a este instrumento. */

/** Dimensões do Big Five, na ordem em que aparecem no resultado.
 *  `estabilidade` é medida DIRETO (não é neuroticismo invertido) — menos uma
 *  inversão é menos um lugar onde o sinal sai trocado sem ninguém ver. */
export const DIMENSOES = [
  { id: 'conscienciosidade', rotulo: 'Organização e disciplina' },
  { id: 'estabilidade',      rotulo: 'Estabilidade sob pressão' },
  { id: 'abertura',          rotulo: 'Abertura a estrutura nova' },
  { id: 'amabilidade',       rotulo: 'Prioridade ao outro' },
  { id: 'extroversao',       rotulo: 'Influência social no gasto' },
];

export const ESCALA = [
  { valor: 1, rotulo: 'Discordo totalmente' },
  { valor: 2, rotulo: 'Discordo' },
  { valor: 3, rotulo: 'Neutro' },
  { valor: 4, rotulo: 'Concordo' },
  { valor: 5, rotulo: 'Concordo totalmente' },
];

/** Bloco A — 20 itens Likert. 5 dimensões x (2 positivos + 2 reversos). */
export const ITENS_BIGFIVE = [
  { id: 'c1', dimensao: 'conscienciosidade', reverso: false, texto: 'Sei de cabeça, com boa aproximação, quanto a minha operação gastou no mês passado.' },
  { id: 'c2', dimensao: 'conscienciosidade', reverso: false, texto: 'Reservo um horário fixo para olhar os números do consultório, mesmo em semana cheia.' },
  { id: 'c3', dimensao: 'conscienciosidade', reverso: true,  texto: 'Costumo descobrir gastos que eu não lembrava ter contratado.' },
  { id: 'c4', dimensao: 'conscienciosidade', reverso: true,  texto: 'Deixo decisões financeiras para depois, até que virem urgência.' },

  { id: 'e1', dimensao: 'estabilidade', reverso: false, texto: 'Consigo tomar decisões financeiras com clareza mesmo em um mês ruim.' },
  { id: 'e2', dimensao: 'estabilidade', reverso: false, texto: 'Uma queda de faturamento me preocupa, mas não tira o meu sono.' },
  { id: 'e3', dimensao: 'estabilidade', reverso: true,  texto: 'Evito abrir o extrato ou o relatório porque sei que vou ficar mal.' },
  { id: 'e4', dimensao: 'estabilidade', reverso: true,  texto: 'Quando o mês aperta, tomo decisões rápidas de que me arrependo depois.' },

  { id: 'a1', dimensao: 'abertura', reverso: false, texto: 'Tenho disposição para mudar a estrutura do meu negócio se me mostrarem que faz sentido.' },
  { id: 'a2', dimensao: 'abertura', reverso: false, texto: 'Gosto de entender como funciona uma estrutura nova antes de descartá-la.' },
  { id: 'a3', dimensao: 'abertura', reverso: true,  texto: 'Prefiro manter o arranjo financeiro que já conheço, mesmo suspeitando que exista opção melhor.' },
  { id: 'a4', dimensao: 'abertura', reverso: true,  texto: 'Trocar de contador ou de banco me parece mais trabalho do que benefício.' },

  { id: 'm1', dimensao: 'amabilidade', reverso: false, texto: 'Tenho dificuldade de cobrar um paciente ou um parceiro que está devendo.' },
  { id: 'm2', dimensao: 'amabilidade', reverso: false, texto: 'Costumo ajudar financeiramente pessoas próximas, mesmo quando aperta para mim.' },
  { id: 'm3', dimensao: 'amabilidade', reverso: true,  texto: 'Consigo dizer não a um pedido de dinheiro sem me sentir culpado.' },
  { id: 'm4', dimensao: 'amabilidade', reverso: true,  texto: 'Negocio preço e condições com fornecedores sem desconforto.' },

  { id: 'x1', dimensao: 'extroversao', reverso: false, texto: 'Gasto mais quando estou acompanhado do que quando estou sozinho.' },
  { id: 'x2', dimensao: 'extroversao', reverso: false, texto: 'Decisões financeiras importantes eu costumo tomar conversando com outras pessoas.' },
  { id: 'x3', dimensao: 'extroversao', reverso: true,  texto: 'Prefiro resolver assuntos de dinheiro sozinho, sem comentar com ninguém.' },
  { id: 'x4', dimensao: 'extroversao', reverso: true,  texto: 'Ambientes e eventos do meio profissional pouco influenciam o meu padrão de consumo.' },
];

/** Bloco B1 — 6 pares de escolha forçada entre CENTROS.
 *  Likert não serve aqui: "é importante para mim alcançar o sucesso" não tem quem
 *  discorde, e foi literalmente o item 10 da v1. Item de motivação em Likert mede
 *  desejabilidade social. Escolha forçada entre duas motivações IGUALMENTE
 *  atraentes é a correção padrão — nenhuma das duas é a resposta "certa". */
export const PARES_CENTRO = [
  { id: 'p1', a: { centro: 'instintivo', texto: 'Quero não depender de ninguém para decidir o rumo do meu dinheiro.' },
              b: { centro: 'emocional',  texto: 'Quero que o meu trabalho seja reconhecido pelo tamanho do que construí.' } },
  { id: 'p2', a: { centro: 'instintivo', texto: 'O que mais me incomoda é alguém decidir por mim.' },
              b: { centro: 'mental',     texto: 'O que mais me incomoda é ser pego despreparado.' } },
  { id: 'p3', a: { centro: 'emocional',  texto: 'Me cobro por não estar no lugar em que eu deveria estar a esta altura.' },
              b: { centro: 'mental',     texto: 'Me cobro por não ter previsto um problema que apareceu.' } },
  { id: 'p4', a: { centro: 'instintivo', texto: 'Prefiro assumir o controle de uma situação difícil a esperar que alguém resolva.' },
              b: { centro: 'emocional',  texto: 'Prefiro ser a pessoa em quem os outros confiam quando a situação aperta.' } },
  { id: 'p5', a: { centro: 'instintivo', texto: 'Segurança, para mim, é ter autonomia — poder dizer não a qualquer um.' },
              b: { centro: 'mental',     texto: 'Segurança, para mim, é ter informação — saber o que vem pela frente.' } },
  { id: 'p6', a: { centro: 'emocional',  texto: 'O meu padrão de vida diz algo sobre quem eu me tornei.' },
              b: { centro: 'mental',     texto: 'O meu padrão de vida precisa caber com folga no pior cenário.' } },
];

/** Bloco B2 — desempates. Só os 3 do centro dominante são exibidos. */
export const DESEMPATES = {
  instintivo: [
    { id: 'di1', pergunta: 'Diante de uma bagunça financeira que não é sua, você…', opcoes: [
      { tipo: 8, texto: 'assume o comando e resolve' },
      { tipo: 9, texto: 'acomoda, evita o atrito e vai resolvendo aos poucos' },
      { tipo: 1, texto: 'arruma até ficar certo, do jeito que deveria ter sido feito' },
    ] },
    { id: 'di2', pergunta: 'O que mais te tira do sério…', opcoes: [
      { tipo: 8, texto: 'sentir que estão te passando para trás' },
      { tipo: 9, texto: 'conflito desnecessário à sua volta' },
      { tipo: 1, texto: 'gente fazendo malfeito e achando normal' },
    ] },
    { id: 'di3', pergunta: 'Quando algo dá errado no dinheiro, você tende a…', opcoes: [
      { tipo: 8, texto: 'ir direto na causa e confrontar' },
      { tipo: 9, texto: 'deixar assentar antes de mexer' },
      { tipo: 1, texto: 'revisar onde o processo falhou' },
    ] },
  ],
  emocional: [
    { id: 'de1', pergunta: 'O que mais te incomodaria ouvir…', opcoes: [
      { tipo: 2, texto: '“você nunca está lá quando alguém precisa”' },
      { tipo: 3, texto: '“você não chegou aonde dizia que ia chegar”' },
      { tipo: 4, texto: '“você é igual a todo mundo”' },
    ] },
    { id: 'de2', pergunta: 'O reconhecimento que mais te importa vem de…', opcoes: [
      { tipo: 2, texto: 'quem você ajudou' },
      { tipo: 3, texto: 'quem mede resultado' },
      { tipo: 4, texto: 'quem entende o que você faz de diferente' },
    ] },
    { id: 'de3', pergunta: 'Numa sala com colegas de profissão, você repara mais em…', opcoes: [
      { tipo: 2, texto: 'quem está precisando de alguma coisa' },
      { tipo: 3, texto: 'quem está à frente e como chegou lá' },
      { tipo: 4, texto: 'o que ali não combina com você' },
    ] },
  ],
  mental: [
    { id: 'dm1', pergunta: 'Diante de uma decisão financeira grande, a sua primeira reação é…', opcoes: [
      { tipo: 5, texto: 'estudar tudo antes de falar com alguém' },
      { tipo: 6, texto: 'procurar quem já passou por isso' },
      { tipo: 7, texto: 'olhar o que essa decisão abre de possibilidade' },
    ] },
    { id: 'dm2', pergunta: 'O que te dá mais tranquilidade…', opcoes: [
      { tipo: 5, texto: 'dominar o assunto sozinho' },
      { tipo: 6, texto: 'ter alguém de confiança junto na decisão' },
      { tipo: 7, texto: 'saber que existe mais de uma saída' },
    ] },
    { id: 'dm3', pergunta: 'Diante de um risco financeiro, você…', opcoes: [
      { tipo: 5, texto: 'recua e observa antes de expor recurso' },
      { tipo: 6, texto: 'procura garantia e plano B' },
      { tipo: 7, texto: 'aposta que dá para contornar se der errado' },
    ] },
  ],
};

/** Qualificação — eram campos do PORTÃO da v1 (6 obrigatórios antes de qualquer
 *  valor entregue, incluindo um textarea aberto). Viraram itens do percurso. */
export const QUALIFICACAO = [
  {
    id: 'faturamento',
    pergunta: 'Qual a faixa de faturamento da sua operação hoje?',
    nota: 'Bruto mensal, somando consultório e demais frentes.',
    opcoes: [
      { valor: 'abaixo-100k', texto: 'Abaixo de R$ 100 mil/mês' },
      { valor: '100-150k',    texto: 'R$ 100 mil a R$ 150 mil/mês' },
      { valor: '150-300k',    texto: 'R$ 150 mil a R$ 300 mil/mês' },
      { valor: '300-600k',    texto: 'R$ 300 mil a R$ 600 mil/mês' },
      { valor: 'acima-600k',  texto: 'Acima de R$ 600 mil/mês' },
      { valor: 'prefiro-nao', texto: 'Prefiro não informar' },
    ],
  },
  {
    id: 'desafio',
    pergunta: 'O que hoje mais te incomoda na sua vida financeira?',
    nota: 'Escolha o que estiver mais perto. Não precisa ser exato.',
    /* Redação verbatim do público — wiki/publico-e-persona.md §"A linguagem do
       próprio público". Usar a frase dele, não a nossa. */
    opcoes: [
      { valor: 'nao-sobra',    texto: 'Faturo muito, mas o dinheiro nunca sobra' },
      { valor: 'pf-pj',        texto: 'Misturo pessoa física e pessoa jurídica' },
      { valor: 'impostos',     texto: 'Tenho a sensação de pagar imposto demais' },
      { valor: 'lucro',        texto: 'Não sei quanto realmente lucro' },
      { valor: 'plantao',      texto: 'Quero sair da dependência dos plantões' },
      { valor: 'patrimonio',   texto: 'Não consigo transformar renda em patrimônio' },
    ],
  },
];

/** Total de itens que a pessoa responde: 20 + 6 + 3 + 2 = 31.
 *  (o artefato fala em 29 itens de instrumento; os 2 de qualificação não pontuam) */
export const TOTAL_ITENS = ITENS_BIGFIVE.length + PARES_CENTRO.length + 3 + QUALIFICACAO.length;
