**UNIVERSIDADE POSITIVO**

**BACHARELADO EM ENGENHARIA DE SOFTWARE E ENGENHARIA DA COMPUTAÇÃO**

GABRIEL DIAS PEIXOTO
GABRIEL LEINEKER WOLFF
HENDREW GUSTAVO CARVALHO DOS SANTOS
JOÃO ADOLFO BONATO MALDONADO
VINICIUS STADLER FERREIRA
VITOR HENRIQUE CAMILLO

**DESENVOLVIMENTO DO CONECTAÍ: PLATAFORMA SOCIAL PARA CRIAÇÃO E DESCOBERTA DE EVENTOS**

**CURITIBA**

**2025**

**GABRIEL DIAS PEIXOTO**
**GABRIEL LEINEKER WOLFF**
**HENDREW GUSTAVO CARVALHO DOS SANTOS**
**JOÃO ADOLFO BONATO MALDONADO**
**VINICIUS STADLER FERREIRA**
**VITOR HENRIQUE CAMILLO**

**DESENVOLVIMENTO DO CONECTAÍ: PLATAFORMA SOCIAL PARA CRIAÇÃO E DESCOBERTA DE EVENTOS**

Trabalho apresentado como requisito parcial na disciplina de Trabalho de Conclusão de Curso I da Universidade Positivo para obtenção do grau de Bacharel em Engenharia de Software e Engenharia da Computação.

Orientador: Prof. Josemar Luís Felix

**CURITIBA**

**2025**

**RESUMO**

	Esse trabalho de conclusão de curso tem como objetivo documentar o desenvolvimento de uma plataforma social focada em eventos, que será disponibilizada de forma web e mobile e terá como funcionalidades a capacidade de usuários descobrirem, criarem e participarem de eventos em regiões de interesse e cidades próximas. A plataforma tem como objetivo facilitar a descoberta de eventos locais e promover interações sociais com base em interesses comuns, disponibilizando ferramentas robustas para organizadores de eventos e também para os frequentadores.

	A plataforma contará com um feed social personalizado baseado na rede de amigos do usuário, um mapa de calor em tempo real demonstrando onde está concentrado o maior público, um sistema de geolocalização com filtros avançados, compartilhamento entre plataformas e um modelo premium, com funcionalidades extras e aprimoradas para estabelecimentos.

**Palavras-chave:** evento; rede social; interação social; geolocalização; modelo freemium; mobile-first; descoberta de eventos.

**ABSTRACT**

This final course project aims to document the development of a social platform focused on events, which will be available on web and mobile devices and will allow users to discover, create, and participate in events in regions of interest and nearby cities. The platform aims to facilitate the discovery of local events and promote social interactions based on common interests, providing robust tools for both event organizers and interested participants and users.

The platform will feature a personalized social feed based on the user's network of friends, a real-time heat map showing where the largest audience is concentrated, a geolocation system with advanced filters, cross-platform sharing, and a freemium model with extra and enhanced features for establishments.

**Keywords:** event; social network; social interaction; geolocation; freemium model; mobile-first; real-time heatmap**.**



**LISTA DE  TABELAS**

Tabela 1 \- Comparação de Funcionalidades das Principais Plataformas................. 21 Tabela 2 \- Fluxo principal do UC001..................................................................... 47 Tabela 3 \- Fluxo alternativo A1 do UC001............................................................... 48 Tabela 4 \- Fluxo alternativo A2 do UC001............................................................... 48 Tabela 5 \- Fluxo de exceção E1 do UC001............................................................... 48 /Tabela 6 \- Fluxo principal do UC002....................................................................... 50 Tabela 7 \- Fluxo alternativo A1 do UC002............................................................... 50 Tabela 8 \- Fluxo alternativo A2 do UC002............................................................... 51 Tabela 9 \- Fluxo de exceção E1 do UC002............................................................... 51 Tabela 10 \- Fluxo principal do UC003..................................................................... 53 Tabela 11 \- Fluxo alternativo A1 do UC003............................................................. 53 Tabela 12 \- Fluxo de exceção E1 do UC003............................................................. 53 Tabela 13 \- Fluxo principal UC004........................................................................... 55 Tabela 14 \- Fluxo alternativo A1 do UC004............................................................. 55 Tabela 15 \- Fluxo alternativo A2 do UC004............................................................. 56 Tabela 16 \- Fluxo de exceção E1 do UC004............................................................. 56 Tabela 17 \- Fluxo principal do UC005..................................................................... 58 Tabela 18 \- Fluxo alternativo A1 do UC005............................................................. 58 Tabela 19 \- Fluxo alternativo A2 do UC005............................................................... 58

**LISTA DE  ILUSTRAÇÕES**

Figura 1 \- Protótipo de tela de cadastro.............................................................. 49 Figura 2 \- Protótipo de tela de criação de eventos................................................... 56 Figura 3 \- Protótipo de tela de mapa de eventos...................................................... 54 Figura 4 \- Protótipo de tela painel de moderação.................................................... 57 Figura 5 \- Protótipo de tela painel de moderação 2................................................. 57 Figura 6 \- Protótipo de tela de denúncia de conteúdo............................................. 59 Figura 7 \- Diagrama de Casos de Uso (Usuário).................................................... 68 Figura 8 \- Diagrama de Classes........................................................................... 69 Figura 9 \- Diagrama de Sequência “Criar Evento”.................................................. 70 Figura 10 \- Diagrama de Entidade e Relacionamento (DER)................................... 71

**SUMÁRIO**

### **1 INTRODUÇÃO…………………………………………………………………………….7**

### **1.1 Contextualização………………………………………………………………………7**

### **1.2 Problema de Pesquisa………………………………………………………………..8**

### **1.3 Justificativa……………………………………………………………………………..9**

### **1.4 Objetivos……………………………………………………………………………….11**

### 1.4.1 Objetivo Geral……………………………………..………………………………….11

### 1.4.2 Objetivos Específicos………………………………………………………………..11

### **2 METODOLOGIA………………………………………………………………………….13**

### **2.1 Caracterização da Pesquisa………………………………………………………..13**

### **2.2 Etapas da Pesquisa…………………………………………………………………..12**

### 2.2.1 Fase 1 \- Levantamento Bibliográfico e Contextualização……………………….13

### 2.2.2 Fase 2 \- Análise de Requisitos………………………………………………….….14

### 2.2.3 Fase 3 \- Especificação e Modelagem do Sistema……………………………….14

### 2.2.4 Fase 4 \- Prototipação de Interfaces…………………………………………….….15

### **2.3 Critérios de Avaliação……………………………………………………………….16**

### **2.4 Limitações da Metodologia…………………………………………………………16**

### **3 FUNDAMENTAÇÃO TEÓRICA / REVISÃO DE LITERATURA……………………18**

### **3.1 Plataformas de Eventos: Panorama e Análise Comparativa…………………13**

### 3.1.1 Meetup: Pioneirismo em Eventos Baseados em Comunidade………………....18

### 3.1.2 Eventbrite: Líder Global em Ticketing……………………………………………..19

### 3.1.3 Sympla: Liderança no Mercado Brasileiro………………………………………..20

### 3.1.4 Análise Comparativa……………………………….……………………………….21

### **3.2 Tecnologias de Geolocalização em Aplicações Móveis…………………….…23**

### 3.2.1 Conceitos Fundamentais de Geolocalização……………………………………..23

### 3.2.2 Tecnologias de Posicionamento…………………………………………………....23

### 3.2.3 APIs e Plataformas de ……………………………………………………………...24

### 3.2.4 Aplicações e Casos de Uso………………………………………………………...25

### 3.2.5 Desafios Técnicos e de Implementação……………………………………….….25

### **3.3 Privacidade e Proteção de Dados: LGPD Aplicada à Geolocalização….…..26**

### 3.3.1 LGPD e Dados de Localização…………………………………….……...……….26

### 3.3.2 Princípios Fundamentais para Conformidade……………………………….……26

### 3.3.3 Obrigações do Controlador de Dados……………………………………………..27

### 3.3.4 Direitos dos Titulares.………………………………………………………….........27

### 3.3.5 Dados Anonimizados……………………………………………………………..…27

### 3.3.6 Implementação Prática em Aplicações de Eventos……………………………...28

### **3.4 Modelos de Monetização: Estratégia Freemium………………………………..28**

### 3.4.1 Conceito e Fundamentos……………………………………………………………28

### 3.4.2 Estratégias de Implementação……………………………………………………..29

### 3.4.3 Cases de Sucesso…………………………………………………………………...29

### 3.4.4 Vantagens do Modelo Freemium…………………………………………………..30

### 3.4.5 Desafios e Considerações………………………………………………………….30

### 3.4.6 Monetização Complementar………………………………………………...……...31

### 3.4.7 Aplicabilidade ao Contexto de Plataformas de Eventos…………………………31

### **3.5 Síntese e Posicionamento do Trabalho…………………………………………..32**

### **4 ESPECIFICAÇÃO TÉCNICA……………………………………..….…………………34**

### **4.1 Tecnologias……………………………………………………………………………34**

### **4.2 Especificação e Modelagem………………………………………………………..37**

### 4.2.1 Requisitos Funcionais……………………………………………………………….37

### 4.2.2 Requisitos Não Funcionais………………………………………………………….41

### **4.3 Stack Tecnológica Sugerida………………………………………………………..44**

### **5 CASOS DE USO…………………………………………………………………………46**

### **6 HISTÓRIAS DE USUÁRIO……………………………………………………………...60**

### **7 ESTRUTURA DE DIAGRAMAS………………………………………………………..68**

### **7.1 Diagrama de Casos de Uso…………………………………………………………68**

### **7.2 Diagrama de Classes (Estrutura Principal)………………………………………69**

### **7.3 Diagrama de Sequência.…………………………………………………………….70**

### **8 MODELO DE DADOS (ESTRUTURA INICIAL)………………………………..…….71**

### **9 CRONOGRAMA SUGERIDO (ADAPTÁVEL)…………………………..…………....72**

### **10 MÉTRICAS DE SUCESSO……………………………………………………………73**

### **11 RISCOS E MITIGAÇÕES………………………………………………………..….…74**

### **12 PRÓXIMOS PASSOS…………...……………………………………………..….…...75**

### **13 CONCLUSÃO……………………………………………………………………...……76**

### **13.1 Considerações Finais………………………………………………………………78**

### **REFERÊNCIAS………………………………………………………………………...…..80**

#

## **1\. INTRODUÇÃO**

## **1.1 Contextualização**

As redes sociais transformaram profundamente a forma como as pessoas se conectam, comunicam e organizam suas vidas sociais. Desde o surgimento do Facebook em 2004, essas plataformas têm desempenhado papel central na organização de encontros presenciais, possibilitando a criação, divulgação e descoberta de eventos de diversos portes e naturezas. Durante anos, a funcionalidade de eventos do Facebook serviu como principal ferramenta para que usuários descobrissem acontecimentos em suas regiões, criassem convites e compartilhassem experiências com suas redes de contatos.

Entretanto, mudanças no comportamento do público jovem e nas estratégias das plataformas digitais têm alterado significativamente esse cenário. O Facebook, ao expandir suas funcionalidades e redirecionar seu algoritmo para privilegiar outros tipos de conteúdo, observou um distanciamento expressivo do público mais jovem. Segundo pesquisa BrandVue Media (CASSIDY, 2024), três em cada quatro usuários da Geração Z demonstraram disposição para abandonar o Facebook, evidenciando uma desconexão entre as ofertas da plataforma e as expectativas desse público. Este afastamento deixou uma lacuna crítica: o público jovem perdeu sua principal ferramenta digital para descoberta e organização de eventos sociais, migrando para plataformas como TikTok, Instagram e Snapchat que, embora populares, não foram projetadas especificamente para este propósito.

Paralelamente, o setor de eventos presenciais no Brasil tem apresentado crescimento robusto no período pós-pandemia. De acordo com dados da Associação Brasileira dos Promotores de Eventos (Abrape), o setor registrou crescimento de 105% no faturamento em relação a 2019, superando os números pré-pandemia (ALMEIDA, 2024). Este crescimento demonstra não apenas a recuperação do setor, mas uma demanda reprimida por experiências presenciais e conexões autênticas, especialmente entre o público jovem que passou por longos períodos de isolamento social e busca ativamente oportunidades de reconexão presencial.

## **1.2 Problema de Pesquisa**

Diante desse contexto, identifica-se uma lacuna crítica no mercado de aplicações digitais: embora exista demanda crescente por eventos presenciais e o público jovem demonstre preferência por plataformas mobile-first com propósitos específicos, não há uma solução brasileira dedicada exclusivamente à descoberta e criação de eventos que combine recursos de geolocalização em tempo real com elementos de redes sociais.

**As dores reais dos usuários manifestam-se de múltiplas formas:**

