import math
import sympy as sp

from .parser import interpretar_expresion, x


def signo(valor):
    if valor > 0:
        return 1.0

    if valor < 0:
        return -1.0

    return 0.0


def preparar_funcion_real(expresion_sympy):
    def es_raiz_impar(valor):
        return (
            isinstance(valor, sp.Pow)
            and isinstance(valor.exp, sp.Rational)
            and valor.exp.q > 1
            and valor.exp.q % 2 == 1
        )

    def convertir_raiz_impar(valor):
        base = valor.base
        exponente = valor.exp

        if int(exponente.p) % 2 == 0:
            factor_signo = 1
        else:
            factor_signo = sp.sign(base)

        return factor_signo * sp.Abs(base) ** exponente

    expresion_real = expresion_sympy.replace(
        es_raiz_impar,
        convertir_raiz_impar
    )

    return sp.lambdify(
        x,
        expresion_real,
        modules=[
            {
                "sign": signo,
                "Abs": abs
            },
            "math"
        ]
    )


def evaluar_funcion(funcion, valor_x):
    try:
        resultado = funcion(valor_x)

    except ZeroDivisionError as error:
        raise ValueError(
            f"No se puede evaluar g(x) en x = {valor_x} porque ocurre una división entre cero."
        ) from error

    except OverflowError as error:
        raise ValueError(
            "El método parece divergir porque los valores obtenidos son demasiado grandes."
        ) from error

    except (ValueError, ArithmeticError) as error:
        raise ValueError(
            f"No se puede evaluar g(x) en x = {valor_x}. El valor se encuentra fuera del dominio real de la función."
        ) from error

    except Exception as error:
        raise ValueError(
            f"No se pudo evaluar g(x) en x = {valor_x}."
        ) from error

    if isinstance(resultado, complex):
        raise ValueError(
            "No se puede continuar porque la función produjo un número complejo."
        )

    try:
        resultado = float(resultado)

    except (TypeError, ValueError) as error:
        raise ValueError(
            "La función g(x) no produjo un resultado numérico válido."
        ) from error

    if not math.isfinite(resultado):
        raise ValueError(
            "El método produjo un valor que no es un número real finito."
        )

    return resultado


def puntoFijo(
    expresion,
    p_inicial,
    tolerancia,
    max_iteraciones=100
):
    datos_funcion = interpretar_expresion(
        expresion
    )

    funcion = preparar_funcion_real(
        datos_funcion["expresion"]
    )

    try:
        p_anterior = float(p_inicial)
        tolerancia = float(tolerancia)
        max_iteraciones = int(max_iteraciones)

    except (TypeError, ValueError) as error:
        raise ValueError(
            "El valor inicial, la tolerancia y el número máximo de iteraciones deben ser numéricos."
        ) from error

    if not math.isfinite(p_anterior):
        raise ValueError(
            "El valor inicial p₀ debe ser un número real finito."
        )

    if not math.isfinite(tolerancia) or tolerancia <= 0:
        raise ValueError(
            "La tolerancia debe ser mayor que cero."
        )

    if max_iteraciones <= 0:
        raise ValueError(
            "El número máximo de iteraciones debe ser mayor que cero."
        )

    tabla = []

    for iteracion in range(1, max_iteraciones + 1):
        p_actual = evaluar_funcion(
            funcion,
            p_anterior
        )

        error = abs(
            p_actual - p_anterior
        )

        tabla.append({
            "iteracion": iteracion,
            "p_anterior": float(p_anterior),
            "p_actual": float(p_actual),
            "error": float(error)
        })

        if error <= tolerancia:
            valor_g = evaluar_funcion(
                funcion,
                p_actual
            )

            return {
                "puntoFijo": float(p_actual),
                "valor_g": float(valor_g),
                "error": float(error),
                "iteraciones": iteracion,
                "tabla": tabla,
                "latex": datos_funcion["latex"]
            }

        if abs(p_actual) > 1e100:
            raise ValueError(
                "El método parece divergir. Los valores de las iteraciones están creciendo demasiado."
            )

        p_anterior = p_actual

    raise ValueError(
        f"No se alcanzó la tolerancia de {tolerancia} después de {max_iteraciones} iteraciones. "
        "La función g(x) seleccionada puede no converger para el valor inicial dado."
    )