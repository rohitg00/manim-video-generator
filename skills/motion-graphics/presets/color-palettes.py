"""
Motion Graphics Color Palettes
Pre-defined color schemes for different visual styles
"""

# =============================================================================
# NEON CYBERPUNK
# Dark backgrounds with vibrant neon accents
# =============================================================================
class NeonCyberpunk:
    BACKGROUND = "#0a0a0a"
    PRIMARY = "#ff00ff"      # Magenta
    SECONDARY = "#00ffff"    # Cyan
    ACCENT = "#00ff00"       # Neon green
    TEXT = "#ffffff"
    TEXT_DIM = "#888888"

    # Gradient pairs
    GRADIENT_1 = ("#ff00ff", "#00ffff")  # Magenta to Cyan
    GRADIENT_2 = ("#ff0066", "#6600ff")  # Pink to Purple


# =============================================================================
# CORPORATE PROFESSIONAL
# Clean, trustworthy business aesthetic
# =============================================================================
class CorporatePro:
    BACKGROUND = "#ffffff"
    PRIMARY = "#0066cc"      # Corporate blue
    SECONDARY = "#333333"    # Dark gray
    ACCENT = "#ff6600"       # Orange highlight
    TEXT = "#1a1a1a"
    TEXT_DIM = "#666666"

    # Gradient pairs
    GRADIENT_1 = ("#0066cc", "#003366")  # Blue depth
    GRADIENT_2 = ("#333333", "#666666")  # Gray gradient


# =============================================================================
# MINIMAL MODERN
# Clean, sophisticated minimalism
# =============================================================================
class MinimalModern:
    BACKGROUND = "#f5f5f5"
    PRIMARY = "#1a1a1a"      # Near black
    SECONDARY = "#888888"    # Medium gray
    ACCENT = "#3366ff"       # Accent blue
    TEXT = "#1a1a1a"
    TEXT_DIM = "#aaaaaa"

    # Gradient pairs
    GRADIENT_1 = ("#f5f5f5", "#e0e0e0")  # Subtle gray
    GRADIENT_2 = ("#1a1a1a", "#333333")  # Dark subtle


# =============================================================================
# 3BLUE1BROWN STYLE
# Educational, warm mathematical aesthetic
# =============================================================================
class ThreeBlue1Brown:
    BACKGROUND = "#1a1a2e"   # Dark blue-gray
    PRIMARY = "#58c4dd"      # Signature blue
    SECONDARY = "#83c167"    # Green
    ACCENT = "#ffff00"       # Yellow highlight
    TEXT = "#ffffff"
    TEXT_DIM = "#888888"

    # Additional math colors
    VARIABLE = "#58c4dd"     # Blue for variables
    CONSTANT = "#ffff00"     # Yellow for constants
    FUNCTION = "#83c167"     # Green for functions
    RESULT = "#ffd700"       # Gold for results


# =============================================================================
# PLAYFUL VIBRANT
# Fun, energetic, youth-oriented
# =============================================================================
class PlayfulVibrant:
    BACKGROUND = "#ffeaa7"   # Warm yellow
    PRIMARY = "#ff6b6b"      # Coral red
    SECONDARY = "#4ecdc4"    # Teal
    ACCENT = "#9b59b6"       # Purple
    TEXT = "#2d3436"
    TEXT_DIM = "#636e72"

    # Fun colors
    PINK = "#fd79a8"
    ORANGE = "#e17055"
    BLUE = "#0984e3"
    GREEN = "#00b894"


# =============================================================================
# DARK ELEGANT
# Sophisticated dark theme with gold accents
# =============================================================================
class DarkElegant:
    BACKGROUND = "#0d0d0d"
    PRIMARY = "#d4af37"      # Gold
    SECONDARY = "#c0c0c0"    # Silver
    ACCENT = "#b87333"       # Copper
    TEXT = "#f5f5f5"
    TEXT_DIM = "#777777"

    # Metallic gradient
    GRADIENT_GOLD = ("#d4af37", "#aa8c2c")
    GRADIENT_SILVER = ("#c0c0c0", "#a0a0a0")


# =============================================================================
# NATURE ORGANIC
# Earthy, natural color palette
# =============================================================================
class NatureOrganic:
    BACKGROUND = "#f4f1de"   # Cream
    PRIMARY = "#3d405b"      # Dark slate
    SECONDARY = "#81b29a"    # Sage green
    ACCENT = "#e07a5f"       # Terra cotta
    TEXT = "#3d405b"
    TEXT_DIM = "#6c757d"

    # Nature tones
    FOREST = "#2d6a4f"
    EARTH = "#8b5e3c"
    SKY = "#89c2d9"
    SUNSET = "#f4a261"


# =============================================================================
# RETRO SYNTHWAVE
# 80s inspired neon retro aesthetic
# =============================================================================
class RetroSynthwave:
    BACKGROUND = "#1a0a2e"   # Deep purple
    PRIMARY = "#ff00ff"      # Hot pink
    SECONDARY = "#00fff7"    # Cyan
    ACCENT = "#ffff00"       # Yellow
    TEXT = "#ffffff"
    TEXT_DIM = "#9966cc"

    # Retro gradient (sunset)
    GRADIENT_SUNSET = ("#ff6b6b", "#feca57", "#ff9ff3")
    # Grid color
    GRID = "#4a0080"


# =============================================================================
# UTILITY FUNCTIONS
# =============================================================================
def get_palette(style_name):
    """Get palette by name"""
    palettes = {
        'neon': NeonCyberpunk,
        'corporate': CorporatePro,
        'minimal': MinimalModern,
        '3blue1brown': ThreeBlue1Brown,
        'playful': PlayfulVibrant,
        'elegant': DarkElegant,
        'nature': NatureOrganic,
        'retro': RetroSynthwave,
    }
    return palettes.get(style_name.lower(), ThreeBlue1Brown)


def apply_palette(scene, palette):
    """Apply palette to scene"""
    scene.camera.background_color = palette.BACKGROUND