* **Dificuldade de descoberta**: Jovens não sabem quais eventos estão acontecendo próximos a eles, perdendo oportunidades de socialização por falta de visibilidade de eventos menores e encontros casuais;
* **Dispersão de informação**: Eventos são divulgados de forma fragmentada em múltiplas plataformas (Instagram Stories, grupos de WhatsApp, Telegram), dificultando o acompanhamento e a descoberta orgânica;
* **Inadequação das soluções existentes**: Plataformas como Eventbrite e Sympla concentram-se principalmente na gestão e venda de ingressos para eventos de médio e grande porte, ignorando encontros menores e espontâneos que constituem grande parte da vida social jovem;
* **Perda de relevância do Facebook**: Embora possua recursos de eventos, o Facebook perdeu a confiança e o engajamento do público jovem, que representa o segmento mais ativo na organização e participação de eventos sociais;
* **Ausência de contextualização geográfica**: Não existe ferramenta que permita visualizar eventos próximos em tempo real, dificultando a descoberta espontânea de atividades na região onde o usuário se encontra.

  Para responder a essas necessidades, este trabalho propõe o desenvolvimento do **Conectaí**: uma plataforma social mobile-first dedicada à descoberta, criação e compartilhamento de eventos, integrando recursos de geolocalização em tempo real com elementos de redes sociais. A plataforma diferencia-se por seu foco único em conectar pessoas através de eventos, oferecendo visualização geográfica em mapa, sistema de recomendação baseado em proximidade e interesses, e recursos sociais que facilitam a formação de comunidades em torno de experiências presenciais.

  Surge então a questão central: **como desenvolver uma plataforma digital que atenda às necessidades específicas do público jovem brasileiro na descoberta, criação e compartilhamento de eventos, aproveitando o momento de retomada do setor de eventos presenciais e preenchendo o vazio deixado pela migração deste público para fora do Facebook?**

  ## **1.3 Justificativa**

  O desenvolvimento deste trabalho justifica-se por múltiplas perspectivas que evidenciam sua relevância tanto para a área de Computação quanto para o contexto social e mercadológico.

  **Do ponto de vista da Ciência da Computação**, este trabalho apresenta contribuições significativas em áreas críticas do desenvolvimento de software contemporâneo:

  **Arquitetura de sistemas distribuídos**: O projeto demanda a concepção de uma arquitetura escalável que integre aplicações móveis multiplataforma (iOS e Android) com backend robusto, exigindo decisões arquiteturais fundamentadas sobre padrões de comunicação, sincronização de dados e gerenciamento de estado distribuído;

  **Sistemas de geolocalização em tempo real**: A implementação de funcionalidades baseadas em localização geográfica apresenta desafios computacionais relevantes, incluindo indexação espacial eficiente, cálculo de proximidade em larga escala, atualização em tempo real de posições e otimização de consultas geoespaciais;

  **Algoritmos de recomendação**: O desenvolvimento de um sistema de recomendação que combine múltiplas dimensões (proximidade geográfica, interesses do usuário, popularidade de eventos, conexões sociais) exige a aplicação e avaliação de técnicas de filtragem colaborativa e baseada em conteúdo em um contexto específico;

  **Experiência do usuário mobile-first**: O projeto explora princípios de design de interação e usabilidade específicos para dispositivos móveis, incluindo navegação por gestos, visualização de dados geoespaciais em telas reduzidas e otimização de performance para diferentes capacidades de hardware;

  **Processamento e visualização de dados geoespaciais**: A implementação de mapas de calor baseados em popularidade e densidade de eventos demanda algoritmos de agregação espacial e técnicas de visualização de dados geográficos.

  Estas contribuições técnicas posicionam o trabalho como uma oportunidade de investigação e aplicação de conceitos fundamentais da Computação em um contexto real e relevante, gerando conhecimento aplicável a outras classes de sistemas baseados em localização e interação social.

  **Do ponto de vista social**, a plataforma proposta responde a uma necessidade crescente de reconexão presencial, especialmente relevante após o período de isolamento imposto pela pandemia de COVID-19. A possibilidade de descobrir eventos próximos e conectar-se com pessoas de interesses similares contribui para o fortalecimento de comunidades locais e para o bem-estar social dos usuários, combatendo o isolamento social que afeta particularmente a Geração Z.

  **Sob a ótica mercadológica**, existe oportunidade significativa de desenvolvimento de uma solução brasileira que atenda especificamente ao mercado nacional. As plataformas internacionais existentes não consideram adequadamente características culturais brasileiras, como a importância de eventos espontâneos e de pequeno porte, padrões de socialização específicos e preferências de interação do público jovem brasileiro. O crescimento de 105% no setor de eventos pós-pandemia evidencia um mercado aquecido e receptivo a inovações tecnológicas que facilitem a descoberta e participação em experiências presenciais.

  **A ausência de soluções dedicadas** que combinem descoberta de eventos locais, geolocalização em tempo real e elementos de rede social focados no público jovem brasileiro torna este desenvolvimento particularmente relevante. As plataformas existentes ou focam exclusivamente em ticketing (Eventbrite, Sympla), ou perderam relevância com o público-alvo (Facebook), ou não têm a descoberta de eventos como propósito principal (Instagram, TikTok). Esta lacuna justifica a dedicação de um trabalho de conclusão de curso completo para desenvolver, validar e avaliar uma solução específica para este problema.

  **Portanto, este TCC justifica-se por**: (1) apresentar desafios técnicos relevantes para a área de Computação, explorando tecnologias contemporâneas em contexto real; (2) preencher uma lacuna identificada no mercado brasileiro de aplicações sociais; (3) contribuir para o bem-estar social ao facilitar conexões presenciais; e (4) gerar conhecimento aplicável ao desenvolvimento de outras classes de sistemas baseados em localização e interação social.

  ## **1.4 Objetivos**

  ### 1.4.1 Objetivo Geral

  Desenvolver uma plataforma social mobile-first para descoberta, criação e compartilhamento de eventos, integrando recursos de geolocalização e interação social, destinada ao público jovem brasileiro.

  ### 1.4.2 Objetivos Específicos

  a) Analisar o comportamento do público jovem em relação ao uso de redes sociais e plataformas de eventos;

  b) Identificar requisitos funcionais e não-funcionais para uma plataforma de eventos direcionada ao público-alvo definido;

  c) Projetar a arquitetura do sistema, contemplando aplicações móveis (iOS e Android) e versão web;

  d) Desenvolver protótipo funcional da plataforma com recursos essenciais de descoberta e criação de eventos;

  e) Implementar sistema de geolocalização em tempo real para recomendação de eventos por proximidade;

  f) Avaliar a usabilidade e aceitação da plataforma por meio de testes com usuários representativos do público-alvo;

  g) Integrar a plataforma a sistemas de geolocalização, viabilizando busca e visualização de eventos em um mapa e um mapa de calor baseado na popularidade de eventos;

  h) Implementar a funcionalidade de fazer amizades, de seguir pessoas ou organizadores de evento dentro da plataforma;

  i) Implementar funcionalidade de compartilhar eventos via link de compartilhamento ou via feed de usuários dentro da plataforma.

#

## **2. METODOLOGIA**

### **2.1 Caracterização da Pesquisa**

Este trabalho caracteriza-se como uma pesquisa aplicada de natureza tecnológica, voltada à resolução de um problema prático identificado no mercado brasileiro de plataformas digitais para eventos. Quanto aos objetivos, configura-se como uma pesquisa exploratória e descritiva, uma vez que busca explorar as características e necessidades do público-alvo, descrever requisitos funcionais e não-funcionais do sistema proposto, e estabelecer relações entre tecnologias de geolocalização e redes sociais no contexto de descoberta de eventos.

Do ponto de vista dos procedimentos técnicos, a pesquisa adota abordagem metodológica mista, combinando pesquisa bibliográfica para fundamentação teórica, estudo de caso das plataformas existentes no mercado (Meetup, Eventbrite, Sympla), e desenvolvimento tecnológico aplicado através da engenharia de software.

### **2.2 Etapas da Pesquisa**

O desenvolvimento deste trabalho foi estruturado em cinco etapas principais, conforme detalhado a seguir:

#### 2.2.1 Fase 1 \- Levantamento Bibliográfico e Contextualização

Nesta fase inicial, foi realizada revisão de literatura abrangendo três áreas fundamentais:

* **Plataformas de eventos existentes**: Análise comparativa das principais soluções disponíveis no mercado (Meetup, Eventbrite, Sympla), identificando funcionalidades, modelos de negócio, público-alvo e limitações;
* **Tecnologias de geolocalização**: Estudo de APIs de mapas (Google Maps, Mapbox), conceitos de georreferenciamento, GPS, A-GPS e técnicas de indexação espacial;
* **Aspectos legais e de privacidade**: Investigação dos requisitos da LGPD aplicados a dados de geolocalização, princípios de privacidade por design e conformidade regulatória.

  As fontes consultadas incluíram documentação técnica oficial das plataformas analisadas, artigos científicos sobre sistemas baseados em localização, legislação brasileira de proteção de dados, e literatura especializada em engenharia de software.


  #### 2.2.2 Fase 2 \- Análise de Requisitos

  A elicitação de requisitos foi conduzida através de múltiplas técnicas complementares:

  **Análise de concorrentes**: Exame detalhado das funcionalidades oferecidas pelas plataformas existentes, identificando lacunas e oportunidades de diferenciação. Foram analisados aspectos como recursos de descoberta de eventos, sistemas de ticketing, elementos sociais, funcionalidades mobile e modelos de monetização;

  **Análise do comportamento do público-alvo**: Estudo de pesquisas de mercado sobre hábitos digitais da Geração Z, padrões de uso de redes sociais, preferências de interação e abandono de plataformas tradicionais como Facebook. Foram considerados dados da BrandVue Media sobre comportamento de jovens usuários e tendências de migração para plataformas mobile-first;

  **Análise do contexto de mercado**: Investigação de dados do setor de eventos no Brasil, incluindo crescimento pós-pandemia, faturamento e demanda por experiências presenciais, utilizando informações da Associação Brasileira dos Promotores de Eventos (Abrape);

  **Definição de personas**: Caracterização de perfis representativos do público-alvo, incluindo jovens de 18 a 30 anos, organizadores de eventos de pequeno e médio porte, e estabelecimentos comerciais interessados em promover eventos.

  Os requisitos identificados foram classificados em funcionais e não-funcionais, e posteriormente priorizados.

  #### 2.2.3 Fase 3 \- Especificação e Modelagem do Sistema

  A especificação técnica do sistema seguiu os princípios e práticas da Engenharia de Software, utilizando UML (Unified Modeling Language) como linguagem de modelagem padrão. Esta fase compreendeu:

  **Especificação de requisitos**: Documentação detalhada de 11 grupos de requisitos funcionais (totalizando mais de 60 funcionalidades) e 8 categorias de requisitos não-funcionais, incluindo critérios mensuráveis de performance, segurança, usabilidade e escalabilidade;

  **Modelagem de casos de uso**: Desenvolvimento de diagramas de casos de uso representando as principais interações entre atores (Usuário e Moderador) e o sistema, com descrição detalhada de fluxos principais, alternativos e de exceção para os casos de uso prioritários (Cadastrar Usuário, Criar Evento, Visualizar Mapa, Denunciar Conteúdo, Moderar Conteúdo);

  **Modelagem estrutural**: Criação de diagrama de classes representando a estrutura principal do sistema, incluindo entidades de domínio (User, Event, Venue, Attendance, Comment), seus atributos, métodos e relacionamentos;

  **Modelagem comportamental**: Desenvolvimento de diagramas de sequência ilustrando a dinâmica de interações entre objetos para processos críticos como criação de eventos, confirmação de presença e moderação de conteúdo;

  **Modelagem de dados**: Concepção do Diagrama de Entidade-Relacionamento (DER) representando a estrutura do banco de dados relacional, incluindo entidades, atributos, chaves primárias e estrangeiras, e cardinalidades dos relacionamentos.

  Para a criação dos diagramas, foi utilizada a ferramenta PlantUML, que permite a geração de diagramas através de código, facilitando o versionamento e a manutenção da documentação.

  #### 2.2.4 Fase 4 \- Prototipação de Interfaces

  A prototipação foi conduzida utilizando a ferramenta Figma, seguindo abordagem iterativa de design:

  **Wireframes de baixa fidelidade**: Criação de esboços iniciais das principais telas do sistema (cadastro, criação de evento, mapa de eventos, feed, perfil de usuário), focando na disposição de elementos e fluxo de navegação;

  **Protótipos de média fidelidade**: Desenvolvimento de protótipos mais detalhados incluindo elementos visuais básicos, tipografia e hierarquia de informações, servindo como base para validação conceitual;

  **Princípios de design aplicados**: Os protótipos foram desenvolvidos considerando princípios de usabilidade mobile-first, acessibilidade, consistência visual e padrões de interface reconhecíveis pelo público-alvo.

  Os protótipos criados foram vinculados aos casos de uso correspondentes, facilitando a compreensão das funcionalidades e servindo como especificação visual para a futura implementação.

**2.3 Critérios de Avaliação**

Para validação da especificação desenvolvida, foram estabelecidos os seguintes critérios:

**Completude**: Verificação se todos os requisitos identificados foram adequadamente especificados e modelados;

**Consistência**: Análise de coerência entre diferentes artefatos (requisitos, casos de uso, diagramas de classes, modelo de dados);

**Rastreabilidade**: Garantia de que cada requisito pode ser rastreado até seus respectivos casos de uso, histórias de usuário e elementos da modelagem;

**Viabilidade técnica**: Avaliação se a arquitetura e stack tecnológica propostas são capazes de atender aos requisitos não-funcionais especificados;

**Alinhamento com objetivos**: Confirmação de que a especificação desenvolvida atende aos objetivos geral e específicos estabelecidos para o trabalho.

### **2.4 Limitações da Metodologia**

É importante reconhecer algumas limitações metodológicas deste trabalho:

* A validação dos requisitos com usuários reais do público-alvo não foi realizada nesta etapa, sendo planejada para fase posterior de desenvolvimento e testes de usabilidade;
* A análise de concorrentes baseou-se em informações publicamente disponíveis, sem acesso a métricas internas ou dados proprietários das plataformas estudadas;
* Os protótipos desenvolvidos têm caráter inicial e exploratório, devendo ser refinados com base em feedback de usuários e testes de usabilidade;
* O cronograma proposto é sugestivo e está sujeito a ajustes conforme complexidades identificadas durante a implementação.

  Estas limitações não comprometem a validade da especificação desenvolvida, mas indicam oportunidades de aprofundamento em trabalhos futuros e na continuidade do projeto.

#

# **3\. FUNDAMENTAÇÃO TEÓRICA / REVISÃO DE LITERATURA**

## **3.1 Plataformas De Eventos: Panorama E Análise Comparativa**

O mercado de plataformas digitais para eventos tem apresentado crescimento significativo nos últimos anos, especialmente impulsionado pela transformação digital acelerada durante a pandemia de COVID-19. Esta seção analisa as principais soluções existentes no mercado, identificando suas características, pontos fortes e limitações, estabelecendo o contexto para compreender a lacuna que o presente trabalho busca preencher.

### 3.1.1 Meetup: Pioneirismo em Eventos Baseados em Comunidade

O Meetup, lançado em junho de 2002, é uma plataforma que se apresenta como uma rede social com um enfoque distintivo: facilitar que pessoas com interesses compartilhados se reúnam em eventos e atividades do mundo real. Com mais de 60 milhões de membros globalmente, a plataforma oferece uma infraestrutura robusta para descoberta e organização de eventos baseados em comunidades de interesse.

**Funcionalidades principais:**

A plataforma permite aos usuários descobrir eventos e grupos locais através de recomendações personalizadas baseadas em interesses, desde clubes de idiomas até eventos sociais, explorando categorias, buscando por palavras-chave ou descobrindo o que é popular em sua zona geográfica. O sistema oferece ferramentas de conversação e mensagens para manter contato entre participantes, além de permitir criar grupos próprios para organizar eventos.

A plataforma permite gestão eficiente dos meetups, envio de emails, upload de fotos e múltiplas funcionalidades, sendo ideal para criar comunidades sobre qualquer tema e gerar engajamento com audiências que a internet não permite de forma presencial.

**Modelo de negócio:**

O Meetup não é gratuito para organizadores de eventos, exigindo pagamento de uma taxa para usar a plataforma, embora seja considerado relativamente barato pelos benefícios oferecidos. Organizadores podem optar por cobrar taxas de membros ou vender ingressos para cada evento, possibilitando compartilhar custos ou obter lucros.

**Limitações identificadas:**

* Foco primário em grupos de encontro recorrente, não em eventos pontuais
* Interface com usabilidade reportada como problemática por usuários
* Ausência de foco específico no público jovem brasileiro
* Sistema de busca limitado que não prioriza proximidade geográfica em tempo real

  ### 3.1.2 Eventbrite: Líder Global em Ticketing

  Presente em mais de 170 países, a Eventbrite é uma plataforma direcionada à organização e gerenciamento de eventos que, apenas em 2018, realizou mais de 3,9 milhões de eventos. A plataforma posiciona-se como solução completa para venda e gestão de ingressos.

  **Arquitetura e funcionalidades:**

  A Eventbrite oferece criação de páginas de inscrição personalizadas com design adaptado à identidade visual do evento, venda de entradas online através de seu site ou plataformas próprias aceitando diversos métodos de pagamento, gestão de listas de convidados incluindo opções de registro no local do evento, ferramentas de marketing com campanhas de email e redes sociais integradas, e análises e informes detalhados sobre vendas de entradas, rendimento do evento e comportamento do público.

  A plataforma oferece integração com WordPress através de API e plugin, permitindo que qualquer tema seja integrado à Eventbrite, possibilitando que produtores vendam ingressos em sua própria página do Facebook, gerando mais engajamento e proximidade com o público.

  Estratégia de distribuição:

  A Eventbrite desenvolveu tecnologia, processo e parceria para colocar os eventos na frente das pessoas certas onde elas passam a maior parte do seu tempo, permitindo que usuários de redes sociais descubram eventos, se informem e comprem ingressos sem precisar ir até outra página online. Parcerias com Spotify, Facebook e Instagram têm sido fundamentais nessa estratégia.




  **Modelo de precificação:**

  A Eventbrite oferece diferentes planos: o Essentials, indicado para primeiros eventos com taxa de 6,99% por ingresso pago, e o Professional, solução profissional para eventos mais robustos com análise de vendas detalhada. Eventos gratuitos não possuem taxas.

  **Limitações identificadas:**

* Foco principal em ticketing para eventos de médio e grande porte
* O principal ponto negativo apontado por usuários é o suporte técnico da plataforma
* Não oferece recursos de descoberta baseados em geolocalização em tempo real
* Ausência de elementos de rede social para conexão entre participantes
* Não atende adequadamente eventos menores e encontros casuais

  ### 3.1.3 Sympla: Liderança no Mercado Brasileiro

  A Sympla é uma plataforma de eventos online, presenciais e de conteúdos digitais que conecta organizadores e participantes, tendo realizado mais de 950 mil eventos, incluindo mais de 150 mil de forma remota e vendido mais de 55 milhões de ingressos.

* Funcionalidades e diferenciais: A plataforma oferece sistema de credenciamento pelo celular tornando o check-in rápido e eficiente, venda de ingressos com assentos numerados, formulários personalizados para coleta de informações relevantes, repasses financeiros quando quiser sem burocracia, e múltiplos métodos de pagamento incluindo cartão de crédito e débito online, Pix, NuPay e outros.
  A Sympla é uma plataforma Do It Yourself, oferecendo autonomia total para criar, gerenciar e acompanhar todas as etapas do evento, com Dashboard que visualiza vendas, ingressos, público e desempenho em tempo real.
* **Adaptação à pandemia:** A plataforma desenvolveu o Sympla Streaming e Sympla Play para eventos virtuais e cursos online, permitindo transmissões via Zoom para até 300 pessoas gratuitamente, com personalização de layout, definição de horários, acesso público ou restrito e venda de ingressos pagos ou gratuitos.
* **Estrutura de taxas:** Criar eventos na Sympla é gratuito, cobrando-se apenas sobre ingressos vendidos com taxa de serviço de 10% mais taxa de processamento entre 2% a 2,5% por venda, que pode ser absorvida pelo produtor ou repassada ao comprador. Eventos gratuitos não possuem taxas. Repasses ocorrem no 3º dia útil após o evento.

  **Limitações identificadas:**

* Foco primário em ticketing e gestão de eventos pagos
* Ausência de recursos de descoberta orgânica de eventos
* Não oferece elementos de rede social ou geolocalização
* Interface não otimizada para descoberta espontânea de eventos próximos

  ### 3.1.4 Análise Comparativa.

Tabela 1 \- Comparação de Funcionalidades das Principais Plataformas

| Funcionalidade | Meetup | Eventbrite | Sympla | Conectaí |
| :---- | :---- | :---- | :---- | :---- |
| **Foco Principal** | Comunidades recorrentes | Ticketing médio/grande porte | Ticketing eventos BR | Descoberta \+ Socialização |
| **Geolocalização** | Busca por cidade | Busca por localização | Busca por cidade  | Tempo real \+ Mapa de calor |
| **Eventos Gratuitos**  | ✓ | ✓ | ✓ |  ✓ |
| **Rede Social** | Limitado | ✗ | ✗ | ✓ (Nativo) |
| **Mapa Visual** | ✗  | ✗  | ✗  |  ✓ |
| **Perfis de Usuário** | Básico | ✗  | ✗  | ✓ (Completo) |
| **Feed de Eventos** | Limitado | ✗ | ✗ | ✓ (Personalizado) |
| **Seguir Organizadores** | ✗  | ✗  | ✗  | ✓  |
| **Compartilhamento Social** | Limitado | ✓ | ✓ | ✓ (Integrado) |
| **Mobile-First** | Parcial | Parcial | Parcial | ✓ (Nativo) |
| **Foco Público Jovem** | ✗  |  ✗  |  ✗  |  ✓  |
| **Eventos Espontâneos** | ✗  |  ✗  |  ✗  |  ✓  |
| **Modelo de Negócio** | Pago (organizador) |  Freemium/Taxas | Freemium/Taxas | Freemium |

**Lacunas identificadas no mercado:**

1. Ausência de geolocalização em tempo real: Nenhuma das plataformas analisadas oferece visualização de eventos próximos em mapa com atualizações em tempo real baseada na localização atual do usuário
2. Foco em ticketing vs. descoberta: As plataformas brasileiras (Eventbrite e Sympla) priorizam gestão e venda de ingressos, negligenciando a descoberta orgânica de eventos
3. Elementos sociais limitados: Ausência de recursos nativos de rede social (perfis, seguir organizadores, feed personalizado, conexões entre participantes)
4. Eventos de pequeno porte ignorados: Foco em eventos estruturados com venda de ingressos, não atendendo encontros casuais e espontâneos
5. Experiência mobile secundária: Aplicativos móveis são adaptações das versões web, não sendo projetados com abordagem mobile-first
6. Público jovem não é prioridade: Nenhuma plataforma posiciona-se especificamente para atender preferências e comportamentos da Geração Z

   ## **3.2 Tecnologias de Geolocalização em Aplicações Móveis.**

   A geolocalização constitui fundamento tecnológico essencial para sistemas baseados em proximidade. Esta seção explora os conceitos, tecnologias e desafios relacionados à implementação de funcionalidades de localização em aplicações móveis.

   ### 3.2.1 Conceitos Fundamentais de Geolocalização

   Geolocalização é a determinação de uma localização a partir de coordenadas geográficas, tecnologia que surgiu no ambiente militar para auxiliar em tempos de guerra e migrou posteriormente para áreas comerciais e pessoais, permitindo que um smartphone seja localizado através de rastreamento via conexão remota.

   A geolocalização identifica onde uma pessoa ou objeto estão localizados utilizando internet ou celular, possibilitando acessar a localização geográfica \- coordenadas de latitude e longitude \- de qualquer dispositivo eletrônico conectado à internet.

   ### 3.2.2 Tecnologias de Posicionamento

   Para que a geolocalização seja inserida em um aplicativo, a equipe de desenvolvimento tem diferentes tecnologias à disposição: GPS (sistema de posicionamento geográfico) estabelecido por meio de sinais de satélite, GSM (sistema global para comunicações móveis) que funciona por ondas de rádio, e wireless via Wi-Fi de acordo com o limite do roteador.

   **GPS (Global Positioning System):**

   O GPS é baseado em satélites de comunicação que orbitam a Terra transmitindo de forma contínua o status, localização e momento exatos, permitindo que dispositivos GPS receptores determinem a localização. A precisão varia entre 10 e 100 metros dependendo de condições atmosféricas, bloqueio de sinal e qualidade do receptor.

   **A-GPS (Assisted GPS):**

   O A-GPS ou GPS assistido usa torres de telefonia para estabelecer comunicação com os sinais de satélite, sendo uma evolução do GPS que utiliza tanto satélites quanto antenas de celulares na geolocalização.

   **Georreferenciamento em tempo real:**

   O georreferenciamento é uma tecnologia muito adotada para geolocalização de celular onde a localização é captada em tempo real, sendo comumente utilizada em mapas de apps de delivery que mostram onde o entregador está com o pedido ou em aplicativos de transporte apontando a rota do motorista.

   ## 3.2.3 APIs e Plataformas de Geolocalização

   ### **Mapbox Platform:**

   A **Mapbox** é uma plataforma moderna de mapas e geolocalização amplamente utilizada em aplicações móveis e web, reconhecida por sua alta capacidade de personalização e desempenho. A empresa fornece infraestrutura de mapas vetoriais, APIs e SDKs que permitem que desenvolvedores criem experiências geoespaciais ricas, oferecendo flexibilidade superior em relação ao design, estilo do mapa e processamento de dados.

   Um dos principais diferenciais da Mapbox é sua arquitetura baseada em **mapas vetoriais**, permitindo renderização eficiente diretamente no dispositivo, com atualizações rápidas, menor consumo de dados e maior fluidez visual. Além disso, a plataforma oferece recursos avançados para visualização geoespacial em tempo real, fundamentais para aplicações focadas em dinâmica de localização, como descoberta de eventos próximos.

   **Principais APIs e SDKs disponíveis:**

