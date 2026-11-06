import './style.css'

const icon = (name, className = '') => {
  const paths = {
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    arrowUp: '<path d="M7 17 17 7M7 7h10v10"/>',
    minimize: '<path d="M5 12h14"/>',
    maximize: '<path d="M12 5v14m-7-7h14"/>',
    fallingLeaf: '<path d="M20.5 3.5C12 3.7 5.2 6.1 4.1 11.6c-.7 3.7 2.4 6.7 6.1 6.1 5.5-1.1 8-7.9 8.3-14.2Z" fill="currentColor" stroke="none"/><path d="M3 21c3-5 7-8 12-11" fill="none" stroke="#f6f7f0" stroke-width="1"/>',
    pin: '<path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
    leaf: '<path d="M20 4c-9 0-15 3-15 10a6 6 0 0 0 6 6c7 0 10-7 9-16Z"/><path d="M5 20c2-5 6-8 11-11"/>',
    cloud: '<path d="M20 16.2A4.5 4.5 0 0 0 18 7.5a6.5 6.5 0 0 0-12.5 2A4.5 4.5 0 0 0 6 18h12a4 4 0 0 0 2-1.8Z"/>',
    rain: '<path d="M20 15.5a4.5 4.5 0 0 0-2-8.7 6.5 6.5 0 0 0-12.5 2A4.5 4.5 0 0 0 6 17h12"/><path d="m8 20-1 2m6-2-1 2m6-2-1 2"/>',
    wind: '<path d="M3 8h12a3 3 0 1 0-3-3M2 12h17a3 3 0 1 1-3 3M4 16h7a3 3 0 1 1-3 3"/>',
    tree: '<path d="m12 3 6 8h-3l5 7H4l5-7H6l6-8Z"/><path d="M12 18v4"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    refresh: '<path d="M20 7v5h-5"/><path d="M4 17v-5h5"/><path d="M5.6 9a7 7 0 0 1 11.6-2L20 12M4 12l2.8 5a7 7 0 0 0 11.6-2"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    arrowDown: '<path d="M12 5v14m-7-7 7 7 7-7"/>',
    arrowUp: '<path d="M12 19V5m7 7-7-7-7 7"/>',
    arrowLeft: '<path d="M19 12H5m7 7-7-7 7-7"/>',
    play: '<path d="m8 5 12 7-12 7V5Z"/>',
    close: '<path d="m18 6-12 12M6 6l12 12"/>',
  }

  return `<svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]}</svg>`
}

const neighborhoods = {
  Pinheiros: { temp: 26, rain: 12, air: 'Boa', humidity: 61, emissions: 'Média', priority: 'Média', trees: '34%', offset: 0 },
  'Vila Madalena': { temp: 24, rain: 18, air: 'Boa', humidity: 67, emissions: 'Baixa', priority: 'Baixa', trees: '46%', offset: 1 },
  'Centro Histórico': { temp: 29, rain: 8, air: 'Atenção', humidity: 54, emissions: 'Alta', priority: 'Alta', trees: '12%', offset: 2 },
}

const temperatureHistory = {
  Pinheiros: [21, 22, 23, 24, 24, 26, 27, 26, 25, 26, 25, 26],
  'Vila Madalena': [20, 20, 21, 22, 23, 24, 25, 24, 23, 24, 23, 24],
  'Centro Histórico': [23, 24, 26, 27, 28, 29, 30, 29, 28, 29, 28, 29],
}

