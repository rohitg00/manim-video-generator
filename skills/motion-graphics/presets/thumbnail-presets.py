"""
Thumbnail Generation Presets
Ready-to-use functions for creating video thumbnails and title cards
"""

from manim import *
import numpy as np


# =============================================================================
# ASPECT RATIO CONFIGURATIONS
# =============================================================================

ASPECT_RATIOS = {
    "youtube": {"width": 1920, "height": 1080, "name": "16:9"},
    "youtube_short": {"width": 1080, "height": 1920, "name": "9:16"},
    "instagram": {"width": 1080, "height": 1080, "name": "1:1"},
    "twitter": {"width": 1200, "height": 675, "name": "16:9"},
    "linkedin": {"width": 1200, "height": 627, "name": "1.91:1"},
}


# =============================================================================
# THUMBNAIL SCENE BASE
# =============================================================================

class ThumbnailScene(Scene):
    """Base class for thumbnail generation."""
    
    # Override in subclass
    TITLE = "Your Title Here"
    SUBTITLE = ""
    ASPECT_RATIO = "youtube"
    
    def construct(self):
        # Set up frame for aspect ratio
        config = ASPECT_RATIOS.get(self.ASPECT_RATIO, ASPECT_RATIOS["youtube"])
        
        # Build thumbnail
        self.create_background()
        self.create_main_visual()
        self.create_text_overlay()
        
        # Hold frame (for image export)
        self.wait(0.1)
    
    def create_background(self):
        """Override to customize background."""
        # Default gradient background
        bg = Rectangle(
            width=config.frame_width + 1,
            height=config.frame_height + 1,
            fill_opacity=1,
            stroke_width=0
        )
        bg.set_color(color=[BLUE_E, PURPLE_E])
        self.add(bg)
    
    def create_main_visual(self):
        """Override to add main visual element."""
        pass
    
    def create_text_overlay(self):
        """Override to customize text."""
        title = Text(
            self.TITLE,
            font_size=72,
            weight=BOLD,
            color=WHITE
        )
        title.move_to(ORIGIN)
        
        if self.SUBTITLE:
            subtitle = Text(
                self.SUBTITLE,
                font_size=36,
                color=GREY_A
            )
            subtitle.next_to(title, DOWN, buff=0.5)
            self.add(subtitle)
        
        self.add(title)


# =============================================================================
# PRESET THUMBNAIL STYLES
# =============================================================================

def create_math_thumbnail(scene, title, equation, colors=None):
    """
    Create a math-focused thumbnail.
    
    Args:
        scene: The Scene instance
        title: Main title text
        equation: LaTeX equation string
        colors: Optional dict of {substring: color}
    """
    if colors is None:
        colors = {}
    
    # Dark gradient background
    bg = Rectangle(
        width=20, height=12,
        fill_opacity=1, stroke_width=0
    )
    bg.set_color(color=[BLUE_E, BLACK])
    scene.add(bg)
    
    # Equation (main focus)
    eq = MathTex(equation, font_size=96)
    for substr, color in colors.items():
        eq.set_color_by_tex(substr, color)
    eq.move_to(ORIGIN)
    
    # Title above
    title_text = Text(title, font_size=56, weight=BOLD, color=WHITE)
    title_text.to_edge(UP, buff=0.8)
    
    # Decorative elements
    line_left = Line(LEFT * 6, LEFT * 2, color=BLUE, stroke_width=4)
    line_right = Line(RIGHT * 2, RIGHT * 6, color=BLUE, stroke_width=4)
    line_left.next_to(title_text, DOWN, buff=0.3)
    line_right.next_to(title_text, DOWN, buff=0.3)
    
    scene.add(bg, eq, title_text, line_left, line_right)


