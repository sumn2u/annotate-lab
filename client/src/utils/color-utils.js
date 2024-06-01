// Helper function to convert hexadecimal color string to RGB tuple
export const hexToRgbTuple = (hex) => {
    // Remove '#' if present
    hex = hex.replace('#', '');
    // Convert hexadecimal to RGB
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    // Return RGB tuple
    return [r, g, b];
  }