document.querySelector('#app').innerHTML = `
  <header class="site-header">
    <a class="brand" href="#inicio" aria-label="Raiz Urbana, início">
      <span class="brand-mark">${icon('leaf')}</span>
      <span>raiz<span class="brand-light">urbana</span></span>
    </a>
    <button class="menu-toggle" type="button" aria-label="Abrir menu" aria-expanded="false">${icon('menu')}</button>
    <nav class="main-nav" aria-label="Navegação principal">
      <a href="#projeto">O projeto</a>
      <a href="#areas-prioritarias">Mapa de áreas</a>
      <a href="#monitoramento">Monitoramento</a>
      <a href="#impacto">Nosso impacto</a>
      <a class="nav-cta" href="/perfil.html">Faça parte ${icon('arrow')}</a>
    </nav>
  </header>

  <main>
    <section class="hero page-wrap" id="inicio">
      <div class="hero-copy">
        <div class="eyebrow"><span class="pulse-dot"></span> CIDADE + NATUREZA, JUNTAS</div>
        <h1>Um futuro mais<br />verde começa <span>na sua rua.</span></h1>
        <p class="hero-description">Conectamos pessoas, dados climáticos e natureza para transformar os espaços públicos em lugares mais frescos, vivos e acolhedores.</p>
        <div class="hero-actions">
          <a class="button button-dark" href="#projeto">Conheça o projeto ${icon('arrow')}</a>
          <a class="text-link" href="#areas-prioritarias">Explore o mapa <span>↓</span></a>
        </div>
        <div class="hero-proof">
          <div class="avatar-stack" aria-hidden="true"><span>J</span><span>M</span><span>A</span><span>+</span></div>
          <p><strong>Uma cidade melhor</strong><br />se constrói em comunidade</p>
        </div>
      </div>
      <div class="hero-visual">
        <img class="hero-image" src="https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1200&q=85" alt="Vista aérea de uma praça arborizada entre prédios da cidade" />
        <div class="image-tint"></div>
        <div class="weather-card">
          <div class="weather-card-top"><span class="weather-label">EXEMPLO DE LEITURA</span><span class="live-pill"><i></i> DEMO</span></div>
          <div class="weather-location">${icon('pin')} <span id="hero-neighborhood">Pinheiros, São Paulo</span></div>
          <div class="temperature-row"><span class="sun-icon">☀</span><strong id="hero-temp">26°</strong><span class="weather-condition">Ensolarado<br />Sensação de 28°</span></div>
          <div class="weather-divider"></div>
          <div class="weather-details">
            <div>${icon('rain')}<span>Chuva</span><strong id="hero-rain">12%</strong></div>
            <div>${icon('wind')}<span>Umidade</span><strong id="hero-humidity">61%</strong></div>
            <div>${icon('leaf')}<span>Qualidade do ar</span><strong class="air-good" id="hero-air">Boa</strong></div>
          </div>
          <p class="data-note">Dados demonstrativos · atualizados há 2 min</p>
        </div>
        <div class="green-tag">${icon('leaf')} Mais sombra, menos calor</div>
        <div class="hero-caption">Praça das Corujas <span>·</span> Pinheiros, SP</div>
      </div>
      <div class="hero-side-note">CUIDAR DO BAIRRO<br />É CUIDAR DO PLANETA</div>
    </section>

    <section class="ticker" aria-label="O que fazemos">
      <div class="ticker-track"><span>MONITORAR</span>${icon('leaf')}<span>REGENERAR</span>${icon('leaf')}<span>CONECTAR</span>${icon('leaf')}<span>MONITORAR</span>${icon('leaf')}<span>REGENERAR</span>${icon('leaf')}<span>CONECTAR</span>${icon('leaf')}</div>
    </section>

    <section class="intro section-wrap" id="projeto">
      <div class="section-kicker">01 — UMA NOVA FORMA DE CUIDAR</div>
      <div class="intro-grid">
        <h2>O clima muda.<br /><span>A cidade também</span><br />pode mudar.</h2>
        <div class="intro-copy">
          <p>As cidades concentram calor e emissões, mas é nelas que a transformação começa. A Raiz Urbana une tecnologia e ação coletiva para identificar onde a natureza faz mais falta — e levar verde para onde ele pode fazer a diferença.</p>
          <a class="inline-link" href="#impacto">Veja como funciona ${icon('arrowUp')}</a>
        </div>
      </div>
      <div class="feature-grid">
        <article class="feature-card">
          <span class="feature-icon">${icon('cloud')}</span>
          <span class="feature-number">01 / OBSERVAR</span>
          <h3>Entender cada microclima</h3>
          <p>Totens em praças e pontos de ônibus acompanham temperatura, umidade e precipitação em cada região.</p>
        </article>
        <article class="feature-card feature-card-green">
          <span class="feature-icon">${icon('tree')}</span>
          <span class="feature-number">02 / REGENERAR</span>
          <h3>Plantar onde mais importa</h3>
          <p>Calor, cobertura vegetal e estimativas de emissões ajudam a priorizar pontos críticos para receber novas árvores.</p>
        </article>
        <article class="feature-card">
          <span class="feature-icon">${icon('leaf')}</span>
          <span class="feature-number">03 / CULTIVAR</span>
          <h3>Fazer junto, cuidar sempre</h3>
          <p>Moradores acompanham as mudanças, participam dos plantios e cultivam hábitos mais sustentáveis no dia a dia.</p>
        </article>
      </div>
    </section>

    <section class="priority-section section-wrap" id="areas-prioritarias">
      <div class="priority-heading">
        <div><div class="section-kicker">UM MAPA PARA AGIR MELHOR</div><h2>Descubra onde o verde<br />pode fazer <span>diferença.</span></h2></div>
        <p>Explore as regiões e veja como a combinação de calor, cobertura vegetal e emissões estimadas pode orientar as próximas ações.</p>
      </div>
      <div class="priority-toolbar">
        <div class="filter-group" role="group" aria-label="Filtrar regiões"><button class="filter-button is-active" type="button" data-priority-filter="all" aria-pressed="true">Todas as regiões</button><button class="filter-button" type="button" data-priority-filter="high" aria-pressed="false">Prioridade alta</button></div>
        <span class="map-demo-note">${icon('pin')} Mapa esquemático · dados demonstrativos</span>
      </div>
      <div class="priority-layout">
        <div class="neighborhood-map" role="group" aria-label="Mapa esquemático das regiões">
          <div class="map-street map-street-one"></div><div class="map-street map-street-two"></div><div class="map-street map-street-three"></div>
          <span class="map-block map-block-one"></span><span class="map-block map-block-two"></span><span class="map-block map-block-three"></span><span class="map-block map-block-four"></span>
                  <button class="map-marker marker-pinheiros" type="button" data-map-region="Pinheiros" data-priority="medium" aria-label="Selecionar Pinheiros"><span>01</span></button>
                  <button class="map-marker marker-vila" type="button" data-map-region="Vila Madalena" data-priority="low" aria-label="Selecionar Vila Madalena"><span>02</span></button>
                  <button class="map-marker marker-centro is-selected" type="button" data-map-region="Centro Histórico" data-priority="high" aria-label="Selecionar Centro Histórico"><span>03</span></button>
          <span class="map-label map-label-pinheiros">PINHEIROS</span><span class="map-label map-label-vila">VILA MADALENA</span><span class="map-label map-label-centro">CENTRO</span>
          <div class="map-compass">N <span>↑</span></div>
          <div class="map-scale"><i></i> REPRESENTAÇÃO ILUSTRATIVA</div>
        </div>
        <div class="region-list">
          <div class="region-list-heading"><span>REGIÕES MONITORADAS</span><span id="region-count">3 áreas</span></div>
          <button class="region-card" type="button" data-map-region="Centro Histórico" data-priority="high">
            <span class="region-rank">03</span><span class="region-card-copy"><strong>Centro Histórico</strong><small>Menor cobertura vegetal</small></span><span class="priority-badge priority-high">Alta ${icon('arrowUp')}</span>
          </button>
          <button class="region-card" type="button" data-map-region="Pinheiros" data-priority="medium">
            <span class="region-rank">01</span><span class="region-card-copy"><strong>Pinheiros</strong><small>Calor e verde em equilíbrio</small></span><span class="priority-badge">Média</span>
          </button>
          <button class="region-card" type="button" data-map-region="Vila Madalena" data-priority="low">
            <span class="region-rank">02</span><span class="region-card-copy"><strong>Vila Madalena</strong><small>Boa cobertura vegetal</small></span><span class="priority-badge priority-low">Baixa</span>
          </button>
          <div class="region-summary" aria-live="polite">
            <div class="summary-top"><span id="summary-priority" class="priority-badge priority-high">Prioridade alta</span><span>ESTIMATIVA CONCEITUAL</span></div>
            <strong id="summary-neighborhood">Centro Histórico</strong>
            <div class="summary-metrics"><span>Vegetação <b id="summary-trees">12%</b></span><span>Emissões <b id="summary-emissions">Alta*</b></span></div>
            <a href="#monitoramento" class="summary-link" id="summary-explore">Explorar dados do bairro ${icon('arrow')}</a>
          </div>
          <p class="region-disclaimer">*Estimativas ilustrativas, sem dados de sensores ou inventário oficial de emissões.</p>
        </div>
      </div>
    </section>

    <section class="monitor-section" id="monitoramento">
      <div class="monitor-inner section-wrap">
        <div class="monitor-copy">
          <div class="section-kicker section-kicker-light">02 — O CLIMA, DE PERTO</div>
          <h2>Cada bairro tem<br />seu próprio <span>clima.</span></h2>
          <p>Uma futura rede de totens conectados vai acompanhar as condições locais. Cruzados com estimativas de emissões e cobertura vegetal, esses dados ajudam a direcionar o reflorestamento para onde ele faz mais falta.</p>
          <label class="select-label" for="neighborhood-select">Explore uma região</label>
          <div class="select-wrap">${icon('pin')}<select id="neighborhood-select" aria-label="Selecione uma região"><option>Pinheiros</option><option>Vila Madalena</option><option>Centro Histórico</option></select><span class="select-chevron">⌄</span></div>
          <span class="demo-label">Prévia ilustrativa do painel climático</span>
        </div>
        <div class="climate-panel">
          <div class="panel-heading"><div><span class="panel-overline">PAINEL DA REGIÃO</span><h3 id="panel-neighborhood">Pinheiros, SP</h3></div><span class="panel-status"><i></i> DADOS ILUSTRATIVOS</span></div>
          <div class="panel-main-metric"><span class="metric-icon">${icon('cloud')}</span><div><span class="metric-caption">TEMPERATURA ATUAL</span><strong id="metric-temp">26°</strong></div><span class="metric-subtext">Sensação<br />de 28°</span></div>
          <div class="chart-area">
            <div class="chart-toolbar"><div class="chart-title"><span id="chart-title">Temperatura nas últimas 12 horas</span><span>°C</span></div><div class="chart-period" role="group" aria-label="Período do gráfico"><button class="period-button is-active" type="button" data-period="12" aria-pressed="true">12h</button><button class="period-button" type="button" data-period="24" aria-pressed="false">24h</button></div></div>
            <div class="chart-grid"><span>30°</span><span>25°</span><span>20°</span><svg viewBox="0 0 520 132" preserveAspectRatio="none" role="img" aria-label="Gráfico demonstrativo de variação da temperatura"><defs><linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stop-color="#b9d88c" stop-opacity=".32"/><stop offset="100%" stop-color="#b9d88c" stop-opacity="0"/></linearGradient></defs><path class="chart-fill" id="chart-fill" d="M0 94 C28 91 35 73 66 78 S105 93 132 72 S171 66 198 61 S238 82 264 64 S303 48 330 55 S368 39 396 45 S435 52 462 27 S498 34 520 13 L520 132 L0 132Z"/><path class="chart-line" id="chart-line" d="M0 94 C28 91 35 73 66 78 S105 93 132 72 S171 66 198 61 S238 82 264 64 S303 48 330 55 S368 39 396 45 S435 52 462 27 S498 34 520 13"/></svg></div>
            <div class="chart-times" id="chart-times"><span>08h</span><span>11h</span><span>14h</span><span>17h</span><span>20h</span></div>
          </div>
          <div class="panel-bottom">
            <div>${icon('rain')}<span>Chance de chuva</span><strong id="metric-rain">12%</strong></div>
            <div>${icon('wind')}<span>Umidade do ar</span><strong id="metric-humidity">61%</strong></div>
            <div>${icon('leaf')}<span>Qualidade do ar</span><strong class="air-good" id="metric-air">Boa</strong></div>
          </div>
          <div class="panel-footer"><span class="panel-footnote" id="last-updated">Demonstração · nenhum totem conectado</span><button class="refresh-button" id="refresh-demo" type="button">${icon('refresh')} Atualizar demonstração</button></div>
        </div>
      </div>
    </section>

    <section class="impact-section section-wrap" id="impacto">
      <div class="impact-heading">
        <div><div class="section-kicker">03 — PEQUENAS AÇÕES, GRANDES RAÍZES</div><h2>O impacto começa<br />perto de <span>casa.</span></h2></div>
        <p>Quando a comunidade e a natureza crescem juntas, todo mundo sente a diferença. Nosso próximo passo? Começar pelo seu bairro.</p>
      </div>
      <div class="impact-grid">
        <article class="impact-card impact-card-dark"><div class="impact-art">${icon('tree')}</div><span>NOSSO NORTE</span><strong>Mais verde,<br />menos calor.</strong><p>Vegetação nativa e espaços públicos mais frescos para quem vive a cidade.</p><a href="#participar">Nossa visão ${icon('arrow')}</a></article>
        <article class="stat-card"><span class="stat-icon">${icon('pin')}</span><span class="stat-label">ONDE A CIDADE PRECISA</span><strong>Por bairro</strong><p>O monitoramento regional ajuda a enxergar diferenças de temperatura e cobertura verde entre áreas próximas.</p><div class="stat-bottom">DADOS LOCAIS <span>→</span> AÇÃO DIRECIONADA</div></article>
        <article class="stat-card stat-card-lime"><span class="stat-icon">${icon('leaf')}</span><span class="stat-label">O QUE PODE FLORESCER</span><strong>Com você</strong><p>Mutirões, plantios comunitários e escolhas cotidianas podem tornar cada rua parte da mudança.</p><div class="stat-bottom">COMUNIDADE <span>→</span> CIDADE VIVA</div></article>
      </div>
    </section>

    <section class="community-section section-wrap" id="desafio">
      <div class="community-heading">
        <div><div class="section-kicker">04 — O SEU BAIRRO, SUA PARTE</div><h2>Pequenos hábitos,<br /><span>raízes mais fortes.</span></h2></div>
        <p>Marque as ações que você já pratica. Acompanhe seu progresso nesta página e veja como escolhas cotidianas ajudam a criar uma cidade mais sustentável.</p>
      </div>
      <div class="community-grid">
        <div class="challenge-card">
          <div class="challenge-card-heading"><div><span class="challenge-kicker">DESAFIO DA COMUNIDADE</span><h3>Um passo mais verde</h3></div><span class="challenge-leaf">${icon('leaf')}</span></div>
          <div class="progress-label"><span>Seu progresso</span><strong id="challenge-count">0 de 3 ações</strong></div>
          <div class="progress-track" role="progressbar" aria-label="Progresso do desafio sustentável" aria-valuemin="0" aria-valuemax="3" aria-valuenow="0"><span id="challenge-progress"></span></div>
          <div class="challenge-actions">
            <label class="challenge-action"><input type="checkbox" data-challenge="transporte" /><span class="custom-check">${icon('check')}</span><span><strong>Escolhi caminhar, pedalar ou usar transporte coletivo</strong><small>Deslocamento com menos emissões</small></span></label>
            <label class="challenge-action"><input type="checkbox" data-challenge="residuos" /><span class="custom-check">${icon('check')}</span><span><strong>Reduzi descartáveis ou separei recicláveis</strong><small>Menos resíduos no nosso bairro</small></span></label>
            <label class="challenge-action"><input type="checkbox" data-challenge="natureza" /><span class="custom-check">${icon('check')}</span><span><strong>Cuidei de uma planta ou área verde</strong><small>Mais natureza perto de casa</small></span></label>
          </div>
          <button class="reset-challenge" id="reset-challenge" type="button">Recomeçar desafio</button>
        </div>
        <aside class="community-event">
          <span class="event-label">PROPOSTA DE ENCONTRO · NÃO AGENDADO</span>
          <div class="event-date"><strong>—</strong><span>DATA<br />A COMBINAR</span></div>
          <h3>Manhã de plantio comunitário</h3>
          <p>Uma proposta para imaginar o primeiro encontro da comunidade. Local e data serão divulgados quando confirmados.</p>
          <button class="event-button" id="event-interest" type="button" aria-pressed="false">Tenho interesse ${icon('arrow')}</button>
          <span class="event-feedback" id="event-feedback" aria-live="polite"></span>
        </aside>
      </div>
      <p class="community-disclaimer">Desafio educativo: as ações não calculam nem compensam emissões de carbono.</p>
    </section>

    <section class="join-section" id="participar">
      <div class="join-decoration">${icon('leaf')}${icon('leaf')}${icon('leaf')}</div>
      <div class="join-content">
        <div class="section-kicker section-kicker-light">A CIDADE TAMBÉM É SUA</div>
        <h2>Vamos fazer<br />florescer <span>juntos?</span></h2>
        <p>Uma ideia ganha raízes quando encontra outras pessoas. Deixe seu e-mail para registrar interesse nesta demonstração.</p>
        <form class="join-form" id="join-form"><label class="visually-hidden" for="email">Seu e-mail</label><input id="email" name="email" type="email" placeholder="Seu melhor e-mail" required /><button type="submit">Quero participar ${icon('arrow')}</button></form>
        <p class="form-message" id="form-message" aria-live="polite"></p>
        <span class="join-footnote">Prévia sem integração: nenhum dado será enviado ou armazenado.</span>
      </div>
      <div class="join-side-label">PLANTE UMA IDEIA.<br />CULTIVE O FUTURO.</div>
    </section>
  </main>

  <aside class="guided-nav" aria-label="Leitura guiada por capítulos">
    <div class="guided-nav-top">
      <span class="guided-label"><i></i> LEITURA GUIADA</span>
      <div class="guided-nav-controls">
        <button class="chapter-toggle" id="chapter-toggle" type="button" aria-expanded="false" aria-controls="chapter-list"><span id="chapter-count">01</span> <span class="chapter-total">/ 07</span> <span class="chapter-toggle-label">Capítulos⌄</span></button>
        <button class="guided-minimize" id="guided-minimize" type="button" aria-label="Minimizar leitura guiada" aria-expanded="true" title="Minimizar leitura guiada">${icon('minimize')}</button>
      </div>
    </div>
    <div class="guided-current" aria-live="polite" aria-atomic="true">
      <span class="guided-progress"><i id="guided-progress"></i></span>
      <strong id="current-chapter">O começo</strong>
      <span id="current-chapter-description">Uma cidade mais verde começa na sua rua</span>
    </div>
    <div class="guided-actions">
      <button class="chapter-previous" id="chapter-previous" type="button" aria-label="Voltar ao tópico anterior">${icon('arrowLeft')}</button>
      <button class="chapter-next" id="chapter-next" type="button"><span id="chapter-next-label">Próximo tópico</span>${icon('arrowDown')}</button>
    </div>
    <button class="presentation-launch" id="presentation-launch" type="button">${icon('play')} Apresentação</button>
    <nav class="chapter-list" id="chapter-list" aria-label="Escolher capítulo" hidden>
      <a href="#inicio" data-chapter="inicio"><span>01</span> O começo</a>
      <a href="#projeto" data-chapter="projeto"><span>02</span> A ideia</a>
      <a href="#areas-prioritarias" data-chapter="areas-prioritarias"><span>03</span> Onde agir</a>
      <a href="#monitoramento" data-chapter="monitoramento"><span>04</span> O clima local</a>
      <a href="#impacto" data-chapter="impacto"><span>05</span> Nosso impacto</a>
      <a href="#desafio" data-chapter="desafio"><span>06</span> Sua comunidade</a>
      <a href="#participar" data-chapter="participar"><span>07</span> Fazer parte</a>
    </nav>
  </aside>

  <section class="presentation-overlay" id="presentation-overlay" role="dialog" aria-modal="true" aria-labelledby="presentation-title" aria-describedby="presentation-copy" aria-hidden="true" hidden>
    <button class="presentation-close" id="presentation-close" type="button" aria-label="Fechar apresentação">${icon('close')}</button>
    <div class="presentation-content">
      <span class="presentation-kicker" id="presentation-kicker">RAIZ URBANA · 01 / 07</span>
      <div class="presentation-progress" aria-hidden="true"><i id="presentation-progress"></i></div>
      <h2 id="presentation-title"></h2>
      <p id="presentation-copy"></p>
      <span class="presentation-chapter-label" id="presentation-chapter-label"></span>
      <span class="presentation-hint" id="presentation-hint">Clique ou role para revelar esta parte</span>
    </div>
    <div class="presentation-controls">
      <button id="presentation-previous" type="button" aria-label="Slide anterior">${icon('arrowLeft')}</button>
      <span id="presentation-counter">01 / 07</span>
      <button id="presentation-next" type="button" aria-label="Próximo slide">${icon('arrowDown')}</button>
    </div>
  </section>

  <footer class="site-footer">
    <a class="brand footer-brand" href="#inicio"><span class="brand-mark">${icon('leaf')}</span><span>raiz<span class="brand-light">urbana</span></span></a>
    <span>Uma cidade melhor cresce com todo mundo.</span>
    <a href="#inicio">Voltar ao topo ↑</a>
    <small>© 2026 Raiz Urbana · Projeto conceitual</small>
  </footer>
`