* **Maps:** Permitem integrar mapas altamente customizáveis, utilizando o **Mapbox Maps SDK** para Android, iOS e Web. Os mapas vetoriais oferecem liberdade total de design, possibilitando alterar cores, fontes, camadas e densidade de informações exibidas.
* **Navigation:** Inclui APIs de roteamento com suporte a navegação passo a passo, cálculo de rotas, redirecionamento automático e estimativa de tempo de chegada (ETA). A plataforma usa dados de tráfego em tempo real para otimizar caminhos.
* **Geocoding:** Disponibiliza conversão entre coordenadas de latitude/longitude e endereços, bem como busca de locais e pontos de interesse (POIs) com suporte global.
* **Search e Places:** Oferecem descoberta de locais, estabelecimentos, ruas e regiões com base em dados próprios e parceiros externos, possibilitando identificação rápida do ambiente ao redor do usuário.
*  **Geolocation e Telemetry:** Permitem rastreamento de localização do usuário ou objetos em tempo real, incluindo APIs otimizadas para uso contínuo sem consumo excessivo de bateria.

  ### 3.2.4 Aplicações e Casos de Uso

  A tecnologia de geolocalização é utilizada em diferentes aplicações: delivery e transporte (Uber, iFood), redes sociais e check-ins (Facebook, Instagram), jogos baseados em localização (Pokémon GO), e-commerce para cálculo de frete e indicação de lojas próximas, e serviços baseados em localização.

  **Benefícios para experiência do usuário:**

  Um dos maiores benefícios é o estreitamento da relação com o cliente final através de interação com backoffice em tempo real e compartilhamento de informação, permitindo otimização de operações logísticas, roteirização de entregas, organização e controle de equipes, e descoberta de estabelecimentos próximos.

  ### 3.2.5 Desafios Técnicos e de Implementação

  **Precisão e confiabilidade:**

  A precisão da localização GPS depende de vários fatores como condições atmosféricas, bloqueio de sinal e design e qualidade do receptor. Fraudadores usam diferentes técnicas para falsificar localização como aplicativos de falsificação de GPS, VPNs, proxies e emuladores.

  **Consumo de bateria:**

  A utilização contínua de GPS representa desafio significativo para autonomia de bateria de dispositivos móveis, exigindo estratégias de otimização como redução de frequência de atualização quando usuário está parado e uso de técnicas de geofencing para ativar serviços apenas em áreas específicas.

  **Performance e escalabilidade:**

  Para aplicações que lidam com grande volume de consultas geoespaciais, é necessário implementar indexação espacial eficiente utilizando estruturas de dados como R-trees ou Quadtrees, além de considerar uso de bancos de dados especializados como PostGIS para consultas geográficas complexas.

**3.3 Privacidade E Proteção De Dados: Lgpd Aplicada À Geolocalização**

A implementação de funcionalidades baseadas em geolocalização exige compreensão profunda dos aspectos legais relacionados à privacidade e proteção de dados pessoais, especialmente no contexto da Lei Geral de Proteção de Dados (LGPD).

### 3.3.1 LGPD e Dados de Localização

A LGPD é uma legislação brasileira que tem como objetivo proteger a privacidade e os dados pessoais dos cidadãos. Dados de geolocalização são considerados dados pessoais valiosos, tornando necessários cuidados específicos para estar em conformidade com a legislação.

**Natureza dos dados de localização:**

Os dados de geolocalização retirados do dispositivo móvel de um indivíduo são inequivocamente dados pessoais, permitindo não só conhecer onde a pessoa estava em determinado dia e horário, como também realizar inferências a partir desse conhecimento, inclusive sobre dados sensíveis.

### 3.3.2 Princípios Fundamentais para Conformidade

**Consentimento informado:**

O consentimento está ligado à legislação e regulamentação, sendo base legal para coletar e processar dados. Empresas obrigadas pelos regulamentos a solicitar consentimento devem ter prova de solicitação explícita e clara e prova de consentimento livre do usuário.

Ao requisitar acesso a dados de geolocalização, o aplicativo deve deixar claro o motivo, como no caso de app de delivery que necessita da geolocalização para prestar serviço adequadamente e enviar cupons de descontos personalizados para a região.

**Interesse legítimo:**

Interesse legítimo é outra base legal para coletar dados do usuário e não requer consentimento. Se a finalidade da coleta de dados for de interesse legítimo, o consentimento do usuário será vazio. De acordo com a LGPD, a prevenção de fraudes é considerada um tema do melhor interesse dos usuários.

**Transparência e finalidade:**

É fundamental haver transparência sobre a finalidade da coleta de dados de geolocalização. Caso os aplicativos compartilhem dados de geolocalização com terceiros, devem informar claramente aos usuários e garantir que essas empresas também estejam em conformidade com a LGPD.

### 3.3.3 Obrigações do Controlador de Dados

De acordo com a LGPD, cada usuário deve ser informado sobre: identidade do controlador, finalidade dos dados, motivo da coleta, destinatários dos dados do sistema de geolocalização, período de conservação dos dados, direitos como titular dos dados pessoais, e possibilidade de apresentar reclamação à ANPD.

**Segurança dos dados:**

A segurança dos dados de geolocalização é crucial. Empresas devem implementar medidas de segurança adequadas para proteger essas informações contra acessos não autorizados, vazamentos ou uso indevido.

**Período de retenção:**

As informações obtidas pelos dispositivos de geolocalização devem ser conservadas por curto período, observando sempre a finalidade e necessidade da manutenção dos dados.

### 3.3.4 Direitos dos Titulares

O trabalhador/usuário precisa ser informado previamente sobre a coleta de dados e ter acesso aos dados gerados. Se o dispositivo violar direitos estabelecidos na LGPD, o usuário tem direito de recusar, além de poder desativar a coleta ou transmissão de dados de localização geográfica em situações específicas.

### 3.3.5 Dados Anonimizados

A LGPD não veda a utilização de dados de forma anonimizada, ou seja, desde que não haja possibilidade de qualquer identificação dos titulares. A legislação prevê situações excepcionais como proteção à vida, execução de políticas públicas previstas em lei e tutela de saúde.

### 3.3.6 Implementação Prática em Aplicações de Eventos

Para nossa plataforma do Conectaí as seguintes diretrizes devem ser observadas:

1. **Solicitação de permissão clara**: Explicar ao usuário por que a localização é necessária (descobrir eventos próximos) e quais benefícios isso proporciona
2. **Controle granular**: Permitir que usuário escolha entre: sempre permitir, permitir apenas quando usar o app, ou nunca permitir
3. **Dados mínimos necessários**: Coletar apenas coordenadas necessárias para funcionalidade de descoberta, sem armazenar histórico completo de movimentação
4. **Transparência total**: Política de privacidade clara em português explicando coleta, uso, armazenamento e compartilhamento de dados
5. **Segurança**: Implementar criptografia de dados em trânsito e em repouso, além de controles de acesso rigorosos
6. **Direito ao esquecimento**: Permitir que usuário solicite exclusão completa de seus dados de localização

   ## **3.4 Modelos De Monetização: Estratégia Freemium**

   A sustentabilidade financeira de plataformas digitais requer modelos de monetização adequados ao perfil do público e à proposta de valor oferecida. O modelo freemium tem se mostrado particularmente eficaz para aplicações móveis que buscam crescimento rápido da base de usuários.

   ### 3.4.1 Conceito e Fundamentos

   Freemium é a junção dos termos free (gratuito) e premium (exclusivo), significando que ao incluir esta técnica em estratégia, a empresa disponibiliza um serviço de qualidade e com certo grau de exclusividade gratuitamente para atingir objetivos estratégicos como levar produto até público desejado, facilitando entrada e expansão no mercado.

   O modelo de negócio freemium envolve distribuir um produto base gratuitamente, mas cobrar por versões mais avançadas. É assim que empresas como Dropbox, Spotify e Canva desenvolvem bases de usuários enormes: permitem que qualquer pessoa entre de graça e monetizam as pessoas que querem mais.

   **Diferença de período de teste:**

   No modelo freemium não há tempo limite para uso gratuito do sistema. O usuário pode usar essa opção até que ela pare de fazer sentido para ele, diferentemente de período de testes que possui prazo definido.

   ### 3.4.2 Estratégias de Implementação

   **Definição de recursos gratuitos vs. pagos:**

   Se a versão gratuita for muito limitada, pode não atrair tantos usuários; por outro lado, se for completa demais, poucos vão sentir necessidade de pagar pela versão premium. Deve-se encontrar equilíbrio entre o que é oferecido gratuitamente e o que será cobrado.

   É importante identificar quais recursos ou funcionalidades serão oferecidos gratuitamente na versão Freemium e quais recursos serão exclusivos para a versão paga, equilibrando o valor oferecido na versão gratuita para atrair usuários enquanto reserva recursos premium para incentivar a atualização.

   **Modelos de limitação:**

   Modelo comum envolve oferecer plano gratuito com quantidade limitada de uso (exemplo: um projeto, cinco faturas por mês, 2 GB de armazenamento). Ao ultrapassar esse limite, passa-se para plano pago ou incorre em cobranças de acordo com uso. Esse tipo funciona bem para produtos dimensionados com uso.

   ### 3.4.3 Cases de Sucesso

   **Spotify:**

   O Spotify usa freemium para atrair usuários oferecendo plano grátis para criar boa experiência com serviço e apresentar versão paga com mais vantagens. Em 2020, alcançou a marca de 130 milhões de usuários pagantes de 286 milhões de usuários totais, sendo o app de streaming de música mais bem-sucedido no mundo.

   **LinkedIn:**

   O LinkedIn tem perfil gratuito com diversas funcionalidades práticas, mas na versão paga existem diferentes tipos de contas premium com diversas vantagens adicionais.

   **Dropbox, Trello, Mailchimp:**

   Existem várias empresas conhecidas que utilizam modelo Freemium com sucesso, incluindo Dropbox para armazenamento em nuvem, Trello para gestão de projetos, e Mailchimp para email marketing.

   ### 3.4.4 Vantagens do Modelo Freemium

   Entre as vantagens estão: aumento no valor da marca ao oferecer experiência gratuita e de qualidade, alcance da marca facilitando inserção no mercado, aquisição de usuários em larga escala, experimentação e adoção rápida sem barreiras de entrada, upsell e conversão de usuários em clientes pagantes, retenção de usuários através de experiência continuada, feedback e interação do produto, e flexibilidade de monetização.

   ### 3.4.5 Desafios e Considerações

   **Custo de distribuição:**

   É indicado que se consiga criar modelo de negócios com custo de distribuição pequeno. Esse é um dos motivos que tornam a técnica freemium mais usada por empresas de Software as a Service (SaaS), onde geralmente o custo de distribuir o serviço tem pouca ligação com número de usuários.

   **Taxa de conversão:**

   Muitas pessoas nunca pagarão pelo produto. Isso significa que para cada cliente pagante, você está dando suporte a 20, 50, talvez 100 usuários que não contribuem diretamente com a receita.

   **Qualidade da versão gratuita:**

   A técnica freemium só tem potencial para sucesso se consumidor estiver satisfeito com opção grátis. Uma má experiência com modelo freemium dificilmente transformará usuário em cliente pagante.

   ### 3.4.6 Monetização Complementar

   **Publicidade:**

   Algumas empresas freemium monetizam seus usuários gratuitamente com publicidade. Aplicativos de mídia fazem isso veiculando anúncios para usuários gratuitos, o que subsidia experiência gratuita.

   **Compras únicas:**

   Alguns produtos permitem que usuários gratuitos comprem recursos, modelos, exportações ou integrações únicas individualmente. Essas pequenas atualizações criam caminhos para receita opcionais sem exigir compromisso com assinatura completa.

   ### 3.4.7 Aplicabilidade ao Contexto de Plataformas de Eventos

   O modelo freemium apresenta-se adequado para plataforma de eventos direcionada ao público jovem pelos seguintes motivos:

1. **Baixa barreira de entrada**: Público jovem demonstra resistência a pagamentos iniciais em aplicativos, especialmente para experimentar novos serviços
2. **Custo marginal reduzido**: Infraestrutura em nuvem permite escalar usuários com custos incrementais relativamente baixos
3. **Crescimento viral**: Usuários gratuitos contribuem para crescimento orgânico ao compartilhar eventos e convidar contatos
4. **Múltiplas oportunidades de monetização**: Possibilidade de cobrar por recursos premium (destaque de eventos, análises avançadas, recursos exclusivos para organizadores), publicidade não-intrusiva, e comissões sobre eventos pagos
5. **Dados para otimização**: Grande base de usuários gratuitos gera dados valiosos para aprimoramento de algoritmos de recomendação e experiência do usuário

   ## **3.5 Síntese e Posicionamento do Trabalho**

   A revisão de literatura realizada revela lacunas significativas no ecossistema atual de plataformas digitais para descoberta e criação de eventos:

1. **Lacuna tecnológica**: Ausência de soluções que integrem geolocalização em tempo real com elementos de rede social focados especificamente em eventos
2. **Lacuna de mercado**: Plataformas existentes priorizam ticketing e gestão de eventos estruturados, negligenciando descoberta orgânica e eventos menores/casuais
3. **Lacuna demográfica**: Nenhuma solução posiciona-se especificamente para atender público jovem brasileiro (Geração Z), que demonstrou abandono de plataformas tradicionais como Facebook
4. **Lacuna de experiência**: Aplicações existentes não são projetadas com abordagem mobile-first, sendo adaptações de versões web

   O presente trabalho posiciona-se para preencher essas lacunas através das seguintes contribuições:

   **Inovação tecnológica:**

* Integração nativa de geolocalização em tempo real com visualização em mapa e mapa de calor
* Algoritmo de recomendação baseado em proximidade geográfica e interesses do usuário
* Arquitetura mobile-first projetada especificamente para dispositivos móveis

  **Diferenciação de mercado:**

* Foco em descoberta orgânica de eventos versus ticketing
* Suporte a eventos de todos os portes, desde encontros casuais até eventos estruturados
* Elementos de rede social nativos (perfis, seguir organizadores, feed personalizado)

  **Alinhamento demográfico:**

* Interface e experiência projetadas para preferências da Geração Z
* Modelo freemium que elimina barreiras de entrada
* Recursos de compartilhamento e viralização integrados

  **Conformidade legal:**

