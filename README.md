# Filtro Espacial WKT com GeoServer e OpenLayers

Projeto de estudo focado na integração de mapas interativos e sistemas de informação geográfica (GIS). O objetivo principal é desenhar geometrias no mapa, convertê-las para o formato WKT (Well-Known Text) e aplicar filtros espaciais diretamente em camadas de um servidor GeoServer usando a linguagem de filtro CQL.

## Funcionalidades

- **Visualização de Mapas:** Consumo de mapas base via OpenLayers.
- **Desenho de Polígonos:** Ferramenta interativa para desenhar áreas de interesse no mapa.
- **Geração de WKT:** Conversão instantânea da geometria desenhada no frontend para texto WKT.
- **Filtro Espacial (CQL):** Comunicação com o backend em Python para montar filtros espaciais dinâmicos (`WITHIN`).
- **Integração GeoServer:** Aplicação direta do filtro na camada WMS renderizada, exibindo apenas as feições contidas na área desenhada.

## Tecnologias Utilizadas

**Frontend:**
- HTML5, CSS3 & JavaScript (Vanilla)
- [OpenLayers](https://openlayers.org/) (v10.5.0) para renderização do mapa e interações espaciais.

**Backend:**
- [Python 3](https://www.python.org/)
- [FastAPI](https://fastapi.tiangolo.com/) para criação ágil das rotas da API.
- `httpx` (pronto para requisições assíncronas externas, se necessário expandir).

**Serviço GIS:**
- [GeoServer](https://geoserver.org/)

## Estrutura do Projeto

Para que o backend consiga servir os arquivos corretamente, a estrutura do projeto deve estar organizada da seguinte forma:

```text
projeto/
├── main.py              # Backend (API em FastAPI)
└── static/              # Pasta onde ficam os arquivos do Frontend
    ├── index.html       # Estrutura da página
    ├── style.css        # Estilos globais (UI moderna)
    └── script.js        # Lógica do OpenLayers e requisições HTTP
```

## Execução

### 1. Pré-requisitos e Ajuste do GeoServer

Antes de iniciar, você precisa configurar o endereço da sua própria instância do GeoServer no backend:

1. Abra o arquivo `main.py`.
2. Localize a linha que define a variável `GEOSERVER_URL`:
```python
GEOSERVER_URL = "http://localhost/geoserver/wms"
```

3. Substitua o valor pelo endereço do seu servidor local ou remoto (lembre-se de incluir a porta correta e o caminho completo até o endpoint WMS se necessário).

### 2. Configurando o Ambiente Backend

Crie um ambiente virtual e instale as dependências necessárias:

```bash
# Crie e ative o ambiente virtual
python3 -m venv .venv
source .venv/bin/activate  

# Instale as dependências
pip install fastapi "uvicorn[standard]" httpx pydantic
```

### 3. Rodando a Aplicação

Inicie o servidor local através do Uvicorn:

```bash
uvicorn main:app --reload
```
A aplicação vai estar disponível na porta 8000. Para acessar: **http://localhost:8000**
