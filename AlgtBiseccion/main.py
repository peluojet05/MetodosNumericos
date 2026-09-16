from pathlib import Path
import webview
from metodos.biseccion import biseccion

class API:
    def calcular_biseccion(
        self,
        expresion,
        limite_a,
        limite_b,
        tolerancia
    ):
        try:
            resultado = biseccion(
                expresion,
                limite_a,
                limite_b,
                tolerancia
            )
            return {
                "ok": True,
                "resultado": resultado
            }
        except Exception as error:
            return {
                "ok": False,
                "error": str(error)
            }

def iniciar_aplicacion():
    ruta_base = Path(
        __file__
    ).resolve().parent

    index = (
        ruta_base
        / "frontend"
        / "dist"
        / "index.html"
    )

    api = API()
    webview.create_window(
        title="Métodos Numéricos",
        url=str(index),
        js_api=api,
        width=1200,
        height=800,
        min_size=(900, 650),
        resizable=True
    )
    webview.start()

if __name__ == "__main__":
    iniciar_aplicacion()