if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const leafIntro = document.createElement('div')
  leafIntro.className = 'leaf-intro'
  leafIntro.setAttribute('aria-hidden', 'true')

  for (let index = 0; index < 18; index += 1) {
    const leaf = document.createElement('span')
    leaf.className = 'falling-leaf'
    leaf.innerHTML = icon('fallingLeaf')
    leaf.style.left = `${Math.random() * 100}%`
    leaf.style.setProperty('--leaf-size', `${12 + Math.random() * 16}px`)
    leaf.style.setProperty('--leaf-duration', `${3.2 + Math.random() * 1.2}s`)
    leaf.style.setProperty('--leaf-delay', `${Math.random() * 0.8}s`)
    leaf.style.setProperty('--leaf-drift', `${Math.round((Math.random() - 0.5) * 220)}px`)
    leaf.style.setProperty('--leaf-rotation', `${Math.round((Math.random() - 0.5) * 700)}deg`)
    leafIntro.append(leaf)
  }

  document.body.append(leafIntro)
  window.setTimeout(() => leafIntro.remove(), 5200)
}

const menuToggle = document.querySelector('.menu-toggle')
const navigation = document.querySelector('.main-nav')
const neighborhoodSelect = document.querySelector('#neighborhood-select')
const chartTitle = document.querySelector('#chart-title')
const regionButtons = [...document.querySelectorAll('[data-map-region]')]
const challengeChecks = [...document.querySelectorAll('[data-challenge]')]
let selectedNeighborhood = 'Pinheiros'
let selectedPeriod = 12
let refreshCount = 0
const chapters = [
  { id: 'inicio', title: 'O começo', description: 'Uma cidade mais verde começa na sua rua', copy: 'Imagine uma cidade onde praças e pontos de ônibus ajudam as pessoas a viver melhor — com mais natureza, sombra e espaços acolhedores.', label: 'Uma cidade que respira melhor' },
  { id: 'projeto', title: 'A ideia', description: 'Como tecnologia e natureza se conectam', copy: 'A Raiz Urbana aproxima moradores, monitoramento climático e reflorestamento para transformar dados locais em cuidado coletivo.', label: 'Tecnologia a serviço da natureza' },
  { id: 'areas-prioritarias', title: 'Onde agir', description: 'Explore as regiões e suas prioridades', copy: 'Ao observar calor, cobertura vegetal e estimativas de emissões, podemos identificar áreas onde novas árvores podem fazer diferença.', label: 'Mais verde onde ele faz falta' },
  { id: 'monitoramento', title: 'O clima local', description: 'Veja como funciona o monitoramento', copy: 'Totens em espaços públicos podem acompanhar temperatura, umidade e chuva. As informações ajudam a entender o microclima de cada bairro.', label: 'Conhecer cada microclima' },
  { id: 'impacto', title: 'Nosso impacto', description: 'Pequenas ações criam grandes raízes', copy: 'Mais sombra, cuidado comunitário e contato com a natureza. A mudança acontece quando cada região participa.', label: 'Mudanças que começam por perto' },
  { id: 'desafio', title: 'Sua comunidade', description: 'Descubra como você pode participar', copy: 'Caminhadas, hábitos sustentáveis e o cuidado com áreas verdes conectam pessoas e fortalecem o vínculo com o bairro.', label: 'Cada pessoa faz parte' },
  { id: 'participar', title: 'Fazer parte', description: 'Cultive o futuro junto com a gente', copy: 'Uma cidade mais saudável nasce de boas ideias compartilhadas. Conheça a proposta e imagine o que podemos fazer juntos.', label: 'O futuro cresce em comunidade' },
]
let activeChapterIndex = 0
let scrollUpdateScheduled = false
let wheelTargetY = null
let wheelAnimationFrame = null

