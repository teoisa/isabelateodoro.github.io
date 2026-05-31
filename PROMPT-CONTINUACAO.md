# Prompt de Continuação — Portfólio Isabela Teodoro

---

Estou desenvolvendo meu portfólio de Product Designer e preciso que você continue me ajudando a editar os arquivos HTML do projeto. Já trabalhei bastante nele e vou te contextualizar tudo abaixo.

---

## Localização do projeto

`/Users/[seu-usuario]/Desktop/portfolio 2/`
(ou onde você clonou o repositório GitHub)

---

## Estrutura de pastas

```
portfolio 2/
├── index.html                        ← homepage principal
├── assets/
│   ├── img/
│   │   └── hero.mp4                  ← vídeo de fundo do hero (Google Vids)
│   ├── css/                          ← NÃO usamos (CSS é inline em cada arquivo)
│   ├── js/                           ← NÃO usamos
│   └── cases/
│       ├── timbro-agro/              ✅ hero, overview, wireframes, prototipo, resultado, thumb
│       ├── rever/                    ✅ hero, thumb, overview, desafio, entregaveis-1/2, resultado
│       ├── cotador-facility/         ✅ hero, thumb, overview, desafio-perfis, desafio-sistemas, processo-asis, entregaveis-telas, entregaveis-comunicacoes, resultado
│       └── discovery-bsc/            ✅ hero, thumb, overview, desafio-sistemas, processo, entregaveis-chatbot, entregaveis-dashboard, resultado, resultado.png.png
└── cases/
    ├── timbro-agro.html              ✅ completo
    ├── rever.html                    ✅ completo
    ├── cotador-facility.html         ✅ completo
    └── discovery-bsc.html            ✅ completo
```

---

## Design System

Todos os arquivos têm **CSS self-contained inline** — sem dependência de arquivos externos.

### Identidade visual
```
--black: #0D0D0D
--white: #F4F2ED
--pure-white: #FFFFFF
--gray-50: #F8F7F3
--gray-100: #EBEBEB
--red: #FA003F
--font-serif: 'Playfair Display'
--font-sans: 'Helvetica Neue', Helvetica, Arial, sans-serif
```

### Features globais
- Cursor customizado ✶ vermelho (fixo, segue o mouse)
- Animações `reveal` com IntersectionObserver (fade + translateY)
- Nav com ✶ preta girando (1.8rem) — NÃO vermelha, NÃO estática

---

## Homepage (index.html) — estado atual

### Hero
- Vídeo de fundo full-cover: `assets/img/hero.mp4` (autoplay, muted, loop)
- Sem gradiente (vídeo já é escuro)
- Nome em Playfair Display, grande
- ✶ ao lado do nome: **vermelha e estática** (não gira)
- Subtítulo: "BELO HORIZONTE, MG ·" estático + ticker vertical com títulos profissionais
  - Cicla entre: Product Designer / UX Researcher / UI Designer / UX Designer / End-to-End Designer
  - Font: Helvetica Neue, 10px, uppercase, #aaa, letter-spacing 0.12em
  - Transição: 450ms cubic-bezier(0.77,0,0.18,1), intervalo 2.2s, loop seamless
- CTA "Ver projetos ↓"

### Ticker de competências
30 itens em loop (40s), velocidade ajustada. Competências completas:
Product Discovery · UX Research · Jornadas as-is/to-be · Avaliação Heurística · WCAG · Prototipação · Design System · Arquitetura da Informação · Landing Page · UX Writing · Low Code · IA Design · Google Flow · Google Stitch · KPIs · Roadmap · Jobs to be Done · Design Estratégico · Service Blueprint · Metodologias Ágeis · Design Sprint · Colaboração · Design Thinking · Lean UX · Dual Track · Figma · FigJam · Figma Make · Bizagi · Miro

### Cards de cases
- Hover: `scale(1.025) + translateY(-4px)` + sombra (0.35s cubic-bezier)
- Seta muda para vermelho no hover
- Todos com thumb real:
  - Rever: Grupo SADA — tags: Marketplace · Mobile & Desktop · Design System · IA Generativa · B2C
  - Cotador Facility: Seguros SURA — tags: IA · End-to-End · B2B · Seguros · Product Design · Escopo Fechado
  - Discovery BSC: Atlas Schindler — tags: Financeiro · Discovery · Mapeamento de Processos · IA Generativa
  - Timbro Agro: Timbro Trading — tags: Proposta Comercial · UI UX Design · B2B

---

## Cases — estrutura padrão

