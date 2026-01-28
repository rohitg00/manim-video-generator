import gradio as gr
import requests
import time
import os
from typing import Tuple, Optional

API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:3000")

STYLES = {
    "3blue1brown": "Classic 3Blue1Brown style with blue background and elegant animations",
    "minimalist": "Clean, simple style with white background and basic shapes",
    "playful": "Colorful and fun style with bouncy animations",
    "corporate": "Professional style suitable for business presentations",
    "neon": "Dark background with glowing neon elements"
}

QUALITY_OPTIONS = ["low", "medium", "high"]


def poll_job_status(job_id: str, max_attempts: int = 60, delay: float = 2.0) -> dict:
    for attempt in range(max_attempts):
        try:
            response = requests.get(f"{API_BASE_URL}/api/jobs/{job_id}", timeout=10)
            result = response.json()

            if result.get("status") == "completed":
                return result
            elif result.get("status") == "failed":
                return result

            time.sleep(delay)
        except requests.RequestException as e:
            if attempt == max_attempts - 1:
                return {"status": "failed", "error": str(e)}
            time.sleep(delay)

    return {"status": "failed", "error": "Generation timed out"}


def generate_animation(
    prompt: str,
    style: str,
    quality: str,
    use_nlu: bool,
    progress: gr.Progress = gr.Progress()
) -> Tuple[Optional[str], str, str]:
    if not prompt.strip():
        return None, "", "Please enter a prompt describing what you want to animate."

    progress(0, desc="Submitting animation request...")

    try:
        response = requests.post(
            f"{API_BASE_URL}/api/generate",
            json={
                "concept": prompt.strip(),
                "style": style,
                "quality": quality,
                "useNLU": use_nlu
            },
            timeout=30
        )

        if response.status_code != 202:
            error_data = response.json()
            return None, "", f"Error: {error_data.get('error', 'Unknown error')}"

        data = response.json()
        job_id = data.get("jobId")

        if not job_id:
            return None, "", "Error: No job ID received"

        progress(0.1, desc=f"Job started: {job_id}")

        max_attempts = 120 if quality == "high" else 60
        for attempt in range(max_attempts):
            progress_val = 0.1 + (0.8 * (attempt / max_attempts))
            progress(progress_val, desc=f"Generating animation... ({attempt + 1}/{max_attempts})")

            status_response = requests.get(
                f"{API_BASE_URL}/api/jobs/{job_id}",
                timeout=10
            )
            result = status_response.json()

            if result.get("status") == "completed":
                progress(1.0, desc="Animation complete!")
                video_url = result.get("video_url", "")
                code = result.get("code", "")

                status_parts = ["Animation generated successfully!"]
                if result.get("skill"):
                    status_parts.append(f"Skill: {result['skill']}")
                if result.get("style"):
                    status_parts.append(f"Style: {result['style']}")
                if result.get("intent"):
                    status_parts.append(f"Intent: {result['intent']}")

                status_msg = " | ".join(status_parts)

                if video_url and not video_url.startswith("http"):
                    video_url = f"{API_BASE_URL}{video_url}"

                return video_url, code, status_msg

            elif result.get("status") == "failed":
                error_msg = result.get("error", "Generation failed")
                details = result.get("details", "")
                return None, "", f"Error: {error_msg}\n{details}"

            time.sleep(2)

        return None, "", "Error: Generation timed out"

    except requests.RequestException as e:
        return None, "", f"Connection error: {str(e)}"
    except Exception as e:
        return None, "", f"Unexpected error: {str(e)}"


def create_style_gallery():
    gallery_html = """
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; padding: 10px;">
    """

    style_colors = {
        "3blue1brown": "#1c1c1c",
        "minimalist": "#f5f5f5",
        "playful": "#ff6b6b",
        "corporate": "#2c3e50",
        "neon": "#0a0a0a"
    }

    for style, description in STYLES.items():
        bg_color = style_colors.get(style, "#333")
        text_color = "#fff" if style not in ["minimalist"] else "#333"
        gallery_html += f"""
        <div style="background: {bg_color}; color: {text_color}; padding: 15px; border-radius: 8px; text-align: center;">
            <strong>{style}</strong><br>
            <small>{description[:50]}...</small>
        </div>
        """

    gallery_html += "</div>"
    return gallery_html


