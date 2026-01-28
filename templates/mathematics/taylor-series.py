
from manim import *
import numpy as np
from math import factorial

class TaylorSeries(Scene):
    def construct(self):
        title = Text("Taylor Series", font_size=48)
        subtitle = Text("Polynomial Approximation of Functions", font_size=24, color=GRAY)
        header = VGroup(title, subtitle).arrange(DOWN)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(0.5)
        self.play(FadeOut(header))

        formula = MathTex(
            r"f(x) = \sum_{n=0}^{\infty} \frac{f^{(n)}(a)}{n!}(x-a)^n",
            font_size=28
        ).to_corner(UL)

        self.play(Write(formula))

        axes = Axes(
            x_range=[-4, 4, 1],
            y_range=[-2, 4, 1],
            axis_config={"include_tip": True},
            x_length=10,
            y_length=5
        ).shift(DOWN * 0.5)

        self.play(Create(axes))


        exp_curve = axes.plot(
            np.exp,
            x_range=[-4, 2],
            color=YELLOW
        )
        exp_label = MathTex(r"e^x", font_size=24, color=YELLOW)
        exp_label.next_to(exp_curve.get_end(), UP)

        self.play(Create(exp_curve), Write(exp_label))

        def taylor_exp(x, n):
            result = 0
            for k in range(n + 1):
                result += (x ** k) / factorial(k)
            return result

        orders = [0, 1, 2, 3, 4, 6, 10]
        colors = [RED, ORANGE, GREEN, BLUE, PURPLE, PINK, TEAL]

        taylor_curve = None
        order_label = None
        taylor_formula = None

        formulas = [
            r"P_0(x) = 1",
            r"P_1(x) = 1 + x",
            r"P_2(x) = 1 + x + \frac{x^2}{2}",
            r"P_3(x) = 1 + x + \frac{x^2}{2} + \frac{x^3}{6}",
            r"P_4(x) = 1 + x + ... + \frac{x^4}{24}",
            r"P_6(x) = 1 + x + ... + \frac{x^6}{720}",
            r"P_{10}(x) = 1 + x + ... + \frac{x^{10}}{3628800}",
        ]

        for i, n in enumerate(orders):
            new_curve = axes.plot(
                lambda x, order=n: taylor_exp(x, order),
                x_range=[-4, 2.5],
                color=colors[i % len(colors)]
            )

            new_label = Text(f"Order: {n}", font_size=20, color=colors[i % len(colors)])
            new_label.to_corner(DR)

            new_formula = MathTex(formulas[i], font_size=20, color=colors[i % len(colors)])
            new_formula.next_to(formula, DOWN, aligned_edge=LEFT)

            if taylor_curve is None:
                taylor_curve = new_curve
                order_label = new_label
                taylor_formula = new_formula
                self.play(
                    Create(taylor_curve),
                    Write(order_label),
                    Write(taylor_formula)
                )
            else:
                self.play(
                    Transform(taylor_curve, new_curve),
                    Transform(order_label, new_label),
                    Transform(taylor_formula, new_formula),
                    run_time=0.8
                )

            self.wait(0.5)

        convergence = Text(
            "Higher order = better approximation near x = 0",
            font_size=18,
            color=GRAY
        ).to_edge(DOWN)

        self.play(Write(convergence))

        common = VGroup(
            Text("Common Taylor Series (a=0):", font_size=16),
            MathTex(r"e^x = 1 + x + \frac{x^2}{2!} + \frac{x^3}{3!} + ...", font_size=14),
            MathTex(r"\sin x = x - \frac{x^3}{3!} + \frac{x^5}{5!} - ...", font_size=14),
            MathTex(r"\cos x = 1 - \frac{x^2}{2!} + \frac{x^4}{4!} - ...", font_size=14),
        ).arrange(DOWN, aligned_edge=LEFT)
        common.to_corner(DL)

        self.play(Write(common))
        self.wait(2)
