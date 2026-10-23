# Projeto Integrador III - AirQuality Monitor | Plataforma de Monitoramento de Qualidade do Ar
## Bacharel em Tecnologia da Informação | Engenharia da Computação (UNIVESP)

**Feito por: Vera**

RA 24226943 | 24212767

<img width="1295" height="628" alt="image" src="https://github.com/user-attachments/assets/9e9184a7-23c0-45b4-8980-54b4c87b3070" />

<img width="672" height="672" alt="image" src="https://github.com/user-attachments/assets/8ad499dd-cd9c-49a5-be40-ab20740fae54" />

<img width="989" height="540" alt="image" src="https://github.com/user-attachments/assets/7f912c34-bf91-4478-8289-a82488fe1b3f" />

<img width="356" height="538" alt="image" src="https://github.com/user-attachments/assets/1c85bdd8-06ed-43ab-aa1f-96f6fd6ce580" />

---

## Descrição do Projeto

O **AirQuality Monitor** é uma plataforma web completa para monitoramento, visualização e análise de dados de qualidade do ar em tempo real, desenvolvido como **Projeto Integrador III** para o curso de Bacharel em Tecnologia da Informação e Engenharia da Computação da UNIVESP. O sistema simula um ambiente IoT, coletando dados de sensores de CO₂, umidade e temperatura, integrando-se com uma API meteorológica externa (OpenWeatherMap) e armazenando os dados em um banco de dados MongoDB Atlas.

## Novidades: Mapa Interativo em Tempo Real

✅ **Mapa Interativo com Leaflet.js** - Visualização geográfica dos sensores

✅ **Atualização em Tempo Real com Socket.io** - Dados atualizados automaticamente sem refresh

✅ **Marcadores de Sensores** - Exibição de status de CO₂ com cores (Bom, Moderado, Ruim, etc.)

✅ **Popups Informativos** - Detalhes de cada sensor ao clicar

✅ **Fácil Hospedagem na Vercel** - Configuração pronta para deploy com um clique

✅ **Conexão Robusta** - Tratamento de erros e reconexão automática

## Tecnologias Utilizadas

### Backend
- **Node.js** - Ambiente de execução JavaScript
- **Express.js** - Framework web para Node.js
- **Mongoose** - ODM para MongoDB
- **dotenv** - Gerenciamento de variáveis de ambiente
- **Axios** - Cliente HTTP para requisições à API externa
- **CORS** - Middleware para habilitar CORS
- **Socket.io** - Comunicação em tempo real
- **HTTP Server** - Servidor HTTP para Socket.io

### Frontend
- **HTML5** - Estrutura semântica
- **CSS3** - Estilização responsiva e acessível
- **JavaScript ES6+** - Lógica do cliente
- **Chart.js** - Geração de gráficos interativos
- **Leaflet.js** - Mapa interativo (OpenStreetMap)
- **Socket.io Client** - Atualizações em tempo real

### Banco de Dados
- **MongoDB Atlas** - Banco de dados NoSQL em nuvem

### APIs Externas
- **OpenWeatherMap API** - Dados meteorológicos em tempo real
- **OpenStreetMap** - Tiles para o mapa (sem necessidade de API key)

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
- **Vercel** - Hospedagem sugerida (configuração pronta)
- **Heroku** - Alternativa para backend

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
│   └── app.js                     # Configuração do servidor Express + Socket.io
├── tests/
│   └── api.test.js                # Testes automatizados
├── data-analysis/
│   ├── analise_dados.py           # Script de análise Python
│   └── requirements.txt           # Dependências Python
├── vercel.json                    # Configuração para Vercel
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
- [x] **Socket.io para atualização em tempo real**
- [x] Tratamento de erros e respostas JSON consistentes
- [x] Arquitetura MVC

### Frontend
- [x] Interface responsiva usando tags semânticas: header, main, section, footer
- [x] Contraste de cores adequado (≥ 4,5:1)
- [x] Navegação completa por teclado
- [x] Compatibilidade com leitores de tela
- [x] Textos alternativos em imagens
- [x] Atualização dinâmica dos dados via fetch
- [x] **Mapa interativo com Leaflet.js e OpenStreetMap**
- [x] **Atualização em tempo real via Socket.io**
- [x] Gráfico interativo com Chart.js para níveis de CO₂
- [x] Formulário acessível para inserir novas leituras
- [x] Validação no navegador
- [x] Exibição de dados climáticos da API externa

### Integração com APIs
- [x] Consumir OpenWeatherMap no backend
- [x] **OpenStreetMap para mapa (sem API key)**
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

### Qualidade de Código
- [x] Código organizado em MVC
- [x] Uso de variáveis de ambiente para strings de conexão e chaves de API
- [x] Validação de dados no backend e frontend
- [x] Acessibilidade WCAG 2.1
- [x] Código limpo e pronto para execução

## 🌍 Mapa Interativo - Funcionalidades

