import re
import sympy as sp

from sympy.parsing.sympy_parser import (
    parse_expr,
    standard_transformations,
    convert_xor,
    implicit_multiplication_application
)

x = sp.Symbol("x")

FUNCIONES_PERMITIDAS = {
    "x": x,

    "sin": sp.sin,
    "cos": sp.cos,
    "tan": sp.tan,

    "asin": sp.asin,
    "acos": sp.acos,
    "atan": sp.atan,

    "sqrt": sp.sqrt,

    "ln": sp.log,
    "log": sp.log,

    "exp": sp.exp,

    "abs": sp.Abs,

    "pi": sp.pi,

    "e": sp.E,
    "E": sp.E
}

TRANSFORMACIONES = (
    standard_transformations
    + (
        convert_xor,
        implicit_multiplication_application
    )
)

def interpretar_expresion(expresion):
    expresion = expresion.strip()
    if not expresion:
        raise ValueError(
            "Debes ingresar una función."
        )
    # Solo caracteres necesarios para expresiones matemáticas.
    if not re.fullmatch(
        r"[0-9A-Za-z+\-*/^().,\s]+",
        expresion
    ):
        raise ValueError(
            "La expresión contiene caracteres no permitidos."
        )
    # Detectamos nombres utilizados por el usuario.
    nombres = set(
        re.findall(
            r"[A-Za-z]+",
            expresion
        )
    )
    permitidos = set(
        FUNCIONES_PERMITIDAS.keys()
    )
    desconocidos = nombres - permitidos
    if desconocidos:
        raise ValueError(
            "Símbolo o función no reconocida: "
            + ", ".join(sorted(desconocidos))
        )
    try:
        expresion_sympy = parse_expr(
            expresion,
            local_dict=FUNCIONES_PERMITIDAS,
            transformations=TRANSFORMACIONES,
            evaluate=True
        )
    except Exception as error:
        raise ValueError(
            "No fue posible interpretar la función."
        ) from error
    variables = expresion_sympy.free_symbols
    if variables - {x}:
        raise ValueError(
            "La única variable permitida es x."
        )
    funcion = sp.lambdify(
        x,
        expresion_sympy,
        modules=["math"]
    )
    latex = sp.latex(
        expresion_sympy
    )
    return {
        "expresion": expresion_sympy,
        "funcion": funcion,
        "latex": latex
    }