document.body.classList.add('has-guided-reading')

menuToggle.addEventListener('click', () => {
  const isOpen = menuToggle.getAttribute('aria-expanded') === 'true'
  menuToggle.setAttribute('aria-expanded', String(!isOpen))
  navigation.classList.toggle('is-open', !isOpen)
})

navigation.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    menuToggle.setAttribute('aria-expanded', 'false')
    navigation.classList.remove('is-open')
  })
})

const chapterList = document.querySelector('#chapter-list')
const chapterToggle = document.querySelector('#chapter-toggle')
const guidedNav = document.querySelector('.guided-nav')
const guidedMinimize = document.querySelector('#guided-minimize')
const chapterLinks = [...chapterList.querySelectorAll('[data-chapter]')]
const presentationOverlay = document.querySelector('#presentation-overlay')
const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
let presentationActive = false
let presentationIndex = 0
let presentationSlideRevealed = false
let presentationTransitionTimer = null
let presentationWheelLocked = false
let presentationWheelTimer = null
let lastFocusedElement = null
let presentationCardAnimation = null
let presentationTouchStartY = null

const cancelWheelAnimation = () => {
  if (wheelAnimationFrame !== null) {
    window.cancelAnimationFrame(wheelAnimationFrame)
    wheelAnimationFrame = null
  }
  wheelTargetY = null
}