* Implementação desde o projeto inicial de princípios da LGPD
* Transparência e controle granular sobre dados de localização
* Práticas de privacidade by design

  A fundamentação teórica estabelecida neste capítulo fornece base sólida para compreender o contexto tecnológico, mercadológico e legal no qual o presente trabalho se insere, validando sua originalidade e relevância ao demonstrar que as soluções existentes não atendem adequadamente às necessidades identificadas do público-alvo brasileiro.

**4\. ESPECIFICAÇÃO TÉCNICA**

	Para o desenvolvimento da plataforma e do projeto, planeja-se a utilização de variadas ferramentas a fim do rendimento final gerar a plataforma desejada. Abaixo encontra-se tais listadas e as justificativas por trás das escolhas:

**4.1 Tecnologias**

4.1.1 TypeScript:

O TypeScript é uma linguagem de programação que funciona como um superconjunto do JavaScript normal, adicionando mais ferramentas de desenvolvimento e comandos a linguagem (TypeScript, s. d.).  O uso da tecnologia pelo projeto se dá pelo fato de que os aprimoramentos ajudam na detecção de erros e deixam mais simples o processo de manutenção do código

4.1.2 Java:
	O Java é uma linguagem de programação e plataforma orientada a objetos, sendo amplamente utilizada em projetos empresariais e podendo funcionar em variados tipos de sistemas operacionais (Java, s. d.). O desenvolvimento utilizará da ferramenta devido a flexibilidade oferecida e compatibilidade com outros instrumentos da plataforma.

4.1.3 API do Mapbox:

O Mapbox é uma plataforma de dados centrada em oferecer serviços de geolocalização e renderização de mapas a clientes (Mapbox, s. d.). A escolha de utilizar a rede advém da tecnologia ser suficiente para a criação de um mapa para usuários observarem a dispersão de eventos e pelo custo-benefício dado os requerimentos do desenvolvimento.

4.1.4 Figma:

	O Figma é uma ferramenta de design baseada em nuvem, o qual permite a criação e desenvolvimento de elementos visuais (Figma, s. d.). A plataforma é útil ao projeto por permitir uma forma melhorada de prototipagem, onde designs poderão ser testados antes de serem desenvolvidos e implementados no sistema.

4.1.5 GitHub:

	O GitHub é uma plataforma para versionamento e controle de projetos de software (GitHub, s. d.); o uso no projeto será para facilitar o trabalho em conjunto no desenvolvimento, já que a ferramenta providencia um repositório central pelo qual é possível armazenar e administrar o código escrito.

4.1.6 PostgreSQL:

	O PostgreSQL é um sistema para gerenciamento de banco de dados relacional, permitindo o armazenamento e gerenciamento de dados de uma forma segura e robusta (PostgreSQL, s. d.). No projeto, a tecnologia foi escolhida por sua versatilidade e compatibilidade com outras tecnologias e por suas capacidades serem alinhadas com a forma como os dados de usuários deverão ser gerenciados para a plataforma.

4.1.7 AWS:

	O Amazon Web Services (AWS) é uma plataforma de computação em nuvem que oferece uma variedade de serviços em escala empresarial que permitem a organizações operarem com maior eficiência (Amazon Web Services, s. d.). Para o desenvolvimento da plataforma, isso será utilizado para providenciar a infraestrutura a qual a rede se baseará.

4.1.8 PlantUML:

	O PlantUML é uma ferramenta que permite a criação de diagramas através do uso de código, sendo útil para criação de diagramas e outros elementos visuais relacionados (Rosal, 2022). A plataforma é uma das tecnologias utilizadas pelo projeto para criar os diagramas detalhando as relações entre os componentes da plataforma.



4.1.9 React Native:

	O React Native é um framework open-source que usa JavaScript e React para criação de aplicativos mobile para sistemas operacionais como IOS e Mobile (React Native, s. d.). O framework será utilizado no desenvolvimento da plataforma para possibilitar integração e uso em dispositivos de tal tipo.

4.1.10 React com Next.js:

	O React é uma biblioteca open-source de JavaScript utilizada para criar interfaces de usuário através de uma arquitetura de componentes (React, s. d.) enquanto o Next.js é uma framework criada com base no React, estendendo as capacidades deste e providenciado melhores estruturas para a criação de aplicações web (Next.js, s. d.). O projeto contará com o uso da tecnologia e do framework para melhorar a experiência do usuário e os menus interativos.



4.1.11 Tailwind CSS e Styled Components:

	O Tailwind CSS é uma framework de CSS que melhora e simplifica a criação e implementação de interfaces de usuários dentro do HTML (TailwindCSS, s. d.) enquanto o Styled Components é uma biblioteca de JavaScript que funciona dentro do React e React Native, permitindo o uso de CSS ao mesmo tempo do JavaScript. Ambos serão utilizados para criar e manusear os elementos de formatação e aparência do programa.

**4.2 Especificação E Modelagem**

4.2.1 Requisitos Funcionais

Esta seção detalha os requisitos funcionais (RFs) identificados para o desenvolvimento do Conectaí. Para garantir a viabilidade do projeto dentro do cronograma acadêmico e focar na proposta de valor essencial, foi adotado um método de priorização de escopo.

Cada requisito listado abaixo foi classificado com uma das seguintes etiquetas:

* (MVP): Produto Mínimo Viável. Requisitos essenciais para a funcionalidade básica e validação da proposta central do projeto.

* (Backlog): Requisitos importantes que agregam valor significativo, mas não são essenciais para a primeira entrega. Serão considerados após a validação do MVP.

* (Nice-to-have): Funcionalidades desejáveis, mas de baixa prioridade ou alta complexidade, consideradas para versões futuras do produto.


  **RF01 \- Gerenciamento de Usuários**

  RF01.1 \- O sistema deve permitir o cadastro de usuários com e-mail e senha (MVP).

  RF01.2 \- O sistema deve permitir login via redes sociais (Google, Facebook) (Backlog).

  RF01.3 \- O sistema deve permitir a edição de perfil (foto, biografia, localização, interesses) (MVP).

  RF01.4 \- O sistema deve suportar dois tipos de conta: Comum e Premium (Backlog).

  RF01.5 \- O sistema deve permitir a recuperação de senha via e-mail (MVP).

  RF01.6 \- O sistema deve validar e-mail através de token de confirmação (MVP).


  **RF02 \- Sistema de Conexões Sociais**

  RF02.1 \- O sistema deve permitir seguir outros usuários (MVP).

  RF02.2 \- O sistema deve estabelecer amizade quando há seguimento mútuo (MVP).

  RF02.3 \- O sistema deve permitir deixar de seguir usuários (MVP).

  RF02.4 \- O sistema deve exibir lista de seguidores e seguindo (Backlog).

  RF02.5 \- O sistema deve permitir bloquear usuários (Backlog).

  RF02.6 \- O sistema deve notificar quando alguém começar a seguir o usuário (Backlog).


  **RF03 \- Criação e Gerenciamento de Eventos**

  RF03.1 \- O sistema deve permitir que qualquer usuário crie eventos (MVP).

  RF03.2 \- O sistema deve solicitar informações básicas (título, descrição, data/hora, localização) (MVP).

  RF03.3 \- O sistema deve permitir upload de imagens do evento (MVP).

  RF03.4 \- O sistema deve permitir definir a categoria do evento (música, esporte, gastronomia, entre outros) (MVP).

  RF03.5 \- O sistema deve permitir definir se o evento é público ou privado (MVP).

  RF03.6 \- O sistema deve permitir edição de eventos criados pelo usuário (MVP).

  RF03.7 \- O sistema deve permitir cancelamento de eventos (MVP).

  RF03.8 \- O sistema deve permitir definir capacidade máxima do evento (Backlog).


  **RF04 \- Participação em Eventos**

  RF04.1 \- O sistema deve permitir marcar interesse em um evento (MVP).

  RF04.2 \- O sistema deve permitir confirmar presença em um evento (MVP).

  RF04.3 \- O sistema deve exibir quantidade de interessados e confirmados (MVP).

  RF04.4 \- O sistema deve permitir remover interesse/presença (MVP).

  RF04.5 \- O sistema deve notificar amigos quando o usuário demonstrar interesse no evento (Backlog).


  **RF05 \- Feed de Eventos**

  RF05.1 \- O sistema deve exibir feed principal com eventos dos amigos (MVP).

  RF05.2 \- O sistema deve exibir eventos que amigos confirmaram presença (MVP).

  RF05.3 \- O sistema deve exibir eventos que amigos demonstraram interesse (MVP).

  RF05.4 \- O sistema deve permitir reação (curtir) em eventos (Backlog).

  RF05.5 \- O sistema deve permitir comentários em eventos (Backlog).

  RF05.6 \- O sistema deve ordenar feed por relevância e proximidade temporal (MVP).


  **RF06 \- Feed Dedicado ao Evento**

  RF06.1 \- O sistema deve criar um feed específico para cada evento (Nice-to-have).

  RF06.2 \- O sistema deve permitir postagens no feed do evento (Nice-to-have).

  RF06.3 \- O sistema deve permitir compartilhamento de fotos/vídeos no feed do evento (Nice-to-have).

  RF06.4 \- O sistema deve exibir lista de participantes confirmados (Nice-to-have).

  RF06.5 \- O sistema deve permitir interações (curtidas, comentários) dentro do feed do evento (Nice-to-have).


  **RF07 \- Sistema de Busca e Filtros**

  RF07.1 \- O sistema deve permitir busca de eventos por nome (MVP).

  RF07.2 \- O sistema deve permitir filtrar eventos por cidade (MVP).

  RF07.3 \- O sistema deve permitir filtrar eventos por categoria (MVP).

  RF07.4 \- O sistema deve permitir filtrar eventos por data (MVP).

  RF07.5 \- O sistema deve permitir filtrar eventos por raio de distância (MVP).

  RF07.6 \- O sistema deve permitir ordenar resultados (data, distância, popularidade) (Backlog).

  RF07.7 \- O sistema deve permitir buscar usuários (Nice-to-have).

  **RF08 \- Mapa de Eventos**

  RF08.1 \- O sistema deve exibir eventos em mapa interativo (MVP).

  RF08.2 \- O sistema deve mostrar localização em tempo real dos eventos (MVP).

  RF08.3 \- O sistema deve implementar mapas de calor baseado na quantidade de participantes (Backlog).

  RF08.4 \- O sistema deve permitir aplicar filtros no mapa (MVP).

  RF08.5 \- O sistema deve permitir clicar em marcador para ver detalhes do evento (MVP).

  RF08.6 \- O sistema deve atualizar mapas em tempo real conforme confirmações de presença (Backlog).


  **RF09 \- Compartilhamento**

  RF09.1 \- O sistema deve permitir compartilhar eventos no feed da plataforma (Backlog).

  RF09.2 \- O sistema deve gerar link único para cada evento (MVP).

  RF09.3 \- O sistema deve permitir compartilhamento via WhatsApp (MVP).

  RF09.4 \- O sistema deve permitir compartilhamento via Instagram/Stories (Backlog).

  RF09.5 \- O sistema deve permitir compartilhamento via Facebook (Backlog).

  RF09.6 \- O sistema deve gerar preview card para links compartilhados (MVP).


  **RF10 \- Notificações**

  RF10.1 \- O sistema deve notificar sobre eventos de amigos (Backlog).

  RF10.2 \- O sistema deve notificar sobre comentários em eventos do usuário (Bakclog).

  RF10.3 \- O sistema deve notificar sobre eventos próximos confirmados(Backlog).

  RF10.4 \- O sistema deve notificar sobre alterações em eventos confirmados (Backlog).

  RF10.5 \- O sistema deve permitir configurar preferências de notificação (Backlog).

  RF10.6 \- O sistema deve suportar notificações push (mobile) e web push (Backlog).


  **RF11 \- Conta Premium**

  RF11.1 \- O sistema deve permitir upgrade para conta premium (Backlog).

  RF11.2 \- O sistema deve processar pagamentos (integração gateway) (Backlog).

  RF11.3 \- Usuários Premium devem ter acesso a estatísticas detalhadas dos eventos (Backlog).

  RF11.4 \- Usuários Premium devem poder destacar eventos no feed (Backlog).

  RF11.5 \- Usuários Premium devem ter suporte prioritário (Backlog).

  RF11.6 \- Usuários Premium devem poder criar eventos recorrentes (Backlog).


  4.2.2 Requisitos Não Funcionais

  **RNF01 – Performance**

  RNF01.1 \- O tempo de renderização do conteúdo principal do feed deve ser de até 2 segundos, com validação via ferramentas de auditoria de performance de frontend (simulação 4G).

  RNF01.2 \- O mapa deve renderizar 1.000 marcadores de eventos mantendo o carregamento inicial em até 3 segundos e a interação (zoom/pan) acima de 30 quadros por segundo (FPS), com validação via ferramentas de profiling de navegador.

  RNF01.3 \- As buscas da API devem retornar resultados em até 1 segundo, meta que deve ser atingida em 95% das requisições, com validação por testes de performance de endpoint de API.

  RNF01.4 \- O sistema deve suportar 10.000 usuários simultâneos (tecnicamente medido como 1.000 requisições por segundo), mantendo o tempo de resposta de até 500ms e taxa de erro até 0.1% para 95% das requisições, com validação via ferramentas de teste de carga.


  **RNF02 \- Usabilidade**

  RNF02.1 \- O sistema deve atingir uma pontuação **maior ou igual a 80** na SUS (System Usability Scale), validada através de testes formais de usabilidade com um grupo de usuários-alvo.

  RNF02.2 \- O sistema deve ser responsivo e funcional nas três categorias de tela (Mobile, Tablet, Desktop), com validação via inspeção de layout e testes em dispositivos de referência.

  RNF02.3 \- O fluxo para "Criar Evento" e "Confirmar Presença" (definidas como ações principais) não deve exigir mais que 3 cliques/toques a partir da tela inicial (feed).

  RNF02.4 \- O sistema deve fornecer feedback visual claro (*loaders*, *toasts* de sucesso/erro) para 100% das ações assíncronas do usuário, validado por inspeção manual de interface.


  **RNF03 \- Confiabilidade**

  RNF03.1 \- O sistema deve ter uma disponibilidade maior ou igual a 99.5% em medição mensal.

  RNF03.2 \- O sistema deve realizar *backup* automático e diário do banco de dados principal.

  RNF03.3 \- O sistema deve garantir um Tempo Máximo de Perda de Dados (RPO) de 24 horas e um Tempo Máximo de Recuperação (RTO) de 4 horas após um incidente grave.

  RNF03.4 \- A arquitetura deve possuir redundância (mínimo de duas instâncias) dos componentes críticos (servidores de aplicação e banco de dados) para permitir a recuperação automática de falhas (failover).

  **RNF04 \- Segurança**

  RNF04.1 \- Senhas devem ser armazenadas com hash (bcrypt/argon2).

  RNF04.2 \- O sistema deve implementar autenticação JWT com refresh tokens.

  RNF04.3 \- O sistema deve usar HTTPS para todas as comunicações.

  RNF04.4 \- O sistema deve implementar rate limiting para prevenir abusos.

  RNF04.5 \- O sistema deve validar e sanitizar todas as entradas de usuário.

  RNF04.6 \- O sistema deve implementar um fluxo de Consentimento Granular (LGPD) no cadastro, permitindo ao usuário aceitar finalidades específicas (ex: "feed social", "notificações").

  RNF04.7- O sistema deve prover Direitos dos Titulares via endpoints de API dedicados para acesso, exportação e exclusão (anonimização) dos dados pessoais do usuário.

  RNF04.8- O sistema deve possuir uma Política de Retenção que anonimize dados de usuários inativos por 24 meses.

  RNF04.9- O sistema deve registrar todas as ações de consentimento (aceite, revogação) em Logs de Auditoria (LGPD) não-modificáveis, detalhando o usuário, a data e a versão dos termos aceitos.


  **RNF05 \- Escalabilidade**

  RNF05.1 \- A arquitetura deve suportar escalabilidade horizontal, permitindo que a capacidade de carga (definida no RNF01.4) aumente de forma linear com a adição de novas instâncias de servidor.

  RNF05.2 \- O sistema deve usar cache para otimizar consultas frequentes (ex: feed), com a meta de uma taxa de acerto maior que 90% para estes dados.

  RNF05.3 \- A arquitetura do banco de dados deve ser projetada para suportar um crescimento de 10 vezes no volume de dados (via sharding ou particionamento) sem degradar a performance das buscas (definida no RNF01.3).

  RNF05.4 \- O sistema deve usar uma Rede de Distribuição de Conteúdo (CDN) para a entrega de mídias estáticas (fotos de perfil, imagens de eventos).


  **RNF06 – Manutenibilidade**

  RNF06.1 \- O código deve seguir padrões de clean code (código limpo) e boas práticas de desenvolvimento.

  RNF06.2 \- O sistema deve atingir uma cobertura de testes automatizados maior ou igual a 70%, com foco em testes unitários e de integração, validada por ferramentas de análise de cobertura.

  RNF06.3 \- O sistema deve ter documentação técnica completa das APIs e da arquitetura principal.

  RNF06.4 \- O código deve seguir arquitetura modular.


  **RNF07 \- Portabilidade**

  RNF07.1 \- A aplicação web deve ser funcional nas duas últimas versões estáveis dos navegadores Chrome, Firefox, Safari e Edge.

  RNF07.2 \- A aplicação mobile deve ser funcional em versões do iOS 14 ou superiores e Android 8 ou superiores.

  RNF07.3 \- O sistema deve usar tecnologias cross-platform quando possível.


  **RNF08 \- Compatibilidade**

  RNF08.1 \- O sistema deve integrar com APIs de mapas (Google Maps / Mapbox).

  RNF08.2 \- O sistema deve integrar com provedores OAuth (Google, Facebook).

  RNF08.3 \- O sistema deve integrar com gateway de pagamento.

  **4.3 Stack Tecnológica Sugerida**

  Frontend:

