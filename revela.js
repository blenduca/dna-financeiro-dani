/* Revelação por scroll — compartilhada pela LP e pelo instrumento.
   Mesmo desenho da `lp-mentoria-mmm`: IntersectionObserver COM FAILSAFE.
   Sem o failsafe, um observer que não dispara deixa a página em branco, porque
   os blocos nascem com `opacity: 0`. */
(function () {
  'use strict';

  var alvos = document.querySelectorAll('[data-revela]');
  if (!alvos.length) return;

  /* Cascata: cada elemento atrasa conforme a posição entre os IRMÃOS que
     também têm `[data-revela]` — não a posição na página inteira. É o que
     faz badge → título → texto → lista entrarem em sequência dentro de uma
     seção, e os quatro cards de `.diagnostico` entrarem um a um, sem que a
     seção seguinte herde o atraso da anterior (cada grupo de irmãos reinicia
     em 0). PASSO e TETO ficam pequenos de propósito: é ritmo, não espera —
     a v1 já tinha "página densa" como anti-padrão explícito (ver estilo.css). */
  var PASSO_MS = 90;
  var TETO_PASSOS = 5;
  Array.prototype.forEach.call(alvos, function (el) {
    var irmaos = Array.prototype.filter.call(el.parentElement.children, function (irmao) {
      return irmao.hasAttribute('data-revela');
    });
    var indice = Math.min(irmaos.indexOf(el), TETO_PASSOS);
    if (indice > 0) el.style.setProperty('--revela-atraso', (indice * PASSO_MS) + 'ms');
  });

  function revelar(el) { el.classList.add('dentro'); }

  /* 🔴 A hero saía revelada "de graça" só ACIDENTALMENTE: o comentário acima
     supunha que seus elementos sempre caem dentro do IntersectionObserver
     logo no primeiro `observe()`, mas o gatilho abaixo usa `rootMargin: -30%`
     — só considera "dentro" quem está nos 70% superiores da tela. Em
     qualquer viewport mais baixo que ~900px (um notebook comum já entrega
     ~768px de altura útil), o botão da hero — último `[data-revela]` do
     bloco — nasce ABAIXO dessa faixa. Ele não tinha scroll para disparar o
     observer, então só aparecia quando o failsafe de 3s lá embaixo vencia:
     3 segundos de espera real toda vez que a página abria ou dava reload.
     A hero não tem scroll para revelar por definição (ver comentário no
     HTML), então ela não deveria depender do MESMO gatilho de rolagem que o
     resto da página — ela revela imediatamente, sempre, mantendo só a
     cascata de atraso entre os irmãos. */
  var heroAlvos = document.querySelectorAll('.heroi [data-revela]');
  Array.prototype.forEach.call(heroAlvos, revelar);

  var scrollAlvos = Array.prototype.filter.call(alvos, function (el) {
    return !el.closest('.heroi');
  });
  if (!scrollAlvos.length) return;

  if (!('IntersectionObserver' in window) ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    Array.prototype.forEach.call(scrollAlvos, revelar);
    return;
  }

  /* 🔴 O gatilho original (`-10%`) disparava com o TOPO do elemento a só 90%
     da altura da tela — ou seja, ele começava a entrar quase no instante em
     que a primeira fatia dele aparecia lá embaixo. Com uma animação de .3s
     (o valor antigo), a revelação terminava de tocar enquanto o elemento
     ainda estava subindo pela tela: quem rolava via o texto já parado, nunca
     o movimento. `-30%` empurra o gatilho para quando o elemento já cruzou
     bem mais para dentro do viewport, e a duração mais longa em `estilo.css`
     faz o resto: a rolagem some ver o texto assentar, não já assentado. */
  var observador = new IntersectionObserver(function (entradas) {
    entradas.forEach(function (e) {
      if (e.isIntersecting) { revelar(e.target); observador.unobserve(e.target); }
    });
  }, { rootMargin: '0px 0px -30% 0px' });

  Array.prototype.forEach.call(scrollAlvos, function (el) { observador.observe(el); });
  setTimeout(function () { Array.prototype.forEach.call(scrollAlvos, revelar); }, 3000);
})();