const setActiveChapter = (index) => {
  activeChapterIndex = Math.max(0, Math.min(index, chapters.length - 1))
  const chapter = chapters[activeChapterIndex]
  const isLastChapter = activeChapterIndex === chapters.length - 1
  const nextButton = document.querySelector('#chapter-next')
  document.querySelector('#chapter-count').textContent = String(activeChapterIndex + 1).padStart(2, '0')
  document.querySelector('#current-chapter').textContent = chapter.title
  document.querySelector('#current-chapter-description').textContent = chapter.description
  document.querySelector('#guided-progress').style.width = `${((activeChapterIndex + 1) / chapters.length) * 100}%`
  nextButton.innerHTML = `<span>${isLastChapter ? 'Voltar ao início' : 'Próximo tópico'}</span>${icon(isLastChapter ? 'arrowUp' : 'arrowDown')}`
  nextButton.setAttribute('aria-label', isLastChapter ? 'Voltar ao início da leitura' : `Próximo tópico: ${chapters[activeChapterIndex + 1].title}`)
  chapterLinks.forEach((link, linkIndex) => {
    if (linkIndex === activeChapterIndex) link.setAttribute('aria-current', 'location')
    else link.removeAttribute('aria-current')
  })
}

const goToChapter = (index) => {
  const normalizedIndex = (index + chapters.length) % chapters.length
  const target = document.getElementById(chapters[normalizedIndex].id)
  if (!target) return

  cancelWheelAnimation()
  setActiveChapter(normalizedIndex)
  window.history.replaceState(null, '', `#${chapters[normalizedIndex].id}`)
  target.scrollIntoView({
    behavior: reducedMotionQuery.matches ? 'auto' : 'smooth',
    block: 'start',
  })
}

