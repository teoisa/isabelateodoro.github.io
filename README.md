# Portfólio — Isabela Teodoro
## Guia de Edição e Manutenção

---

## 📁 Estrutura de Arquivos

```
/
├── index.html                        ← Página principal
├── /cases/
│   ├── cotador-facility.html         ← Case 01
│   ├── rever.html                    ← Case 02
│   ├── discovery-bsc.html            ← Case 03
│   └── timbro-agro.html              ← Case 04
├── /assets/
│   ├── css/
│   │   ├── global.css                ← Variáveis, reset, nav, footer, botões
│   │   ├── main.css                  ← Estilos da index.html
│   │   └── case.css                  ← Estilos das páginas de case
│   ├── js/
│   │   ├── global.js                 ← Navegação, hamburger, scroll reveal
│   │   └── transitions.js            ← Fade de página, lazy image
│   ├── cases/
│   │   ├── cotador-facility/         ← Imagens do case 01
│   │   ├── rever/                    ← Imagens do case 02
│   │   ├── discovery-bsc/            ← Imagens do case 03
│   │   └── timbro-agro/              ← Imagens do case 04
│   ├── img/                          ← Fotos pessoais (hero, sobre)
│   └── docs/                         ← Arquivos para download (CV)
└── README.md
```

---

## 🖼️ Como Inserir Imagens

### 1. Fotos pessoais (index.html)

Adicione seus arquivos de imagem na pasta `/assets/img/`:
- `isabela-hero.jpg` → Foto para o hero da home
- `isabela-sobre.jpg` → Foto para a seção "Sobre"

Em `index.html`, encontre os comentários como:
```html
<!-- INSERIR FOTO: /assets/img/isabela-hero.jpg -->
<!-- <img src="assets/img/isabela-hero.jpg" alt="Isabela Teodoro" loading="eager"> -->
<div class="img-placeholder" ...>Inserir foto aqui</div>
```

Para ativar a imagem:
1. Apague a linha com `<div class="img-placeholder"...>`
2. Descomente a linha com `<img ...>` (remova `<!--` e `-->`)

### 2. Imagens dos cases

Cada case tem uma pasta em `/assets/cases/[nome-do-case]/`. Sugestão de estrutura:

```
/assets/cases/cotador-facility/
├── hero.jpg              ← Imagem do hero (tela cheia)
├── thumb.jpg             ← Thumbnail na listagem da home
├── overview/
│   └── visao-geral.jpg
├── papel/
│   └── meu-papel.jpg
├── processo/
│   └── fluxograma.jpg
├── entregaveis/
│   ├── wireframes.jpg
│   ├── tela-home.jpg
│   └── ...
└── resultado/
    └── resultado-final.jpg
```

**Recomendações de tamanho:**
- Hero: 1920×1080px ou maior, JPG otimizado
- Thumbnails (home): 800×450px (proporção 16:9)
- Imagens de seção: 1200×900px
- Panorâmicas (full-width): 1920×820px

---

## 🎨 Como Alterar Cores

Todas as cores estão em variáveis no topo de `/assets/css/global.css`:

```css
:root {
  --color-primary:   #FA003F;  /* Vermelho de destaque */
  --color-black:     #000000;
  --color-dark:      #1a1a1a;  /* Fundo nav e footer */
  --color-dark-mid:  #2a2a2a;  /* Fundo seção de works */
  --color-mid:       #666666;  /* Texto secundário */
  --color-light:     #e8e8e8;  /* Fundo seções claras nos cases */
  --color-white:     #ffffff;
}
```

---

## 🔤 Como Alterar Textos

### Seção Hero (index.html)
Encontre `.hero-eyebrow`, `.hero-name`, `.hero-tagline` e edite o conteúdo.

### Seção Sobre (index.html)
Encontre a seção com `id="sobre"` e edite os parágrafos `.about-text` e o `.about-mantra`.

### Skills / Competências (index.html)
Edite os `<span class="skill-pill">` dentro da `.skills-grid`.

### Conteúdo dos cases
Cada arquivo de case (`/cases/*.html`) contém os textos divididos em seções numeradas. Basta localizar a seção desejada (ex: `<!-- ── SEÇÃO 01: OVERVIEW ── -->`) e editar os parágrafos.

---

## 🔗 Como Atualizar Links de Contato

Busque e substitua nos arquivos os placeholders abaixo:

| Placeholder | Substituir por |
|---|---|
| `isabelasandoro@gmail.com` | Seu e-mail real |
| `linkedin.com/in/teodoroisabela` | Seu LinkedIn real |
| `behance.net/isabelateodoro` | Seu Behance real |
| `assets/docs/Isabela-Teodoro-CV.pdf` | Caminho real do seu currículo |

Adicione o arquivo do currículo em: `/assets/docs/Isabela-Teodoro-CV.pdf`

---

## ➕ Como Adicionar um Novo Case

1. Copie um dos arquivos de case existentes (ex: `timbro-agro.html`)
2. Renomeie para o slug do novo case (ex: `novo-case.html`)
3. Atualize:
   - `<title>`, `<meta name="description">`
   - Conteúdo de todas as seções
   - Navegação de cases (links anterior/próximo ao final)
4. Crie a pasta de assets: `/assets/cases/novo-case/`
5. Adicione o card na listagem em `index.html` (dentro de `.cases-list`)
6. Atualize os links de navegação cíclica nos outros cases

---

## 📱 Responsividade

O portfólio foi construído **desktop-first** com breakpoints em:
- **900px** — Layout de duas colunas vira coluna única nas seções de case
- **768px** — Menu colapsa para hamburger; cards viram layout vertical

Para testar localmente, você pode usar qualquer servidor local. Exemplo com Node.js:
```bash
npx serve .
```

Ou com Python:
```bash
python3 -m http.server 3000
```

---

## 🚀 Deploy

O portfólio é um site estático — funciona em qualquer hospedagem de arquivos estáticos:
- **Vercel**: `vercel deploy`
- **Netlify**: arraste a pasta para o painel ou via CLI
- **GitHub Pages**: faça push do repositório e ative em Settings → Pages

---

## 🎨 Paleta de Cores de Referência

| Cor | Hex | Uso |
|---|---|---|
| Vermelho Principal | `#FA003F` | CTAs, destaques, acento |
| Preto | `#000000` | Seção CTA, hero |
| Dark | `#1a1a1a` | Nav, footer, hero |
| Dark Mid | `#2a2a2a` | Seção de cases na home |
| Cinza Médio | `#666666` | Textos secundários |
| Cinza Claro | `#e8e8e8` | Fundos de seção nos cases |
| Branco | `#ffffff` | Fundo seções de conteúdo |

---

Dúvidas ou ajustes? Edite com cuidado e teste sempre no browser antes de publicar. ✨