* Web: React.js \+ Next.js \+ TypeScript.
* Mobile: React Native \+ TypeScript.
* Estilização: Tailwind CSS (Web) / Styled Components (Mobile).
* Estado: Redux Toolkit ou Zustand.
* Mapas: Google Maps API / Mapbox.


  Backend

* Runtime: Java.
* Framework: Express.js ou Fastify.
* Linguagem: TypeScript.
* API: REST \+ GraphQL (opcional).
* Autenticação: JWT \+ Passport.js.
* Validação: Zod ou Yup.


  Banco de Dados:

* Principal: PostgreSQL \+ PostGIS (para geolocalização).
* Cache: Redis.
* Busca: Elasticsearch (opcional).


  Infraestrutura

* Cloud: AWS / Google Cloud / Azure.
* CDN: Cloudflare / CloudFront.
* Storage: AWS S3 / Google Cloud Storage.
* CI/CD: GitHub Actions / GitLab CI.


  Monitoramento

* Logs: Winston \+ ELK Stack.
* APM: New Relic / Datadog.
* Erros: Sentry.

**5\. CASOS DE USO**

**UC001 \- Cadastrar Usuário**

Ator Principal: Visitante

Pré-condições: Usuário não está cadastrado

**Fluxo Principal:**

Tabela 2 \- Fluxo principal do UC001.

| P-1  | Visitante acessa tela de cadastro.  |
| :---- | :---- |
| P-1.2  | Sistema exibe formulário de cadastro.  |
| P-1.3  | Visitante preenche dados (nome, email, senha).  |
| P-1.4  | Visitante aceita termos de uso.  |
| P-1.5  | Visitante envia o formulário.   |
| P-1.6  | Sistema valida os dados.  |
| P-1.7  | Sistema envia o E mail de confirmação.  |
| P-1.8  | Visitante confirma E-mail via link.  |
| P-1.9  | Sistema ativa a conta.  |
| P-1.10  | Sistema redireciona para tela de login.  |

**Fluxos Alternativos**:

A1 \- Visitante não recebe e-mail de confirmação.

Tabela 3 \- Fluxo alternativo A1 do UC001.

| A-1.1  | Início após P-1.6.  |
| :---- | :---- |
| A-1.2  | Usuário não confirma o E-mail.  |
| A-1.3  | Visitante clica no botão: “Re-enviar E-mail de confirmação”.  |
| A-1.4  | O sistema envia o E-mail novamente. |
| A-1.5  | Retorna para P-1.7. |

A2 \- O visitante não envia o formulário.

Tabela 4 \- Fluxo alternativo A2 do UC001.

| A-2.1  | Início após P-1.4. |
| :---- | :---- |
| A-2.2  | Visitante clica no botão “Voltar”. |
| A-2.3  | Sistema redireciona para página de login.  |

**Fluxos de exceção**:

E1 \- E-Mail já cadastrado.

Tabela 5 \- Fluxo de exceção E1 do UC001.

| E-1.1  | Início em P-1.6. |
| :---- | :---- |
| E-1.2  | Sistema verifica E mail já cadastrado na base de dados.  |
| E-1.3  | Sistema emite aviso “E-Mail já cadastrado... Redirecionando”. |
| E-1.4  | Sistema redireciona para página de login. |

Protótipo De Tela:

Figura 1 \- Protótipo de tela de cadastro.

![][image1]

Fonte: Elaborada pelo autor

**UC02 \- Criar Evento**

Ator Principal: Usuário autenticado.

Pré-condições: O usuário está logado.

**Fluxo Principal:**

Tabela 6 \- Fluxo principal do UC002.

| P-1  | Usuário acessa opção “Criar Evento”  |
| :---- | :---- |
| P-1.2  | Sistema exibe formulário de criação.  |
| P-1.3  | Usuário preenche dados obrigatórios. |
| P-1.4  | Usuário adiciona imagem do evento.  |
| P-1.5  | Usuário seleciona uma categoria.  |
| P-1.6  | Usuário define visibilidade (público/privado).  |
| P-1.7  | Usuário define capacidade máxima (opcional).  |
| P-1.8  | Sistema valida dados.  |
| P-1.9  | Sistema geolocaliza endereço informado.  |
| P-1.10  | Sistema armazena os dados do evento.  |
| P-1.11  | O sistema exibe confirmação e link do evento.  |
| P-1.12  | Sistema notifica amigos do usuário.  |

**Fluxos Alternativos:**

A1 \- Usuário Premium

Tabela 7 \- Fluxo alternativo A1 do UC002.

| A-1.1  | Início após P-1.7. |
| :---- | :---- |
| A-1.2  | Usuário premium adiciona imagens extras ao evento.  |
| A-1.3  | Usuário premium destaca o evento.  |
| A-1.4  | Usuário premium torna o evento recorrente.  |

A2 \- Usuário cancela a criação do evento:

Tabela 8 \- Fluxo alternativo A2 do UC002.

| A-2.1  | Início após P-1.4.  |
| :---- | :---- |
| A-2.2  | Visitante clica no botão “Voltar”. |
| A-2.3  | O sistema redireciona para o dashboard.  |

**Fluxos de Exceção:**

E1 \- Dados Inválidos

Tabela 9 \- Fluxo de exceção E1 do UC002.

| E-1.1  | Início em P-1.8.  |
| :---- | :---- |
| E-1.2  | O sistema verifica que a data informada e o endereço são inválidos.  |
| E-1.3  | Sistema emite aviso “Dados inválidos”.  |
| E-1.4  | Sistema reseta a data no formulário.  |

Protótipo de Tela:

Figura 2 \- Protótipo de tela de criação de eventos.

![][image2]

Fonte: Elaborada pelo autor

**UC03 \- Visualizar Mapa de Eventos.**

Ator Principal: Usuário autenticado.

Pré-condições: Usuário está logado.


**Fluxo Principal:**

Tabela 10 \- Fluxo principal do UC003.

| P-1  | Usuário acessa a visualização de mapa.  |
| :---- | :---- |
| P-1.2  | O sistema verifica permissões do aplicativo.  |
| P-1.3  | Sistema confirma permissão de localização.   |
| P-1.4  | Sistema carrega mapa centrado na localização do usuário.  |
| P-1.5  | Sistema renderiza marcadores de eventos próximos.   |
| P-1.6  | O sistema aplica o mapa de calor baseado na popularidade.  |
| P-1.7  | O sistema atualiza o mapa em tempo real.  |
| P-1.9  | O usuário seleciona um marcador.  |
| P-1.10  | Sistema exibe detalhes do evento.   |

**Fluxos Alternativos:**

A1 \- Permissão de localização:

Tabela 11 \- Fluxo alternativo A1 do UC003.

| A-1.1  | Início após P-1.2. |
| :---- | :---- |
| A-1.2  | O sistema verifica que não possui permissão de localização. |
| A-1.3  | Sistema pede para o usuário conceder permissão.  |
| A-1.4  | Usuário concede permissão.  |
| A-1.5  | Retorna para P-1.3. |

**Fluxos de Exceção:**

Tabela 12 \- Fluxo de exceção E1 do UC003.

| E-1.1  | Início em P-1.5. |
| :---- | :---- |
| E-1.2  | O sistema não encontra nenhum resultado com os filtros inseridos. |
| E-1.3  | O sistema exibe uma tela com o aviso “Nenhum evento encontrado”. |

Protótipo de Tela:

Figura 3 \- Protótipo de tela de mapa de eventos.

![][image3]

Fonte: Elaborada pelo autor

### **UC004 \- Gerenciar Conteúdo Denunciado.**

Ator Principal: Moderador

Pré-condições: O Moderador está autenticado no painel administrativo do sistema, existe pelo menos um item (evento, post, comentário ou usuário) que foi denunciado por um usuário e está na fila de moderação.

**Fluxo Principal (Análise e Resolução da Denúncia):**

Tabela 13 \- Fluxo principal UC004

| P-1  | Moderador acessa o "Painel de Moderação". |
| :---- | :---- |
| P-1.2  | O sistema exibe a fila de denúncias pendentes, ordenadas por prioridade ou data. |
| P-1.3  | O Moderador seleciona uma denúncia para analisar. |
| P-1.4  | O sistema exibe os detalhes do conteúdo denunciado (o evento, comentário, etc.), o motivo da denúncia e o histórico do infrator (se houver). |
| P-1.5  | Moderador avalia o caso e decide que a denúncia é **inválida** (cenário 1). |
| P-1.6  | Moderador seleciona a ação "Ignorar Denúncia" (ou "Marcar como Inválido"). |
| P-1.7  | O sistema fecha o ticket de denúncia e remove o item da fila de moderação. |

A1 \- Ação: Remover Conteúdo e Suspender Conta (Infração Média)

Tabela 14 \- Fluxo alternativo A1 do UC004

