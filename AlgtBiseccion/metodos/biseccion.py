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

        return (
            factor_signo
            * sp.Abs(base) ** exponente
        )

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


def evaluar_funcion(funcion, x):
    try:
        resultado = funcion(x)

    except ZeroDivisionError as error:
        raise ValueError(
            f"No se puede evaluar la función en x = {x} "
            "porque ocurre una división entre cero."
        ) from error

    except OverflowError as error:
        raise ValueError(
            f"No se puede evaluar la función en x = {x} "
            "porque el resultado excede el rango permitido."
        ) from error

    except (ValueError, ArithmeticError) as error:
        raise ValueError(
            f"No se puede evaluar la función en x = {x}. "
            "El valor se encuentra fuera del dominio real "
            "de la función."
        ) from error

    except Exception as error:
        raise ValueError(
            f"No se pudo evaluar la función en x = {x}."
        ) from error

    if isinstance(resultado, complex):
        raise ValueError(
            f"No se puede evaluar la función en x = {x}. "
            "El resultado pertenece a los números complejos."
        )

    try:
        resultado = float(resultado)

    except (TypeError, ValueError) as error:
        raise ValueError(
            f"La función no produjo un resultado numérico "
            f"válido en x = {x}."
        ) from error

    if not math.isfinite(resultado):
        raise ValueError(
            f"No se puede evaluar la función en x = {x}. "
            "El resultado no es un número real finito."
        )

    return resultado


def biseccion(
    expresion,
    limite_a,
    limite_b,
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
        a = float(limite_a)
        b = float(limite_b)
        tolerancia = float(tolerancia)
        max_iteraciones = int(
            max_iteraciones
        )

    except (TypeError, ValueError) as error:
        raise ValueError(
            "Los límites, la tolerancia y el número máximo "
            "de iteraciones deben ser valores numéricos."
        ) from error

    if not all(
        math.isfinite(valor)
        for valor in (
            a,
            b,
            tolerancia
        )
    ):
        raise ValueError(
            "Los límites y la tolerancia deben ser "
            "números reales finitos."
        )

    if a >= b:
        raise ValueError(
            f"Intervalo inválido: a = {a} y b = {b}. "
            "El límite inferior a debe ser menor "
            "que el límite superior b."
        )

    if tolerancia <= 0:
        raise ValueError(
            f"Tolerancia inválida: {tolerancia}. "
            "La tolerancia debe ser mayor que cero."
        )

    if max_iteraciones <= 0:
        raise ValueError(
            "El número máximo de iteraciones "
            "debe ser mayor que cero."
        )

    fa = evaluar_funcion(
        funcion,
        a
    )

    fb = evaluar_funcion(
        funcion,
        b
    )

    if fa == 0:
        return {
            "raiz": a,
            "valor_funcion": 0.0,
            "error": 0.0,
            "iteraciones": 0,
            "tabla": [],
            "latex": datos_funcion["latex"]
        }

    if fb == 0:
        return {
            "raiz": b,
            "valor_funcion": 0.0,
            "error": 0.0,
            "iteraciones": 0,
            "tabla": [],
            "latex": datos_funcion["latex"]
        }

    if fa * fb > 0:
        raise ValueError(
            "No se puede aplicar el método de bisección "
            "en el intervalo seleccionado. "
            f"f({a}) = {fa:.6g} y f({b}) = {fb:.6g} "
            "tienen el mismo signo. "
            "Selecciona un intervalo donde la función "
            "cambie de signo."
        )

    tabla = []

    for iteracion in range(
        1,
        max_iteraciones + 1
    ):
        p = (
            a + b
        ) / 2

        fp = evaluar_funcion(
            funcion,
            p
        )

        error = abs(
            b - a
        ) / 2

        tabla.append({
            "iteracion": iteracion,
            "a": float(a),
            "b": float(b),
            "p": float(p),
            "fa": float(fa),
            "fb": float(fb),
            "fp": float(fp),
            "error": float(error)
        })

        if (
            abs(fp) <= tolerancia
            or error <= tolerancia
        ):
            return {
                "raiz": float(p),
                "valor_funcion": float(fp),
                "error": float(error),
                "iteraciones": iteracion,
                "tabla": tabla,
                "latex": datos_funcion["latex"]
            }

        if fa * fp < 0:
            b = p
            fb = fp

        else:
            a = p
            fa = fp

    raise ValueError(
        f"No se alcanzó la tolerancia de {tolerancia} "
        f"después de {max_iteraciones} iteraciones. "
        "Prueba aumentando el número máximo de iteraciones "
        "o utilizando una tolerancia menos estricta."
    )