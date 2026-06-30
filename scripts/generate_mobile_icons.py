import os
from PIL import Image, ImageDraw

def draw_sparkle(draw, cx, cy, R, r, fill_color):
    # A 4-pointed star
    points = [
        (cx, cy - R),
        (cx + r, cy - r),
        (cx + R, cy),
        (cx + r, cy + r),
        (cx, cy + R),
        (cx - r, cy + r),
        (cx - R, cy),
        (cx - r, cy - r)
    ]
    draw.polygon(points, fill=fill_color)

def get_gradient_image(width, height, c1, c2):
    img = Image.new('RGB', (16, 16))
    for y in range(16):
        for x in range(16):
            t = (x + y) / 30.0
            t = max(0.0, min(1.0, t))
            r = int(c1[0] + (c2[0] - c1[0]) * t)
            g = int(c1[1] + (c2[1] - c1[1]) * t)
            b = int(c1[2] + (c2[2] - c1[2]) * t)
            img.putpixel((x, y), (r, g, b))
    return img.resize((width, height), Image.Resampling.BILINEAR)

def create_logo_image(bg_color, with_bg=True):
    # 1024x1024 canvas
    size = 1024
    if with_bg:
        img = Image.new('RGBA', (size, size), bg_color)
    else:
        img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    
    # 1. Draw rounded gradient square in the center
    sq_size = 512
    sq_radius = 120
    
    # Create the gradient image of square size
    c1 = (124, 43, 202)  # #7c2bca
    c2 = (156, 105, 237) # #9c69ed
    grad = get_gradient_image(sq_size, sq_size, c1, c2)
    
    # Create mask for rounded corners
    mask = Image.new('L', (sq_size, sq_size), 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.rounded_rectangle((0, 0, sq_size, sq_size), radius=sq_radius, fill=255)
    
    # Create the rounded gradient square image
    sq_img = Image.new('RGBA', (sq_size, sq_size), (0, 0, 0, 0))
    sq_img.paste(grad, (0, 0), mask)
    
    # Draw sparkles inside the square
    sq_draw = ImageDraw.Draw(sq_img)
    white = (250, 250, 250, 255)
    
    # Large sparkle centered at (sq_size/2 - 20, sq_size/2 + 20)
    cx, cy = sq_size // 2, sq_size // 2
    draw_sparkle(sq_draw, cx - 15, cy + 15, 95, 30, white)
    draw_sparkle(sq_draw, cx + 65, cy - 65, 55, 18, white)
    draw_sparkle(sq_draw, cx + 55, cy + 65, 35, 11, white)
    
    # Paste the square in the center of the canvas
    offset = (size - sq_size) // 2
    img.paste(sq_img, (offset, offset), sq_img)
    
    return img

def main():
    assets_dir = "/home/tengis/Documents/Tengis/rag_chatbot/apps/mobile/assets"
    os.makedirs(assets_dir, exist_ok=True)
    
    # 1. icon.png (with dark background)
    print("Generating icon.png...")
    icon = create_logo_image((9, 9, 11, 255), with_bg=True)
    icon.save(os.path.join(assets_dir, "icon.png"), "PNG")
    
    # 2. adaptive-icon.png (transparent background for foreground)
    print("Generating adaptive-icon.png...")
    adaptive = create_logo_image((0, 0, 0, 0), with_bg=False)
    # Expo expects adaptive-icon.png
    adaptive.save(os.path.join(assets_dir, "adaptive-icon.png"), "PNG")
    
    # 3. splash-icon.png (transparent background)
    print("Generating splash-icon.png...")
    splash = create_logo_image((0, 0, 0, 0), with_bg=False)
    splash.save(os.path.join(assets_dir, "splash-icon.png"), "PNG")
    
    print("All assets generated successfully!")

if __name__ == "__main__":
    main()
