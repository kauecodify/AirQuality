# AirQuality Monitor - Plataforma de Monitoramento de Qualidade do Ar

## Descrição do Projeto

O **AirQuality Monitor** é uma plataforma web completa para monitoramento, visualização e análise de dados de qualidade do ar em tempo real. O sistema simula um ambiente IoT, coletando dados de sensores de CO₂, umidade e temperatura, integrando-se com uma API meteorológica externa (OpenWeatherMap) e armazenando os dados em um banco de dados MongoDB Atlas.

## Tecnologias Utilizadas

### Backend
- **Node.js** - Ambiente de execução JavaScript
- **Express.js** - Framework web para Node.js
- **Mongoose** - ODM para MongoDB
- **dotenv** - Gerenciamento de variáveis de ambiente
- **Axios** - Cliente HTTP para requisições à API externa
- **CORS** - Middleware para habilitar CORS

### Frontend
- **HTML5** - Estrutura semântica
- **CSS3** - Estilização responsiva e acessível
- **JavaScript ES6+** - Lógica do cliente
- **Chart.js** - Geração de gráficos interativos

### Banco de Dados
- **MongoDB Atlas** - Banco de dados NoSQL em nuvem

### APIs Externas
- **OpenWeatherMap API** - Dados meteorológicos em tempo real

### Testes
- **Jest** - Framework de testes
- **Supertest** - Testes de API

### Análise de Dados
- **Python 3** - Linguagem para análise
- **Pandas** - Manipulação de dados
- **Matplotlib** - Geração de gráficos
- **NumPy** - Operações numéricas

### DevOps
- **Git** - Controle de versão
- **GitHub** - Hospedagem de código
- **Vercel/Heroku** - Hospedagem sugerida

## Estrutura de Pastas

```
airquality-monitor/
├── src/
│   ├── controllers/
│   │   ├── leiturasController.js  # Controlador para leituras
│   │   └── climaController.js     # Controlador para dados climáticos
│   ├── models/
│   │   └── Leitura.js             # Modelo de dados
│   ├── routes/
│   │   ├── leituras.js            # Rotas para leituras
│   │   └── clima.js               # Rotas para clima
│   ├── public/
│   │   ├── index.html             # Página principal
│   │   ├── style.css              # Estilos CSS
│   │   └── script.js              # Scripts do cliente
│   └── app.js                     # Configuração do servidor Express
├── tests/
│   └── api.test.js                # Testes automatizados
├── data-analysis/
│   ├── analise_dados.py           # Script de análise Python
│   └── requirements.txt           # Dependências Python
├── .gitignore                     # Arquivos ignorados pelo Git
├── .env.example                   # Exemplo de variáveis de ambiente
├── package.json                   # Dependências e scripts npm
└── README.md                      # Documentação do projeto
```

## Requisitos Atendidos

### Backend
- [x] Servidor Express configurado
- [x] Conexão com MongoDB Atlas usando variáveis de ambiente
- [x] Modelo de leitura com: co2, umidade, temperatura e data/hora
- [x] API REST interna com:
  - GET /api/leituras — retorna todas as leituras
  - POST /api/leituras — insere nova medição com validação
  - GET /api/clima — consulta a API OpenWeatherMap
- [x] Tratamento de erros e respostas JSON consistentes
- [x] Arquitetura MVC

### Frontend
- [x] Interface responsiva usando tags semânticas: header, main, section, footer
- [x] Contraste de cores adequado (≥ 4,5:1)
- [x] Navegação completa por teclado
- [x] Compatibilidade com leitores de tela
- [x] Textos alternativos em imagens
- [x] Atualização dinâmica dos dados via fetch
- [x] Gráfico interativo com Chart.js para níveis de CO₂
- [x] Formulário acessível para inserir novas leituras
- [x] Validação no navegador
- [x] Exibição de dados climáticos da API externa
- [x] Mapa de sensores

### Integração com APIs
- [x] Consumir OpenWeatherMap no backend
- [x] Chave via variável de ambiente
- [x] Nunca expor chaves secretas no código-fonte

### Testes Automatizados
- [x] Testes com Jest + Supertest
- [x] GET /api/leituras retorna status 200 e array
- [x] POST /api/leituras valida dados e retorna status adequado
- [x] Rotas principais respondem corretamente
- [x] Script "npm test"

