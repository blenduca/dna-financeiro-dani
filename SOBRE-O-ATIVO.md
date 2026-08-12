# DNA Financeiro — Daniele Meger (cópia publicada)

> **Cópia de leitura para o time de design.** Sem deploy: abre no navegador.
> **GERADO. Não editar nada aqui à mão.** Esta pasta é montada por
> `clientes/cliente-daniele-meger/2-motor-de-crescimento/marketing/lp-dna-financeiro/publicar.mjs`
> a partir do repo do cliente (privado, sem remote). Correção se faz na origem
> e republica — editar aqui cria drift silencioso.

## O que é

A v2 do **DNA Financeiro**: página de entrada + instrumento de diagnóstico de
comportamento financeiro, na identidade MEGER. Publicada em **modo validação**,
para aprovar layout, texto, as perguntas e o formato do resultado.

Duas páginas: `index.html` (a oferta do diagnóstico) e `teste.html`
(o instrumento, em 4 telas: intro → 31 itens → seus dados → resultado).

## O que esta cópia NÃO faz

🔴 **O formulário não envia.** No ativo de origem ele posta para o n8n; aqui o
envio está **desligado de propósito**, porque os fluxos de captação foram
escritos e ainda não ativados — o endpoint devolve 404. O percurso segue até o
resultado normalmente (é o que precisa ser validado), e a tela do diagnóstico
traz um aviso dizendo que **nada foi registrado**.

A validação dos campos continua inteira: nome, e-mail, WhatsApp com 10–11
dígitos e consentimento criticam normalmente.

## O que pedir atenção na validação

- **As 31 perguntas** — redação, ordem e se soam como a Dani falaria.
- **Os 9 arquétipos** e as três leituras de cada um (força, sangria invisível,
  primeiro movimento). São proposta nossa: a metodologia não existia em nenhum
  material, e foi autorada para esta versão.
- **A ressalva de estatuto** na tela de resultado: a página diz, com essas
  palavras, que o eneagrama não tem validação científica e que o Big Five tem.
  É decisão de integridade, e é reversível — mas convém ser consciente.
- **O que saiu da v1:** a escassez ("acesso gratuito por tempo limitado"),
  "CEO da Fidem" e a credencial de neurociências, que não tem fonte.


---

_Impressão da origem: `4592969314bda3b6` · gerado em 2026-08-03T18:09:45.579Z_