def create_concept_thumbnail(scene, title, icon_mobject, subtitle=""):
    """
    Create a concept-focused thumbnail with icon.
    
    Args:
        scene: The Scene instance
        title: Main title text
        icon_mobject: A Mobject to use as the central icon
        subtitle: Optional subtitle
    """
    # Gradient background
    bg = Rectangle(width=20, height=12, fill_opacity=1, stroke_width=0)
    bg.set_color(color=[PURPLE_E, BLUE_E])
    scene.add(bg)
    
    # Icon (scaled and centered)
    icon = icon_mobject.copy()
    icon.scale_to_fit_height(4)
    icon.move_to(ORIGIN)
    
    # Add glow effect
    glow = icon.copy()
    glow.set_color(WHITE)
    glow.set_opacity(0.3)
    glow.scale(1.2)
    scene.add(glow)
    scene.add(icon)
    
    # Title
    title_text = Text(title, font_size=64, weight=BOLD, color=WHITE)
    title_text.to_edge(UP, buff=0.6)
    scene.add(title_text)
    
    # Subtitle
    if subtitle:
        sub = Text(subtitle, font_size=32, color=GREY_A)
        sub.to_edge(DOWN, buff=0.8)
        scene.add(sub)


def create_comparison_thumbnail(scene, left_text, right_text, vs_text="VS"):
    """
    Create a comparison/versus thumbnail.
    
    Args:
        scene: The Scene instance
        left_text: Text for left side
        right_text: Text for right side
        vs_text: Center divider text
    """
    # Split background
    left_bg = Rectangle(width=8, height=12, fill_opacity=1, stroke_width=0)
    left_bg.set_color(BLUE_E)
    left_bg.shift(LEFT * 4)
    
    right_bg = Rectangle(width=8, height=12, fill_opacity=1, stroke_width=0)
    right_bg.set_color(RED_E)
    right_bg.shift(RIGHT * 4)
    
    scene.add(left_bg, right_bg)
    
    # VS circle
    vs_circle = Circle(radius=1, fill_opacity=1, fill_color=WHITE, stroke_width=0)
    vs_label = Text(vs_text, font_size=48, weight=BOLD, color=BLACK)
    vs_group = VGroup(vs_circle, vs_label)
    scene.add(vs_group)
    
    # Left text
    left = Text(left_text, font_size=56, weight=BOLD, color=WHITE)
    left.move_to(LEFT * 4)
    scene.add(left)
    
    # Right text
    right = Text(right_text, font_size=56, weight=BOLD, color=WHITE)
    right.move_to(RIGHT * 4)
    scene.add(right)


def create_numbered_thumbnail(scene, number, title, subtitle=""):
    """
    Create a numbered episode/part thumbnail.
    
    Args:
        scene: The Scene instance
        number: Episode/part number
        title: Main title
        subtitle: Optional subtitle
    """
    # Background
    bg = Rectangle(width=20, height=12, fill_opacity=1, stroke_width=0)
    bg.set_color(color=[GREY_E, BLACK])
    scene.add(bg)
    
    # Large number
    num = Text(str(number), font_size=200, weight=BOLD, color=BLUE)
    num.set_opacity(0.3)
    num.move_to(LEFT * 3)
    scene.add(num)
    
    # Title
    title_text = Text(title, font_size=64, weight=BOLD, color=WHITE)
    title_text.move_to(RIGHT * 1 + UP * 0.5)
    scene.add(title_text)
    
    # Part label
    part_label = Text(f"PART {number}", font_size=28, color=BLUE)
    part_label.next_to(title_text, UP, buff=0.5)
    scene.add(part_label)
    
    # Subtitle
    if subtitle:
        sub = Text(subtitle, font_size=32, color=GREY_A)
        sub.next_to(title_text, DOWN, buff=0.5)
        scene.add(sub)


