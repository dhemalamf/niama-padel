import sys
from PIL import Image

def process(input_path):
    img = Image.open(input_path).convert("RGBA")
    
    # Save standard PWA sizes
    img.resize((192, 192), Image.Resampling.LANCZOS).save("public/icon-192.png")
    img.resize((512, 512), Image.Resampling.LANCZOS).save("public/icon-512.png")
    
    # Save favicon (we can use PNG for favicon, just replace the SVG ref)
    img.resize((64, 64), Image.Resampling.LANCZOS).save("public/favicon.png")

if __name__ == "__main__":
    process(sys.argv[1])