CUSTOM_CSS = """
.gradio-container {
    max-width: 1200px !important;
    margin: auto !important;
}

.output-video {
    border-radius: 8px;
    overflow: hidden;
}

.code-output {
    font-family: 'Fira Code', 'Monaco', monospace;
    font-size: 12px;
}

.status-bar {
    padding: 10px;
    border-radius: 4px;
    margin-top: 10px;
}

.style-gallery {
    padding: 10px;
}
"""

with gr.Blocks(
    title="Manim Video Generator",
    theme=gr.themes.Soft(),
    css=CUSTOM_CSS
) as demo:
    gr.Markdown("""
    # Manim Video Generator

    Generate beautiful mathematical animations from natural language descriptions.
    Powered by [Manim](https://www.manim.community/) and AI.
    """)

    with gr.Row():
        with gr.Column(scale=2):
            prompt_input = gr.Textbox(
                label="Animation Prompt",
                placeholder="Describe what you want to animate...\n\nExamples:\n- Show how the Pythagorean theorem works\n- Visualize the derivative of x^2\n- Demonstrate sorting algorithms",
                lines=4,
                max_lines=8
            )

            with gr.Row():
                style_dropdown = gr.Dropdown(
                    choices=list(STYLES.keys()),
                    value="3blue1brown",
                    label="Visual Style",
                    info="Choose the visual style for your animation"
                )

                quality_radio = gr.Radio(
                    choices=QUALITY_OPTIONS,
                    value="low",
                    label="Quality",
                    info="Higher quality = longer render time"
                )

            with gr.Row():
                use_nlu_checkbox = gr.Checkbox(
                    value=True,
                    label="Use NLU Pipeline",
                    info="Enable intelligent intent classification and skill matching"
                )

            generate_btn = gr.Button(
                "Generate Animation",
                variant="primary",
                size="lg"
            )

            gr.HTML(
                value=create_style_gallery(),
                label="Style Preview"
            )

        with gr.Column(scale=3):
            status_output = gr.Textbox(
                label="Status",
                interactive=False,
                max_lines=3
            )

            video_output = gr.Video(
                label="Generated Animation",
                interactive=False,
                elem_classes=["output-video"]
            )

            code_output = gr.Code(
                label="Generated Manim Code",
                language="python",
                interactive=False,
                elem_classes=["code-output"]
            )

    gr.Examples(
        examples=[
            ["Show how the Pythagorean theorem works with a visual proof", "3blue1brown", "low", True],
            ["Visualize the derivative of sin(x) as a rate of change", "minimalist", "medium", True],
            ["Demonstrate bubble sort algorithm step by step", "playful", "low", True],
            ["Animate a sine wave transforming into a cosine wave", "neon", "low", True],
            ["Show how vectors add together in 2D space", "corporate", "low", True],
        ],
        inputs=[prompt_input, style_dropdown, quality_radio, use_nlu_checkbox],
        label="Example Prompts"
    )

    generate_btn.click(
        fn=generate_animation,
        inputs=[prompt_input, style_dropdown, quality_radio, use_nlu_checkbox],
        outputs=[video_output, code_output, status_output],
        show_progress=True
    )

    gr.Markdown("""
    ---
    **Tips:**
    - Be specific about what mathematical concept you want to visualize
    - Use the NLU pipeline for better intent understanding
    - Start with low quality for quick previews, then render in high quality
    - Check the generated code to learn Manim syntax
    """)


if __name__ == "__main__":
    demo.launch(
        server_name="0.0.0.0",
        server_port=7860,
        share=False,
        show_error=True
    )
