import math

def calcular_errores(
    valor_real,
    valor_aproximado
):
    try:
        real = float(valor_real)
        aproximado = float(
            valor_aproximado
        )

    except (TypeError, ValueError) as error:
        raise ValueError(
            "El valor real y el valor aproximado "
            "deben ser números."
        ) from error

    if (
        not math.isfinite(real)
        or not math.isfinite(aproximado)
    ):
        raise ValueError(
            "Los valores deben ser números finitos."
        )

    error_absoluto = abs(
        real - aproximado
    )

    if real == 0:
        return {
            "valor_real": real,
            "valor_aproximado": aproximado,
            "error_absoluto": error_absoluto,
            "error_relativo": None,
            "error_porcentual": None,
            "relativo_definido": False
        }

    error_relativo = (
        error_absoluto
        / abs(real)
    )

    error_porcentual = (
        error_relativo
        * 100
    )

    return {
        "valor_real": real,
        "valor_aproximado": aproximado,
        "error_absoluto": error_absoluto,
        "error_relativo": error_relativo,
        "error_porcentual": error_porcentual,
        "relativo_definido": True
    }