Cada case tem:
1. **Hero** — imagem full-width (`max-height: 90vh`, `object-fit: cover`)
2. **Meta bar** — 6 colunas: cliente, setor, ano, plataforma, papel, resultado
3. **Seções** alternando fundo branco/cinza com `role-cols` (texto + imagem)
4. **Process cards** — grid com hover (abinha, ícone SVG, tags de ferramentas)
5. **Deliverables** — cards de texto com ícone SVG
6. **Resultado** — tipografia grande em serif + imagem
7. **Aprendizados** — grid 3 colunas
8. **Próximo case** — bloco escuro full-width
9. **Footer** — "Isabela Teodoro ✶ · Belo Horizonte, MG · 2026"

### Layouts de imagem usados
- **Full-width**: `<div class="real-img-wrap reveal d1"><img ...></div>`
- **Texto esquerda + imagem direita**: `<div class="role-cols" style="align-items:center/start">` com texto na col 1 e img na col 2
- **Lado a lado**: grid 2 colunas inline

---

## Resumo por case

### Timbro Agro
- Cliente: **Timbro Trading** (produto: Timbro Agro)
- Plataforma: Mobile App
- Resultado: Contrato conquistado → squad alocada → app publicado nas lojas (App Store e Google Play)
- 6 etapas de processo: Entendimento · Mapa mental · Benchmarking · Wireframes · Alta Fidelidade · Apresentação

### Rever (Grupo SADA)
- Cliente: **Grupo SADA**
- Plataforma: Mobile + Web
- Desafio: texto esquerda + `desafio.png` direita
- 6 etapas de processo: Entendimento · Mapeamento to-be · Prototipação · Refinamento · Validação · Estratégia do MVP
- 4 entregáveis: Fluxos/protótipos · Especificações · Design System · Estratégia de go-live

### Cotador Facility (Seguros SURA)
- Dois sistemas coexistindo: Facility legado + Excel VBA (medida paliativa)
- 5 sprints, escopo fechado
- Desafio em 2 subsections: sistemas (texto+img) · perfis (texto+img, align-items:start)
- 6 etapas de processo: Entendimento · Mapeamento as-is · Reestruturação to-be · Prototipação · Handoff · Validação
- Seção "IA como segundo cérebro": texto esquerda + processo-asis.png direita
- Entregáveis incluem: Documentação completa do produto (gerada em 2 dias com IA)

### Discovery BSC (Atlas Schindler)
- Setor: Financeiro (NÃO Elevadores)
- Plataforma: Web & Chatbot
- Resultado: Proposta fechada · Novo cliente dti
- 9 etapas de processo: Entendimento · Mapeamento JTBD · Entrevistas · Sombra · Consolidação · Priorização · Ideação · Definição to-be · Showcase
- Entregáveis: texto Quick Wins/Estratégicas → dashboard full-width → chatbot (texto+img) → fluxograma to-be (texto+img)
- Seção 06 Resultado: usa `resultado.png.png` (novo asset comercial)
- **Pendente**: renomear `resultado.png.png` para nome mais limpo e atualizar o caminho no HTML

---

## Como inserir imagens nos cases

**Hero:**
```html
<div style="margin-top:57px;border-bottom:1px solid var(--black);overflow:hidden">
  <img src="../assets/cases/[case]/hero.png"
       style="width:100%;display:block;max-height:90vh;object-fit:cover;object-position:center center"
       loading="eager">
</div>
```

**Full-width:**
```html
<div class="real-img-wrap reveal d1">
  <img src="../assets/cases/[case]/[nome].png"
       style="width:100%;border-radius:8px;display:block" loading="lazy">
</div>
```

**Texto esquerda + imagem direita:**
```html
<div class="role-cols reveal d1" style="align-items:center">
  <div>título + texto</div>
  <div><img src="../assets/cases/[case]/[nome].png" style="width:100%;border-radius:8px;display:block" loading="lazy"></div>
</div>
```

**Thumb no index.html:**
```html
<div class="card-thumb">
  <img src="assets/cases/[case]/thumb.png"
       style="width:100%;height:100%;object-fit:cover;display:block" loading="lazy">
</div>
```

---

## Informações da Isabela

- **E-mail:** isabelasandoro@gmail.com
- **LinkedIn:** linkedin.com/in/teodoroisabela
- **Behance:** behance.net/isabelateodoro
- **Localização:** Belo Horizonte, MG

---

## Pendências conhecidas

- [ ] Renomear `resultado.png.png` → `resultado-comercial.png` e atualizar o caminho no `discovery-bsc.html`
- [ ] A homepage vai continuar evoluindo: refinamentos de hero, seção Sobre, responsividade mobile, etc.
- [ ] Subir o projeto no GitHub antes de trocar de máquina
