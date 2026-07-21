"""Build source-faithful NNC product scenes from approved catalogue pixels.

ImageGen supplies only the text-free studio environments. Product packaging is
cropped from the supplied NNC catalogues, background-masked, and composited into
the final raster assets without generative redraw of labels or pack structure.
"""

from __future__ import annotations

from collections import deque
from dataclasses import dataclass
from pathlib import Path

import numpy as np
from PIL import Image, ImageChops, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
HANDOFF = (
    ROOT
    / "NNC_B2B_ONLINE_REWARDS_Q3_2026_ANTIGRAVITY_HANDOFF"
    / "NNC_B2B_ONLINE_REWARDS_Q3_2026_HANDOFF"
    / "03_VISUAL_REFERENCES"
)
VISUAL = ROOT / "public" / "assets" / "nnc-b2b-rewards" / "visual"
CUTOUTS = VISUAL / "cutouts"


@dataclass(frozen=True)
class ProductAsset:
    product_id: str
    catalogue: str
    crop: tuple[int, int, int, int]
    category: str


PRODUCTS = (
    ProductAsset("tadimax", "03_catalogue_tadimax_bai_thach_vg5.png", (1165, 270, 1745, 625), "herbal"),
    ProductAsset("bai-thach", "03_catalogue_tadimax_bai_thach_vg5.png", (1220, 920, 1765, 1435), "herbal"),
    ProductAsset("cvmox-1000", "04_catalogue_cvmox_family.png", (1125, 180, 1760, 525), "antibiotic"),
    ProductAsset("nc-cvmox-625", "04_catalogue_cvmox_family.png", (1095, 570, 1745, 1175), "antibiotic"),
    ProductAsset("cvmok-228", "04_catalogue_cvmox_family.png", (1210, 1340, 1725, 1845), "antibiotic"),
    ProductAsset("cefixad-100", "05_catalogue_cefixad_azihadi.png", (1175, 1325, 1730, 1765), "antibiotic"),
    ProductAsset("azihadi", "05_catalogue_cefixad_azihadi.png", (1245, 1940, 1740, 2375), "antibiotic"),
)


