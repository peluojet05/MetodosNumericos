from pathlib import Path
import webview
from metodos.errores import calcular_errores

class API:
    def calcular_errores(
        self,
        valor_real,
        valor_aproximado
    ):
        try:
            resultado = calcular_errores(
                valor_real,
                valor_aproximado
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

    if not index.exists():
        raise FileNotFoundError(
            "\nNo se encontró frontend/dist/index.html.\n\n"
            "Ejecuta primero:\n"
            "cd frontend\n"
            "npm run build\n"
        )

    api = API()

    webview.create_window(
        title="Cálculo de Errores",
        url=str(index),
        js_api=api,
        width=1100,
        height=720,
        min_size=(820, 620),
        resizable=True
    )

    webview.start()

if __name__ == "__main__":
    iniciar_aplicacion()