| A-1.1  | Início após P-4. |
| :---- | :---- |
| A-1.2  | Moderador avalia que a infração é "Média" (cenário 2). |
| A-1.3  | Moderador seleciona a ação "Remover Conteúdo e Suspender". |
| A-1.4  | O sistema solicita a confirmação e a duração da suspensão (ex: 7 dias, 30 dias). |
| A-1.5  | O Moderador confirma a ação. |
| A-1.6 | O sistema remove o conteúdo denunciado da plataforma. |
| A-1.7 | O sistema aplica a suspensão na conta do usuário infrator. |
| A-1.8 | Sistema notifica o usuário infrator sobre a ação e o motivo. |
| A-1.9 | Continua no P-1.7. |

A2 \- Ação: Remover Conteúdo e Banir Conta (Infração Grave)

Tabela 15 \- Fluxo alternativo A2 do UC004

| A-2.1  | Início após P-4. |
| :---- | :---- |
| A-2.2  | O Moderador avalia que a infração é "Grave" (cenário 3). |
| A-2.3  | Moderador seleciona a ação "Remover Conteúdo e Banir Permanentemente". |
| A-2.4  | Sistema solicita a confirmação final (ação irreversível). |
| A-2.5  | O Moderador confirma a ação. |
| A-2.6 | O sistema remove o conteúdo denunciado da plataforma. |
| A-2.7 | O sistema aplica o banimento permanente na conta do usuário infrator. |
| A-2.8 | O sistema notifica o usuário infrator sobre a ação. |
| A-2.9 | Continua no P-1.7. |

**Fluxos de Exceção:**

Tabela 16 \- Fluxo de exceção E1 do UC004

| E-1.1  | Início no P-3. |
| :---- | :---- |
| E-1.2  | O sistema detecta que a denúncia selecionada já foi resolvida (status "Resolvido"). |
| E-1.3  | O sistema exibe a mensagem "Este caso já foi resolvido por outro moderador". |
| E-1.4  | O sistema atualiza a fila de denúncias (retorna ao P-2). |

Protótipos de tela:

Figura 4 \- Protótipo de tela painel de moderação.

![][image4]

Fonte: Elaborada pelo autor

Figura 5 \- Protótipo de tela painel de moderação 2\.

![][image5]

Fonte: Elaborada pelo autor

### **UC005 \- Denunciar Conteúdo.**

Ator Principal: Usuário autenticado

Pré-condições: O usuário está logado, o usuário está visualizando um conteúdo.

**Fluxo Principal (Análise e Resolução da Denúncia):**

Tabela 17 \- Fluxo principal do UC005

| P-1  | O usuário identifica um conteúdo que viola os Termos de Uso. |
| :---- | :---- |
| P-1.2  | O usuário clica na opção "Denunciar". |
| P-1.3  | O sistema exibe um formulário pop-up solicitando o motivo da denúncia. |
| P-1.4  | O usuário seleciona um motivo principal da lista. |
| P-1.5  | O usuário clica no botão "Enviar Denúncia". |
| P-1.6  | O sistema registra a denúncia na fila de moderação. |
| P-1.7  | O sistema exibe uma mensagem de confirmação ao usuário. |
| P-1.8 | O sistema fecha o formulário de denúncia. |

A1 \- Usuário adiciona detalhes (comentário) à denúncia:

Tabela 18 \- Fluxo alternativo A1 do UC005

| A-1.1  | Início após P-4. |
| :---- | :---- |
| A-1.2  | O sistema oferece um campo de texto opcional para "Adicionar mais detalhes". |
| A-1.3  | Usuário digita um contexto adicional para ajudar o moderador. |
| A-1.4  | Continua no P-5. |



A2 \- Usuário cancela a denúncia:

**Fluxos de Exceção:**

Tabela 19 \- Fluxo alternativo A2 do UC005.

| E-1.1  | Início no P-2. |
| :---- | :---- |
| E-1.2  | O sistema verifica que este usuário já possui uma denúncia ativa para este conteúdo. |
| E-1.3  | O sistema exibe um aviso: "Você já denunciou este conteúdo." |

Protótipos de tela:

Figura 6 \- Protótipo de tela de denúncia de conteúdo.

![][image6]

Fonte: Elaborada pelo autor

**6\. HISTÓRIAS DE USUÁRIO**

Épico 1: Gerenciamento de Conta.

**US001 \- Cadastro de Usuário.**

Como: Visitante.

Quero: Criar uma conta na plataforma.

Para: Poder acessar e utilizar as funcionalidades do sistema.

Critérios de Aceitação:

* Deve ser possível cadastrar com e-mail/senha.
* Deve ser possível cadastrar via Google ou Facebook.
* E-mail de confirmação deve ser enviado.
* Validação de senha forte (mínimo 8 caracteres).
* Termos de uso devem ser aceitos.

Casos de uso relacionados: RF01.1, RF01.2, RF01.6.

**US002 \- Login na Plataforma.**

Como: Usuário cadastrado.

Quero: Fazer login na plataforma.

Para: Acessar minha conta e funcionalidades personalizadas.

Critérios de Aceitação:

* Login deve funcionar com e-mail e senha.
* Login via OAuth deve funcionar.
* Token JWT deve ser gerado.
* Sessão deve persistir entre navegações.
* Opção "Lembrar-me" deve manter login.

Casos de uso relacionados: RF01.1, RF01.2.

**US003 \- Edição de Perfil.**

Como: Usuário autenticado.

Quero: Editar informações do meu perfil.

Para: Manter meus dados atualizados e personalizados.

Critérios de Aceitação:

* Deve poder alterar a foto de perfil.
* Deve poder editar biografia.
* Deve poder atualizar localização.
* Deve poder adicionar interesses.
* Alterações devem ser salvas imediatamente.

Casos de uso relacionados: RF01.3.

Épico 2: Eventos.

**US004 \- Criação de Evento.**

Como: Usuário autenticado.

Quero: Criar um novo evento.

Para: Convidar pessoas e organizar encontros.

Critérios de Aceitação:

* Campos obrigatórios: título, descrição, data, local.
* Upload de imagem deve funcionar.
* Categorização deve estar disponível.
* Endereço deve ser geolocalizado automaticamente.
* Evento deve aparecer no feed após criação.

Casos de uso relacionados: RF03.1, RF03.2, RF03.3, RF03.4, RF03.5.

**US005 \- Busca de Eventos.**

Como: Usuário autenticado.

Quero: Buscar eventos por diferentes critérios.

Para: Encontrar eventos do meu interesse.

Critérios de Aceitação:

* Busca por texto deve funcionar.
* Filtros de cidade, categoria e data devem funcionar.
* Filtro de raio de distância deve usar geolocalização.
* Resultados devem ser ordenados por relevância.
* A busca deve retornar resultados em até 1 segundo.

Casos de uso relacionados: RF07.1, RF07.2, RF07.3, RF07.4, RF07.5, RF07.6.

**US006 \- Confirmar Presença.**

Como: Usuário autenticado.

Quero: Confirmar minha presença em um evento.

Para: Que o organizador e meus amigos saibam que vou participar.

Critérios de Aceitação:

* O Botão de confirmação deve ser visível.
* Confirmação deve atualizar contador.
* Amigos devem ser notificados.
* Evento deve aparecer em "Meus Eventos".
* Deve poder cancelar confirmação.

Casos de uso relacionados: RF04.2, RF04.3, RF04.4, RF04.5.

**US007 \- Demonstrar Interesse.**

Como: Usuário autenticado.

Quero: Marcar interesse em um evento.

Para: Acompanhar o evento sem me comprometer completamente.

Critérios de Aceitação:

* Opção "Tenho Interesse" deve estar disponível.
* Interesse deve atualizar contador.
* Evento deve aparecer em lista de interesses.
* Deve poder remover interesse.

Casos de uso relacionados: RF04.1, RF04.3, RF04.4.

Épico 3: Social.

**US008 \- Seguir Usuários.**

Como: Usuário autenticado.

Quero: Seguir outros usuários.

Para: Ver eventos e atividades deles.

Critérios de Aceitação:

* Botão seguir deve estar em perfis.
* Usuário seguido deve ser notificado.
* O Seguimento mútuo deve criar amizade.
* Feed deve atualizar com conteúdo do seguinte.

Casos de uso relacionados: RF02.1, RF02.2, RF02.6.

**US009 \- Feed Personalizado.**

Como: Usuário autenticado.

Quero: Ver um feed com eventos relevantes para mim.

Para: Descobrir eventos dos meus amigos e interesses.

Critérios de Aceitação:

* Feed deve mostrar eventos de amigos.
* Feed deve priorizar eventos próximos temporalmente.
* Feed deve incluir eventos confirmados por amigos.
* Feed deve refletir novas postagens e confirmações de amigos em até 5 segundos após a ação.

Casos de uso relacionados: RF05.1, RF05.2, RF05.3, RF05.6.

**US010 \- Comentar em Eventos.**

Como: Usuário autenticado.

Quero: Comentar em eventos.

Para: Interagir com outros participantes.

Critérios de Aceitação:

* O campo de comentário deve estar visível.
* Comentários devem aparecer para outros participantes na página do evento em até 5 segundos após a publicação.

* O criador do evento deve ser notificado.
* Deve poder curtir comentários.
* Deve poder responder comentários.

Casos de uso relacionados: RF05.5, RF06.5.

Épico 4: Mapa e Geolocalização.

**US011 \- Visualizar Mapa de Eventos.**

Como: Usuário autenticado.

Quero: Visualizar eventos em um mapa.

Para: Visualizar eventos próximos à minha localização.

Critérios de Aceitação:

* Mapa deve centralizar na localização do usuário.
* Eventos devem aparecer como marcadores.
* Marcadores devem mostrar preview ao clicar.
* O mapa deve carregar novos eventos (marcadores) que entram na área de visualização do usuário durante a navegação (pan/zoom).
* Performance deve ser mantida com muitos eventos.

Casos de uso relacionados: RF08.1, RF08.2, RF08.5.

**US012 \- Mapa de Calor.**

Como: Usuário autenticado.

Quero: Visualizar um mapa de calor dos eventos.

Para: Identificar regiões e eventos mais populares.

Critérios de Aceitação:

* Intensidade do calor deve refletir no número de participantes.
* Os dados de intensidade do mapa de calor devem ser recalculados e atualizados na visualização do usuário a cada 5 minutos, ou ao recarregar a tela do mapa.
* Deve ser possível ativar/desativar a camada de calor.
* Filtros devem afetar o mapa de calor.

Casos de uso relacionados: RF08.3, RF08.6.

Épico 5: Compartilhamento.

**US013 \- Compartilhar Evento.**

Como: Usuário autenticado.

Quero: Compartilhar eventos.

Para: Convidar amigos de outras plataformas.

Critérios de Aceitação:

* Deve gerar link único para cada evento.
* Preview card deve ser gerado corretamente.
* Compartilhamento para WhatsApp deve funcionar.
* Compartilhamento para Instagram Stories deve funcionar.
* Deve registrar compartilhamentos para analytics.

Casos de uso relacionados: RF09.1, RF09.2, RF09.3, RF09.4

Épico 6: Conta Premium.

**US014 \- Upgrade para Premium.**

Como: Usuário comum.

Quero: Fazer upgrade para conta premium.

Para: Acessar funcionalidades avançadas.

Critérios de Aceitação:

* Planos devem estar claramente descritos.
* Pagamento deve ser processado com segurança.
* Upgrade deve ser imediato após pagamento confirmado.
* Funcionalidades premium devem ser desbloqueadas.
* Deve haver opção de cancelamento.

Casos de uso relacionados: RF11.1, RF11.2.

**US015 \- Analytics de Eventos (Premium).**

Como: Usuário premium.

Quero: Acessar estatísticas dos meus eventos.

Para: Entender o engajamento e alcance.

Critérios de Aceitação:

* Dashboard de analytics deve estar disponível.
* Métricas: visualizações, compartilhamentos, confirmações.
* Gráficos devem ser interativos.
* Dados devem poder ser exportados.
* Os dados do dashboard de analytics devem ser atualizados em um intervalo de 15 minutos, ou através de um botão de atualização manual.

Casos de uso relacionados: RF11.3.

**7\. ESTRUTURA DE DIAGRAMAS**

**7.1 Diagrama de Casos de Uso.**

Figura 7 \- Diagrama de Casos de Uso (Usuário).

![][image7]

Fonte: Elaborada pelo autor

**7.2 Diagrama de Classes (Estrutura Principal)**

Figura 8 \- Diagrama de Classes.

![][image8]

				Fonte: Elaborada pelo autor

**7.3 Diagrama de Sequência**

Figura 9 \- Diagrama de Sequência “Criar Evento”.

![][image9]

Fonte: Elaborada pelo autor

**8\. MODELO DE DADOS (Estrutura Inicial)**

Figura 10 \- Diagrama de Entidade e Relacionamento (DER).

![][image10]

			Fonte: Elaborada pelo autor

**9\. CRONOGRAMA SUGERIDO (Adaptável)**

Fase 1 \- Planejamento (2 semanas):

* Refinamento de requisitos.
* Criação de wireframes e protótipos.
* Definição de arquitetura.
* Setup do projeto.

Fase 2 \- MVP Core (6 semanas):

* Autenticação e gerenciamento de usuários.
* CRUD de eventos.
* Feed básico.
* Sistema de follow.

Fase 3 \- Features Sociais (4 semanas):

