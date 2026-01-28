import gradio as gr
from typing import Dict, List, Tuple, Optional


STYLE_DEFINITIONS: Dict[str, dict] = {
    "3blue1brown": {
        "name": "3Blue1Brown",
        "description": "Classic mathematical animation style inspired by 3Blue1Brown. Features a dark blue background with elegant, smooth animations and clear visual explanations.",
        "background": "#1c1c1c",
        "primary_color": "#3b82f6",
        "accent_color": "#22c55e",
        "text_color": "#ffffff",
        "preview_image": "/static/previews/3b1b-preview.png",
        "best_for": ["Math explanations", "Proofs", "Calculus", "Linear algebra"]
    },
    "minimalist": {
        "name": "Minimalist",
        "description": "Clean, simple style with white background. Perfect for clarity and focus on the mathematical content without distractions.",
        "background": "#f5f5f5",
        "primary_color": "#1f2937",
        "accent_color": "#3b82f6",
        "text_color": "#1f2937",
        "preview_image": "/static/previews/minimalist-preview.png",
        "best_for": ["Academic presentations", "Documentation", "Simple concepts"]
    },
    "playful": {
        "name": "Playful",
        "description": "Colorful and fun style with bouncy animations. Great for educational content aimed at younger audiences.",
        "background": "#fef3c7",
        "primary_color": "#f97316",
        "accent_color": "#ec4899",
        "text_color": "#1f2937",
        "preview_image": "/static/previews/playful-preview.png",
        "best_for": ["K-12 education", "Tutorials", "Engaging content"]
    },
    "corporate": {
        "name": "Corporate",
        "description": "Professional style suitable for business presentations. Features muted colors and smooth, professional animations.",
        "background": "#1e293b",
        "primary_color": "#0ea5e9",
        "accent_color": "#a3e635",
        "text_color": "#f1f5f9",
        "preview_image": "/static/previews/corporate-preview.png",
        "best_for": ["Business presentations", "Reports", "Professional content"]
    },
    "neon": {
        "name": "Neon",
        "description": "Dark background with glowing neon elements. Creates a modern, tech-inspired look with vibrant colors.",
        "background": "#0a0a0a",
        "primary_color": "#f0abfc",
        "accent_color": "#22d3ee",
        "text_color": "#ffffff",
        "preview_image": "/static/previews/neon-preview.png",
        "best_for": ["Tech content", "Modern presentations", "Attention-grabbing"]
    }
}


def create_style_selector(
    default_style: str = "3blue1brown",
    show_preview: bool = True
) -> Tuple[gr.Dropdown, Optional[gr.HTML]]:
    style_choices = list(STYLE_DEFINITIONS.keys())

    style_dropdown = gr.Dropdown(
        choices=style_choices,
        value=default_style,
        label="Visual Style",
        info="Choose the visual style for your animation",
        elem_id="style-selector"
    )

    if show_preview:
        preview_html = gr.HTML(
            value=generate_style_preview_html(default_style),
            label="Style Preview",
            elem_id="style-preview"
        )

        style_dropdown.change(
            fn=generate_style_preview_html,
            inputs=[style_dropdown],
            outputs=[preview_html]
        )

        return style_dropdown, preview_html

    return style_dropdown, None


def create_style_gallery() -> gr.HTML:
    gallery_html = """
    <div class="style-gallery" style="
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 16px;
        padding: 16px;
    ">
    """

    for style_key, style_data in STYLE_DEFINITIONS.items():
        gallery_html += generate_style_card_html(style_key, style_data)

    gallery_html += "</div>"

    return gr.HTML(value=gallery_html, label="Style Gallery")


def generate_style_card_html(style_key: str, style_data: dict) -> str:
    bg = style_data["background"]
    primary = style_data["primary_color"]
    accent = style_data["accent_color"]
    text = style_data["text_color"]
    name = style_data["name"]
    description = style_data["description"][:100] + "..."
    best_for = ", ".join(style_data["best_for"][:2])

    return f"""
    <div class="style-card" style="
        background: {bg};
        color: {text};
        padding: 20px;
        border-radius: 12px;
        cursor: pointer;
        transition: transform 0.2s, box-shadow 0.2s;
        border: 2px solid transparent;
    " onmouseover="this.style.transform='scale(1.02)'; this.style.boxShadow='0 4px 20px rgba(0,0,0,0.2)';"
       onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='none';">

        <div style="display: flex; gap: 8px; margin-bottom: 12px;">
            <div style="width: 24px; height: 24px; background: {primary}; border-radius: 50%;"></div>
            <div style="width: 24px; height: 24px; background: {accent}; border-radius: 50%;"></div>
        </div>

        <h3 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 600;">{name}</h3>
        <p style="margin: 0 0 12px 0; font-size: 13px; opacity: 0.8; line-height: 1.4;">
            {description}
        </p>
        <div style="font-size: 11px; opacity: 0.6;">
            <strong>Best for:</strong> {best_for}
        </div>
    </div>
    """


def generate_style_preview_html(style_key: str) -> str:
    if style_key not in STYLE_DEFINITIONS:
        style_key = "3blue1brown"

    style = STYLE_DEFINITIONS[style_key]
    bg = style["background"]
    primary = style["primary_color"]
    accent = style["accent_color"]
    text = style["text_color"]

    return f"""
    <div style="
        background: {bg};
        color: {text};
        padding: 24px;
        border-radius: 12px;
        margin: 16px 0;
    ">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <h3 style="margin: 0; font-size: 20px;">{style['name']}</h3>
            <div style="display: flex; gap: 8px;">
                <span style="
                    background: {primary};
                    color: white;
                    padding: 4px 12px;
                    border-radius: 16px;
                    font-size: 12px;
                ">Primary</span>
                <span style="
                    background: {accent};
                    color: white;
                    padding: 4px 12px;
                    border-radius: 16px;
                    font-size: 12px;
                ">Accent</span>
            </div>
        </div>

        <p style="margin: 0 0 16px 0; opacity: 0.9; line-height: 1.5;">
            {style['description']}
        </p>

        <div style="
            height: 100px;
            border-radius: 8px;
            background: linear-gradient(135deg, {primary}20, {accent}20);
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            overflow: hidden;
        ">
            <svg width="200" height="80" viewBox="0 0 200 80">
                <circle cx="40" cy="40" r="20" fill="{primary}" opacity="0.8">
                    <animate attributeName="r" values="15;25;15" dur="2s" repeatCount="indefinite"/>
                </circle>
                <circle cx="100" cy="40" r="15" fill="{accent}" opacity="0.8">
                    <animate attributeName="cy" values="35;45;35" dur="1.5s" repeatCount="indefinite"/>
                </circle>
                <rect x="140" y="25" width="30" height="30" fill="{primary}" opacity="0.6">
                    <animate attributeName="transform" values="rotate(0 155 40);rotate(360 155 40)" dur="3s" repeatCount="indefinite"/>
                </rect>
            </svg>
        </div>

        <div style="margin-top: 16px; font-size: 13px; opacity: 0.7;">
            <strong>Best for:</strong> {', '.join(style['best_for'])}
        </div>
    </div>
    """


def get_style_config(style_key: str) -> dict:
    return STYLE_DEFINITIONS.get(style_key, STYLE_DEFINITIONS["3blue1brown"])


def get_all_styles() -> List[str]:
    return list(STYLE_DEFINITIONS.keys())
