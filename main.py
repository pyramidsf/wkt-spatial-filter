import httpx
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

GEOSERVER_URL = "http://localhost/geoserver/wms"


class WKTRequest(BaseModel):
    wkt: str
    tipo: str  # Point, LineString, Polygon


class FilterRequest(BaseModel):
    layer_name: str       # por exemplo geonode:ibge_municipios
    geometry_column: str  # provavelmente the_geom
    wkt: str


@app.post("/wkt")
async def receber_wkt(req: WKTRequest):
    print(f"\n{'='*50}")
    print(f"Tipo: {req.tipo}")
    print(f"WKT:  {req.wkt}")
    print(f"{'='*50}\n")
    return {"status": "ok", "wkt": req.wkt, "tipo": req.tipo}


@app.post("/apply-filter")
async def aplicar_filtro(req: FilterRequest):

   # aqui é  montado o filtro CQL espacial e retorna pro frontend.
   # essa seria a lógica que o agente usaria, mas sem ele. 

    cql_filter = f"WITHIN({req.geometry_column}, {req.wkt})"

    print(f"\n{'='*50}")
    print(f"Camada: {req.layer_name}")
    print(f"Filtro CQL: {cql_filter}")
    print(f"{'='*50}\n")

    return {
        "status": "ok",
        "layer_name": req.layer_name,
        "cql_filter": cql_filter,
    }


@app.get("/wms-base-url")
async def get_wms_url():
    # vai rettornar a URL base do WMS para o frontend montar as camadas
    return {"wms_url": f"{GEOSERVER_URL}/wms"}


app.mount("/", StaticFiles(directory="static", html=True), name="static")