### Características do Mapa
- **Leaflet.js**: Biblioteca leve e eficiente para mapas
- **OpenStreetMap**: Tiles gratuitos sem necessidade de API key
- **Marcadores Personalizados**: Ícones coloridos de acordo com o nível de CO₂
- **Popups Informativos**: Exibe CO₂, umidade, temperatura e localização ao clicar
- **Atualização em Tempo Real**: Novos sensores aparecem automaticamente
- **Status de Conexão**: Indicador visual de conexão com o servidor

### Níveis de CO₂ e Cores
| Nível de CO₂ (ppm) | Cor | Status |
|-------------------|-----|--------|
| 0-299 | Verde | Bom |
| 300-399 | Amarelo | Moderado |
| 400-499 | Laranja | Ruim |
| 500-999 | Vermelho | Muito Ruim |
| 1000+ | Roxo | Péssimo |

### Reconexão Automática
- O mapa tenta reconectar automaticamente se perder a conexão
- Indicador visual mostra o status da conexão
- Dados são sincronizados automaticamente quando a conexão é restabelecida

## Pré-requisitos

Antes de começar, certifique-se de ter os seguintes pré-requisitos instalados:

- **Node.js** (versão 18 ou superior)
- **npm** (versão 9 ou superior)
- **MongoDB Atlas** (conta gratuita disponível)
- **Python 3** (para análise de dados, opcional)
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

## ✅ Teste o Mapa Interativo

1. **Adicione uma nova leitura** com coordenadas no formulário
2. **Veja o marcador aparecer no mapa** automaticamente
3. **Clique no marcador** para ver os detalhes do sensor
4. **Abra em outro navegador** para ver atualizações em tempo real
5. **Verifique o status de conexão** no canto superior direito do mapa

## 🌐 Deploy na Vercel (Fácil e Rápido)

### Passo 1: Crie um projeto na Vercel
1. Acesse [https://vercel.com](https://vercel.com)
2. Clique em "Add New" > "Project"
3. Importe o repositório do GitHub

### Passo 2: Configure as variáveis de ambiente
1. No painel do projeto na Vercel, vá em "Settings" > "Environment Variables"
2. Adicione as seguintes variáveis:
   - `MONGODB_URI`: Sua string de conexão do MongoDB Atlas
   - `OPENWEATHER_API_KEY`: Sua chave da API OpenWeatherMap
   - `NODE_ENV`: `production`

### Passo 3: Faça deploy
1. Clique em "Deploy"
2. Aguarde a conclusão do deploy
3. Acesse sua aplicação no URL fornecido pela Vercel

### ⚠️ Observações importantes para Vercel
- A Vercel tem limite de execução de 10 segundos para funções serverless
- O Socket.io funciona com WebSockets na Vercel
- Para ambientes de produção, recomenda-se usar um banco de dados com conexão persistente
- O mapa com Leaflet e OpenStreetMap **funciona sem API key**

### Configuração Alternativa: Heroku

```bash
# Instale o CLI do Heroku
# Crie um novo app
heroku create

# Configure as variáveis de ambiente
heroku config:set MONGODB_URI=your_mongodb_uri
heroku config:set OPENWEATHER_API_KEY=your_api_key

# Faça deploy
git push heroku main
```

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
- **Mapa interativo com sensores em tempo real**
- Tabela com as leituras recentes

### Dados Climáticos
- Exibição do clima atual (OpenWeatherMap)
- Previsão para 5 dias
- Índice de Qualidade do Ar (AQI) simulado

### Adicionar Nova Leitura
- Formulário para inserir novos dados
- **Coordenadas geográficas** (latitude e longitude)
- Validação em tempo real
- Feedback visual
- **Atualização instantânea no mapa**

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

### Health Check (para Vercel)
- `GET /api/health` - Verifica se a API está funcionando

### Socket.io
- Conecta em `/socket.io/` para atualizações em tempo real

## 🛠️ Solução de Problemas

### Mapa não carrega
- Verifique sua conexão com a internet
- O OpenStreetMap requer conexão ativa
- Tente recarregar a página

### Sensores não aparecem no mapa
- Verifique se as leituras têm coordenadas geográficas
- Adicione uma nova leitura com latitude e longitude

### Socket.io não conecta
- Verifique se o servidor está rodando
- Tente recarregar a página
- O sistema tentará reconectar automaticamente

### Problemas de CORS
- O servidor está configurado para aceitar todas as origens
- Para desenvolvimento local, certifique-se de usar `http://localhost:3000`

## Contribuição

Contribuições são bem-vindas! Siga os passos:

1. Fork o repositório
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Faça commit das suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## Contato

Para dúvidas ou sugestões, abra uma issue no GitHub ou entre em contato.

---

## Informações do Curso

- **Instituição**: UNIVESP (Universidade Virtual do Estado de São Paulo)
- **Curso**: Bacharel em Tecnologia da Informação | Engenharia da Computação
- **Disciplina**: Projeto Integrador III
- **Autora**: Vera
- **Data**: 2026

---

**AirQuality Monitor** - Monitoramento de Qualidade do Ar em Tempo Real

*Projeto Integrador III - UNIVESP - Desenvolvido para fins acadêmicos e de aprendizado*

*✨ Mapa Interativo com Atualização em Tempo Real via Socket.io e Leaflet.js ✨*