### Análise de Dados
- [x] Script Python que lê dados exportados em CSV
- [x] Calcula média de CO₂, pico registrado
- [x] Análise por dia da semana
- [x] Gera gráfico boxplot com Matplotlib
- [x] Exibe relatório simples no terminal

### Documentação
- [x] README completo
- [x] Descrição do projeto
- [x] Tecnologias utilizadas
- [x] Estrutura de pastas
- [x] Como configurar variáveis de ambiente
- [x] Como rodar o projeto localmente
- [x] Como executar testes
- [x] Como rodar a análise de dados
- [x] Requisitos atendidos
- [x] Melhorias futuras

### Qualidade de Código
- [x] Código organizado em MVC
- [x] Uso de variáveis de ambiente para strings de conexão e chaves de API
- [x] Validação de dados no backend e frontend
- [x] Acessibilidade WCAG 2.1
- [x] Código limpo e pronto para execução

## Pré-requisitos

Antes de começar, certifique-se de ter os seguintes pré-requisitos instalados:

- **Node.js** (versão 18 ou superior)
- **npm** (versão 9 ou superior)
- **MongoDB Atlas** (conta gratuita disponível)
- **Python 3** (para análise de dados)
- **Git**

## Configuração

### 1. Clone o repositório

```bash
git clone https://github.com/kauecodify/AirQuality.git
cd AirQuality
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto com base no arquivo `.env.example`:

```bash
cp .env.example .env
```

Edite o arquivo `.env` e preencha as variáveis:

```env
# MongoDB Atlas Connection String
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.example.mongodb.net/airquality?retryWrites=true&w=majority

# OpenWeatherMap API Key
OPENWEATHER_API_KEY=your_api_key_here

# Server Port
PORT=3000

# Application Environment
NODE_ENV=development
```

> **Nota:** Para obter uma chave da API OpenWeatherMap, cadastre-se em [https://openweathermap.org/api](https://openweathermap.org/api) e crie uma chave gratuita.

> **Nota:** Para o MongoDB Atlas, crie um cluster gratuito em [https://www.mongodb.com/atlas](https://www.mongodb.com/atlas) e obtenha a string de conexão.

### 4. Instale as dependências Python (opcional, para análise de dados)

```bash
# Navegue até a pasta de análise
cd data-analysis

# Crie um ambiente virtual (recomendado)
python -m venv venv
source venv/bin/activate  # No Windows: venv\Scripts\activate

# Instale as dependências
pip install -r requirements.txt
```

## Como Rodar o Projeto Localmente

### Iniciar o servidor

```bash
npm start
```

O servidor será iniciado na porta 3000 (ou na porta configurada em `.env`).

Acesse a aplicação em: [http://localhost:3000](http://localhost:3000)

### Modo de desenvolvimento (com hot reload)

```bash
npm run dev
```

> **Nota:** Certifique-se de ter o `nodemon` instalado globalmente (`npm install -g nodemon`) ou ele será instalado automaticamente como dependência de desenvolvimento.

## Como Executar Testes

### Rodar todos os testes

```bash
npm test
```

### Rodar testes no modo watch

```bash
npm run test:watch
```

## Como Rodar a Análise de Dados

### 1. Exportar dados do MongoDB

Primeiro, exporte os dados do MongoDB para um arquivo CSV. Você pode usar o MongoDB Compass ou a linha de comando:

```bash
# Usando mongoexport (se instalado)
mongoexport --uri="$MONGODB_URI" --collection=leituras --out=dados_qualidade_ar.csv --type=csv --fields=co2,umidade,temperatura,dataHora
```

Ou use o MongoDB Compass para exportar manualmente.

### 2. Rodar o script de análise

```bash
# Navegue até a pasta de análise
cd data-analysis

# Ative o ambiente virtual (se criado)
source venv/bin/activate  # No Windows: venv\Scripts\activate

# Execute o script
python analise_dados.py ../dados_qualidade_ar.csv
```

> **Nota:** Certifique-se de que o arquivo CSV está no mesmo diretório ou forneça o caminho completo.

### Saída da Análise

O script gerará os seguintes arquivos:
- `relatorio_analise.txt` - Relatório completo em texto
- `boxplot_qualidade_ar.png` - Gráfico boxplot das variáveis
- `series_temporal.png` - Gráfico de série temporal
- `matriz_correlacao.png` - Matriz de correlação entre variáveis

## Fluxo de Trabalho Recomendado (Git)

```bash
# Criar branch de feature
git checkout -b feature/nova-funcionalidade