def edge_connected_white_mask(rgb: Image.Image) -> Image.Image:
    """Return a feathered alpha mask while preserving enclosed white packaging."""

    array = np.asarray(rgb.convert("RGB"), dtype=np.uint8)
    channel_min = array.min(axis=2)
    channel_max = array.max(axis=2)
    candidate = (channel_min >= 246) & ((channel_max - channel_min) <= 12)
    height, width = candidate.shape
    background = np.zeros((height, width), dtype=bool)
    queue: deque[tuple[int, int]] = deque()

    def seed(y: int, x: int) -> None:
        if candidate[y, x] and not background[y, x]:
            background[y, x] = True
            queue.append((y, x))

    for x in range(width):
        seed(0, x)
        seed(height - 1, x)
    for y in range(height):
        seed(y, 0)
        seed(y, width - 1)

    while queue:
        y, x = queue.popleft()
        for next_y, next_x in ((y - 1, x), (y + 1, x), (y, x - 1), (y, x + 1)):
            if 0 <= next_y < height and 0 <= next_x < width:
                if candidate[next_y, next_x] and not background[next_y, next_x]:
                    background[next_y, next_x] = True
                    queue.append((next_y, next_x))

    foreground = ~background
    visited = np.zeros((height, width), dtype=bool)
    minimum_component_area = max(700, (height * width) // 250)
    for start_y in range(height):
        for start_x in range(width):
            if not foreground[start_y, start_x] or visited[start_y, start_x]:
                continue
            component: list[tuple[int, int]] = []
            component_queue: deque[tuple[int, int]] = deque([(start_y, start_x)])
            visited[start_y, start_x] = True
            while component_queue:
                y, x = component_queue.popleft()
                component.append((y, x))
                for next_y, next_x in ((y - 1, x), (y + 1, x), (y, x - 1), (y, x + 1)):
                    if 0 <= next_y < height and 0 <= next_x < width:
                        if foreground[next_y, next_x] and not visited[next_y, next_x]:
                            visited[next_y, next_x] = True
                            component_queue.append((next_y, next_x))
            if len(component) < minimum_component_area:
                for y, x in component:
                    foreground[y, x] = False

    alpha = Image.fromarray(np.where(foreground, 255, 0).astype(np.uint8), "L")
    return alpha.filter(ImageFilter.GaussianBlur(0.55))


def build_cutout(product: ProductAsset) -> Image.Image:
    catalogue = Image.open(HANDOFF / product.catalogue).convert("RGB")
    crop = catalogue.crop(product.crop)
    alpha = edge_connected_white_mask(crop)
    if product.product_id == "cvmox-1000":
        # The approved CVmox-1000 carton is predominantly white and its white
        # face touches the catalogue background. Preserve the exact rectangular
        # carton pixels explicitly; otherwise an edge-connected white removal
        # keeps only the coloured artwork and makes the identity unreadable.
        carton = Image.new("L", crop.size, 0)
        ImageDraw.Draw(carton).rectangle((21, 17, 410, 305), fill=255)
        alpha = ImageChops.lighter(alpha, carton.filter(ImageFilter.GaussianBlur(0.55)))
    elif product.product_id == "nc-cvmox-625":
        # The large white face of the NC CV Mox 625 carton is also connected
        # to the catalogue page background. Preserve the exact face and side
        # panel pixels so the logo and dosage do not disappear in the scene.
        carton = Image.new("L", crop.size, 0)
        ImageDraw.Draw(carton).rectangle((7, 214, 395, 490), fill=255)
        alpha = ImageChops.lighter(alpha, carton.filter(ImageFilter.GaussianBlur(0.55)))
    rgba = crop.convert("RGBA")
    rgba.putalpha(alpha)
    bbox = alpha.getbbox()
    if bbox is None:
        raise RuntimeError(f"No foreground found for {product.product_id}")
    left, top, right, bottom = bbox
    padding = 8
    box = (
        max(0, left - padding),
        max(0, top - padding),
        min(rgba.width, right + padding),
        min(rgba.height, bottom + padding),
    )
    return rgba.crop(box)


def fit_image(image: Image.Image, max_width: int, max_height: int) -> Image.Image:
    scale = min(max_width / image.width, max_height / image.height)
    size = (max(1, round(image.width * scale)), max(1, round(image.height * scale)))
    return image.resize(size, Image.Resampling.LANCZOS)


def add_product(
    base: Image.Image,
    product: Image.Image,
    *,
    center_x: int,
    bottom_y: int,
    max_width: int,
    max_height: int,
    reflection: bool = True,
) -> None:
    item = fit_image(product, max_width, max_height)
    left = round(center_x - item.width / 2)
    top = bottom_y - item.height

    shadow_width = max(24, round(item.width * 0.76))
    shadow_height = max(8, round(item.height * 0.055))
    shadow = Image.new("RGBA", (shadow_width + 36, shadow_height + 30), (0, 0, 0, 0))
    shadow_alpha = Image.new("L", shadow.size, 0)
    shadow_alpha.paste(78, (18, 10, 18 + shadow_width, 10 + shadow_height))
    shadow_alpha = shadow_alpha.filter(ImageFilter.GaussianBlur(max(4, shadow_height * 0.8)))
    shadow.putalpha(shadow_alpha)
    base.alpha_composite(shadow, (round(center_x - shadow.width / 2), bottom_y - round(shadow_height * 0.65)))

    if reflection:
        reflection_height = min(round(item.height * 0.22), 90)
        reflected = item.transpose(Image.Transpose.FLIP_TOP_BOTTOM).crop((0, 0, item.width, reflection_height))
        reflected_alpha = np.asarray(reflected.getchannel("A"), dtype=np.float32)
        fade = np.linspace(0.14, 0.0, reflection_height, dtype=np.float32)[:, None]
        reflected.putalpha(Image.fromarray(np.clip(reflected_alpha * fade, 0, 255).astype(np.uint8), "L"))
        reflected = reflected.filter(ImageFilter.GaussianBlur(0.7))
        base.alpha_composite(reflected, (left, bottom_y + 2))

    base.alpha_composite(item, (left, top))


def save_derivatives(image: Image.Image, stem: Path, *, png: bool = True) -> None:
    rgb = Image.new("RGB", image.size, "white")
    rgb.paste(image, mask=image.getchannel("A") if image.mode == "RGBA" else None)
    if png:
        rgb.save(stem.with_suffix(".png"), "PNG", optimize=True)
    rgb.save(stem.with_suffix(".webp"), "WEBP", quality=90, method=6)
    rgb.save(stem.with_suffix(".avif"), "AVIF", quality=60)


def build_product_scene(product: ProductAsset, cutout: Image.Image) -> None:
    background_path = VISUAL / f"product-stage-{product.category}-source.png"
    base = Image.open(background_path).convert("RGBA").resize((1024, 1024), Image.Resampling.LANCZOS)
    add_product(
        base,
        cutout,
        center_x=512,
        bottom_y=790,
        max_width=610 if product.product_id != "nc-cvmox-625" else 660,
        max_height=445,
        reflection=True,
    )
    save_derivatives(base, VISUAL / f"product-scene-{product.product_id}")


def build_hero(cutouts: dict[str, Image.Image], *, mobile: bool) -> None:
    if mobile:
        source = VISUAL / "hero-clinical-checkpoints-v4-mobile-source.png"
        base = Image.open(source).convert("RGBA").resize((720, 620), Image.Resampling.LANCZOS)
        centers = (62, 159, 258, 360, 466, 568, 667)
        widths = (92, 88, 94, 103, 82, 92, 78)
        bottoms = (474, 470, 475, 472, 475, 472, 474)
        max_height = 112
        stem = VISUAL / "hero-clinical-checkpoints-v5-mobile-integrated"
    else:
        source = VISUAL / "hero-clinical-checkpoints-v4-wide-source.png"
        base = Image.open(source).convert("RGBA")
        centers = (1035, 1178, 1322, 1472, 1616, 1762, 1892)
        widths = (132, 126, 136, 150, 118, 130, 108)
        bottoms = (648, 644, 650, 646, 650, 646, 648)
        max_height = 164
        stem = VISUAL / "hero-clinical-checkpoints-v5-wide-integrated"

    for product, center, width, bottom in zip(PRODUCTS, centers, widths, bottoms, strict=True):
        add_product(
            base,
            cutouts[product.product_id],
            center_x=center,
            bottom_y=bottom,
            max_width=width,
            max_height=max_height,
            reflection=False,
        )
    save_derivatives(base, stem)


def main() -> None:
    CUTOUTS.mkdir(parents=True, exist_ok=True)
    cutouts: dict[str, Image.Image] = {}
    for product in PRODUCTS:
        cutout = build_cutout(product)
        cutouts[product.product_id] = cutout
        cutout.save(CUTOUTS / f"{product.product_id}.png", "PNG", optimize=True)
        build_product_scene(product, cutout)
    build_hero(cutouts, mobile=False)
    build_hero(cutouts, mobile=True)
    print("Built 7 source-faithful product scenes and desktop/mobile integrated heroes.")


if __name__ == "__main__":
    main()
