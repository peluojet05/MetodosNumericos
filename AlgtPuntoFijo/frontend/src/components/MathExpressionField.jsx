import {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useRef
} from "react";

import "mathlive";
import "./MathExpressionField.css";

const IDENTIFICADORES_PERMITIDOS = new Set([
    "x",
    "sin",
    "cos",
    "tan",
    "ln",
    "log",
    "sqrt",
    "abs",
    "pi",
    "e"
]);

function leerParentesis(texto, inicio) {
    if (texto[inicio] !== "(") {
        return null;
    }

    let nivel = 0;

    for (let i = inicio; i < texto.length; i++) {
        if (texto[i] === "(") {
            nivel++;
        }

        if (texto[i] === ")") {
            nivel--;

            if (nivel === 0) {
                return {
                    contenido: texto.slice(inicio + 1, i),
                    fin: i
                };
            }
        }
    }

    return null;
}

function separarComaSuperior(texto) {
    let nivel = 0;

    for (let i = 0; i < texto.length; i++) {
        if (texto[i] === "(") {
            nivel++;
        }

        if (texto[i] === ")") {
            nivel--;
        }

        if (texto[i] === "," && nivel === 0) {
            return [
                texto.slice(0, i),
                texto.slice(i + 1)
            ];
        }
    }

    return null;
}

function convertirRaices(expresion) {
    let resultado = "";
    let i = 0;

    while (i < expresion.length) {
        if (expresion.startsWith("root(", i)) {
            const primerParentesis = leerParentesis(expresion, i + 4);

            if (!primerParentesis) {
                resultado += expresion[i];
                i++;
                continue;
            }

            const partes = separarComaSuperior(primerParentesis.contenido);

            if (partes) {
                const indice = convertirRaices(partes[0]);
                const radicando = convertirRaices(partes[1]);

                resultado += `(${radicando})^(1/(${indice}))`;
                i = primerParentesis.fin + 1;
                continue;
            }

            let siguiente = primerParentesis.fin + 1;

            while (expresion[siguiente] === " ") {
                siguiente++;
            }

            if (expresion[siguiente] === "(") {
                const segundoParentesis = leerParentesis(expresion, siguiente);

                if (segundoParentesis) {
                    const indice = convertirRaices(primerParentesis.contenido);
                    const radicando = convertirRaices(segundoParentesis.contenido);

                    resultado += `(${radicando})^(1/(${indice}))`;
                    i = segundoParentesis.fin + 1;
                    continue;
                }
            }
        }

        resultado += expresion[i];
        i++;
    }

    return resultado;
}

function normalizarExpresion(expresion) {
    const limpia = expresion
        .replace(/−/g, "-")
        .replace(/×/g, "*")
        .replace(/÷/g, "/")
        .trim();

    return convertirRaices(limpia);
}

function validarExpresion(expresion) {
    const limpia = normalizarExpresion(expresion);

    if (!limpia) {
        return {
            ok: false,
            error: "Ingresa una función."
        };
    }

    if (/(^|[^A-Za-z])X([^A-Za-z]|$)/.test(limpia)) {
        return {
            ok: false,
            error: "La variable debe escribirse como x minúscula."
        };
    }

    const identificadores = limpia.match(/[A-Za-z]+/g) ?? [];

    for (const identificador of identificadores) {
        if (!IDENTIFICADORES_PERMITIDOS.has(identificador)) {
            return {
                ok: false,
                error: `"${identificador}" no es una función, constante o variable permitida.`
            };
        }
    }

    if (!identificadores.includes("x")) {
        return {
            ok: false,
            error: "La función debe contener la variable x."
        };
    }

    return {
        ok: true,
        expresion: limpia
    };
}