chapterToggle.addEventListener('click', () => {
  const isExpanded = chapterToggle.getAttribute('aria-expanded') === 'true'
  chapterToggle.setAttribute('aria-expanded', String(!isExpanded))
  chapterList.hidden = isExpanded
})

guidedMinimize.addEventListener('click', () => {
  const isExpanded = guidedMinimize.getAttribute('aria-expanded') === 'true'
  guidedMinimize.setAttribute('aria-expanded', String(!isExpanded))
  guidedMinimize.setAttribute('aria-label', isExpanded ? 'Expandir leitura guiada' : 'Minimizar leitura guiada')
  guidedMinimize.title = isExpanded ? 'Expandir leitura guiada' : 'Minimizar leitura guiada'
  guidedMinimize.innerHTML = icon(isExpanded ? 'maximize' : 'minimize')
  guidedNav.classList.toggle('is-minimized', isExpanded)
  if (isExpanded) {
    chapterList.hidden = true
    chapterToggle.setAttribute('aria-expanded', 'false')
  }
})

chapterLinks.forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault()
    chapterList.hidden = true
    chapterToggle.setAttribute('aria-expanded', 'false')
    const chapterIndex = chapters.findIndex((chapter) => chapter.id === link.dataset.chapter)
    if (presentationActive) renderPresentationSlide(chapterIndex)
    else goToChapter(chapterIndex)
  })
})

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  if (link.closest('#chapter-list')) return
  link.addEventListener('click', (event) => {
    const targetId = link.getAttribute('href').slice(1)
    const chapterIndex = chapters.findIndex((chapter) => chapter.id === targetId)
    if (chapterIndex < 0) return

    event.preventDefault()
    chapterList.hidden = true
    chapterToggle.setAttribute('aria-expanded', 'false')
    menuToggle.setAttribute('aria-expanded', 'false')
    navigation.classList.remove('is-open')
    if (presentationActive) renderPresentationSlide(chapterIndex)
    else goToChapter(chapterIndex)
  })
})

document.querySelector('#chapter-previous').addEventListener('click', () => {
  goToChapter(activeChapterIndex - 1)
})

document.querySelector('#chapter-next').addEventListener('click', () => {
  goToChapter(activeChapterIndex === chapters.length - 1 ? 0 : activeChapterIndex + 1)
})

const renderPresentationSlide = (index) => {
  const card = document.querySelector('.presentation-content')
  presentationCardAnimation?.cancel()
  presentationCardAnimation = null
  const wasDocked = presentationActive && !presentationOverlay.hidden && card.classList.contains('is-docked')
  const previousRect = wasDocked ? card.getBoundingClientRect() : null
  presentationIndex = Math.max(0, Math.min(index, chapters.length - 1))
  presentationSlideRevealed = false
  const chapter = chapters[presentationIndex]
  const slideNumber = String(presentationIndex + 1).padStart(2, '0')
  const percentage = `${((presentationIndex + 1) / chapters.length) * 100}%`
  const nextButton = document.querySelector('#presentation-next')

  presentationOverlay.classList.remove('is-lit', 'is-revealing')
  presentationOverlay.setAttribute('aria-modal', 'true')
  card.classList.remove('is-docked')
  void presentationOverlay.offsetWidth
  presentationOverlay.classList.add('is-revealing')
  document.querySelector('#presentation-kicker').textContent = `RAIZ URBANA · ${slideNumber} / 07`
  document.querySelector('#presentation-progress').style.width = percentage
  document.querySelector('#presentation-title').textContent = chapter.title
  document.querySelector('#presentation-copy').textContent = chapter.copy
  document.querySelector('#presentation-chapter-label').textContent = chapter.label
  document.querySelector('#presentation-hint').textContent = 'Clique ou role para revelar esta parte'
  document.querySelector('#presentation-counter').textContent = `${slideNumber} / 07`
  document.querySelector('#presentation-previous').disabled = presentationIndex === 0

  window.clearTimeout(presentationTransitionTimer)
  nextButton.setAttribute('aria-label', 'Revelar esta parte')
  nextButton.innerHTML = icon('arrowDown')
  if (wasDocked && previousRect) animatePresentationCard(previousRect)
}

const animatePresentationCard = (previousRect) => {
  const card = document.querySelector('.presentation-content')
  const nextRect = card.getBoundingClientRect()
  presentationCardAnimation?.cancel()
  presentationCardAnimation = null

  if (reducedMotionQuery.matches) return

  presentationCardAnimation = card.animate([
    {
      transformOrigin: 'top left',
      transform: `translate(${previousRect.left - nextRect.left}px, ${previousRect.top - nextRect.top}px) scale(${previousRect.width / nextRect.width}, ${previousRect.height / nextRect.height})`,
    },
    { transformOrigin: 'top left', transform: 'translate(0, 0) scale(1)' },
  ], {
    duration: 720,
    easing: 'cubic-bezier(.22,.74,.24,1)',
  })
}

const revealPresentationChapter = () => {
  if (!presentationActive || presentationSlideRevealed) return
  presentationSlideRevealed = true
  const card = document.querySelector('.presentation-content')
  presentationCardAnimation?.cancel()
  presentationCardAnimation = null
  const previousRect = card.getBoundingClientRect()

  presentationOverlay.classList.add('is-lit')
  presentationOverlay.setAttribute('aria-modal', 'false')
  card.classList.add('is-docked')
  document.querySelector('#presentation-hint').textContent = 'Role ou clique para continuar'
  document.querySelector('#presentation-previous').disabled = false

  const nextButton = document.querySelector('#presentation-next')
  const isLastChapter = presentationIndex === chapters.length - 1
  nextButton.setAttribute('aria-label', isLastChapter ? 'Finalizar apresentação' : 'Próximo tópico')
  nextButton.innerHTML = isLastChapter ? icon('close') : icon('arrowDown')

  goToChapter(presentationIndex)
  animatePresentationCard(previousRect)
}

const advancePresentation = (direction = 1) => {
  if (!presentationActive) return
  if (!presentationSlideRevealed) {
    revealPresentationChapter()
    return
  }

  if (direction > 0 && presentationIndex === chapters.length - 1) {
    closePresentation()
    return
  }
  if (direction < 0 && presentationIndex === 0) return
  renderPresentationSlide(presentationIndex + direction)
}

