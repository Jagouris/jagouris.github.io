function extractColor(ctx, width, height, shade, saturation){
    let pixels = ctx.getImageData(0, 0, width, height);
    
    let r = 0;
    let g = 0;
    let b = 0;
    let a = 0;
    
    let count = 0;
    
    for(let i = 0; i < pixels.data.length; i += 4){
        r += pixels.data[i] * (pixels.data[i+3] / 255);
        g += pixels.data[i+1] * (pixels.data[i+3] / 255);
        b += pixels.data[i+2] * (pixels.data[i+3] / 255);
        a += pixels.data[i+3];
        
        count++;
    }
    
    a = parseInt(a / count) / 255;
    count *= a;
    
    r = r / count;
    g = g / count;
    b = b / count;
    
    let dark = Math.min(r, g, b);
    
    r = r - (dark * saturation);
    g = g - (dark * saturation);
    b = b - (dark * saturation);
    
    let light = Math.max(r, g, b) / 255;
    
    r = r / light;
    g = g / light;
    b = b / light;

    //1 is no shade 0 is full shade
    r = parseInt(r * shade);
    g = parseInt(g * shade);
    b = parseInt(b * shade);
    
    let hexCode = `rgb(${r}, ${g}, ${b})`;
    
    return hexCode;
}