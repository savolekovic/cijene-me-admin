export const validateEANBarcode = (barcode: string): boolean => {
  // Remove any whitespace
  const cleanBarcode = barcode.replace(/\s/g, '');
  
  // Check if barcode is either 8 or 13 digits
  if (!/^\d{8}$|^\d{13}$/.test(cleanBarcode)) {
    return false;
  }

  const digits = cleanBarcode.split('').map(Number);
  const checkDigit = digits.pop()!; // Last digit is the check digit
  let sum = 0;

  if (digits.length === 7) { // EAN-8
    // Multiply each digit by 3 or 1 alternately (starting with 3)
    digits.forEach((digit, index) => {
      sum += digit * (index % 2 === 0 ? 3 : 1);
    });
  } else { // EAN-13
    // For EAN-13, odd positions are multiplied by 1 and even by 3
    digits.forEach((digit, index) => {
      sum += digit * (index % 2 === 0 ? 1 : 3);
    });
  }

  // The check digit should make the sum divisible by 10
  const expectedCheckDigit = (10 - (sum % 10)) % 10;
  return checkDigit === expectedCheckDigit;
};

export const validateProductName = (name: string): string | null => {
  const trimmedName = name.trim();
  if (!trimmedName) {
    return 'Product name is required';
  }
  if (trimmedName.length > 100) {
    return 'Product name cannot exceed 100 characters';
  }
  return null;
};

export const validateImageUrl = (url: string): string | null => {
  const trimmedUrl = url.trim();
  if (!trimmedUrl) {
    return 'Image URL is required';
  }
  
  try {
    const parsedUrl = new URL(trimmedUrl);
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return 'Image URL must start with http:// or https://';
    }
    
    const extension = trimmedUrl.split('.').pop()?.toLowerCase();
    const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    if (!extension || !validExtensions.includes(extension)) {
      return 'Image URL must end with a valid image extension (.jpg, .jpeg, .png, .gif, .webp)';
    }
  } catch {
    return 'Please enter a valid URL';
  }
  
  return null;
};

export const validateCategoryName = (name: string): string | null => {
  const trimmedName = name.trim();
  if (!trimmedName) {
    return 'Category name is required';
  }
  if (trimmedName.length > 50) {
    return 'Category name cannot exceed 50 characters';
  }
  return null;
};

export const validateStoreLocationAddress = (address: string): string | null => {
  const trimmedAddress = address.trim();
  if (!trimmedAddress) {
    return 'Store location address is required';
  }
  if (trimmedAddress.length > 200) {
    return 'Address cannot exceed 200 characters';
  }
  return null;
};

export const validateStoreBrandName = (name: string): string | null => {
  const trimmedName = name.trim();
  if (!trimmedName) {
    return 'Store brand name is required';
  }
  if (trimmedName.length > 50) {
    return 'Store brand name cannot exceed 50 characters';
  }
  return null;
};

export const validateImageFile = (file: File | null): string | null => {
  if (!file) {
    return 'Image file is required';
  }

  // Check file size (5MB limit)
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (file.size > maxSize) {
    return 'Image file size must not exceed 5MB';
  }

  // Check file type
  const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (!validTypes.includes(file.type)) {
    return 'Only JPEG, PNG, and GIF images are allowed';
  }

  return null;
};

export const validateImageInput = (input: File | null): string | null => {
  if (!input) {
    return 'Image is required';
  }

  return validateImageFile(input);
};

// Valid EAN-8 examples:
// 40170725 (valid because 4×3 + 0×1 + 1×3 + 7×1 + 0×3 + 7×1 + 2×3 = 35, next multiple of 10 is 40, so check digit is 5)
// 96385074
// 12345670 