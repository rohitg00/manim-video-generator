import gradio as gr
from typing import Optional, Tuple, Callable
import re


def create_code_editor(
    on_code_change: Optional[Callable] = None,
    editable: bool = False
) -> Tuple[gr.Code, gr.Row]:
    with gr.Group():
        gr.Markdown("### Generated Manim Code")

        code_editor = gr.Code(
            label="Python/Manim Code",
            language="python",
            interactive=editable,
            show_label=False,
            elem_id="code-editor",
            lines=20
        )

        with gr.Row():
            copy_btn = gr.Button(
                "Copy Code",
                variant="secondary",
                size="sm",
                elem_id="copy-code-btn"
            )

            download_code_btn = gr.Button(
                "Download .py",
                variant="secondary",
                size="sm",
                elem_id="download-code-btn"
            )

            if editable:
                save_btn = gr.Button(
                    "Save Changes",
                    variant="primary",
                    size="sm",
                    elem_id="save-code-btn"
                )

        code_info = gr.Markdown(
            value="Generated code will appear here after animation is created.",
            elem_id="code-info"
        )

    copy_btn.click(
        fn=lambda code: code,
        inputs=[code_editor],
        outputs=[],
        js="(code) => { navigator.clipboard.writeText(code); }"
    )

    return code_editor, code_info


def create_code_analysis_panel() -> gr.Accordion:
    with gr.Accordion("Code Analysis", open=False) as analysis_panel:
        with gr.Row():
            lines_count = gr.Number(
                label="Lines of Code",
                interactive=False
            )

            scene_count = gr.Number(
                label="Scenes Detected",
                interactive=False
            )

            animation_count = gr.Number(
                label="Animations",
                interactive=False
            )

        imports_display = gr.Markdown(
            label="Imports Used"
        )

        warnings_display = gr.Markdown(
            label="Warnings/Suggestions"
        )

    return analysis_panel


def analyze_manim_code(code: str) -> dict:
    analysis = {
        "lines_count": 0,
        "scene_count": 0,
        "animation_count": 0,
        "imports": [],
        "classes": [],
        "animations": [],
        "warnings": []
    }

    if not code:
        return analysis

    lines = code.split('\n')
    analysis["lines_count"] = len([l for l in lines if l.strip()])

    import_pattern = r'^(?:from\s+[\w.]+\s+)?import\s+.+'
    for line in lines:
        if re.match(import_pattern, line.strip()):
            analysis["imports"].append(line.strip())

    class_pattern = r'class\s+(\w+)\s*\([^)]*Scene[^)]*\)'
    analysis["classes"] = re.findall(class_pattern, code)
    analysis["scene_count"] = len(analysis["classes"])

    animation_methods = [
        'play', 'wait', 'add', 'remove', 'fade_in', 'fade_out',
        'create', 'uncreate', 'transform', 'replace', 'morph',
        'animate', 'shift', 'scale', 'rotate', 'move_to'
    ]

    for method in animation_methods:
        pattern = rf'\.{method}\s*\('
        matches = re.findall(pattern, code)
        analysis["animation_count"] += len(matches)
        if matches:
            analysis["animations"].append(f"{method}: {len(matches)}")

    if "from manim import *" not in code:
        if "from manim import" not in code:
            analysis["warnings"].append("Missing manim import statement")

    if analysis["scene_count"] == 0:
        analysis["warnings"].append("No Scene class found")

    if analysis["animation_count"] == 0:
        analysis["warnings"].append("No animations detected")

    if "self.play" not in code and "self.add" not in code:
        analysis["warnings"].append("Scene may not render any content")

    return analysis


def format_code_analysis(analysis: dict) -> str:
    md = "**Code Analysis**\n\n"

    md += f"- **Lines:** {analysis['lines_count']}\n"
    md += f"- **Scenes:** {analysis['scene_count']}\n"
    md += f"- **Animations:** {analysis['animation_count']}\n"

    if analysis['classes']:
        md += f"\n**Scene Classes:** {', '.join(analysis['classes'])}\n"

    if analysis['imports']:
        md += "\n**Imports:**\n"
        for imp in analysis['imports'][:5]:
            md += f"- `{imp}`\n"
        if len(analysis['imports']) > 5:
            md += f"- *...and {len(analysis['imports']) - 5} more*\n"

    if analysis['warnings']:
        md += "\n**Warnings:**\n"
        for warning in analysis['warnings']:
            md += f"- {warning}\n"

    return md


def add_line_numbers(code: str) -> str:
    lines = code.split('\n')
    max_digits = len(str(len(lines)))

    numbered_lines = []
    for i, line in enumerate(lines, 1):
        line_num = str(i).rjust(max_digits)
        numbered_lines.append(f"{line_num} | {line}")

    return '\n'.join(numbered_lines)


def extract_scene_names(code: str) -> list:
    pattern = r'class\s+(\w+)\s*\([^)]*Scene[^)]*\)'
    return re.findall(pattern, code)


def generate_run_command(code: str, quality: str = "low") -> str:
    scenes = extract_scene_names(code)

    quality_flags = {
        "low": "-ql",
        "medium": "-qm",
        "high": "-qh"
    }

    flag = quality_flags.get(quality, "-ql")

    if scenes:
        return f"manim {flag} script.py {scenes[0]}"
    else:
        return f"manim {flag} script.py"


EMPTY_CODE_TEMPLATE = '''from manim import *

class ExampleScene(Scene):
    def construct(self):
        text = Text("Enter a prompt to generate an animation!")
        self.play(Write(text))
        self.wait()
'''


SYNTAX_COLORS = {
    "keyword": "#ff7b72",
    "string": "#a5d6ff",
    "comment": "#8b949e",
    "function": "#d2a8ff",
    "class": "#79c0ff",
    "number": "#ffa657",
    "operator": "#ff7b72",
    "builtin": "#ffa657",
}