const MathExpressionField = forwardRef(function MathExpressionField({ onChange }, ref) {
    const mathfieldRef = useRef(null);

    const obtenerExpresion = () => {
        const campo = mathfieldRef.current;

        if (!campo) {
            return "";
        }

        return normalizarExpresion(
            campo.getValue("ascii-math")
        );
    };

    const actualizar = () => {
        onChange?.(
            obtenerExpresion()
        );
    };

    useEffect(() => {
        let cancelado = false;
        let campoActual = null;
        let manejarTeclado = null;

        const configurar = async () => {
            await customElements.whenDefined("math-field");

            if (cancelado) {
                return;
            }

            const campo = mathfieldRef.current;

            if (!campo) {
                return;
            }

            campoActual = campo;

            campo.readOnly = false;
            campo.mathVirtualKeyboardPolicy = "manual";
            campo.smartFence = true;
            campo.smartSuperscript = true;
            campo.letterShapeStyle = "tex";
            campo.inlineShortcutTimeout = 0;

            campo.placeholder = "x^n - bx + c";
            campo.placeholderSymbol = "▢";

            campo.inlineShortcuts = {
                ...campo.inlineShortcuts,
                sin: "\\sin\\left(#?\\right)",
                sen: "\\sin\\left(#?\\right)",
                cos: "\\cos\\left(#?\\right)",
                tan: "\\tan\\left(#?\\right)",
                ln: "\\ln\\left(#?\\right)",
                log: "\\log\\left(#?\\right)",
                sqrt: "\\sqrt{#?}",
                abs: "\\left|#?\\right|",
                pi: "\\pi"
            };

            manejarTeclado = (evento) => {
                if (evento.ctrlKey || evento.metaKey || evento.altKey) {
                    return;
                }

                if (evento.key === "^") {
                    evento.preventDefault();
                    evento.stopPropagation();

                    campo.insert("#@^{#?}", {
                        focus: true,
                        insertionMode: "replaceSelection",
                        selectionMode: "placeholder",
                        scrollIntoView: false
                    });

                    actualizar();
                    return;
                }

                if (evento.key === "/") {
                    evento.preventDefault();
                    evento.stopPropagation();

                    campo.insert("\\frac{#@}{#?}", {
                        focus: true,
                        insertionMode: "replaceSelection",
                        selectionMode: "placeholder",
                        scrollIntoView: false
                    });

                    actualizar();
                }
            };

            campo.addEventListener("keydown", manejarTeclado, {
                capture: true
            });
        };

        configurar();

        return () => {
            cancelado = true;

            if (campoActual && manejarTeclado) {
                campoActual.removeEventListener("keydown", manejarTeclado, {
                    capture: true
                });
            }
        };
    }, []);

    const posicionarConMouse = (evento) => {
        const campo = mathfieldRef.current;

        if (!campo || typeof campo.getOffsetFromPoint !== "function") {
            return;
        }

        requestAnimationFrame(() => {
            const posicion = campo.getOffsetFromPoint(
                evento.clientX,
                evento.clientY,
                {
                    bias: 0
                }
            );

            if (Number.isFinite(posicion)) {
                campo.position = posicion;

                campo.focus({
                    preventScroll: true
                });
            }
        });
    };

    useImperativeHandle(ref, () => ({
        insertar(latex, selectionMode = "placeholder") {
            const campo = mathfieldRef.current;

            if (!campo) {
                return;
            }

            campo.insert(latex, {
                focus: true,
                insertionMode: "replaceSelection",
                selectionMode,
                scrollIntoView: false
            });

            actualizar();
        },

        borrar() {
            const campo = mathfieldRef.current;

            if (!campo) {
                return;
            }

            campo.focus({
                preventScroll: true
            });

            campo.executeCommand(
                "deleteBackward"
            );

            actualizar();
        },

        limpiar() {
            const campo = mathfieldRef.current;

            if (!campo) {
                return;
            }

            campo.setValue("");

            campo.focus({
                preventScroll: true
            });

            onChange?.("");
        },

        obtenerExpresion() {
            return obtenerExpresion();
        },

        obtenerLatex() {
            return mathfieldRef.current?.getValue("latex") ?? "";
        },

        validar() {
            const campo = mathfieldRef.current;

            if (!campo) {
                return {
                    ok: false,
                    error: "No se pudo leer la función."
                };
            }

            const latex = campo.getValue("latex");

            if (latex.includes("\\placeholder")) {
                return {
                    ok: false,
                    error: "Completa todos los espacios de la función."
                };
            }

            return validarExpresion(
                campo.getValue("ascii-math")
            );
        },

        focus() {
            mathfieldRef.current?.focus({
                preventScroll: true
            });
        }
    }), [onChange]);

    return (
        <div className="math-editor">
            <div className="math-editor-container">
                <span className="math-editor-prefix">g(x) =</span>
                <math-field ref={mathfieldRef} className="math-expression-field" aria-label="Función de iteración g(x)" onInput={actualizar} onClick={posicionarConMouse} />
            </div>
        </div>
    );
});

export default MathExpressionField;