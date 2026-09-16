import {
    useCallback,
    useEffect,
    useRef,
    useState
} from "react";

import MathExpressionField from "./components/MathExpressionField";
import MathKeyboard from "./components/MathKeyboard";


function App() {
    const [
        limiteA,
        setLimiteA
    ] = useState("");

    const [
        limiteB,
        setLimiteB
    ] = useState("");

    const [
        tolerancia,
        setTolerancia
    ] = useState("0.0001");

    const [
        resultado,
        setResultado
    ] = useState(null);

    const [
        error,
        setError
    ] = useState("");

    const [
        calculando,
        setCalculando
    ] = useState(false);

    const [
        apiDisponible,
        setApiDisponible
    ] = useState(false);

    const [
        tablaExpandida,
        setTablaExpandida
    ] = useState(false);

    const [
        notacionDecimal,
        setNotacionDecimal
    ] = useState(true);


    const editorFuncion =
        useRef(null);


    /* pywebview */
    useEffect(() => {
        if (
            window.pywebview?.api
        ) {
            setApiDisponible(true);
            return;
        }

        const activarAPI =
            () => {
                setApiDisponible(true);
            };

        window.addEventListener(
            "pywebviewready",
            activarAPI
        );

        return () => {
            window.removeEventListener(
                "pywebviewready",
                activarAPI
            );
        };
    }, []);

    /* funcion */
    const actualizarExpresion =
        useCallback(
            () => {
                setError("");
            },
            []
        );


    /* teclado */
    const insertar = (
        latex,
        modo
    ) => {
        editorFuncion
            .current
            ?.insertar(
                latex,
                modo
            );
    };

    const borrar = () => {
        editorFuncion
            .current
            ?.borrar();
    };

    const limpiar = () => {
        editorFuncion
            .current
            ?.limpiar();
        setResultado(null);
        setTablaExpandida(false);
        setError("");
    };


    /* formato numeros */

    const quitarCeros =
        (texto) => {
            if (
                texto.includes("e")
            ) {
                return texto;
            }

            return texto
                .replace(
                    /(\.\d*?[1-9])0+$/,
                    "$1"
                )
                .replace(
                    /\.0+$/,
                    ""
                );
        };

    const formatoDecimal =
        (
            valor,
            decimales = 12
        ) => {
            if (
                !Number.isFinite(valor)
            ) {
                return String(valor);
            }

            if (valor === 0) {
                return "0";
            }

            return quitarCeros(
                valor.toFixed(
                    decimales
                )
            );
        };

    const formatoResultado =
        (
            valor,
            decimales = 14
        ) => {
            if (
                !Number.isFinite(valor)
            ) {
                return String(valor);
            }

            if (
                notacionDecimal
            ) {
                return formatoDecimal(
                    valor,
                    decimales
                );
            }

            return valor
                .toExponential(6);
        };

    /* tolerancia */

    const formatearTolerancia =
        (valor) => {
            if (
                valor >= 1
            ) {
                return String(valor);
            }

            if (
                valor < 1e-15
            ) {
                return valor
                    .toExponential();
            }

            const decimales =
                Math.max(
                    1,
                    Math.ceil(
                        -Math.log10(
                            valor
                        )
                    )
                    + 1
                );

            return valor
                .toFixed(decimales)
                .replace(/0+$/, "")
                .replace(/\.$/, "");
        };

    const aumentarTolerancia =
        () => {
            let valor =
                Number(tolerancia);

            if (
                !Number.isFinite(valor)
                ||
                valor <= 0
            ) {
                valor = 0.0001;
            }

            const nuevoValor =
                Math.min(
                    valor * 10,
                    1
                );

            setTolerancia(
                formatearTolerancia(
                    nuevoValor
                )
            );
        };

    const disminuirTolerancia =
        () => {
            let valor =
                Number(tolerancia);

            if (
                !Number.isFinite(valor)
                ||
                valor <= 0
            ) {
                valor = 0.0001;
            }

            const nuevoValor =
                Math.max(
                    valor / 10,
                    1e-15
                );

            setTolerancia(
                formatearTolerancia(
                    nuevoValor
                )
            );
        };

    /* calculos */
    const calcular =
        async () => {
            setError("");
            setResultado(null);
            setTablaExpandida(false);

            const validacion =
                editorFuncion
                    .current
                    ?.validar();

            if (
                !validacion
                ||
                !validacion.ok
            ) {
                setError(
                    validacion?.error
                    ??
                    "Ingresa una función válida."
                );

                editorFuncion
                    .current
                    ?.focus();

                return;
            }

            const funcion =
                validacion.expresion;

            if (
                limiteA === ""
                ||
                limiteB === ""
            ) {
                setError(
                    "Ingresa los dos límites del intervalo."
                );
                return;
            }

            const numeroA =
                Number(limiteA);

            const numeroB =
                Number(limiteB);

            const numeroTolerancia =
                Number(tolerancia);

            if (
                !Number.isFinite(
                    numeroA
                )
                ||
                !Number.isFinite(
                    numeroB
                )
            ) {
                setError(
                    "Los límites deben ser números válidos."
                );
                return;
            }

            if (
                numeroA >= numeroB
            ) {
                setError(
                    "El límite a debe ser menor que el límite b."
                );
                return;
            }

            if (
                !Number.isFinite(
                    numeroTolerancia
                )
                ||
                numeroTolerancia <= 0
            ) {
                setError(
                    "La tolerancia debe ser mayor que cero."
                );
                return;
            }

            if (
                !apiDisponible
            ) {
                setError(
                    "La conexión con Python todavía no está disponible."
                );
                return;
            }

            setCalculando(true);

            try {
                const respuesta =
                    await window
                        .pywebview
                        .api
                        .calcular_biseccion(
                            funcion,
                            numeroA,
                            numeroB,
                            numeroTolerancia
                        );

                if (
                    !respuesta.ok
                ) {
                    setError(
                        respuesta.error
                    );
                    return;
                }

                setResultado(
                    respuesta.resultado
                );
            } catch {
                setError(
                    "Ocurrió un error al comunicarse con Python."
                );
            } finally {
                setCalculando(false);
            }
        };

    return (
        <main className="app">
            <header className="topbar">
                <span className="app-tag">
                    MÉTODOS NUMÉRICOS
                </span>
                <h1>
                    Método de Bisección
                </h1>
            </header>
            <div
                className={
                    tablaExpandida
                    && resultado
                        ? "workspace results-expanded"
                        : "workspace"
                }
            >
                {/* entrada */}
                <section
                    className="
                        panel
                        input-panel
                    "
                >
                <h2 className="section-title">
                    Función
                </h2>    
                    <MathExpressionField
                        ref={
                            editorFuncion
                        }
                        onChange={
                            actualizarExpresion
                        }
                    />
                    <MathKeyboard
                        insertar={
                            insertar
                        }
                        borrar={
                            borrar
                        }
                        limpiar={
                            limpiar
                        }
                    />
                    <div className="section-divider" />
                    <div className="section-header">
                        <div>
                            <h2 className="section-title">
                                Intervalo
                            </h2>
                        </div>
                    </div>
                    <div className="number-fields">
                        <div className="field">
                            <label htmlFor="limite-a">
                                Límite a
                            </label>
                            <input
                                id="limite-a"
                                type="number"
                                step="any"
                                value={
                                    limiteA
                                }
                                onChange={
                                    (evento) =>
                                        setLimiteA(
                                            evento
                                                .target
                                                .value
                                        )
                                }
                            />
                        </div>
                        <div className="field">
                            <label htmlFor="limite-b">
                                Límite b
                            </label>
                            <input
                                id="limite-b"
                                type="number"
                                step="any"
                                value={
                                    limiteB
                                }
                                onChange={
                                    (evento) =>
                                        setLimiteB(
                                            evento
                                                .target
                                                .value
                                        )
                                }
                            />
                        </div>
                        <div
                            className="
                                field
                                tolerance-field
                            "
                        >
                            <label htmlFor="tolerancia">
                                Tolerancia
                            </label>
                            <div className="tolerance-input">
                                <input
                                    id="tolerancia"
                                    type="number"
                                    min="0"
                                    step="any"
                                    value={
                                        tolerancia
                                    }
                                    onChange={
                                        (evento) =>
                                            setTolerancia(
                                                evento
                                                    .target
                                                    .value
                                            )
                                    }
                                />
                                <div className="tolerance-stepper">
                                    <button
                                        type="button"
                                        className="tolerance-step-button"
                                        title="Aumentar tolerancia ×10"
                                        onClick={
                                            aumentarTolerancia
                                        }
                                    >
                                        ▲
                                    </button>
                                    <button
                                        type="button"
                                        className="tolerance-step-button"
                                        title="Disminuir tolerancia ÷10"
                                        onClick={
                                            disminuirTolerancia
                                        }
                                    >
                                        ▼
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    {
                        error && (
                            <div className="error-box">
                                {error}
                            </div>
                        )
                    }
                    <button
                        className="calculate-button"
                        type="button"
                        onClick={
                            calcular
                        }
                        disabled={
                            calculando
                        }
                    >
                        {
                            calculando
                                ? "Calculando..."
                                : "Calcular raíz"
                        }
                    </button>
                </section>
                {/* resultados */}
                <section
                    className="
                        panel
                        results-panel
                    "
                >
                    <div className="results-header">
                        <div>
                            <h2 className="section-title">
                                Resultado
                            </h2>
                        </div>
                        {
                            resultado && (
                                <div className="result-actions">
                                    <button
                                        type="button"
                                        className="result-view-button"
                                        onClick={
                                            () =>
                                                setNotacionDecimal(
                                                    (
                                                        actual
                                                    ) =>
                                                        !actual
                                                )
                                        }
                                    >
                                        {
                                            notacionDecimal
                                                ? "Científica"
                                                : "Decimal"
                                        }
                                    </button>
                                    <button
                                        type="button"
                                        className="
                                            result-view-button
                                            expand-button
                                        "
                                        onClick={
                                            () =>
                                                setTablaExpandida(
                                                    (
                                                        actual
                                                    ) =>
                                                        !actual
                                                )
                                        }
                                    >
                                        {
                                            tablaExpandida
                                                ? "← Volver"
                                                : "⛶ Vista completa"
                                        }
                                    </button>
                                </div>
                            )
                        }
                    </div>
                    {
                        !resultado && (
                            <div className="empty-state">
                                <div className="empty-icon">
                                    ∫
                                </div>
                                <h3>
                                    Sin resultados todavía
                                </h3>
                                <p>
                                    Ingresa una función,
                                    selecciona el intervalo
                                    y calcula la raíz.
                                </p>
                            </div>
                        )
                    }
                    {
                        resultado && (
                            <>
                                <div className="result-cards">
                                    <article
                                        className="
                                            result-card
                                            primary-result
                                        "
                                    >
                                        <span>
                                            Raíz aproximada
                                        </span>
                                        <strong>
                                            {
                                                formatoDecimal(
                                                    resultado.raiz,
                                                    12
                                                )
                                            }
                                        </strong>
                                    </article>
                                    <article className="result-card">
                                        <span>
                                            f(raíz)
                                        </span>
                                        <strong>
                                            {
                                                formatoResultado(
                                                    resultado
                                                        .valor_funcion
                                                )
                                            }
                                        </strong>
                                    </article>
                                    <article className="result-card">
                                        <span>
                                            Iteraciones
                                        </span>
                                        <strong>
                                            {
                                                resultado
                                                    .iteraciones
                                            }
                                        </strong>
                                    </article>
                                    <article className="result-card">
                                        <span>
                                            Error
                                        </span>
                                        <strong>
                                            {
                                                formatoResultado(
                                                    resultado.error
                                                )
                                            }
                                        </strong>
                                    </article>
                                </div>
                                <div className="table-container">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>
                                                    i
                                                </th>
                                                <th>
                                                    a
                                                </th>
                                                <th>
                                                    b
                                                </th>
                                                <th>
                                                    p
                                                </th>
                                                <th>
                                                    f(p)
                                                </th>
                                                <th>
                                                    Error
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {
                                                resultado
                                                    .tabla
                                                    .map(
                                                        (
                                                            fila
                                                        ) => (
                                                            <tr
                                                                key={
                                                                    fila
                                                                        .iteracion
                                                                }
                                                            >
                                                                <td>
                                                                    {
                                                                        fila
                                                                            .iteracion
                                                                    }
                                                                </td>
                                                                <td>
                                                                    {
                                                                        formatoDecimal(
                                                                            fila.a,
                                                                            12
                                                                        )
                                                                    }
                                                                </td>
                                                                <td>
                                                                    {
                                                                        formatoDecimal(
                                                                            fila.b,
                                                                            12
                                                                        )
                                                                    }
                                                                </td>
                                                                <td>
                                                                    {
                                                                        formatoDecimal(
                                                                            fila.p,
                                                                            12
                                                                        )
                                                                    }
                                                                </td>
                                                                <td>
                                                                    {
                                                                        formatoResultado(
                                                                            fila.fp,
                                                                            14
                                                                        )
                                                                    }
                                                                </td>
                                                                <td>
                                                                    {
                                                                        formatoResultado(
                                                                            fila.error,
                                                                            14
                                                                        )
                                                                    }
                                                                </td>
                                                            </tr>
                                                        )
                                                    )
                                            }
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )
                    }
                </section>
            </div>
        </main>
    );
}


export default App;