def create_quote_thumbnail(scene, quote, author=""):
    """
    Create a quote-style thumbnail.
    
    Args:
        scene: The Scene instance
        quote: The quote text
        author: Optional author attribution
    """
    # Dark background
    bg = Rectangle(width=20, height=12, fill_opacity=1, stroke_width=0)
    bg.set_color(BLACK)
    scene.add(bg)
    
    # Quote marks
    open_quote = Text('"', font_size=200, color=BLUE)
    open_quote.set_opacity(0.5)
    open_quote.to_corner(UL, buff=0.5)
    scene.add(open_quote)
    
    close_quote = Text('"', font_size=200, color=BLUE)
    close_quote.set_opacity(0.5)
    close_quote.to_corner(DR, buff=0.5)
    scene.add(close_quote)
    
    # Quote text
    quote_text = Text(
        quote,
        font_size=48,
        color=WHITE,
        line_spacing=1.5
    )
    quote_text.move_to(ORIGIN)
    
    # Wrap if too wide
    if quote_text.width > 12:
        quote_text.scale_to_fit_width(12)
    
    scene.add(quote_text)
    
    # Author
    if author:
        author_text = Text(f"— {author}", font_size=32, color=GREY_A)
        author_text.next_to(quote_text, DOWN, buff=0.8)
        scene.add(author_text)


# =============================================================================
# TITLE CARD PRESETS
# =============================================================================

class IntroTitleCard(Scene):
    """Animated intro title card."""
    
    TITLE = "Your Title"
    SUBTITLE = "Your Subtitle"
    DURATION = 3
    
    def construct(self):
        # Background
        bg = Rectangle(width=20, height=12, fill_opacity=1, stroke_width=0)
        bg.set_color(color=[BLUE_E, BLACK])
        self.add(bg)
        
        # Title
        title = Text(self.TITLE, font_size=72, weight=BOLD, color=WHITE)
        title.move_to(UP * 0.5)
        
        # Subtitle
        subtitle = Text(self.SUBTITLE, font_size=36, color=GREY_A)
        subtitle.next_to(title, DOWN, buff=0.5)
        
        # Underline
        underline = Line(LEFT * 4, RIGHT * 4, color=BLUE, stroke_width=4)
        underline.next_to(subtitle, DOWN, buff=0.5)
        
        # Animate
        self.play(Write(title), run_time=1)
        self.play(FadeIn(subtitle, shift=UP * 0.2), run_time=0.5)
        self.play(Create(underline), run_time=0.5)
        self.wait(self.DURATION - 2)


class OutroTitleCard(Scene):
    """Animated outro/end card."""
    
    THANKS_TEXT = "Thanks for watching!"
    CTA_TEXT = "Subscribe for more"
    DURATION = 4
    
    def construct(self):
        # Background
        bg = Rectangle(width=20, height=12, fill_opacity=1, stroke_width=0)
        bg.set_color(BLACK)
        self.add(bg)
        
        # Thanks
        thanks = Text(self.THANKS_TEXT, font_size=64, weight=BOLD, color=WHITE)
        thanks.move_to(UP * 1)
        
        # CTA
        cta = Text(self.CTA_TEXT, font_size=36, color=BLUE)
        cta.move_to(DOWN * 0.5)
        
        # Animate
        self.play(FadeIn(thanks, scale=1.2), run_time=1)
        self.wait(0.5)
        self.play(FadeIn(cta, shift=UP * 0.3), run_time=0.5)
        self.wait(self.DURATION - 2)
        self.play(FadeOut(thanks), FadeOut(cta), run_time=0.5)


# =============================================================================
# UTILITY FUNCTIONS
# =============================================================================

def export_thumbnail(scene_class, output_path, **scene_kwargs):
    """
    Export a thumbnail scene as an image.
    
    Usage:
        export_thumbnail(MyThumbnail, "thumbnail.png", TITLE="Custom Title")
    """
    # Set scene attributes
    for key, value in scene_kwargs.items():
        setattr(scene_class, key, value)
    
    # Configure for image export
    config.frame_rate = 1
    config.pixel_width = 1920
    config.pixel_height = 1080
    
    # Render
    scene = scene_class()
    scene.render()
    
    # The output will be in media/images/


def batch_export_thumbnails(scenes, output_dir):
    """
    Export multiple thumbnails.
    
    Args:
        scenes: List of (scene_class, filename, kwargs) tuples
        output_dir: Directory for output files
    """
    import os
    os.makedirs(output_dir, exist_ok=True)
    
    for scene_class, filename, kwargs in scenes:
        output_path = os.path.join(output_dir, filename)
        export_thumbnail(scene_class, output_path, **kwargs)
        print(f"Exported: {output_path}")