* Sistema de comentários.
* Feed dedicado ao evento.
* Notificações.
* Compartilhamento.

Fase 4 \- Geolocalização (3 semanas):

* Integração com API de mapas.
* Mapa de eventos.
* Filtros de localização.
* Mapa de calor.

Fase 5 \- Premium e Pagamentos (2 semanas):

* Integração com gateway de pagamento.
* Features premium.
* Analytics.

Fase 6 \- Testes e Deploy (2 semanas):

* Testes end-to-end.
* Correções de bugs.
* Deploy em produção.

**10\. MÉTRICAS DE SUCESSO**

KPIs Técnicos:

* Tempo de resposta da API \< 200ms (95º percentil).
* Uptime \> 99.5%.
* Taxa de erro \< 0.1%.
* Cobertura de testes \> 70%.

KPIs de Produto:

* Taxa de conversão cadastro \> 40%.
* Usuários ativos mensais.
* Número de eventos criados por mês.
* Taxa de confirmação de presença.
* Engajamento no feed (curtidas, comentários).

KPIs de Negócio:

* Taxa de conversão para premium.
* Retention rate (usuários que voltam após 7 dias).
* Lifetime Value (LTV) dos usuários.

**11\. RISCOS E MITIGAÇÕES**

Risco 1: Escalabilidade do Mapa em Tempo Real.

Mitigação: Implementar cache agressivo, lazy loading de marcadores, clustering.

Risco 2: Segurança e Privacidade de Dados.

Mitigação: Conformidade com LGPD, criptografia, auditorias de segurança.

Risco 3: Precisão da Geolocalização.

Mitigação: Validação de endereços, fallback para múltiplas APIs de mapas.

Risco 4: Moderação de Conteúdo.

Mitigação: Sistema de denúncias, moderação automática \+ manual.

Risco 5: Performance com Muitos Eventos.

Mitigação: Paginação, índices otimizados, cache, sharding.

**12\. PRÓXIMOS PASSOS**

1. Validar requisitos: com orientador e stakeholders.
2. Criar protótipos de alta fidelidade: no Figma.
3. Desenvolver diagramas UML completos (Casos de Uso, Classes, Sequência, entre outros).
4. Definir arquitetura detalhada: do sistema.
5. Iniciar desenvolvimento: do MVP.
6. Implementar testes: desde o início.
7. Documentar API: com Swagger/OpenAPI.
8. Realizar testes de usabilidade: com usuários reais.

**13\. CONCLUSÃO**

Este trabalho apresentou o desenvolvimento do Conectaí, uma plataforma social inovadora voltada para a descoberta, criação e gerenciamento de eventos, com foco no público jovem brasileiro. A proposta surgiu da identificação de uma lacuna significativa no mercado: a ausência de uma solução nacional que combine recursos de geolocalização em tempo real com elementos de rede social, especialmente após o distanciamento do público jovem de plataformas generalistas como o Facebook.

O projeto foi estruturado em bases sólidas de engenharia de software, contemplando desde a análise de requisitos até a definição de uma arquitetura escalável e moderna. A especificação técnica resultou na identificação de 11 grupos de requisitos funcionais, totalizando mais de 60 funcionalidades detalhadas, além de 8 categorias de requisitos não-funcionais que garantem performance, segurança e usabilidade.

A metodologia de priorização adotada, classificando requisitos em MVP (Produto Mínimo Viável), Backlog e Nice-to-have, demonstrou-se essencial para viabilizar o desenvolvimento dentro do cronograma acadêmico, mantendo o foco nas funcionalidades core que materializam a proposta de valor da plataforma: a descoberta facilitada de eventos baseada em proximidade geográfica e conexões sociais.

A modelagem do sistema, expressa através de diagramas UML (Casos de Uso, Classes, Sequência e Entidade-Relacionamento), proporcionou uma visão clara da arquitetura proposta, evidenciando as interações entre os principais componentes do sistema e a estrutura de dados necessária para suportar as funcionalidades planejadas.

Em relação aos objetivos estabelecidos, o presente trabalho cumpriu a etapa de especificação e planejamento completo do sistema. A análise do comportamento do público jovem foi realizada na contextualização, identificando a migração da Geração Z para plataformas mais específicas e o crescimento pós-pandemia do setor de eventos. A identificação de requisitos foi concluída com sucesso, resultando em documentação detalhada e priorizada. O projeto da arquitetura foi completado através da definição da stack tecnológica e dos diagramas estruturais. Protótipos de baixa fidelidade foram criados para as telas principais, servindo como base para a implementação futura.

As contribuições deste trabalho manifestam-se em diferentes dimensões. Do ponto de vista técnico, a especificação propõe uma arquitetura escalável e moderna, utilizando tecnologias contemporâneas como React Native para mobile, Next.js para web, e PostgreSQL com extensão PostGIS para dados geoespaciais. A integração de dados relacionais com extensões geoespaciais representa um diferencial técnico relevante para aplicações baseadas em localização. A estratégia de priorização de escopo adotada pode servir como referência para outros projetos acadêmicos e startups.

Do ponto de vista social, em um momento histórico marcado pela retomada de interações presenciais, o Conectaí posiciona-se como ferramenta facilitadora de encontros reais, contribuindo para o bem-estar social e fortalecimento de comunidades locais. Ao focar nas necessidades da Geração Z, o projeto demonstra compromisso com a inclusão digital de diferentes perfis de usuários. Do ponto de vista mercadológico, a proposta de uma solução brasileira para descoberta de eventos atende a uma demanda específica do mercado local, considerando aspectos culturais e padrões de socialização próprios do Brasil.

**13.1** **Considerações Finais**

O desenvolvimento do Conectaí representa não apenas um projeto técnico de engenharia de software, mas uma resposta concreta a necessidades sociais identificadas no contexto pós-pandemia. A plataforma proposta demonstra como a tecnologia pode servir como ponte para reconexões humanas autênticas, facilitando encontros presenciais em uma era predominantemente digital.

A metodologia rigorosa de engenharia de software aplicada neste trabalho \- desde a elicitação de requisitos até a modelagem detalhada do sistema \- estabelece bases sólidas para a implementação bem-sucedida do projeto. A escolha de tecnologias modernas e escaláveis, aliada à definição clara de métricas de sucesso, posiciona o Conectaí não apenas como um projeto acadêmico, mas como um produto com potencial real de mercado.

Mais do que uma plataforma de eventos, o Conectaí materializa uma filosofia: a de que a tecnologia deve servir para aproximar pessoas, criar comunidades e enriquecer experiências humanas. Em um mundo onde as conexões digitais frequentemente substituem interações presenciais, este projeto reafirma o valor insubstituível dos encontros face a face, utilizando a tecnologia como facilitadora, não substituta, das relações sociais.

O caminho percorrido até aqui \- da identificação do problema à especificação completa da solução \- demonstra a viabilidade técnica e a relevância social do projeto. Os próximos passos, que envolvem a implementação e validação do sistema, prometem transformar esta especificação detalhada em uma realidade tangível que pode impactar positivamente a vida social de milhares de usuários.

Este trabalho, portanto, não se encerra aqui, mas representa o primeiro capítulo de uma jornada mais ampla: a de criar uma plataforma que, ao facilitar a descoberta de eventos, contribua para tecidos sociais mais conectados, comunidades mais vibrantes e experiências humanas mais ricas.

**REFERÊNCIAS**

ALMEIDA, Paulo Octavio. **Setor de eventos no Brasil supera pré-pandemia em 2023 e deve crescer 19% em 2024**. Mercado e Eventos, São Paulo, 20 fev. 2024\. Disponível em: https://www.mercadoeeventos.com.br/\_destaque\_/slideshow/setor-de-eventos-no-brasil-supera-pre-pandemia-em-2023-e-deve-crescer-19-em-2024/. Acesso em: 18 ago. 2025\.

ASSOCIAÇÃO BRASILEIRA DOS PROMOTORES DE EVENTOS (ABRAPE). **Projeções para o setor de eventos brasileiro em 2024**. São Paulo, 2024\. Disponível em: https://www.abrape.com.br/. Acesso em: 22 set. 2025\.

CASSIDY, Ciara. **Facebook's not getting any younger; neither are its users**. The Drum, Londres, 13 mar. 2024\. Disponível em: https://www.thedrum.com/opinion/2024/03/13/facebook-s-not-getting-any-younger-neither-are-its-users. Acesso em: 03 out. 2025\.

**EVENTBRITE**. **Sobre o Eventbrite: Plataforma de eventos e ingressos**. Eventbrite Inc., 2024\. Disponível em: https://www.eventbrite.com.br/. Acesso em: 11 ago. 2025\.

FONSECA, João José Saraiva da. **Metodologia da Pesquisa Científica**. Fortaleza: UEC, 2002\.

**GOOGLE MAPS PLATFORM**. **Google Maps Platform Documentation**. Google LLC, 2024\. Disponível em: https://developers.google.com/maps. Acesso em: 29 set. 2025\.

**INCOGNIA**. **Tudo o que você precisa saber sobre tecnologia de localização: o seu guia definitivo**. Incognia, 28 abr. 2022\. Disponível em: https://www.incognia.com/pt/dicionario-da-autenticacao-mobile/tudo-o-que-voce-precisa-saber-sobre-localizacao-guia-definitivo. Acesso em: 14 ago. 2025\.

JUNIOR, Gustavo Silva. **Desenvolvimento de Sistema de Geolocalização em Realidade Aumentada para Multiplataforma Móvel**. 2015\. 61 f. Dissertação (Mestrado em Engenharia Elétrica) \- Faculdade de Engenharia Elétrica, Universidade Federal de Uberlândia, Uberlândia, 2015\.

**LOGPYX**. **Tecnologias de localização em tempo real: Conheça\!** LogPyx, 10 maio 2025\. Disponível em: https://logpyx.com/tecnologias-de-localizacao-em-tempo-real/. Acesso em: 16 nov. 2025\.

**MEETUP**. **Sobre o Meetup: Conectando pessoas através de interesses compartilhados**. Meetup LLC, 2024\. Disponível em: https://www.meetup.com/pt-BR/about/. Acesso em: 07 nov. 2025\.

**SYMPLA**. **Sympla: Plataforma de eventos online e presenciais**. Sympla Tecnologia S.A., 2024\. Disponível em: https://www.sympla.com.br/. Acesso em: 21 set. 2025\.

**TREINAWEB**. **O que é o React Native?** TreinaWeb Blog, 2024\. Disponível em: https://www.treinaweb.com.br/blog/o-que-e-o-react-native. Acesso em: 21 set. 2025\.

**USEMOBILE**. **React Native: saiba o que é, vantagens e funcionalidades**. Usemobile, 12 set. 2023\. Disponível em: https://usemobile.com.br/react-native/. Acesso em: 15 out. 2025\.

TypeScript. ***TypeScript: JavaScript With Syntax For Types***. s. d. Disponível em: https://www.typescriptlang.org/. Acesso em: 10 ago. 2025\.

Java. ***What is Java technology and why do I need it?***. s. d. Disponível em: https://www.java.com/en/download/help/whatis\_java.html. Acesso em: 02 nov. 2025\.

Figma. ***Figma: Figma: The Collaborative Interface Design Tool***. s. d. Disponível em: www.figma.com. 12 set. 2025\.

Klug, Brandy. (2017). ***An Overview of the System Usability Scale in Library Website and System Usability Testing***. Weave: Journal of Library User Experience. Disponível em: https://doi.org/10.3998/weave.12535642.0001.602. Acesso em: 30 out. 2025\.

FERREIRA, V. B. S.; FERREIRA, C. A.; GRANDE, E. T. G. **Estado da arte da pesquisa em: Clean Architecture e princípios de SOLID**. Research, Society and Development, 2022\. Disponível em: http://dx.doi.org/10.33448/rsd-v11i16.37198. Acesso em: 09 set. 2025\.

GitHub. ***Change is constant. GitHub keeps you ahead***. s. d. Disponível em: www.github.com. Acesso em: 28 set. 2025\.

PostgreSQL. ***About \- PostgreSQL***. s. d. Disponível em: https://www.postgresql.org/about/. Acesso em: 06 ago. 2025\.

Amazon Web Services. ***What is AWS? \- Cloud Computing with AWS \- Amazon AWS***. s. d. Disponível em: https://aws.amazon.com/what-is-aws/. Acesso em: 19 set. 2025\.

Rosal, I. **Desenhando Diagramas por Linha de Código | PlantUML e VS Code** \[Vídeo\]. YouTube, 2022\. Disponível em: https://www.youtube.com/watch?v=WSC1K\_rDf2w. Acesso em: 10 out. 2025

React Native. ***React Native · Learn once, write anywhere***. s. d. Disponível em: https://reactnative.dev/. Acesso em: 10 out. 2025

Next.js. ***Next.js by Vercel \- The React Framework***. s. d. Disponível em: https://nextjs.org/. Acesso em: 10 out. 2025\.

TailwindCSS. ***Tailwind CSS \- Rapidly build modern websites without ever leaving your HTML***. Disponível em: https://tailwindcss.com/. Acesso em: 10 out. 2025

SOMMERVILLE, I. **Software Engineering.** 10th Global ed. Harlow: Pearson, 2016\. Acesso em: 10 out. 2025\.

PRESSMAN, R. W, MAXIM B. R. **Software Engineering** \- A Practitioner's Approach. 8th ed. New York: McGraw-Hill, 2015\. Acesso em: 10 out. 2025\.
