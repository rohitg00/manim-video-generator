import gradio as gr
from typing import Tuple, Optional, Callable


def create_prompt_input(
    on_submit: Optional[Callable] = None,
    on_image_upload: Optional[Callable] = None
) -> Tuple[gr.Textbox, gr.Image, gr.Button]:
    placeholder_text = """Describe what you want to animate...

Examples:
- Show how the Pythagorean theorem works
- Visualize the derivative of x^2
- Demonstrate sorting algorithms
- Animate a Mobius strip rotating in 3D
- Show the relationship between e^(ix) and unit circle"""

    with gr.Group():
        gr.Markdown("### Animation Prompt")

        prompt_textbox = gr.Textbox(
            label="Text Prompt",
            placeholder=placeholder_text,
            lines=5,
            max_lines=10,
            show_label=False,
            elem_id="prompt-input"
        )

        with gr.Accordion("Image Input (Optional)", open=False):
            gr.Markdown(
                "Upload a diagram, equation, or graph to convert into an animation."
            )

            image_input = gr.Image(
                label="Upload Image",
                type="filepath",
                sources=["upload", "clipboard"],
                show_label=False,
                elem_id="image-input"
            )

            gr.Markdown(
                "*Supported: diagrams, graphs, handwritten equations, textbook screenshots*"
            )

        with gr.Row():
            clear_btn = gr.Button(
                "Clear",
                variant="secondary",
                size="sm"
            )

            submit_btn = gr.Button(
                "Generate Animation",
                variant="primary",
                size="lg",
                elem_id="submit-btn"
            )

        clear_btn.click(
            fn=lambda: ("", None),
            outputs=[prompt_textbox, image_input]
        )

    return prompt_textbox, image_input, submit_btn


def create_quick_prompts() -> gr.Dataset:
    examples = [
        ["Explain the Pythagorean theorem visually"],
        ["Show how derivatives represent slopes"],
        ["Visualize matrix multiplication"],
        ["Animate a Fourier series approximating a square wave"],
        ["Demonstrate the central limit theorem"],
        ["Show how neural network forward pass works"],
        ["Visualize gradient descent optimization"],
        ["Animate the construction of a Koch snowflake"],
    ]

    return gr.Dataset(
        components=[gr.Textbox(visible=False)],
        samples=examples,
        label="Quick Prompts",
        type="index"
    )


def parse_math_from_text(text: str) -> dict:
    import re

    parsed = {
        "equations": [],
        "functions": [],
        "concepts": [],
        "operations": []
    }

    equation_pattern = r'(?:\$.*?\$|\\[.*?\\])'
    function_pattern = r'(?:f\(x\)|g\(x\)|sin|cos|tan|log|ln|exp|sqrt)\(?[^)]*\)?'
    operation_pattern = r'(?:derivative|integral|limit|sum|product|transform)'

    parsed["equations"] = re.findall(equation_pattern, text)
    parsed["functions"] = re.findall(function_pattern, text, re.IGNORECASE)
    parsed["operations"] = re.findall(operation_pattern, text, re.IGNORECASE)

    concept_keywords = [
        "theorem", "proof", "equation", "formula", "graph", "curve",
        "vector", "matrix", "transform", "series", "sequence", "limit",
        "derivative", "integral", "differential", "polynomial", "function",
        "angle", "triangle", "circle", "sphere", "plane", "line"
    ]

    for keyword in concept_keywords:
        if keyword.lower() in text.lower():
            parsed["concepts"].append(keyword)

    return parsed


def validate_prompt(prompt: str) -> Tuple[bool, str]:
    if not prompt or not prompt.strip():
        return False, "Please enter a prompt describing what you want to animate."

    if len(prompt.strip()) < 10:
        return False, "Please provide a more detailed description (at least 10 characters)."

    if len(prompt) > 2000:
        return False, "Prompt is too long. Please keep it under 2000 characters."

    blocked_patterns = [
        r'<script',
        r'javascript:',
        r'on\w+\s*=',
    ]

    import re
    for pattern in blocked_patterns:
        if re.search(pattern, prompt, re.IGNORECASE):
            return False, "Invalid input detected. Please enter a valid animation prompt."

    return True, ""
