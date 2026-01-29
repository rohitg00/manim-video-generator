"""
Core Animation Library
Reusable animation functions for all skills
"""

from manim import *
import numpy as np


# =============================================================================
# ENTRANCE ANIMATIONS
# =============================================================================

def pop_in(scene, mobject, scale_factor=0.5, duration=0.4):
    """
    Element pops in with overshoot effect.
    
    Args:
        scene: The Scene instance
        mobject: The mobject to animate
        scale_factor: Initial scale (0 = fully collapsed)
        duration: Animation duration in seconds
    """
    original_scale = mobject.get_height() if mobject.get_height() > 0 else 1
    mobject.scale(0)
    scene.play(
        mobject.animate.scale(1 / scale_factor if scale_factor != 0 else 1),
        rate_func=rate_functions.ease_out_back,
        run_time=duration
    )


def slide_in_left(scene, mobject, duration=0.5):
    """
    Slide in from left side of screen.
    
    Args:
        scene: The Scene instance
        mobject: The mobject to animate
        duration: Animation duration in seconds
    """
    original_pos = mobject.get_center()
    mobject.shift(LEFT * 15)
    scene.play(
        mobject.animate.move_to(original_pos),
        rate_func=rate_functions.ease_out_cubic,
        run_time=duration
    )


def slide_in_right(scene, mobject, duration=0.5):
    """
    Slide in from right side of screen.
    
    Args:
        scene: The Scene instance
        mobject: The mobject to animate
        duration: Animation duration in seconds
    """
    original_pos = mobject.get_center()
    mobject.shift(RIGHT * 15)
    scene.play(
        mobject.animate.move_to(original_pos),
        rate_func=rate_functions.ease_out_cubic,
        run_time=duration
    )


def slide_in_up(scene, mobject, duration=0.5):
    """
    Slide in from bottom of screen.
    
    Args:
        scene: The Scene instance
        mobject: The mobject to animate
        duration: Animation duration in seconds
    """
    original_pos = mobject.get_center()
    mobject.shift(DOWN * 10)
    scene.play(
        mobject.animate.move_to(original_pos),
        rate_func=rate_functions.ease_out_cubic,
        run_time=duration
    )


def slide_in_down(scene, mobject, duration=0.5):
    """
    Slide in from top of screen.
    
    Args:
        scene: The Scene instance
        mobject: The mobject to animate
        duration: Animation duration in seconds
    """
    original_pos = mobject.get_center()
    mobject.shift(UP * 10)
    scene.play(
        mobject.animate.move_to(original_pos),
        rate_func=rate_functions.ease_out_cubic,
        run_time=duration
    )


def fade_in_up(scene, mobject, distance=0.5, duration=0.6):
    """
    Fade in while moving up.
    
    Args:
        scene: The Scene instance
        mobject: The mobject to animate
        distance: Distance to travel
        duration: Animation duration in seconds
    """
    mobject.shift(DOWN * distance).set_opacity(0)
    scene.play(
        mobject.animate.shift(UP * distance).set_opacity(1),
        rate_func=rate_functions.ease_out_cubic,
        run_time=duration
    )


def fade_in_down(scene, mobject, distance=0.5, duration=0.6):
    """
    Fade in while moving down.
    
    Args:
        scene: The Scene instance
        mobject: The mobject to animate
        distance: Distance to travel
        duration: Animation duration in seconds
    """
    mobject.shift(UP * distance).set_opacity(0)
    scene.play(
        mobject.animate.shift(DOWN * distance).set_opacity(1),
        rate_func=rate_functions.ease_out_cubic,
        run_time=duration
    )


def zoom_in(scene, mobject, duration=0.5):
    """
    Zoom in from small to normal size.
    
    Args:
        scene: The Scene instance
        mobject: The mobject to animate
        duration: Animation duration in seconds
    """
    mobject.scale(0.1).set_opacity(0)
    scene.play(
        mobject.animate.scale(10).set_opacity(1),
        rate_func=rate_functions.ease_out_expo,
        run_time=duration
    )


def grow_from_point(scene, mobject, point=ORIGIN, duration=0.5):
    """
    Grow from a specific point.
    
    Args:
        scene: The Scene instance
        mobject: The mobject to animate
        point: The point to grow from
        duration: Animation duration in seconds
    """
    original_pos = mobject.get_center()
    mobject.move_to(point).scale(0)
    scene.play(
        mobject.animate.move_to(original_pos).scale(1),
        rate_func=rate_functions.ease_out_back,
        run_time=duration
    )


