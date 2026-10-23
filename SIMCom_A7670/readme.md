# APN CONFIG

AT+CGDCONT=1,"IP","seu_apn_5g_aqui"

**Documento de Requisitos:** para integrar o módulo **SIMCom A7670** ao projeto AirQuality. 

> **⚠️ Nota técnica importante:** O SIMCom A7670 é um módulo **4G LTE Cat 1** (não 5G nativo). Ele é excelente e mais do que suficiente para o projeto (envio de pequenos pacotes de dados).

# Requirements: Integração SIMCom A7670 + AirQuality Monitor

## 1. Requisitos de Hardware (Físico)
Para que o A7670 funcione de forma estável com o seu ESP32/Arduino:
*   **Alimentação (Crítico):** O A7670 exige uma fonte de **3.8V a 4.2V** com capacidade de pico de **2A**. Não o conecte diretamente no pino 5V do Arduino. Use um conversor *Buck* (ex: LM2596) ajustado para 4.0V.
*   **Nível Lógico:** Os pinos de comunicação (TX/RX) operam em **1.8V** ou **3.3V**. Se usar Arduino (5V), é obrigatório usar um *Level Shifter* (conversor de nível lógico) para não queimar o módulo.
*   **Interface:** Conexão UART (Serial) cruzada (TX do módulo no RX do microcontrolador e vice-versa) com Baud Rate padrão de **115200 bps**.
*   **Antenas:** Antena LTE conectada ao pino principal e antena GNSS (se for usar GPS) conectada ao pino GPS.
*   **SIM Card:** Chip Nano-SIM de operadora com plano de dados ativo (recomendado plano M2M/IoT).

## 2. Requisitos de Software (Firmware)
O firmware do microcontrolador deve executar a seguinte sequência lógica de comandos AT para se conectar e enviar os dados:

### Fase 1: Inicialização e Rede
```at
AT                              // Teste de comunicação (deve retornar OK)
ATE0                            // Desativa o eco (opcional, mas limpa a comunicação)
AT+CPIN?                        // Verifica se o SIM Card foi lido (deve retornar READY)
AT+CSQ                          // Verifica a qualidade do sinal (aceitável: > 10)
AT+CREG?                        // Verifica registro na rede (deve retornar 0,1 ou 0,5)
```

### Fase 2: Configuração de APN e Contexto PDP
*Nota: O comando correto para o A7670 substitui o `CGSOCKCONT`.*
```at
AT+CGDCONT=1,"IP","seu_apn_aqui"  // Define o APN (ex: "zap.vivo.com.br", "tim.br")
AT+CGACT=1,1                      // Ativa o contexto de dados (conecta à internet)
AT+CGPADDR=1                      // Verifica se recebeu um endereço IP
```

### Fase 3: Configuração do HTTP
```at
AT+HTTPINIT                       // Inicializa o serviço HTTP
AT+HTTPPARA="CID",1               // Define o contexto de dados (1)
AT+HTTPPARA="URL","https://sua-api.com/api/leituras" // URL do seu backend Node.js
AT+HTTPPARA="CONTENT","application/json" // Define o header para o Express
```

### Fase 4: Envio dos Dados (POST)
```at
AT+HTTPDATA=80,5000               // 80 bytes de tamanho, 5 segundos de timeout
> {"co2":450,"umidade":60,"temperatura":25}  // O JSON deve ser enviado aqui
AT+HTTPACTION=1                   // Executa a ação 1 (POST). Retorna +HTTPACTION: 1,200,120
AT+HTTPREAD                       // Lê a resposta do seu Node.js (ex: {"mensagem":"Sucesso"})
AT+HTTPTERM                       // Encerra o serviço HTTP para economizar energia
```

## 3. Requisitos de Integração com o Backend (Node.js)
O seu servidor atual já atende aos requisitos, mas deve estar preparado para receber a requisição:

*   **Rota:** `POST /api/leituras`
*   **Header Obrigatório:** `Content-Type: application/json`
*   **Payload Esperado:**
    ```json
    {
      "co2": 450,
      "umidade": 60,
      "temperatura": 25
    }
    ```
*   **Resposta:** O servidor deve responder com status `201 Created` para que o módulo saiba que a transmissão foi bem-sucedida.

## 4. Requisitos de Resiliência (Tratamento de Erros)
Sensores em campo sofrem com oscilações de rede. O firmware deve implementar:
*   **Retry (Nova tentativa):** Se o `AT+HTTPACTION` retornar um código diferente de `200`, o ESP32/Arduino deve aguardar 10 segundos e tentar enviar novamente (máximo de 3 tentativas).
*   **Watchdog Timer:** Se o módulo A7670 travar, o microcontrolador deve reiniciá-lo através do pino de `RESET` (ou enviando o comando `AT+CRESET`).
*   **Deep Sleep:** Após o envio bem-sucedido, o microcontrolador deve entrar em modo de baixo consumo (Deep Sleep) por 5 a 15 minutos para economizar bateria (já que o A7670 consome bastante energia).

---

### Resumo da Adaptação

1.  Substituir `AT+CGSOCKCONT` por `AT+CGDCONT`.
2.  Garantir que o JSON enviado no `AT+HTTPDATA` tenha exatamente o mesmo tamanho em bytes que o declarado antes da vírgula (ex: `80,5000`).
3.  A URL deve incluir o `https://` se o seu servidor Node.js estiver hospedado em serviços como Render, Vercel ou Heroku (eles forçam HTTPS). O A7670 suporta SSL/TLS nativamente.

firmware estará alinhado com o *dashboard*. O fluxo é: Sensor lê -> A7670 envia JSON via 4G -> Node.js salva no MongoDB -> Mapa e Gráficos atualizam