# Fazer commits
git add .
git commit -m "Adiciona nova funcionalidade"

# Enviar para o repositório remoto
git push origin feature/nova-funcionalidade

# Criar Pull Request no GitHub
# Após revisão, mesclar com a branch develop

# Atualizar a branch main a partir da develop
git checkout main
git merge develop
```

## Funcionalidades da Aplicação

### Dashboard
- Visualização da última leitura
- Gráfico interativo de CO₂ ao longo do tempo
- Mapa de sensores distribuídos pela cidade
- Tabela com as leituras recentes

### Dados Climáticos
- Exibição do clima atual (OpenWeatherMap)
- Previsão para 5 dias
- Índice de Qualidade do Ar (AQI) simulado

### Adicionar Nova Leitura
- Formulário para inserir novos dados
- Validação em tempo real
- Feedback visual

### Estatísticas
- Estatísticas detalhadas para CO₂, umidade e temperatura
- Total de leituras registradas

## Acessibilidade

A aplicação segue os padrões WCAG 2.1:
- Contraste de cores ≥ 4,5:1
- Navegação completa por teclado
- Compatibilidade com leitores de tela
- Textos alternativos em imagens
- Estrutura semântica do HTML
- Foco visível em elementos interativos

## API Endpoints

### Leituras
- `GET /api/leituras` - Lista todas as leituras
- `GET /api/leituras/latest` - Última leitura
- `GET /api/leituras/stats` - Estatísticas
- `GET /api/leituras/paginated` - Leituras paginadas
- `GET /api/leituras/:id` - Leitura por ID
- `POST /api/leituras` - Criar nova leitura
- `PUT /api/leituras/:id` - Atualizar leitura
- `DELETE /api/leituras/:id` - Deletar leitura

### Clima
- `GET /api/clima` - Dados climáticos atuais
- `GET /api/clima/forecast` - Previsão para 5 dias
- `GET /api/clima/air-quality` - Índice de qualidade do ar

## Hospedagem

### Vercel (Frontend)
1. Instale o CLI da Vercel: `npm install -g vercel`
2. Execute: `vercel`
3. Siga as instruções

### Heroku (Backend)
1. Instale o CLI do Heroku
2. Crie um novo app: `heroku create`
3. Configure as variáveis de ambiente: `heroku config:set MONGODB_URI=... OPENWEATHER_API_KEY=...`
4. Faça deploy: `git push heroku main`

## Melhorias Futuras

### Funcionalidades
- [ ] Autenticação de usuários (JWT)
- [ ] Sistema de alertas para níveis críticos de CO₂
- [ ] Integração com mais APIs de qualidade do ar
- [ ] Geolocalização automática dos sensores
- [ ] Dashboard personalizável
- [ ] Exportação de dados em PDF/Excel
- [ ] Notificações por e-mail/SMS

### Backend
- [ ] Implementar cache com Redis
- [ ] Adicionar rate limiting
- [ ] Implementar logging estruturado
- [ ] Adicionar mais validações
- [ ] Implementar WebSockets para atualizações em tempo real

### Frontend
- [ ] Adicionar mais gráficos (umidade, temperatura)
- [ ] Implementar mapa interativo com Leaflet/Mapbox
- [ ] Adicionar modo escuro
- [ ] Melhorar responsividade mobile
- [ ] Adicionar animações mais suaves

### Banco de Dados
- [ ] Implementar índices adicionais para melhorar performance
- [ ] Adicionar agregações mais complexas
- [ ] Implementar backup automático

### Testes
- [ ] Adicionar testes de integração
- [ ] Adicionar testes E2E com Cypress
- [ ] Aumentar cobertura de testes
- [ ] Implementar testes de performance

### DevOps
- [ ] Configurar CI/CD com GitHub Actions
- [ ] Implementar containerização com Docker
- [ ] Configurar monitoramento com Prometheus/Grafana
- [ ] Implementar deployment automático

## Contribuição

Contribuições são bem-vindas! Siga os passos:

1. Fork o repositório
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Faça commit das suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## Licença

Este projeto está licenciado sob a [MIT License](LICENSE).

## Contato

Para dúvidas ou sugestões, abra uma issue no GitHub ou entre em contato.

---

**AirQuality Monitor** - Monitoramento de Qualidade do Ar em Tempo Real

*Desenvolvido para fins acadêmicos e de aprendizado*