# =============================================================================
# EXIT ANIMATIONS
# =============================================================================

def pop_out(scene, mobject, duration=0.3):
    """
    Element shrinks and disappears.
    
    Args:
        scene: The Scene instance
        mobject: The mobject to animate
        duration: Animation duration in seconds
    """
    scene.play(
        mobject.animate.scale(0),
        rate_func=rate_functions.ease_in_back,
        run_time=duration
    )
    scene.remove(mobject)


def fade_out_up(scene, mobject, distance=0.5, duration=0.4):
    """
    Fade out while moving up.
    
    Args:
        scene: The Scene instance
        mobject: The mobject to animate
        distance: Distance to travel
        duration: Animation duration in seconds
    """
    scene.play(
        mobject.animate.shift(UP * distance).set_opacity(0),
        rate_func=rate_functions.ease_in_cubic,
        run_time=duration
    )
    scene.remove(mobject)


def fade_out_down(scene, mobject, distance=0.5, duration=0.4):
    """
    Fade out while moving down.
    
    Args:
        scene: The Scene instance
        mobject: The mobject to animate
        distance: Distance to travel
        duration: Animation duration in seconds
    """
    scene.play(
        mobject.animate.shift(DOWN * distance).set_opacity(0),
        rate_func=rate_functions.ease_in_cubic,
        run_time=duration
    )
    scene.remove(mobject)


def slide_out_left(scene, mobject, duration=0.4):
    """
    Slide out to left side.
    
    Args:
        scene: The Scene instance
        mobject: The mobject to animate
        duration: Animation duration in seconds
    """
    scene.play(
        mobject.animate.shift(LEFT * 15),
        rate_func=rate_functions.ease_in_cubic,
        run_time=duration
    )
    scene.remove(mobject)


def slide_out_right(scene, mobject, duration=0.4):
    """
    Slide out to right side.
    
    Args:
        scene: The Scene instance
        mobject: The mobject to animate
        duration: Animation duration in seconds
    """
    scene.play(
        mobject.animate.shift(RIGHT * 15),
        rate_func=rate_functions.ease_in_cubic,
        run_time=duration
    )
    scene.remove(mobject)


def dissolve(scene, mobject, duration=0.5):
    """
    Gentle dissolve/fade effect.
    
    Args:
        scene: The Scene instance
        mobject: The mobject to animate
        duration: Animation duration in seconds
    """
    scene.play(
        mobject.animate.set_opacity(0),
        rate_func=rate_functions.smooth,
        run_time=duration
    )
    scene.remove(mobject)


def shrink_to_point(scene, mobject, point=ORIGIN, duration=0.5):
    """
    Shrink into a specific point.
    
    Args:
        scene: The Scene instance
        mobject: The mobject to animate
        point: The point to shrink into
        duration: Animation duration in seconds
    """
    scene.play(
        mobject.animate.move_to(point).scale(0),
        rate_func=rate_functions.ease_in_back,
        run_time=duration
    )
    scene.remove(mobject)


# =============================================================================
# EMPHASIS ANIMATIONS
# =============================================================================

def pulse(scene, mobject, scale=1.2, duration=0.4):
    """
    Scale up then back down (pulse effect).
    
    Args:
        scene: The Scene instance
        mobject: The mobject to animate
        scale: Maximum scale factor
        duration: Animation duration in seconds
    """
    scene.play(
        mobject.animate.scale(scale),
        rate_func=rate_functions.there_and_back,
        run_time=duration
    )


def shake(scene, mobject, amplitude=0.1, duration=0.4):
    """
    Quick horizontal shake effect.
    
    Args:
        scene: The Scene instance
        mobject: The mobject to animate
        amplitude: Shake distance
        duration: Animation duration in seconds
    """
    original_pos = mobject.get_center()
    for _ in range(3):
        scene.play(
            mobject.animate.shift(LEFT * amplitude),
            run_time=duration / 6
        )
        scene.play(
            mobject.animate.shift(RIGHT * amplitude * 2),
            run_time=duration / 6
        )
    scene.play(
        mobject.animate.move_to(original_pos),
        run_time=duration / 6
    )


