const numeros = [
    { texto: "7", valor: "7", modo: "after" },
    { texto: "8", valor: "8", modo: "after" },
    { texto: "9", valor: "9", modo: "after" },
    { texto: "÷", valor: "\\frac{#@}{#?}", modo: "placeholder" },
    { texto: "4", valor: "4", modo: "after" },
    { texto: "5", valor: "5", modo: "after" },
    { texto: "6", valor: "6", modo: "after" },
    { texto: "×", valor: "*", modo: "after" },
    { texto: "1", valor: "1", modo: "after" },
    { texto: "2", valor: "2", modo: "after" },
    { texto: "3", valor: "3", modo: "after" },
    { texto: "−", valor: "-", modo: "after" },
    { texto: "0", valor: "0", modo: "after" },
    { texto: ".", valor: ".", modo: "after" },
    { texto: "𝑥", valor: "x", modo: "after" },
    { texto: "+", valor: "+", modo: "after" }
];

const funciones = [
    { texto: "sin", valor: "\\sin\\left(#?\\right)", modo: "placeholder" },
    { texto: "cos", valor: "\\cos\\left(#?\\right)", modo: "placeholder" },
    { texto: "tan", valor: "\\tan\\left(#?\\right)", modo: "placeholder" },
    { texto: "ln", valor: "\\ln\\left(#?\\right)", modo: "placeholder" },
    { texto: "log", valor: "\\log\\left(#?\\right)", modo: "placeholder" },
    { texto: "√", valor: "\\sqrt{#?}", modo: "placeholder" },
    { texto: "ⁿ√", valor: "\\sqrt[#?]{#?}", modo: "placeholder" },
    { texto: "eˣ", valor: "e^{#?}", modo: "placeholder" },
    { texto: "𝑥²", valor: "#@^{2}", modo: "after" },
    { texto: "𝑥³", valor: "#@^{3}", modo: "after" },
    { texto: "𝑥ʸ", valor: "#@^{#?}", modo: "placeholder" },
    { texto: "π", valor: "\\pi", modo: "after" },
    { texto: "e", valor: "e", modo: "after" },
    { texto: "(", valor: "(", modo: "after" },
    { texto: ")", valor: ")", modo: "after" },
    { texto: "|𝑥|", valor: "\\left|#?\\right|", modo: "placeholder" }
];

function MathKeyboard({ insertar, borrar, limpiar }) {
    const conservarFoco = (evento) => {
        evento.preventDefault();
    };

    return (
        <div className="math-keyboard">
            <div className="keyboard-section">
                <span className="keyboard-title">Básico</span>

                <div className="keyboard-grid basic-grid">
                    {numeros.map((tecla) => (
                        <button key={tecla.texto} type="button" className="key" onMouseDown={conservarFoco} onClick={() => insertar(tecla.valor, tecla.modo)}>
                            {tecla.texto}
                        </button>
                    ))}
                </div>
            </div>

            <div className="keyboard-section">
                <span className="keyboard-title">Funciones</span>

                <div className="keyboard-grid function-grid">
                    {funciones.map((tecla) => (
                        <button key={tecla.texto} type="button" className="key function-key" onMouseDown={conservarFoco} onClick={() => insertar(tecla.valor, tecla.modo)}>
                            {tecla.texto}
                        </button>
                    ))}
                </div>

                <div className="keyboard-controls">
                    <button type="button" className="key control-key" onMouseDown={conservarFoco} onClick={borrar} title="Borrar">
                        ⌫
                    </button>

                    <button type="button" className="key clear-key" onMouseDown={conservarFoco} onClick={limpiar} title="Limpiar función">
                        C
                    </button>
                </div>
            </div>
        </div>
    );
}

export default MathKeyboard;