import { ToolKey, ToolTemplate } from '../../types/tools';

export const TOOL_TEMPLATES: Record<ToolKey, ToolTemplate[]> = {
  product_canvas: [
    {
      id: 'blank',
      name: 'Em Branco',
      description: 'Estrutura limpa pronta para preenchimento.',
      data: {
        product_name: '',
        vision_goal: '',
        target_group: '',
        big_picture: '',
        metrics: '',
        product_details: '',
      },
    },
    {
      id: 'saas_b2b',
      name: 'SaaS B2B Analytics',
      description: 'Plataforma de inteligência de dados corporativa.',
      data: {
        product_name: 'DataPulse Enterprise',
        vision_goal: 'Democratizar tomada de decisão em tempo real para times de receita B2B.',
        target_group: 'Diretores de Operações, Líderes de RevOps e Analistas Sênior.',
        big_picture: '1. Integração de fontes de dados\n2. Pipeline de normalização com IA\n3. Dashboards preditivos em tempo real\n4. Alertas proativos no Slack/Teams',
        metrics: '• NRR > 120%\n• D30 Retention > 65%\n• Time-to-first-dashboard < 10 minutos',
        product_details: 'API GraphQL, Conectores Salesforce/HubSpot, Sistema RBAC com SSO SAML 2.0, Exportação PDF/CSV.',
      },
    },
    {
      id: 'mobile_b2c',
      name: 'App Mobile B2C Fintech',
      description: 'Carteira digital com foco em investimentos automatizados.',
      data: {
        product_name: 'Kite Finanças Inteligentes',
        vision_goal: 'Tornar o investimento automático tão simples quanto enviar uma mensagem.',
        target_group: 'Jovens profissionais de 22-35 anos com renda média que querem poupar sem fricção.',
        big_picture: '1. Onboarding em 2 minutos via biometria\n2. Conexão Open Finance com bancos\n3. Arredondamento automático de trocos\n4. Carteiras diversificadas automáticas',
        metrics: '• CAC < R$ 25\n• Ativação D1 > 70%\n• Volume médio investido > R$ 350/mês',
        product_details: 'App Nativo iOS/Android, Integração Bacen PIX Automático, Notificações push personalizadas, Gamificação de metas.',
      },
    },
  ],

  product_vision_board: [
    {
      id: 'blank',
      name: 'Em Branco',
      description: 'Visão, público, necessidades, produto e metas de negócio.',
      data: {
        vision: '',
        target_group: '',
        needs: '',
        product: '',
        business_goals: '',
        competitors: '',
        revenue_cost: '',
      },
    },
    {
      id: 'ai_copilot',
      name: 'AI Co-pilot de Produto',
      description: 'Assistente inteligente para times de tecnologia.',
      data: {
        vision: 'Capacitar todo Product Manager a transformar dados brutos em decisões assertivas em segundos.',
        target_group: 'Product Managers, Product Owners e Tech Leads em empresas em escala.',
        needs: '• Reduzir tempo gasto compilando anotações manuais\n• Evitar lançar features sem validação prévia de hipóteses\n• Manter rastreabilidade clara entre pesquisa e roadmap',
        product: 'Product OS com Inteligência Gemini integrada e rastreabilidade contínua de discovery.',
        business_goals: '• Atingir 10.000 PMs ativos no primeiro ano\n• Converter 12% para plano Pro\n• Reduzir ciclo de discovery dos clientes em 50%',
        competitors: 'Jira Product Discovery, Productboard, Notion, Dovetail',
        revenue_cost: 'Modelo freemium per seat com add-on de IA. Custos concentrados em infraestrutura Cloud Run e LLM API.',
      },
    },
  ],

  opportunity_solution_tree: [
    {
      id: 'blank',
      name: 'Em Branco',
      description: 'Árvore OST com nó raiz de Desired Outcome.',
      data: {
        desired_outcome: '',
        opportunities: [
          {
            id: 'opp_1',
            title: 'Oportunidade 1',
            solutions: [
              {
                id: 'sol_1_1',
                title: 'Solução 1.1',
                experiments: [{ id: 'exp_1_1_1', title: 'Experimento 1.1.1', status: 'planned' }],
              },
            ],
          },
        ],
      },
    },
    {
      id: 'retention_ost',
      name: 'Aumento de Retenção D30',
      description: 'Árvore de descoberta focada em ativação e engajamento inicial.',
      data: {
        desired_outcome: 'Aumentar a taxa de retenção D30 de 32% para 55% no próximo trimestre',
        opportunities: [
          {
            id: 'opp_1',
            title: 'Usuários desistem durante a configuração inicial do workspace',
            solutions: [
              {
                id: 'sol_1_1',
                title: 'Assistente interativo de setup com templates prontos',
                experiments: [
                  { id: 'exp_1_1_1', title: 'Teste A/B com checklist guiado vs fluxo vazio', status: 'running' },
                  { id: 'exp_1_1_2', title: '5 entrevistas de usabilidade com novos usuários', status: 'completed' },
                ],
              },
              {
                id: 'sol_1_2',
                title: 'Importador automático de dados via CSV e Trello',
                experiments: [
                  { id: 'exp_1_2_1', title: 'Fake door button para medir interesse no importador', status: 'planned' },
                ],
              },
            ],
          },
          {
            id: 'opp_2',
            title: 'Usuários não percebem o valor do relatório executivo na primeira semana',
            solutions: [
              {
                id: 'sol_2_1',
                title: 'Resumo semanal automatizado por email com insights de IA',
                experiments: [
                  { id: 'exp_2_1_1', title: 'Envio de protótipo estático por email para 50 usuários beta', status: 'running' },
                ],
              },
            ],
          },
        ],
      },
    },
  ],

  personas: [
    {
      id: 'blank',
      name: 'Em Branco',
      description: 'Perfil de persona em branco.',
      data: {
        name: '',
        role_title: '',
        segment: '',
        description: '',
        goals: '',
        pains: '',
        behaviors: '',
        jobs_to_be_done: '',
      },
    },
    {
      id: 'pm_lead',
      name: 'Mariana - Head de Produto',
      description: 'Líder de produto focada em governança, impacto e alinhamento.',
      data: {
        name: 'Mariana Silva',
        role_title: 'Head de Produto / GPM',
        segment: 'Empresas Tech B2B (Scale-up)',
        description: 'Gerencia 4 squads de produto e precisa justificar prioridades para a diretoria e investidores.',
        goals: '• Garantir que os squads construam soluções alinhadas aos OKRs da empresa\n• Apresentar relatórios executivos confiáveis com embasamento de dados\n• Eliminar achismos no roadmap',
        pains: '• Informações espalhadas em dezenas de ferramentas (Jira, Slack, Notion, Planilhas)\n• Dificuldade de demonstrar o ROI de pesquisas com clientes\n• Falta de padrão no registro de hipóteses e experimentos',
        behaviors: '• Toma decisões orientadas a métricas\n• Prefere dashboards consolidados e atualizados em tempo real\n• Fomenta autonomia dos PMs com guardrails claros',
        jobs_to_be_done: '• Consolidar o status de discovery dos squads em um único painel\n• Rastrear a linhagem desde a pesquisa até o impacto pós-lançamento\n• Facilitar sessões de priorização com a liderança',
      },
    },
  ],

  user_journey_map: [
    {
      id: 'blank',
      name: 'Em Branco',
      description: 'Mapa de jornada do usuário com 5 estágios.',
      data: {
        stages: [
          { stage: 'Descoberta', goal: '', actions: '', thoughts: '', pain_points: '', emotion: 'neutral', opportunities: '' },
          { stage: 'Onboarding', goal: '', actions: '', thoughts: '', pain_points: '', emotion: 'neutral', opportunities: '' },
          { stage: 'Uso Diário', goal: '', actions: '', thoughts: '', pain_points: '', emotion: 'positive', opportunities: '' },
          { stage: 'Suporte/Resolução', goal: '', actions: '', thoughts: '', pain_points: '', emotion: 'negative', opportunities: '' },
          { stage: 'Renovação/Expansão', goal: '', actions: '', thoughts: '', pain_points: '', emotion: 'positive', opportunities: '' },
        ],
      },
    },
    {
      id: 'saas_onboarding_journey',
      name: 'Jornada de Adoção de Software',
      description: 'Jornada de primeiro uso e ativação de ferramenta B2B.',
      data: {
        stages: [
          {
            stage: '1. Descoberta & Cadastro',
            goal: 'Encontrar uma ferramenta para organizar o fluxo de produto',
            actions: 'Acessa a landing page, clica em criar conta com Google SSO',
            thoughts: 'Será que é fácil de usar ou vou precisar de treinamento demorado?',
            pain_points: 'Excesso de campos no formulário de boas-vindas',
            emotion: 'neutral',
            opportunities: 'Permitir entrada rápida com 1 clique e workspace de exemplo pré-carregado',
          },
          {
            stage: '2. Primeiro Acesso (Setup)',
            goal: 'Criar o primeiro projeto e convidar os colegas de time',
            actions: 'Navega pelas abas de pesquisa, problemas e roadmap',
            thoughts: 'Por onde começo? Há muitas opções disponíveis.',
            pain_points: 'Sensação de tela vazia ("cold start problem")',
            emotion: 'negative',
            opportunities: 'Oferecer tour guiado interativo e biblioteca de templates rápidos',
          },
          {
            stage: '3. Execução do Discovery',
            goal: 'Registrar entrevistas de clientes e priorizar oportunidades',
            actions: 'Cola anotações de entrevistas, gera problemas com auxílio de IA',
            thoughts: 'Excelente! A IA estruturou os achados em segundos.',
            pain_points: 'Ajustar filtros de priorização pode ser confuso no início',
            emotion: 'positive',
            opportunities: 'Salvar presets de priorização (RICE padrão ou customizado)',
          },
          {
            stage: '4. Alinhamento com Stakeholders',
            goal: 'Apresentar o Roadmap no comitê de produto',
            actions: 'Exporta a visão executiva e compartilha link com diretores',
            thoughts: 'A liderança adorou a rastreabilidade entre o problema e a entrega.',
            pain_points: 'Formatação em PDF cortava algumas colunas',
            emotion: 'positive',
            opportunities: 'Adicionar modo de apresentação executiva em tela cheia',
          },
          {
            stage: '5. Renovação e Expansão',
            goal: 'Expandir o uso para outros squads da empresa',
            actions: 'Solicita upgrade de plano com múltiplos workspaces',
            thoughts: 'Tornou-se a ferramenta central da nossa operação de produto.',
            pain_points: 'Negociação com time de procurement/compras',
            emotion: 'positive',
            opportunities: 'Oferecer faturamento corporativo consolidado e SSO corporativo',
          },
        ],
      },
    },
  ],

  jtbd: [
    {
      id: 'blank',
      name: 'Em Branco',
      description: 'Framework Jobs To Be Done.',
      data: {
        situation: 'Quando [situação/contexto]...',
        motivation: 'Eu quero [ação/motivação central]...',
        desired_outcome: 'Para que eu possa [resultado esperado/transformação]...',
        functional_job: '',
        emotional_job: '',
        social_job: '',
        pain_points: '',
        evidence: '',
      },
    },
    {
      id: 'discovery_pm',
      name: 'PM estruturando Discovery',
      description: 'JTBD de um PM precisando justificar decisões com dados.',
      data: {
        situation: 'Quando estou preparando a priorização do próximo trimestre com a liderança...',
        motivation: 'Eu quero comprovar com evidências reais de clientes por que determinados problemas foram escolhidos...',
        desired_outcome: 'Para que eu possa obter aprovação rápida de budget e manter os engenheiros motivados com o propósito da entrega.',
        functional_job: 'Mapear evidências qualitativas diretamente às oportunidades priorizadas e gerar score RICE.',
        emotional_job: 'Sentir segurança e confiança de que não estou desperdiçando tempo de engenharia com suposições.',
        social_job: 'Ser reconhecido pela liderança e pares como um Product Manager estratégico e rigoroso.',
        pain_points: 'Evidências perdidas em documentos isolados e reuniões que se transformam em discussões de opinião.',
        evidence: 'Pesquisa com 18 PMs: 85% relataram dificuldade em defender prioridades sem histórico estruturado.',
      },
    },
  ],

  problem_statement: [
    {
      id: 'blank',
      name: 'Em Branco',
      description: 'Estruturação formal de declaração de problema.',
      data: {
        who: '',
        problem: '',
        context: '',
        frequency_level: 'frequent',
        impact_level: 'high',
        evidence: '',
        current_alternatives: '',
        why_it_matters: '',
        desired_outcome: '',
      },
    },
    {
      id: 'onboarding_drop',
      name: 'Abandono no Onboarding de Pagamentos',
      description: 'Problema crítico de conversão no checkout.',
      data: {
        who: 'Novos clientes de e-commerce tentando configurar o gateway de pagamento pela primeira vez.',
        problem: 'Usuários desistem do cadastro devido à complexidade da validação de documentos fiscais.',
        context: 'Durante o passo 3 do onboarding de credenciamento bancário.',
        frequency_level: 'constant',
        impact_level: 'critical',
        evidence: 'Dados de telemetria apontam 42% de churn no passo de upload de contrato social (N=1.200/mês).',
        current_alternatives: 'Envio manual de documentos por email para o time de compliance, demorando até 72h.',
        why_it_matters: 'Representa uma perda estimada de R$ 180.000 em receita recorrente anual (ARR).',
        desired_outcome: 'Validação automática e instantânea via integração com a Receita Federal em menos de 30 segundos.',
      },
    },
  ],

  value_proposition_canvas: [
    {
      id: 'blank',
      name: 'Em Branco',
      description: 'Customer Profile x Value Map.',
      data: {
        customer_jobs: '',
        customer_pains: '',
        customer_gains: '',
        products_services: '',
        pain_relievers: '',
        gain_creators: '',
      },
    },
    {
      id: 'discovery_platform',
      name: 'Plataforma de Product OS',
      description: 'Proposta de valor para ferramentas de gestão de produto.',
      data: {
        customer_jobs: '• Coletar feedback de clientes\n• Priorizar backlog com critérios claros\n• Alinhar time de engenharia e negócios\n• Medir resultados pós-lançamento',
        customer_pains: '• Decisões tomadas na base do "achismo"\n• Retrabalho em features que ninguém usa\n• Falta de tempo para documentação detalhada',
        customer_gains: '• Visibilidade ponta a ponta do discovery\n• Agilidade com resumos gerados por IA\n• Autonomia para os squads de produto',
        products_services: '• Product OS Discovery Engine\n• AI Product Coach em tempo real\n• Toolkit com 15 canvases interativos',
        pain_relievers: '• Rastreabilidade nativa de ponta a ponta\n• Detecção de dados insuficientes e riscos\n• Elimina silos entre pesquisa e roadmap',
        gain_creators: '• Aumento de 3x na velocidade de discovery\n• Apresentações executivas prontas em 1 clique\n• Alinhamento estratégico perfeito com OKRs',
      },
    },
  ],

  rice_prioritization: [
    {
      id: 'blank',
      name: 'Em Branco',
      description: 'Matriz RICE para priorização de iniciativas.',
      data: {
        items: [
          { id: '1', name: 'Iniciativa 1', reach: 500, impact: 3, confidence: 80, effort: 2, score: 600, notes: '' },
          { id: '2', name: 'Iniciativa 2', reach: 1200, impact: 4, confidence: 70, effort: 4, score: 840, notes: '' },
        ],
      },
    },
    {
      id: 'quarterly_prioritization',
      name: 'Priorização de Q3 - Scale-up',
      description: 'Exemplo real com 4 iniciativas avaliadas.',
      data: {
        items: [
          { id: '1', name: 'Onboarding com Google SSO', reach: 2500, impact: 4, confidence: 90, effort: 2, score: 4500, notes: 'Impacto alto na conversão e esforço muito baixo de implementação.' },
          { id: '2', name: 'Exportação Avançada em PDF Executivo', reach: 800, impact: 3, confidence: 85, effort: 1, score: 2040, notes: 'Quick win solicitado pelos diretores de produto.' },
          { id: '3', name: 'Integração Nativa com Jira e GitHub', reach: 1500, impact: 5, confidence: 75, effort: 5, score: 1125, notes: 'Muito estratégico, mas consome 2 sprints inteiras do squad.' },
          { id: '4', name: 'Modo Escuro / Customização de Tema', reach: 1200, impact: 2, confidence: 95, effort: 2, score: 1140, notes: 'Melhoria de conforto visual para usuários assíduos.' },
        ],
      },
    },
  ],

  impact_effort_matrix: [
    {
      id: 'blank',
      name: 'Em Branco',
      description: 'Matriz 2x2 Impacto vs Esforço.',
      data: {
        quick_wins: [],
        major_projects: [],
        fill_ins: [],
        thankless_tasks: [],
      },
    },
    {
      id: 'sprint_planning',
      name: 'Priorização de Sprint de Melhorias',
      description: 'Distribuição em 4 quadrantes para decisão rápida.',
      data: {
        quick_wins: [
          'Atalhos de teclado (Ctrl+K para busca global)',
          'Auto-save em tempo real nos canvases',
          'Feedback visual de toast ao salvar',
        ],
        major_projects: [
          'Motor de IA com recomendações de Product Coach',
          'Rastreabilidade completa de linhagem de discovery',
          'Sistema multi-tenant com papéis RBAC e auditoria',
        ],
        fill_ins: [
          'Ajuste fino de paleta de cores Zinc e Militar',
          'Ícones contextuais no menu lateral',
          'Tooltips informativas nos campos técnicos',
        ],
        thankless_tasks: [
          'Reescrita completa do motor CSS em styled-components',
          'Suporte a navegadores legados (Internet Explorer)',
        ],
      },
    },
  ],

  assumption_map: [
    {
      id: 'blank',
      name: 'Em Branco',
      description: 'Matriz 2x2 Importância vs Incerteza.',
      data: {
        critical_hypotheses: [],
        important_knowns: [],
        low_priority_risks: [],
        unimportant_knowns: [],
      },
    },
    {
      id: 'discovery_risks',
      name: 'Mapeamento de Riscos de Produto',
      description: 'Identificação de hipóteses críticas que precisam de teste imediato.',
      data: {
        critical_hypotheses: [
          'Os usuários estão dispostos a pagar R$ 99/mês pelo módulo de IA',
          'A taxa de conversão aumentará se simplificarmos o formulário para 2 passos',
          'O time de engenharia consegue integrar a API em menos de 1 semana',
        ],
        important_knowns: [
          'A segurança de dados e conformidade LGPD são obrigatórias para clientes Enterprise',
          'O sistema precisa operar com latência inferior a 300ms',
        ],
        low_priority_risks: [
          'Os usuários preferem notificações via WhatsApp em vez de Email',
          'O layout pode precisar de customização com a marca do cliente (White-label)',
        ],
        unimportant_knowns: [
          'Usuários preferem login por email ou senha em vez de magic link',
        ],
      },
    },
  ],

  experiment_canvas: [
    {
      id: 'blank',
      name: 'Em Branco',
      description: 'Desenho de teste e experimentação.',
      data: {
        hypothesis: '',
        assumption: '',
        target_user: '',
        problem: '',
        experiment_type: 'Teste A/B',
        success_criteria: '',
        expected_result: '',
        evidence_needed: '',
        timebox: '2 semanas',
        result: '',
        learning: '',
        decision: 'pending',
      },
    },
    {
      id: 'checkout_experiment',
      name: 'Teste de Redução de Fricção no Checkout',
      description: 'Experimento para validar aumento de conversão.',
      data: {
        hypothesis: 'Se removermos o campo de telefone obrigatório no checkout, a taxa de finalização aumentará.',
        assumption: 'Os clientes desistem da compra por receio de receber ligações promocionais indesejadas.',
        target_user: 'Visitantes de primeira viagem no e-commerce.',
        problem: 'Abandono de carrinho de 58% na etapa de dados pessoais.',
        experiment_type: 'Teste A/B com divisão de tráfego 50/50',
        success_criteria: 'Aumento estatisticamente significativo (p < 0.05) de no mínimo 10% na taxa de conversão final.',
        expected_result: 'Conversão subindo de 2.4% para 2.9% no grupo variante.',
        evidence_needed: 'Mínimo de 3.000 sessões em cada variante.',
        timebox: '14 dias corridos',
        result: 'Grupo B (sem telefone) atingiu 3.1% de conversão (+29% de uplift com 99% de confiança estatística).',
        learning: 'O telefone era a maior barreira de entrada para clientes novos. Telefone pode ser solicitado posteriormente na entrega.',
        decision: 'accepted',
      },
    },
  ],

  decision_canvas: [
    {
      id: 'blank',
      name: 'Em Branco',
      description: 'Registro executivo de tomada de decisão.',
      data: {
        decision: '',
        context: '',
        problem_addressed: '',
        options_evaluated: '',
        evidence_data: '',
        trade_offs: '',
        risks_mitigations: '',
        recommendation: '',
        expected_outcome: '',
        owner: '',
        review_date: '',
      },
    },
    {
      id: 'tech_decision',
      name: 'Aprovação do Novo Fluxo de Onboarding',
      description: 'Decisão estratégica de produto após validação por experimentos.',
      data: {
        decision: 'Aprovar o lançamento global do Onboarding Simplificado com Inteligência Artificial.',
        context: 'Após 3 semanas de testes A/B que comprovaram aumento de 40% na ativação D1.',
        problem_addressed: 'Usuários não configuravam o primeiro projeto na primeira sessão.',
        options_evaluated: 'Opção 1: Manter fluxo antigo com melhorias de texto\nOpção 2: Adicionar vídeo tutorial\nOpção 3: Substituir por setup interativo com IA (Vencedora)',
        evidence_data: 'Experimento EXP-042 validou que 78% dos usuários completaram o setup na Opção 3 vs 35% no fluxo antigo.',
        trade_offs: 'Maior custo de inferência de IA (~$0.02 por onboarding), amplamente compensado pelo aumento do LTV.',
        risks_mitigations: 'Risco de falha na API de IA: implementar fallback heurístico instantâneo sem travar a interface.',
        recommendation: 'Efetuar rollout gradual de 100% para novos cadastros a partir da próxima terça-feira.',
        expected_outcome: 'Taxa de ativação D1 consolidada acima de 65% em 30 dias.',
        owner: 'Mariana Silva (Head de Produto)',
        review_date: 'Revisão de métricas em 30 dias pós-rollout',
      },
    },
  ],

  story_map: [
    {
      id: 'blank',
      name: 'Em Branco',
      description: 'Story mapping com atividades, tarefas e fatias de release.',
      data: {
        activities: [
          {
            id: 'act_1',
            name: 'Atividade 1',
            tasks: [
              {
                id: 'task_1_1',
                name: 'Passo 1.1',
                mvp_stories: ['História 1.1 (MVP)'],
                release_1_stories: ['História 1.2 (Release 1)'],
                release_2_stories: [],
              },
            ],
          },
        ],
      },
    },
    {
      id: 'ecommerce_story_map',
      name: 'Fluxo de Compra e Checkout',
      description: 'Story map dividido em MVP, Release 1 e Release 2.',
      data: {
        activities: [
          {
            id: 'act_1',
            name: '1. Buscar Produtos',
            tasks: [
              {
                id: 'task_1',
                name: 'Pesquisar por texto',
                mvp_stories: ['Campo de busca com correspondência exata'],
                release_1_stories: ['Auto-complete e sugestões'],
                release_2_stories: ['Busca por imagem e voz'],
              },
              {
                id: 'task_2',
                name: 'Filtrar resultados',
                mvp_stories: ['Filtro básico por categoria e preço'],
                release_1_stories: ['Filtros múltiplos simultâneos e ordenação'],
                release_2_stories: ['Filtro inteligente baseado em preferências'],
              },
            ],
          },
          {
            id: 'act_2',
            name: '2. Carrinho & Checkout',
            tasks: [
              {
                id: 'task_3',
                name: 'Revisar itens',
                mvp_stories: ['Visualizar lista e alterar quantidade'],
                release_1_stories: ['Salvar para depois / Favoritos'],
                release_2_stories: ['Sugestão de cross-sell no carrinho'],
              },
              {
                id: 'task_4',
                name: 'Efetuar Pagamento',
                mvp_stories: ['Pagamento com Cartão de Crédito e PIX'],
                release_1_stories: ['Salvar cartão tokenizado'],
                release_2_stories: ['Apple Pay e Google Pay com 1 clique'],
              },
            ],
          },
          {
            id: 'act_3',
            name: '3. Acompanhamento',
            tasks: [
              {
                id: 'task_5',
                name: 'Status do Pedido',
                mvp_stories: ['Email com código de rastreio'],
                release_1_stories: ['Página interativa de status do pedido'],
                release_2_stories: ['Notificações em tempo real via WhatsApp'],
              },
            ],
          },
        ],
      },
    },
  ],

  lean_canvas: [
    {
      id: 'blank',
      name: 'Em Branco',
      description: 'Lean Canvas clássico de 9 blocos.',
      data: {
        problem: '',
        solution: '',
        unique_value: '',
        unfair_advantage: '',
        customer_segments: '',
        key_metrics: '',
        channels: '',
        cost_structure: '',
        revenue_streams: '',
      },
    },
    {
      id: 'product_os_lean',
      name: 'Product OS Platform',
      description: 'Lean Canvas da plataforma de Product Discovery & Intelligence.',
      data: {
        problem: '1. Decisões tomadas no escuro sem dados\n2. Ferramentas desconectadas geram silos\n3. Falta de rastreabilidade entre pesquisa e roadmap',
        solution: '1. Sistema integrado de Discovery Contínuo\n2. AI Product Coach com rigor metodológico\n3. Canvases interativos com link direto ao ciclo',
        unique_value: 'O primeiro sistema operacional de produto que une discovery contínuo, inteligência artificial e governança em um único fluxo.',
        unfair_advantage: 'Motor de linhagem ponta a ponta (Pesquisa → Evidência → Problema → Oportunidade → Hipótese → Experimento → Decisão → Roadmap → Impacto).',
        customer_segments: '• Heads e VPs de Produto em Scale-ups\n• Product Managers e Product Owners\n• Consultorias e Agências de Produto',
        key_metrics: '• Taxa de conversão de experimentos em decisões\n• Discovery Health Score\n• Retenção semanal de PMs ativos',
        channels: '• Conteúdo e comunidade de Product Management\n• Indicação boca a boca e product-led growth (PLG)\n• Demonstrações guiadas para contas Enterprise',
        cost_structure: '• Infraestrutura em Cloud Run e Banco de Dados\n• Custos de inferência de IA Gemini\n• Engenharia e suporte ao cliente',
        revenue_streams: '• Assinatura SaaS Freemium (Plano Starter Grátis)\n• Plano Pro ($29/usuário/mês)\n• Plano Enterprise customizado com SSO e segurança avançada',
      },
    },
  ],

  empathy_map: [
    {
      id: 'blank',
      name: 'Em Branco',
      description: 'Mapa de empatia com 6 quadrantes: Diz, Pensa, Faz, Sente, Dores e Ganhos.',
      data: {
        says: '',
        thinks: '',
        does: '',
        feels: '',
        pains: '',
        gains: '',
      },
    },
    {
      id: 'pm_lead',
      name: 'Product Manager Sênior',
      description: 'Mapa de empatia de um PM liderando times ágeis em scale-up.',
      data: {
        says: '• "Preciso consolidar as anotações das 10 entrevistas com clientes até amanhã"\n• "A diretoria quer ver o impacto do roadmap no faturamento"',
        thinks: '• "Será que estamos priorizando a coisa certa?"\n• "Gostaria que os desenvolvedores entendessem o contexto da dor do usuário"',
        does: '• Passa 15 horas por semana montando slides e planilhas manuais\n• Conduz entrevistas com clientes e grava no Loom',
        feels: '• Sobrecarga com reuniões e desalinhamentos\n• Empolgação quando um teste A/B valida a hipótese',
        pains: '• Informações espalhadas em 5 ferramentas diferentes\n• Pressão por prazos de entrega em detrimento de valor',
        gains: '• Clareza estratégica e aprovação rápida com stakeholders\n• Produto com alta retenção e clientes satisfeitos',
      },
    },
  ],

  product_strategy: [
    {
      id: 'blank',
      name: 'Em Branco',
      description: 'Estratégia de produto: Visão, Mercado-Alvo, Problema, Apostas, Diferenciais e Métricas.',
      data: {
        vision: '',
        target_market: '',
        problem_focus: '',
        strategic_bets: '',
        differentiators: '',
        metrics_and_outcomes: '',
      },
    },
    {
      id: 'scaleup_saas',
      name: 'Estratégia Scale-up B2B',
      description: 'Posicionamento estratégico para produto SaaS de média/alta maturidade.',
      data: {
        vision: 'Capacitar times de tecnologia a tomarem decisões 10x mais rápidas com dados e evidências conectadas.',
        target_market: 'Scale-ups B2B de 50 a 500 colaboradores com múltiplos squads de desenvolvimento.',
        problem_focus: 'Desconexão entre descoberta de problemas e entrega de código. Features construídas sem validação geram desperdício de engenharia.',
        strategic_bets: '• Aposta 1: Motor de Inteligência Artificial para análise de entrevistas em tempo real\n• Aposta 2: Linhagem ponta a ponta com rastreabilidade estrita\n• Aposta 3: Toolkit independente com exportação e autosave',
        differentiators: '• Único com governança de decisões integrada\n• AI Coach com rigor metodológico baseado nos 5 pilares\n• Funciona tanto como fluxo guiado quanto como ferramentas isoladas',
        metrics_and_outcomes: '• NRR > 125%\n• Discovery Health Score médio > 85%\n• Redução de 60% no tempo de ciclo da ideia ao roadmap',
      },
    },
  ],

  prd_canvas: [
    {
      id: 'blank',
      name: 'Em Branco',
      description: 'PRD profissional completo com 10 seções estruturadas.',
      data: {
        context_and_overview: '',
        problem_statement: '',
        objectives: '',
        non_objectives: '',
        target_users: '',
        user_stories: '',
        functional_requirements: '',
        non_functional_requirements: '',
        business_rules: '',
        acceptance_criteria: '',
        success_metrics: '',
        dependencies_and_risks: '',
        open_questions: '',
      },
    },
    {
      id: 'export_prd',
      name: 'PRD: Módulo de Exportação Executiva',
      description: 'Documento de requisitos completo para exportação e relatórios.',
      data: {
        context_and_overview: 'Os líderes de produto precisam compartilhar artefatos e relatórios com a diretoria sem dar acesso de edição à ferramenta.',
        problem_statement: 'Atualmente, os PMs gastam horas tirando screenshots e formatando slides no PowerPoint para apresentar em reuniões de comitê.',
        objectives: '• Permitir exportação em 1 clique em PDF, Markdown e cópia limpa\n• Fornecer layout executivo padronizado para apresentações',
        non_objectives: '• Não haverá edição colaborativa em tempo real na V1\n• Não haverá envio agendado por email na primeira release',
        target_users: '• Product Managers, Tech Leads e Executivos (CPO, VP de Engenharia)',
        user_stories: '• Como PM, quero exportar o canvas em PDF formatado para anexar ao relatório da reunião de diretoria\n• Como Tech Lead, quero copiar o PRD em Markdown para incluir na issue do Jira',
        functional_requirements: '• RF01: Botão de exportação acessível no header da ferramenta\n• RF02: Opção de cópia do Markdown formatado para a área de transferência\n• RF03: Suporte a impressão direta via browser (Ctrl+P / Cmd+P)',
        non_functional_requirements: '• RNF01: Geração de Markdown em menos de 50ms no client-side\n• RNF02: Compatibilidade com impressoras e visualizadores de PDF em layout A4',
        business_rules: '• RN01: Qualquer perfil autenticado com acesso ao workspace pode exportar dados\n• RN02: Não deve incluir chaves de API ou dados sensíveis de infraestrutura nos relatórios',
        acceptance_criteria: '• Dado que o usuário clica em "Exportar Markdown", quando colar o texto, então a estrutura deve conter títulos e listas corretas\n• Dado que o usuário aciona impressão, então a barra de ferramentas superior deve ser oculta no layout impresso',
        success_metrics: '• 500+ exportações na primeira semana pós-lançamento\n• NPS da funcionalidade > 80',
        dependencies_and_risks: '• Nenhuma dependência crítica de backend para geração de Markdown client-side',
        open_questions: '• No futuro, devemos suportar templates corporativos com logo customizada da empresa?',
      },
    },
  ],
};
