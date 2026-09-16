import {
    useEffect,
    useMemo,
    useState
} from "react";


function App() {
    const [
        valorReal,
        setValorReal
    ] = useState("");

    const [
        valorAproximado,
        setValorAproximado
    ] = useState("");

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
        notacionDecimal,
        setNotacionDecimal
    ] = useState(true);


    /* PYWEBVIEW */

    useEffect(() => {
        if (
            window.pywebview?.api
        ) {
            setApiDisponible(true);
            return;
        }

        const activarAPI = () => {
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


    /* FORMATO DE NÚMEROS */

    const limpiarCeros = (
        texto
    ) => {
        if (
            texto.includes("e")
            ||
            texto.includes("E")
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


    const formatearNumero = (
        valor,
        decimales = 14
    ) => {
        if (
            valor === null
            ||
            valor === undefined
        ) {
            return "No definido";
        }

        if (
            !Number.isFinite(valor)
        ) {
            return String(valor);
        }

        if (
            valor === 0
        ) {
            return "0";
        }

        if (
            !notacionDecimal
        ) {
            return valor
                .toExponential(8);
        }

        const absoluto =
            Math.abs(valor);

        if (
            absoluto >= 1e12
            ||
            absoluto < 1e-10
        ) {
            return valor
                .toExponential(8);
        }

        return limpiarCeros(
            valor.toFixed(
                decimales
            )
        );
    };


    /* VISTA PREVIA */

    const vistaPrevia =
        useMemo(() => {
            const real =
                Number(valorReal);

            const aproximado =
                Number(
                    valorAproximado
                );

            if (
                valorReal === ""
                ||
                valorAproximado === ""
                ||
                !Number.isFinite(real)
                ||
                !Number.isFinite(
                    aproximado
                )
            ) {
                return null;
            }

            return Math.abs(
                real - aproximado
            );
        }, [
            valorReal,
            valorAproximado
        ]);


    /* CALCULAR */

    const calcular =
        async () => {
            setError("");
            setResultado(null);

            if (
                valorReal.trim() === ""
                ||
                valorAproximado.trim() === ""
            ) {
                setError(
                    "Ingresa el valor real "
                    + "y el valor aproximado."
                );

                return;
            }

            const real =
                Number(valorReal);

            const aproximado =
                Number(
                    valorAproximado
                );

            if (
                !Number.isFinite(real)
                ||
                !Number.isFinite(
                    aproximado
                )
            ) {
                setError(
                    "Ambos datos deben ser "
                    + "números válidos."
                );

                return;
            }

            if (
                !apiDisponible
            ) {
                setError(
                    "La conexión con Python "
                    + "todavía no está disponible."
                );

                return;
            }

            setCalculando(true);

            try {
                const respuesta =
                    await window
                        .pywebview
                        .api
                        .calcular_errores(
                            real,
                            aproximado
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
                    "Ocurrió un error al "
                    + "comunicarse con Python."
                );

            } finally {
                setCalculando(false);
            }
        };


    const limpiar = () => {
        setValorReal("");
        setValorAproximado("");
        setResultado(null);
        setError("");
    };


    const manejarTeclado = (
        evento
    ) => {
        if (
            evento.key === "Enter"
        ) {
            calcular();
        }
    };

    return (
        <main className="app">
            <header className="topbar">
                <span className="app-tag">
                    MÉTODOS NUMÉRICOS
                </span>
                <h1>
                    Cálculo de Errores
                </h1>
            </header>
            <section className="workspace">
                <div
                    className="
                        panel
                        input-panel
                    "
                >
                    <div className="section-header">
                        <div>
                            <h2>
                                Datos de entrada
                            </h2>
                        </div>
                    </div>
                    <div className="fields">
                        <label className="field">
                          <span>
                              Valor real
                          </span>
                          <div className="input-container">
                              <input
                                  type="text"
                                  inputMode="decimal"
                                  value={valorReal}
                                  onChange={(evento) => {
                                      setValorReal(
                                          evento.target.value
                                      );
                                      setError("");
                                  }}
                                  onKeyDown={manejarTeclado}
                                  autoFocus
                              />
                              {
                                  !valorReal && (
                                      <span className="input-example">
                                          Ej. 3.14159265
                                      </span>
                                  )
                              }
                          </div>
                      </label>
                        <label className="field">
                          <span>
                              Valor aproximado
                          </span>
                          <div className="input-container">
                              <input
                                  type="text"
                                  inputMode="decimal"
                                  value={valorAproximado}
                                  onChange={(evento) => {
                                      setValorAproximado(
                                          evento.target.value
                                      );
                                      setError("");
                                  }}
                                  onKeyDown={manejarTeclado}
                              />
                              {
                                  !valorAproximado && (
                                      <span className="input-example">
                                          Ej. 3.14
                                      </span>
                                  )
                              }
                          </div>
                      </label>
                    </div>
                    <div className="difference-preview">
                        <span>
                            Diferencia actual
                        </span>
                        <strong>
                            {
                                vistaPrevia === null
                                    ? "—"
                                    : formatearNumero(
                                        vistaPrevia
                                    )
                            }
                        </strong>
                    </div>
                    <div className="formula-box">
                        <span className="formula-title">
                            Fórmulas utilizadas
                        </span>
                        <div className="formula-row">
                            <span>
                                Error absoluto
                            </span>
                            <code>
                                Ea = |Vr − Va|
                            </code>
                        </div>
                        <div className="formula-row">
                            <span>
                                Error relativo
                            </span>
                            <code>
                                Er = Ea / |Vr|
                            </code>
                        </div>
                        <div className="formula-row">
                            <span>
                                Error porcentual
                            </span>
                            <code>
                                Ep = Er × 100%
                            </code>
                        </div>
                    </div>
                    {
                        error
                        && (
                            <div className="error-message">
                                {error}
                            </div>
                        )
                    }
                    <div className="actions">
                        <button
                            type="button"
                            className="
                                secondary-button
                            "
                            onClick={
                                limpiar
                            }
                            disabled={
                                calculando
                            }
                        >
                            C
                        </button>
                        <button
                            type="button"
                            className="
                                primary-button
                            "
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
                                    : "Calcular errores"
                            }
                        </button>
                    </div>
                </div>
                <div
                    className="
                        panel
                        results-panel
                    "
                >
                    <div
                        className="
                            section-header
                            result-header
                        "
                    >
                        <div>
                            <h2>
                                Resultados
                            </h2>
                        </div>
                        <div className="notation-switch">
                            <button
                                type="button"
                                className={
                                    notacionDecimal
                                        ? "active"
                                        : ""
                                }
                                onClick={
                                    () =>
                                        setNotacionDecimal(
                                            true
                                        )
                                }
                            >
                                Decimal
                            </button>
                            <button
                                type="button"
                                className={
                                    !notacionDecimal
                                        ? "active"
                                        : ""
                                }
                                onClick={
                                    () =>
                                        setNotacionDecimal(
                                            false
                                        )
                                }
                            >
                                Científica
                            </button>
                        </div>
                    </div>
                    {
                        !resultado
                        ? (
                            <div className="empty-state">
                                <div className="empty-symbol">
                                    Δ
                                </div>
                                <h3>
                                    Aún no hay resultados
                                </h3>
                                <p>
                                    Ingresa ambos valores
                                    y presiona
                                    “Calcular errores”.
                                </p>
                            </div>
                        )
                        : (
                            <div className="results-content">
                                <div className="comparison-card">
                                    <div>
                                        <span>
                                            Valor real
                                        </span>
                                        <strong>
                                            {
                                                formatearNumero(
                                                    resultado
                                                        .valor_real
                                                )
                                            }
                                        </strong>
                                    </div>
                                    <div className="comparison-arrow">
                                        →
                                    </div>
                                    <div>
                                        <span>
                                            Valor aproximado
                                        </span>
                                        <strong>
                                            {
                                                formatearNumero(
                                                    resultado
                                                        .valor_aproximado
                                                )
                                            }
                                        </strong>
                                    </div>
                                </div>
                                <div className="result-grid">
                                    <article
                                        className="
                                            result-card
                                            featured
                                        "
                                    >
                                        <span className="result-label">
                                            Error absoluto
                                        </span>
                                        <strong className="result-value">
                                            {
                                                formatearNumero(
                                                    resultado
                                                        .error_absoluto
                                                )
                                            }
                                        </strong>
                                    </article>
                                    <article className="result-card">
                                        <span className="result-label">
                                            Error relativo
                                        </span>
                                        <strong className="result-value">
                                            {
                                                resultado
                                                    .relativo_definido
                                                    ? formatearNumero(
                                                        resultado
                                                            .error_relativo
                                                    )
                                                    : "No definido"
                                            }
                                        </strong>
                                    </article>
                                    <article
                                        className="
                                            result-card
                                            percentage-card
                                        "
                                    >
                                        <span className="result-label">
                                            Error porcentual
                                        </span>
                                        <strong className="result-value">
                                            {
                                                resultado
                                                    .relativo_definido
                                                    ? `${
                                                        formatearNumero(
                                                            resultado
                                                                .error_porcentual
                                                        )
                                                    } %`
                                                    : "No definido"
                                            }
                                        </strong>
                                    </article>
                                </div>
                                {
                                    !resultado
                                        .relativo_definido
                                    && (
                                        <div className="warning-message">
                                            El error relativo y
                                            el porcentual no se
                                            pueden calcular cuando
                                            el valor real es 0,
                                            porque implicaría una
                                            división entre cero.
                                        </div>
                                    )
                                }
                            </div>
                        )
                    }
                </div>
            </section>
        </main>
    );
}


export default App;