def wiggle(scene, mobject, angle=0.1, duration=0.5):
    """
    Rotational wiggle effect.
    
    Args:
        scene: The Scene instance
        mobject: The mobject to animate
        angle: Maximum rotation angle in radians
        duration: Animation duration in seconds
    """
    scene.play(Wiggle(mobject, scale_value=1.1, rotation_angle=angle), run_time=duration)


def glow(scene, mobject, color=YELLOW, duration=0.5):
    """
    Add expanding glow effect.
    
    Args:
        scene: The Scene instance
        mobject: The mobject to animate
        color: Glow color
        duration: Animation duration in seconds
    """
    glow_copy = mobject.copy()
    glow_copy.set_color(color).set_opacity(0.5)
    scene.add(glow_copy)
    scene.play(
        glow_copy.animate.scale(1.3).set_opacity(0),
        run_time=duration
    )
    scene.remove(glow_copy)


def color_flash(scene, mobject, color=YELLOW, duration=0.3):
    """
    Quick color change and back.
    
    Args:
        scene: The Scene instance
        mobject: The mobject to animate
        color: Flash color
        duration: Animation duration in seconds
    """
    original_color = mobject.get_color()
    scene.play(
        mobject.animate.set_color(color),
        run_time=duration / 2
    )
    scene.play(
        mobject.animate.set_color(original_color),
        run_time=duration / 2
    )


def highlight_box(scene, mobject, color=YELLOW, duration=0.5):
    """
    Draw a highlighting box around the mobject.
    
    Args:
        scene: The Scene instance
        mobject: The mobject to highlight
        color: Box color
        duration: Animation duration in seconds
    
    Returns:
        The surrounding rectangle mobject
    """
    box = SurroundingRectangle(mobject, color=color, buff=0.15)
    scene.play(Create(box), run_time=duration)
    return box


def spotlight(scene, mobject, others, duration=0.5):
    """
    Spotlight effect - highlight one, dim others.
    
    Args:
        scene: The Scene instance
        mobject: The mobject to spotlight
        others: List of other mobjects to dim
        duration: Animation duration in seconds
    """
    scene.play(
        mobject.animate.set_opacity(1),
        *[o.animate.set_opacity(0.2) for o in others],
        run_time=duration
    )


def restore_from_spotlight(scene, mobjects, duration=0.5):
    """
    Restore all mobjects to full opacity after spotlight.
    
    Args:
        scene: The Scene instance
        mobjects: List of all mobjects to restore
        duration: Animation duration in seconds
    """
    scene.play(
        *[m.animate.set_opacity(1) for m in mobjects],
        run_time=duration
    )


# =============================================================================
# TEXT ANIMATIONS
# =============================================================================

def typewriter(scene, text_mobject, char_time=0.05):
    """
    Typewriter text reveal effect.
    
    Args:
        scene: The Scene instance
        text_mobject: The Text mobject to animate
        char_time: Time per character
    """
    duration = len(text_mobject.text) * char_time
    scene.play(AddTextLetterByLetter(text_mobject), run_time=duration)


def word_by_word(scene, text, font_size=48, color=WHITE, wait_time=0.2):
    """
    Display text word by word.
    
    Args:
        scene: The Scene instance
        text: String of text to display
        font_size: Font size
        color: Text color
        wait_time: Wait time between words
    
    Returns:
        The VGroup of word mobjects
    """
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
        scene.wait(wait_time)
    
    return group


def text_replace(scene, old_text, new_text, duration=0.5):
    """
    Replace one text with another smoothly.
    
    Args:
        scene: The Scene instance
        old_text: The Text mobject to replace
        new_text: The new Text mobject
        duration: Animation duration in seconds
    
    Returns:
        The new text mobject
    """
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
    """
    Wipe transition to the left.
    
    Args:
        scene: The Scene instance
        duration: Animation duration in seconds
    """
    wipe = Rectangle(
        width=20, height=12,
        fill_opacity=1,
        fill_color=BLACK,
        stroke_width=0
    )
    wipe.to_edge(RIGHT, buff=0).shift(RIGHT * 20)
    scene.play(
        wipe.animate.shift(LEFT * 40),
        run_time=duration
    )
    scene.clear()
    scene.remove(wipe)


def wipe_right(scene, duration=0.8):
    """
    Wipe transition to the right.
    
    Args:
        scene: The Scene instance
        duration: Animation duration in seconds
    """
    wipe = Rectangle(
        width=20, height=12,
        fill_opacity=1,
        fill_color=BLACK,
        stroke_width=0
    )
    wipe.to_edge(LEFT, buff=0).shift(LEFT * 20)
    scene.play(
        wipe.animate.shift(RIGHT * 40),
        run_time=duration
    )
    scene.clear()
    scene.remove(wipe)


