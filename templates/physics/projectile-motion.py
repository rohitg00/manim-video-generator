
from manim import *
import numpy as np

class ProjectileMotion(Scene):
    def construct(self):
        title = Text("Projectile Motion", font_size=48)
        self.play(Write(title))
        self.wait(0.5)
        self.play(title.animate.to_edge(UP).scale(0.6))

        axes = Axes(
            x_range=[0, 10, 1],
            y_range=[0, 5, 1],
            axis_config={"include_tip": True},
            x_length=10,
            y_length=5
        ).shift(DOWN * 0.5 + LEFT * 0.5)

        x_label = Text("x (m)", font_size=20).next_to(axes.x_axis, RIGHT)
        y_label = Text("y (m)", font_size=20).next_to(axes.y_axis, UP)

        self.play(Create(axes), Write(x_label), Write(y_label))

        v0 = 8
        angle = PI / 4
        g = 9.8

        v0x = v0 * np.cos(angle)
        v0y = v0 * np.sin(angle)

        t_flight = 2 * v0y / g

        def trajectory(t):
            x = v0x * t
            y = v0y * t - 0.5 * g * t * t
            return axes.c2p(x, max(0, y))

        trajectory_path = ParametricFunction(
            lambda t: trajectory(t),
            t_range=[0, t_flight],
            color=YELLOW
        )

        self.play(Create(trajectory_path), run_time=2)

        t_tracker = ValueTracker(0)

        ball = always_redraw(lambda: Dot(
            trajectory(t_tracker.get_value()),
            color=RED,
            radius=0.15
        ))

        velocity_scale = 0.3

        vx_arrow = always_redraw(lambda: Arrow(
            trajectory(t_tracker.get_value()),
            trajectory(t_tracker.get_value()) + RIGHT * v0x * velocity_scale,
            buff=0,
            color=BLUE,
            stroke_width=3
        ))

        vy_arrow = always_redraw(lambda: Arrow(
            trajectory(t_tracker.get_value()),
            trajectory(t_tracker.get_value()) + UP * (v0y - g * t_tracker.get_value()) * velocity_scale,
            buff=0,
            color=GREEN,
            stroke_width=3
        ))

        v_arrow = always_redraw(lambda: Arrow(
            trajectory(t_tracker.get_value()),
            trajectory(t_tracker.get_value()) + np.array([
                v0x * velocity_scale,
                (v0y - g * t_tracker.get_value()) * velocity_scale,
                0
            ]),
            buff=0,
            color=RED,
            stroke_width=4
        ))

        vx_label = Text("vx", font_size=16, color=BLUE).to_corner(UL).shift(DOWN * 1)
        vy_label = Text("vy", font_size=16, color=GREEN).next_to(vx_label, DOWN)
        v_label = Text("v", font_size=16, color=RED).next_to(vy_label, DOWN)

        self.play(FadeIn(ball))
        self.play(
            Create(vx_arrow), Create(vy_arrow), Create(v_arrow),
            Write(vx_label), Write(vy_label), Write(v_label)
        )

        self.play(
            t_tracker.animate.set_value(t_flight),
            run_time=3,
            rate_func=linear
        )

        formulas = VGroup(
            MathTex(r"x = v_0 \cos(\theta) \cdot t", font_size=24),
            MathTex(r"y = v_0 \sin(\theta) \cdot t - \frac{1}{2}gt^2", font_size=24),
            MathTex(r"R = \frac{v_0^2 \sin(2\theta)}{g}", font_size=24)
        ).arrange(DOWN, aligned_edge=LEFT).to_corner(DR)

        self.play(Write(formulas))
        self.wait(2)
