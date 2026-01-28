
from manim import *

class BinarySearch(Scene):
    def construct(self):
        title = Text("Binary Search Algorithm", font_size=48)
        subtitle = Text("O(log n) time complexity", font_size=24, color=GRAY)
        header = VGroup(title, subtitle).arrange(DOWN)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(0.5)
        self.play(FadeOut(header))

        values = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19]
        target = 13

        boxes = self.create_array(values)
        boxes.move_to(ORIGIN + UP * 0.5)

        self.play(LaggedStart(*[FadeIn(box) for box in boxes], lag_ratio=0.1))

        target_text = Text(f"Target: {target}", font_size=28, color=YELLOW)
        target_text.to_edge(UP)
        self.play(Write(target_text))

        self.binary_search_animate(boxes, values, target)

        self.wait(2)

    def create_array(self, values):
        boxes = VGroup()
        for i, val in enumerate(values):
            box = VGroup(
                Square(side_length=0.8, color=WHITE),
                Text(str(val), font_size=20)
            )
            index_label = Text(str(i), font_size=14, color=GRAY)
            index_label.next_to(box, DOWN, buff=0.1)
            box.add(index_label)
            boxes.add(box)

        boxes.arrange(RIGHT, buff=0.1)
        return boxes

    def binary_search_animate(self, boxes, values, target):
        left, right = 0, len(values) - 1
        step = 0

        left_pointer = self.create_pointer("L", BLUE).next_to(boxes[left], UP)
        right_pointer = self.create_pointer("R", RED).next_to(boxes[right], UP)
        mid_pointer = None

        self.play(FadeIn(left_pointer), FadeIn(right_pointer))

        while left <= right:
            step += 1
            mid = (left + right) // 2

            step_text = Text(f"Step {step}", font_size=20, color=YELLOW)
            step_text.to_corner(UL).shift(DOWN * 0.8)
            self.play(Write(step_text), run_time=0.3)

            calc_text = MathTex(
                f"mid = \\lfloor({left} + {right}) / 2\\rfloor = {mid}",
                font_size=24
            ).to_corner(UR).shift(DOWN * 0.8)
            self.play(Write(calc_text), run_time=0.3)

            new_mid_pointer = self.create_pointer("M", GREEN).next_to(boxes[mid], UP)
            if mid_pointer:
                self.play(Transform(mid_pointer, new_mid_pointer), run_time=0.3)
            else:
                mid_pointer = new_mid_pointer
                self.play(FadeIn(mid_pointer), run_time=0.3)

            for i in range(len(boxes)):
                if left <= i <= right:
                    boxes[i][0].set_color(BLUE_C)
                else:
                    boxes[i][0].set_color(GRAY)
            self.wait(0.3)

            self.play(boxes[mid][0].animate.set_color(YELLOW), run_time=0.3)

            compare_text = Text(
                f"Compare: {values[mid]} vs {target}",
                font_size=20
            ).next_to(calc_text, DOWN)
            self.play(Write(compare_text), run_time=0.3)

            if values[mid] == target:
                result_text = Text("Found!", font_size=24, color=GREEN)
                result_text.next_to(compare_text, DOWN)
                self.play(Write(result_text))
                self.play(boxes[mid][0].animate.set_color(GREEN), run_time=0.5)
                self.play(
                    FadeOut(step_text), FadeOut(calc_text),
                    FadeOut(compare_text), FadeOut(left_pointer),
                    FadeOut(right_pointer), FadeOut(mid_pointer)
                )
                return

            elif values[mid] < target:
                result_text = Text(f"{values[mid]} < {target}, search right", font_size=18, color=BLUE)
                result_text.next_to(compare_text, DOWN)
                self.play(Write(result_text), run_time=0.3)

                for i in range(left, mid + 1):
                    boxes[i][0].set_color(GRAY)

                left = mid + 1
                self.play(
                    left_pointer.animate.next_to(boxes[min(left, len(boxes)-1)], UP),
                    run_time=0.3
                )

            else:
                result_text = Text(f"{values[mid]} > {target}, search left", font_size=18, color=RED)
                result_text.next_to(compare_text, DOWN)
                self.play(Write(result_text), run_time=0.3)

                for i in range(mid, right + 1):
                    boxes[i][0].set_color(GRAY)

                right = mid - 1
                self.play(
                    right_pointer.animate.next_to(boxes[max(right, 0)], UP),
                    run_time=0.3
                )

            self.play(
                FadeOut(step_text), FadeOut(calc_text),
                FadeOut(compare_text), FadeOut(result_text),
                run_time=0.2
            )

    def create_pointer(self, label, color):
        pointer = VGroup(
            Triangle(color=color, fill_opacity=1).scale(0.15).rotate(PI),
            Text(label, font_size=16, color=color)
        ).arrange(UP, buff=0.05)
        return pointer
