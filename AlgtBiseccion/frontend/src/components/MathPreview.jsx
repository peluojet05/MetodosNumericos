import { BlockMath } from "react-katex";
import { parse } from "mathjs";

function MathPreview({
    expresion
}) {
    if (!expresion) {
        return (
            <div className="math-placeholder">
                f(x)
            </div>
        );
    }
    try {
        const expresionNormalizada =
            expresion.replace(
                /\bln\(/g,
                "log("
            );
        const arbol = parse(
            expresionNormalizada
        );
        const latex = arbol.toTex({
            parenthesis: "keep"
        });
        return (
            <BlockMath math={latex} />
        );
    } catch {
        return (
            <div className="math-error">
                {expresion}
            </div>
        );
    }
}

export default MathPreview;