const closePresentation = () => {
  if (!presentationActive) return
  const chapterIndex = presentationIndex
  const returnToRevealedChapter = presentationSlideRevealed
  presentationActive = false
  window.clearTimeout(presentationTransitionTimer)
  window.clearTimeout(presentationWheelTimer)
  presentationWheelLocked = false
  document.body.classList.remove('is-presenting')
  presentationSlideRevealed = false
  presentationCardAnimation?.cancel()
  document.querySelector('.presentation-content').classList.remove('is-docked')
  presentationOverlay.classList.remove('is-lit', 'is-revealing')
  presentationOverlay.hidden = true
  presentationOverlay.setAttribute('aria-hidden', 'true')
  if (returnToRevealedChapter) goToChapter(chapterIndex)
  lastFocusedElement?.focus()
}

document.querySelector('#presentation-launch').addEventListener('click', () => {
  presentationActive = true
  lastFocusedElement = document.activeElement
  cancelWheelAnimation()
  document.body.classList.add('is-presenting')
  presentationOverlay.hidden = false
  presentationOverlay.setAttribute('aria-modal', 'true')
  presentationOverlay.setAttribute('aria-hidden', 'false')
  renderPresentationSlide(0)
  document.querySelector('#presentation-close').focus()
})

document.querySelector('#presentation-close').addEventListener('click', closePresentation)
document.querySelector('#presentation-previous').addEventListener('click', () => {
  advancePresentation(-1)
})
document.querySelector('#presentation-next').addEventListener('click', () => {
  advancePresentation()
})

presentationOverlay.addEventListener('click', (event) => {
  const clickedButton = event.composedPath().some((element) => element instanceof Element && element.matches('button'))
  if (presentationSlideRevealed || clickedButton) return
  revealPresentationChapter()
})

document.addEventListener('click', (event) => {
  if (!presentationActive || !presentationSlideRevealed || !(event.target instanceof Element)) return
  if (event.target.closest('a, button, input, select, textarea, label, .presentation-content, .presentation-controls, .presentation-close')) return
  advancePresentation()
}, true)

document.addEventListener('touchstart', (event) => {
  if (presentationActive && event.touches.length === 1) {
    presentationTouchStartY = event.touches[0].clientY
  }
}, { passive: true })

document.addEventListener('touchmove', (event) => {
  if (presentationActive && presentationTouchStartY !== null) event.preventDefault()
}, { passive: false })

document.addEventListener('touchend', (event) => {
  if (!presentationActive || presentationTouchStartY === null || event.changedTouches.length !== 1) return
  const deltaY = presentationTouchStartY - event.changedTouches[0].clientY
  presentationTouchStartY = null
  if (Math.abs(deltaY) < 35) return
  advancePresentation(deltaY > 0 ? 1 : -1)
}, { passive: true })

document.addEventListener('keydown', (event) => {
  if (!presentationActive) return
  if (event.key === 'Escape') {
    closePresentation()
  } else if (event.key === 'Tab') {
    const focusableControls = [...presentationOverlay.querySelectorAll('button:not(:disabled)')]
    const firstControl = focusableControls[0]
    const lastControl = focusableControls.at(-1)
    if (event.shiftKey && document.activeElement === firstControl) {
      event.preventDefault()
      lastControl.focus()
    } else if (!event.shiftKey && document.activeElement === lastControl) {
      event.preventDefault()
      firstControl.focus()
    }
  } else if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
    event.preventDefault()
    advancePresentation()
  } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
    event.preventDefault()
    advancePresentation(-1)
  }
})

window.addEventListener('scroll', () => {
  if (presentationActive || scrollUpdateScheduled) return
  scrollUpdateScheduled = true
  window.requestAnimationFrame(() => {
    if (presentationActive) {
      scrollUpdateScheduled = false
      return
    }
    const readingLine = window.innerHeight * 0.4
    let visibleChapterIndex = 0
    chapters.forEach((chapter, index) => {
      if (document.getElementById(chapter.id).getBoundingClientRect().top <= readingLine) {
        visibleChapterIndex = index
      }
    })
    setActiveChapter(visibleChapterIndex)
    scrollUpdateScheduled = false
  })
}, { passive: true })