def circle_wipe(scene, duration=1.0):
    """
    Circle expanding wipe transition.
    
    Args:
        scene: The Scene instance
        duration: Animation duration in seconds
    """
    circle = Circle(radius=0.1, fill_opacity=1, fill_color=BLACK, stroke_width=0)
    scene.play(
        circle.animate.scale(100),
        rate_func=rate_functions.ease_in_cubic,
        run_time=duration
    )
    scene.clear()


def zoom_transition(scene, duration=0.5):
    """
    Zoom out transition (everything shrinks away).
    
    Args:
        scene: The Scene instance
        duration: Animation duration in seconds
    """
    all_objects = VGroup(*scene.mobjects)
    scene.play(
        all_objects.animate.scale(0.01).set_opacity(0),
        run_time=duration
    )
    scene.clear()


def crossfade(scene, old_mobjects, new_mobjects, duration=0.5):
    """
    Crossfade between two sets of mobjects.
    
    Args:
        scene: The Scene instance
        old_mobjects: List of mobjects to fade out
        new_mobjects: List of mobjects to fade in
        duration: Animation duration in seconds
    """
    for m in new_mobjects:
        m.set_opacity(0)
        scene.add(m)
    
    scene.play(
        *[m.animate.set_opacity(0) for m in old_mobjects],
        *[m.animate.set_opacity(1) for m in new_mobjects],
        run_time=duration
    )
    
    for m in old_mobjects:
        scene.remove(m)


# =============================================================================
# SPECIAL EFFECTS
# =============================================================================

def confetti(scene, num_pieces=30, duration=2):
    """
    Confetti celebration effect.
    
    Args:
        scene: The Scene instance
        num_pieces: Number of confetti pieces
        duration: Animation duration in seconds
    """
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
            piece.animate.move_to(end_pos).rotate(np.random.uniform(0, 4 * PI))
        )
    
    scene.play(*animations, run_time=duration, rate_func=rate_functions.linear)
    scene.remove(pieces)


def particle_burst(scene, center=ORIGIN, num_particles=20, duration=1.0):
    """
    Particles bursting outward from a center point.
    
    Args:
        scene: The Scene instance
        center: Center point of the burst
        num_particles: Number of particles
        duration: Animation duration in seconds
    """
    particles = VGroup()
    
    for _ in range(num_particles):
        particle = Dot(radius=0.05, color=YELLOW)
        particle.move_to(center)
        particles.add(particle)
    
    scene.add(particles)
    
    animations = []
    for particle in particles:
        angle = np.random.uniform(0, 2 * PI)
        distance = np.random.uniform(2, 4)
        end_pos = center + distance * np.array([np.cos(angle), np.sin(angle), 0])
        animations.append(
            particle.animate.move_to(end_pos).set_opacity(0)
        )
    
    scene.play(*animations, run_time=duration, rate_func=rate_functions.ease_out_cubic)
    scene.remove(particles)


# =============================================================================
# COUNTER ANIMATIONS
# =============================================================================

def count_up(scene, start, end, duration=2, font_size=72, color=WHITE, position=ORIGIN):
    """
    Animated counting number.
    
    Args:
        scene: The Scene instance
        start: Starting number
        end: Ending number
        duration: Animation duration in seconds
        font_size: Font size of the number
        color: Color of the number
        position: Position of the counter
    
    Returns:
        The final number mobject
    """
    counter = ValueTracker(start)
    
    number = always_redraw(lambda: Text(
        f"{int(counter.get_value()):,}",
        font_size=font_size,
        color=color
    ).move_to(position))
    
    scene.add(number)
    scene.play(
        counter.animate.set_value(end),
        run_time=duration,
        rate_func=rate_functions.ease_out_cubic
    )
    
    return number


def count_down(scene, start, end=0, duration=2, font_size=72, color=WHITE, position=ORIGIN):
    """
    Animated countdown.
    
    Args:
        scene: The Scene instance
        start: Starting number
        end: Ending number (default 0)
        duration: Animation duration in seconds
        font_size: Font size of the number
        color: Color of the number
        position: Position of the counter
    
    Returns:
        The final number mobject
    """
    return count_up(scene, start, end, duration, font_size, color, position)
