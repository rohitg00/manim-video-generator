
from manim import *
import numpy as np

class BrownianMotion(Scene):
    def construct(self):
        title = Text("Brownian Motion", font_size=48)
        subtitle = Text("Random Particle Movement", font_size=24, color=GRAY)
        header = VGroup(title, subtitle).arrange(DOWN)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(0.5)
        self.play(FadeOut(header))

        box = Rectangle(width=10, height=6, color=WHITE)
        self.play(Create(box))

        num_particles = 20
        particles = VGroup()
        for _ in range(num_particles):
            particle = Dot(
                point=np.array([
                    np.random.uniform(-4.5, 4.5),
                    np.random.uniform(-2.5, 2.5),
                    0
                ]),
                color=random_color(),
                radius=0.1
            )
            particles.add(particle)

        self.play(LaggedStart(*[FadeIn(p) for p in particles], lag_ratio=0.05))

        num_steps = 100
        step_size = 0.15
        dt = 0.05

        for _ in range(num_steps):
            animations = []
            for particle in particles:
                dx = np.random.normal(0, step_size)
                dy = np.random.normal(0, step_size)

                new_x = np.clip(particle.get_x() + dx, -4.5, 4.5)
                new_y = np.clip(particle.get_y() + dy, -2.5, 2.5)

                animations.append(
                    particle.animate.move_to([new_x, new_y, 0])
                )

            self.play(*animations, run_time=dt, rate_func=linear)

        explanation = Text(
            "Each particle moves randomly due to molecular collisions",
            font_size=20
        ).to_edge(DOWN)
        self.play(Write(explanation))
        self.wait(2)
