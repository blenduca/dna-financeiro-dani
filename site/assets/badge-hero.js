/* Badge do hero em "hug" no mobile.
   O texto ("DNA Financeiro · diagnóstico gratuito", caixa alta, tracking
   largo) precisa de ~430px numa linha só — mais do que qualquer tela de
   celular tem disponível — então SEMPRE quebra em duas linhas abaixo de
   ~430px de largura útil.

   🔴 O problema não é a quebra em si: é que nenhuma combinação de CSS puro
   (inline-flex, inline-block ou display:table — testados os três ao vivo)
   faz a caixa se ajustar à linha renderizada mais larga quando o conteúdo
   quebra. O algoritmo de shrink-to-fit do CSS, nesse caso, ignora o
   resultado real da quebra e usa o espaço disponível INTEIRO como largura —
   por isso a pílula, em vez de abraçar duas linhas de texto, virava um
   retângulo raso esticado até a borda do container. Isso é comportamento de
   especificação, não bug de layout: não existe propriedade CSS que resolva.

   A única forma correta é medir a quebra real no navegador e travar a
   largura nela — daí a busca binária abaixo, que evita hardcodar um valor em
   px (frágil a mudança de fonte, tracking ou copy) em favor de perguntar ao
   próprio navegador qual é a menor largura que ainda produz o mesmo número
   de linhas da quebra natural. */
(function () {
  'use strict';

  var badge = document.querySelector('.heroi .sobretitulo');
  if (!badge) return;

  function nodoDeTexto() {
    for (var i = 0; i < badge.childNodes.length; i++) {
      if (badge.childNodes[i].nodeType === 3) return badge.childNodes[i];
    }
    return null;
  }

  function contarLinhas() {
    var texto = nodoDeTexto();
    if (!texto) return 1;
    var alcance = document.createRange();
    alcance.selectNodeContents(texto);
    return alcance.getClientRects().length || 1;
  }

  function abracar() {
    badge.style.width = '';
    var linhasNaturais = contarLinhas();
    if (linhasNaturais <= 1) return; /* cabe numa linha: o hug padrão do
      inline-flex já é exato aqui — só o caso de quebra precisa de ajuda. */

    /* Busca binária: `alto` começa na largura natural (a que gera
       `linhasNaturais`, por definição) e desce até a menor largura que
       ainda mantém a MESMA contagem de linhas — ou seja, a largura que
       abraça a quebra real em vez de encher o espaço disponível. */
    var alto = Math.ceil(badge.getBoundingClientRect().width);
    var baixo = 0;
    for (var i = 0; i < 12 && alto - baixo > 1; i++) {
      var meio = Math.round((baixo + alto) / 2);
      badge.style.width = meio + 'px';
      if (contarLinhas() <= linhasNaturais) { alto = meio; } else { baixo = meio; }
    }
    badge.style.width = (alto + 1) + 'px'; /* +1px de folga contra
      arredondamento de subpixel entre a medição e o layout final. */
  }

  abracar();

  var reagendar;
  window.addEventListener('resize', function () {
    clearTimeout(reagendar);
    reagendar = setTimeout(abracar, 150);
  });

  /* A fonte (Google Fonts Inter) pode chegar depois do primeiro layout e
     mudar a métrica do texto — sem isso a pílula mediria a quebra da fonte
     de sistema (fallback) e ficaria com folga ou aperto errados assim que a
     Inter carregasse. */
  if (window.document.fonts && document.fonts.ready) {
    document.fonts.ready.then(abracar);
  }
})();
