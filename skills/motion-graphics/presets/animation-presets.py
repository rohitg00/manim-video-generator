"""
Motion Graphics Animation Presets
Ready-to-use animation functions for common effects
"""

from manim import *
import numpy as np


# =============================================================================
# ENTRANCE ANIMATIONS
# =============================================================================

def pop_in(scene, mobject, scale_factor=0.5, duration=0.4):
    """Element pops in with overshoot"""
    mobject.scale(0)
    scene.play(
        mobject.animate.scale(1/scale_factor if scale_factor != 0 else 1),
        rate_func=rate_functions.ease_out_back,
        run_time=duration
    )


def slide_in_left(scene, mobject, duration=0.5):
    """Slide in from left side"""
    original_pos = mobject.get_center()
    mobject.shift(LEFT * 15)
    scene.play(
        mobject.animate.move_to(original_pos),
        rate_func=rate_functions.ease_out_cubic,
        run_time=duration
    )


def slide_in_right(scene, mobject, duration=0.5):
    """Slide in from right side"""
    original_pos = mobject.get_center()
    mobject.shift(RIGHT * 15)
    scene.play(
        mobject.animate.move_to(original_pos),
        rate_func=rate_functions.ease_out_cubic,
        run_time=duration
    )


def fade_in_up(scene, mobject, distance=0.5, duration=0.6):
    """Fade in while moving up"""
    mobject.shift(DOWN * distance).set_opacity(0)
    scene.play(
        mobject.animate.shift(UP * distance).set_opacity(1),
        rate_func=rate_functions.ease_out_cubic,
        run_time=duration
    )


def zoom_in(scene, mobject, duration=0.5):
    """Zoom in from small to normal"""
    mobject.scale(0.1).set_opacity(0)
    scene.play(
        mobject.animate.scale(10).set_opacity(1),
        rate_func=rate_functions.ease_out_expo,
        run_time=duration
    )


# =============================================================================
# EXIT ANIMATIONS
# =============================================================================

def pop_out(scene, mobject, duration=0.3):
    """Element shrinks and disappears"""
    scene.play(
        mobject.animate.scale(0),
        rate_func=rate_functions.ease_in_back,
        run_time=duration
    )
    scene.remove(mobject)


def fade_out_up(scene, mobject, distance=0.5, duration=0.4):
    """Fade out while moving up"""
    scene.play(
        mobject.animate.shift(UP * distance).set_opacity(0),
        rate_func=rate_functions.ease_in_cubic,
        run_time=duration
    )
    scene.remove(mobject)


def slide_out_left(scene, mobject, duration=0.4):
    """Slide out to left"""
    scene.play(
        mobject.animate.shift(LEFT * 15),
        rate_func=rate_functions.ease_in_cubic,
        run_time=duration
    )
    scene.remove(mobject)


def dissolve(scene, mobject, duration=0.5):
    """Gentle dissolve/fade"""
    scene.play(
        mobject.animate.set_opacity(0),
        rate_func=rate_functions.smooth,
        run_time=duration
    )
    scene.remove(mobject)


# =============================================================================
# EMPHASIS ANIMATIONS
# =============================================================================

def pulse(scene, mobject, scale=1.2, duration=0.4):
    """Scale up then back down"""
    scene.play(
        mobject.animate.scale(scale),
        rate_func=rate_functions.there_and_back,
        run_time=duration
    )


def shake(scene, mobject, amplitude=0.1, duration=0.4):
    """Quick shake effect"""
    original_pos = mobject.get_center()
    for _ in range(3):
        scene.play(
            mobject.animate.shift(LEFT * amplitude),
            run_time=duration/6
        )
        scene.play(
            mobject.animate.shift(RIGHT * amplitude * 2),
            run_time=duration/6
        )
    scene.play(
        mobject.animate.move_to(original_pos),
        run_time=duration/6
    )


def glow(scene, mobject, color=YELLOW, duration=0.5):
    """Add glow effect"""
    glow_copy = mobject.copy()
    glow_copy.set_color(color).set_opacity(0.5)
    scene.play(
        glow_copy.animate.scale(1.3).set_opacity(0),
        run_time=duration
    )
    scene.remove(glow_copy)


def color_flash(scene, mobject, color=YELLOW, duration=0.3):
    """Quick color change and back"""
    original_color = mobject.get_color()
    scene.play(
        mobject.animate.set_color(color),
        run_time=duration/2
    )
    scene.play(
        mobject.animate.set_color(original_color),
        run_time=duration/2
    )


