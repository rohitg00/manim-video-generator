
from manim import *
import numpy as np

class DopplerEffect(Scene):
    def construct(self):
        title = Text("Doppler Effect", font_size=48)
        self.play(Write(title))
        self.wait(0.5)
        self.play(title.animate.to_edge(UP).scale(0.6))

        road = Line(LEFT * 6, RIGHT * 6, color=GRAY)
        self.play(Create(road))

        observer = VGroup(
            Circle(radius=0.2, color=GREEN, fill_opacity=1),
            Text("O", font_size=16, color=WHITE)
        )
        observer.move_to(RIGHT * 4)
        observer_label = Text("Observer", font_size=18).next_to(observer, DOWN)

        self.play(FadeIn(observer), Write(observer_label))

        source = VGroup(
            Rectangle(width=0.8, height=0.4, color=RED, fill_opacity=1),
            Triangle(color=RED, fill_opacity=1).scale(0.2).rotate(-PI/2).shift(RIGHT * 0.5)
        )
        source.move_to(LEFT * 5)
        source_label = Text("Source", font_size=18).next_to(source, UP)

        self.play(FadeIn(source), Write(source_label))

        t = ValueTracker(0)

        waves = VGroup()
        wave_times = []

        num_waves = 8
        for i in range(num_waves):
            wave_time = i * 0.5
            wave_times.append(wave_time)
            circle = Circle(radius=0.1, color=BLUE, stroke_width=2)
            circle.move_to(LEFT * 5)
            waves.add(circle)

        self.add(waves)

        def update_scene(mob):
            current_t = t.get_value()

            source_x = -5 + current_t * 1.5
            if source_x < 4:
                source.move_to(RIGHT * source_x)
                source_label.next_to(source, UP)

            wave_speed = 3
            for i, (wave, emit_time) in enumerate(zip(waves, wave_times)):
                if current_t > emit_time:
                    age = current_t - emit_time
                    radius = wave_speed * age
                    emit_x = -5 + emit_time * 1.5

                    wave.become(Circle(
                        radius=min(radius, 8),
                        color=BLUE,
                        stroke_width=max(0, 2 - radius * 0.2),
                        stroke_opacity=max(0, 1 - radius * 0.1)
                    ).move_to(RIGHT * emit_x))

        waves.add_updater(update_scene)

        self.play(t.animate.set_value(5), run_time=5, rate_func=linear)

        waves.clear_updaters()

        explanation_box = VGroup(
            Text("Approaching: waves compressed", font_size=20, color=BLUE),
            MathTex(r"f_{observed} = f_{source} \frac{v}{v - v_s}", font_size=24),
            Text("Higher frequency (pitch)", font_size=18, color=BLUE)
        ).arrange(DOWN).to_corner(DL)

        explanation_box2 = VGroup(
            Text("Receding: waves stretched", font_size=20, color=RED),
            MathTex(r"f_{observed} = f_{source} \frac{v}{v + v_s}", font_size=24),
            Text("Lower frequency (pitch)", font_size=18, color=RED)
        ).arrange(DOWN).to_corner(DR)

        self.play(Write(explanation_box), Write(explanation_box2))
        self.wait(2)
