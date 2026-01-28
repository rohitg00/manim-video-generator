
from manim import *
import numpy as np

class FourierSeries(Scene):
    def construct(self):
        title = Text("Fourier Series", font_size=48)
        subtitle = Text("Approximating Functions with Sine Waves", font_size=24, color=GRAY)
        header = VGroup(title, subtitle).arrange(DOWN)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(0.5)
        self.play(FadeOut(header))

        axes = Axes(
            x_range=[-PI, PI, PI/2],
            y_range=[-1.5, 1.5, 0.5],
            axis_config={"include_tip": True},
            x_length=10,
            y_length=5
        ).shift(DOWN * 0.5)

        x_labels = VGroup(
            MathTex(r"-\pi").move_to(axes.c2p(-PI, 0) + DOWN * 0.3),
            MathTex(r"-\frac{\pi}{2}").move_to(axes.c2p(-PI/2, 0) + DOWN * 0.3).scale(0.7),
            MathTex(r"\frac{\pi}{2}").move_to(axes.c2p(PI/2, 0) + DOWN * 0.3).scale(0.7),
            MathTex(r"\pi").move_to(axes.c2p(PI, 0) + DOWN * 0.3)
        )

        self.play(Create(axes), Write(x_labels))

        def square_wave(x):
            if x < 0:
                return -1
            else:
                return 1

        square_left = axes.plot(
            lambda x: -1,
            x_range=[-PI, 0],
            color=YELLOW,
            use_smoothing=False
        )
        square_right = axes.plot(
            lambda x: 1,
            x_range=[0, PI],
            color=YELLOW,
            use_smoothing=False
        )
        square_jump = Line(
            axes.c2p(0, -1),
            axes.c2p(0, 1),
            color=YELLOW,
            stroke_opacity=0.5
        )

        square_label = Text("Square Wave", font_size=18, color=YELLOW)
        square_label.to_corner(UL)

        self.play(
            Create(square_left), Create(square_right), Create(square_jump),
            Write(square_label)
        )

        formula = MathTex(
            r"f(x) = \frac{4}{\pi}\sum_{n=1,3,5,...}^{\infty} \frac{1}{n}\sin(nx)",
            font_size=24
        ).to_corner(UR)

        self.play(Write(formula))

        def fourier_approx(x, num_terms):
            result = 0
            for n in range(1, 2 * num_terms, 2):
                result += (4 / (np.pi * n)) * np.sin(n * x)
            return result

        term_counts = [1, 2, 3, 5, 10, 20]
        colors = [RED, ORANGE, GREEN, BLUE, PURPLE, PINK]

        approx_curve = None
        term_label = None

        for i, num_terms in enumerate(term_counts):
            new_curve = axes.plot(
                lambda x, n=num_terms: fourier_approx(x, n),
                x_range=[-PI, PI],
                color=colors[i % len(colors)]
            )

            new_label = Text(f"Terms: {num_terms}", font_size=18, color=colors[i % len(colors)])
            new_label.to_corner(DL)

            if approx_curve is None:
                approx_curve = new_curve
                term_label = new_label
                self.play(Create(approx_curve), Write(term_label))
            else:
                self.play(
                    Transform(approx_curve, new_curve),
                    Transform(term_label, new_label),
                    run_time=0.8
                )

            self.wait(0.5)

        gibbs = Text(
            "Gibbs phenomenon: overshoot at discontinuities (~9%)",
            font_size=16,
            color=GRAY
        ).to_edge(DOWN)

        self.play(Write(gibbs))

        apps = VGroup(
            Text("Applications:", font_size=18),
            Text("- Signal processing", font_size=14, color=GRAY),
            Text("- Image compression", font_size=14, color=GRAY),
            Text("- Heat transfer", font_size=14, color=GRAY),
            Text("- Music synthesis", font_size=14, color=GRAY)
        ).arrange(DOWN, aligned_edge=LEFT)
        apps.to_corner(DR)

        self.play(Write(apps))
        self.wait(2)