# =============================================================================
# TEXT ANIMATIONS
# =============================================================================

def typewriter(scene, text_mobject, duration=None):
    """Typewriter text effect"""
    if duration is None:
        duration = len(text_mobject.text) * 0.05
    scene.play(AddTextLetterByLetter(text_mobject), run_time=duration)


def word_by_word(scene, text, font_size=48, color=WHITE, wait=0.2):
    """Display text word by word"""
    words = text.split()
    mobjects = []
    for word in words:
        t = Text(word, font_size=font_size, color=color)
        mobjects.append(t)

    group = VGroup(*mobjects).arrange(RIGHT, buff=0.3)

    for m in mobjects:
        m.set_opacity(0)

    scene.add(group)

    for m in mobjects:
        scene.play(m.animate.set_opacity(1), run_time=0.2)
        scene.wait(wait)

    return group


def text_replace(scene, old_text, new_text, duration=0.5):
    """Replace one text with another"""
    new_text.move_to(old_text)
    scene.play(
        FadeOut(old_text, shift=UP * 0.3),
        FadeIn(new_text, shift=UP * 0.3),
        run_time=duration
    )
    return new_text


# =============================================================================
# TRANSITION ANIMATIONS
# =============================================================================

def wipe_left(scene, duration=0.8):
    """Wipe transition to the left"""
    wipe = Rectangle(
        width=16, height=10,
        fill_opacity=1,
        fill_color=BLACK,
        stroke_width=0
    )
    wipe.to_edge(RIGHT, buff=0).shift(RIGHT * 16)
    scene.play(
        wipe.animate.shift(LEFT * 32),
        run_time=duration
    )
    scene.clear()
    scene.remove(wipe)


def circle_wipe(scene, duration=1.0):
    """Circle expanding wipe"""
    circle = Circle(radius=0.1, fill_opacity=1, fill_color=BLACK, stroke_width=0)
    scene.play(
        circle.animate.scale(100),
        rate_func=rate_functions.ease_in_cubic,
        run_time=duration
    )
    scene.clear()


def zoom_transition(scene, duration=0.5):
    """Zoom out transition"""
    all_objects = VGroup(*scene.mobjects)
    scene.play(
        all_objects.animate.scale(0.01).set_opacity(0),
        run_time=duration
    )
    scene.clear()


# =============================================================================
# SPECIAL EFFECTS
# =============================================================================

def confetti(scene, num_pieces=30, duration=2):
    """Confetti celebration effect"""
    colors = [RED, BLUE, GREEN, YELLOW, PURPLE, ORANGE]
    pieces = VGroup()

    for _ in range(num_pieces):
        piece = Square(side_length=0.1, fill_opacity=1, stroke_width=0)
        piece.set_fill(np.random.choice(colors))
        piece.move_to(UP * 4 + np.random.uniform(-6, 6) * RIGHT)
        pieces.add(piece)

    scene.add(pieces)

    animations = []
    for piece in pieces:
        end_pos = DOWN * 5 + np.random.uniform(-7, 7) * RIGHT
        animations.append(
            piece.animate.move_to(end_pos).rotate(np.random.uniform(0, 4*PI))
        )

    scene.play(*animations, run_time=duration, rate_func=rate_functions.linear)
    scene.remove(pieces)


def spotlight(scene, mobject, others, duration=0.5):
    """Spotlight on one element, dim others"""
    scene.play(
        mobject.animate.set_opacity(1),
        *[o.animate.set_opacity(0.2) for o in others],
        run_time=duration
    )


def restore_from_spotlight(scene, mobject, others, duration=0.5):
    """Restore from spotlight effect"""
    scene.play(
        *[o.animate.set_opacity(1) for o in [mobject] + list(others)],
        run_time=duration
    )


# =============================================================================
# COUNTER ANIMATIONS
# =============================================================================

def count_up(scene, start, end, duration=2, font_size=72, color=WHITE):
    """Animated counting number"""
    counter = ValueTracker(start)

    number = always_redraw(lambda: Text(
        f"{int(counter.get_value()):,}",
        font_size=font_size,
        color=color
    ))

    scene.add(number)
    scene.play(
        counter.animate.set_value(end),
        run_time=duration,
        rate_func=rate_functions.ease_out_cubic
    )

    return number
