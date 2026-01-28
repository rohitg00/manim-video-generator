"""
Gradio Web UI Components
Modular components for the Manim Video Generator web interface.
"""

from .prompt_input import create_prompt_input
from .style_selector import create_style_selector
from .preview_player import create_preview_player
from .code_editor import create_code_editor

__all__ = [
    "create_prompt_input",
    "create_style_selector",
    "create_preview_player",
    "create_code_editor"
]
