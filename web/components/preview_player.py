import gradio as gr
from typing import Optional, Tuple, Callable
import os


def create_preview_player(
    on_video_loaded: Optional[Callable] = None
) -> Tuple[gr.Video, gr.Markdown]:
    with gr.Group():
        gr.Markdown("### Generated Animation")

        video_player = gr.Video(
            label="Animation Preview",
            interactive=False,
            show_label=False,
            autoplay=True,
            elem_id="video-player",
            height=400
        )

        with gr.Row():
            download_btn = gr.Button(
                "Download Video",
                variant="secondary",
                size="sm",
                interactive=False,
                elem_id="download-btn"
            )

            share_btn = gr.Button(
                "Copy Link",
                variant="secondary",
                size="sm",
                interactive=False,
                elem_id="share-btn"
            )

        video_info = gr.Markdown(
            value="No video generated yet. Enter a prompt and click Generate.",
            elem_id="video-info"
        )

    video_player.change(
        fn=lambda v: (
            gr.update(interactive=v is not None),
            gr.update(interactive=v is not None),
            format_video_info(v) if v else "No video generated yet."
        ),
        inputs=[video_player],
        outputs=[download_btn, share_btn, video_info]
    )

    return video_player, video_info


def create_video_controls() -> Tuple[gr.Slider, gr.Button, gr.Button]:
    with gr.Row():
        playback_speed = gr.Slider(
            minimum=0.25,
            maximum=2.0,
            value=1.0,
            step=0.25,
            label="Playback Speed",
            elem_id="playback-speed"
        )

        loop_btn = gr.Button(
            "Loop",
            variant="secondary",
            size="sm"
        )

        fullscreen_btn = gr.Button(
            "Fullscreen",
            variant="secondary",
            size="sm"
        )

    return playback_speed, loop_btn, fullscreen_btn


def format_video_info(video_path: Optional[str]) -> str:
    if not video_path:
        return "No video generated yet."

    try:
        if os.path.exists(video_path):
            file_size = os.path.getsize(video_path)
            size_str = format_file_size(file_size)

            return f"""
**Video Generated Successfully**
- **Size:** {size_str}
- **Format:** MP4
- **Path:** `{os.path.basename(video_path)}`

*Right-click on the video to save or use the Download button.*
"""
        else:
            return f"""
**Video Generated Successfully**
- **URL:** {video_path}

*Click Download to save the video locally.*
"""
    except Exception as e:
        return f"Video ready for playback."


def format_file_size(size_bytes: int) -> str:
    for unit in ['B', 'KB', 'MB', 'GB']:
        if size_bytes < 1024:
            return f"{size_bytes:.1f} {unit}"
        size_bytes /= 1024
    return f"{size_bytes:.1f} TB"


def create_comparison_view() -> gr.Row:
    with gr.Row():
        with gr.Column():
            gr.Markdown("### Version A")
            video_a = gr.Video(
                label="Original",
                interactive=False
            )

        with gr.Column():
            gr.Markdown("### Version B")
            video_b = gr.Video(
                label="Refined",
                interactive=False
            )

    return gr.Row()


def create_thumbnail_gallery(
    max_thumbnails: int = 6
) -> gr.Gallery:
    gallery = gr.Gallery(
        label="Recent Generations",
        show_label=True,
        elem_id="thumbnail-gallery",
        columns=3,
        rows=2,
        height="auto",
        object_fit="cover"
    )

    return gallery


def generate_video_thumbnail(video_path: str) -> Optional[str]:
    try:
        import subprocess
        import tempfile

        thumbnail_path = tempfile.mktemp(suffix=".png")

        subprocess.run([
            "ffmpeg", "-i", video_path,
            "-ss", "00:00:01",
            "-vframes", "1",
            "-q:v", "2",
            thumbnail_path
        ], capture_output=True, check=True)

        return thumbnail_path if os.path.exists(thumbnail_path) else None

    except Exception:
        return None


VIDEO_PLAYER_JS = """
function enhanceVideoPlayer() {
    const video = document.querySelector('#video-player video');
    if (!video) return;

    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        switch(e.key) {
            case ' ':
                e.preventDefault();
                video.paused ? video.play() : video.pause();
                break;
            case 'ArrowLeft':
                video.currentTime -= 5;
                break;
            case 'ArrowRight':
                video.currentTime += 5;
                break;
            case 'f':
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                } else {
                    video.requestFullscreen();
                }
                break;
        }
    });

    const speedSlider = document.querySelector('#playback-speed input');
    if (speedSlider) {
        speedSlider.addEventListener('input', () => {
            video.playbackRate = parseFloat(speedSlider.value);
        });
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', enhanceVideoPlayer);
} else {
    enhanceVideoPlayer();
}
"""