window.addEventListener('wheel', (event) => {
  if (presentationActive) {
    if (event.ctrlKey || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return
    event.preventDefault()
    if (presentationWheelLocked || Math.abs(event.deltaY) < 12) return

    presentationWheelLocked = true
    window.clearTimeout(presentationWheelTimer)
    advancePresentation(event.deltaY > 0 ? 1 : -1)
    presentationWheelTimer = window.setTimeout(() => {
      presentationWheelLocked = false
    }, 750)
    return
  }
  if (event.ctrlKey || reducedMotionQuery.matches) return
  if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return
  if (event.target instanceof Element && event.target.closest('select, textarea, [contenteditable="true"]')) return

  const deltaMultiplier = event.deltaMode === WheelEvent.DOM_DELTA_LINE
    ? 16
    : event.deltaMode === WheelEvent.DOM_DELTA_PAGE
      ? window.innerHeight
      : 1
  event.preventDefault()

  const maximumScrollY = document.documentElement.scrollHeight - window.innerHeight
  if (wheelTargetY === null) wheelTargetY = window.scrollY
  wheelTargetY = Math.max(0, Math.min(maximumScrollY, wheelTargetY + event.deltaY * deltaMultiplier * 2))
  if (wheelAnimationFrame !== null) return

  const animateWheelScroll = () => {
    const remainingDistance = wheelTargetY - window.scrollY
    if (Math.abs(remainingDistance) < 0.75) {
      window.scrollTo(0, wheelTargetY)
      wheelTargetY = null
      wheelAnimationFrame = null
      return
    }

    window.scrollBy(0, remainingDistance * 0.2)
    wheelAnimationFrame = window.requestAnimationFrame(animateWheelScroll)
  }

  wheelAnimationFrame = window.requestAnimationFrame(animateWheelScroll)
}, { passive: false })

setActiveChapter(0)

const getReading = (neighborhood) => {
  const data = neighborhoods[neighborhood]
  const variation = refreshCount % 3 === 1 ? 1 : refreshCount % 3 === 2 ? -1 : 0

  return {
    ...data,
    currentTemp: data.temp + variation,
    rain: `${String(Math.max(0, data.rain + variation * 2)).padStart(2, '0')}%`,
    humidity: `${data.humidity - variation}%`,
  }
}

const updateChart = () => {
  const history = temperatureHistory[selectedNeighborhood]
  const values = selectedPeriod === 12 ? history.slice(-6) : history
  const points = values.map((value, index) => {
    const adjusted = value + (refreshCount % 3 === 1 ? 0.6 : refreshCount % 3 === 2 ? -0.5 : 0)
    const x = (index / (values.length - 1)) * 520
    const y = 118 - ((adjusted - 18) / 12) * 112
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })
  const path = `M${points.join(' L')}`
  const lastPoint = points.at(-1).split(',')[0]

  document.querySelector('#chart-line').setAttribute('d', path)
  document.querySelector('#chart-fill').setAttribute('d', `${path} L${lastPoint},132 L0,132 Z`)
  document.querySelector('#chart-times').innerHTML = selectedPeriod === 12
    ? '<span>14h</span><span>15h</span><span>16h</span><span>17h</span><span>18h</span><span>19h</span>'
    : '<span>08h</span><span>10h</span><span>12h</span><span>14h</span><span>16h</span><span>18h</span><span>20h</span>'
  chartTitle.textContent = `Temperatura nas últimas ${selectedPeriod} horas`
}

const selectNeighborhood = (neighborhood) => {
  selectedNeighborhood = neighborhood
  const data = getReading(neighborhood)
  const air = document.querySelector('#metric-air')

  neighborhoodSelect.value = neighborhood
  document.querySelector('#panel-neighborhood').textContent = `${neighborhood}, SP`
  document.querySelector('#metric-temp').textContent = `${data.currentTemp}°`
  document.querySelector('#metric-rain').textContent = data.rain
  document.querySelector('#metric-humidity').textContent = data.humidity
  air.textContent = data.air
  air.classList.toggle('air-attention', data.air === 'Atenção')
  document.querySelector('#hero-neighborhood').textContent = `${neighborhood}, São Paulo`
  document.querySelector('#hero-temp').textContent = `${data.currentTemp}°`
  document.querySelector('#hero-rain').textContent = data.rain
  document.querySelector('#hero-humidity').textContent = data.humidity
  const heroAir = document.querySelector('#hero-air')
  heroAir.textContent = data.air
  heroAir.classList.toggle('air-attention', data.air === 'Atenção')
  document.querySelector('#summary-neighborhood').textContent = neighborhood
  document.querySelector('#summary-priority').textContent = `Prioridade ${data.priority.toLowerCase()}`
  document.querySelector('#summary-priority').className = `priority-badge priority-${data.priority.toLowerCase()}`
  document.querySelector('#summary-trees').textContent = data.trees
  document.querySelector('#summary-emissions').textContent = `${data.emissions}*`

  regionButtons.forEach((button) => {
    button.classList.toggle('is-selected', button.dataset.mapRegion === neighborhood)
    if (button.classList.contains('region-card')) {
      button.setAttribute('aria-pressed', String(button.dataset.mapRegion === neighborhood))
    }
  })
  updateChart()
}

neighborhoodSelect.addEventListener('change', (event) => selectNeighborhood(event.target.value))
regionButtons.forEach((button) => {
  button.addEventListener('click', () => selectNeighborhood(button.dataset.mapRegion))
})

document.querySelectorAll('[data-priority-filter]').forEach((button) => {
  button.addEventListener('click', () => {
    const showHighPriorityOnly = button.dataset.priorityFilter === 'high'
    document.querySelectorAll('[data-priority-filter]').forEach((filter) => {
      const isActive = filter === button
      filter.classList.toggle('is-active', isActive)
      filter.setAttribute('aria-pressed', String(isActive))
    })
    document.querySelectorAll('[data-priority]').forEach((region) => {
      region.hidden = showHighPriorityOnly && region.dataset.priority !== 'high'
    })
    document.querySelector('#region-count').textContent = showHighPriorityOnly ? '1 área' : '3 áreas'
  })
})

document.querySelectorAll('[data-period]').forEach((button) => {
  button.addEventListener('click', () => {
    selectedPeriod = Number(button.dataset.period)
    document.querySelectorAll('[data-period]').forEach((periodButton) => {
      const isActive = periodButton === button
      periodButton.classList.toggle('is-active', isActive)
      periodButton.setAttribute('aria-pressed', String(isActive))
    })
    updateChart()
  })
})

document.querySelector('#refresh-demo').addEventListener('click', (event) => {
  const refreshButton = event.currentTarget
  refreshCount += 1
  selectNeighborhood(selectedNeighborhood)
  const updatedAt = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(new Date())
  document.querySelector('#last-updated').textContent = `Demonstração atualizada às ${updatedAt} · sem conexão a sensores`
  refreshButton.classList.add('is-refreshing')
  window.setTimeout(() => refreshButton.classList.remove('is-refreshing'), 450)
})

const updateChallengeProgress = () => {
  const completed = challengeChecks.filter((checkbox) => checkbox.checked).length
  const progress = document.querySelector('.progress-track')
  document.querySelector('#challenge-count').textContent = `${completed} de 3 ações`
  progress.setAttribute('aria-valuenow', String(completed))
  document.querySelector('#challenge-progress').style.width = `${(completed / challengeChecks.length) * 100}%`
}

challengeChecks.forEach((checkbox) => {
  checkbox.addEventListener('change', () => {
    checkbox.closest('.challenge-action').classList.toggle('is-complete', checkbox.checked)
    updateChallengeProgress()
  })
})

document.querySelector('#reset-challenge').addEventListener('click', () => {
  challengeChecks.forEach((checkbox) => {
    checkbox.checked = false
    checkbox.closest('.challenge-action').classList.remove('is-complete')
  })
  updateChallengeProgress()
})

document.querySelector('#event-interest').addEventListener('click', (event) => {
  const button = event.currentTarget
  const isInterested = button.getAttribute('aria-pressed') === 'true'
  button.setAttribute('aria-pressed', String(!isInterested))
  button.classList.toggle('is-interested', !isInterested)
  button.firstChild.textContent = isInterested ? 'Tenho interesse ' : 'Interesse anotado '
  document.querySelector('#event-feedback').textContent = isInterested
    ? 'Seu interesse foi removido desta demonstração.'
    : 'Interesse anotado apenas nesta sessão. O encontro é fictício.'
})

document.querySelector('#join-form').addEventListener('submit', (event) => {
  event.preventDefault()
  const email = document.querySelector('#email')
  if (!email.reportValidity()) return
  document.querySelector('#form-message').textContent = 'Obrigado por chegar junto! Esta prévia não envia nem armazena seu e-mail.'
  event.target.reset()
})

selectNeighborhood(selectedNeighborhood)
