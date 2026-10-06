import { supabase } from "@/lib/supabase";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

export const uploadImage = async (file: File): Promise<string> => {
  const extension = ALLOWED_IMAGE_TYPES[file.type as keyof typeof ALLOWED_IMAGE_TYPES];

  if (!extension) {
    throw new Error("Unsupported image type. Use JPEG, PNG, or WebP.");
  }

  if (file.size <= 0 || file.size > MAX_IMAGE_SIZE) {
    throw new Error("Image must be larger than 0 bytes and no larger than 5 MB.");
  }

  const filePath = `products/${crypto.randomUUID()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from("product-images")
    .upload(filePath, file, {
      upsert: false,
      contentType: file.type,
      cacheControl: "31536000",
    });

  if (uploadError) {
    throw uploadError;
  }

  const { data: urlData } = supabase.storage
    .from("product-images")
    .getPublicUrl(filePath);

  return urlData.publicUrl;
};

export const deleteImage = async (publicUrl: string) => {
  const url = new URL(publicUrl);
  const parts = url.pathname.split("/").filter(Boolean);
  const publicIndex = parts.indexOf("public");

  if (publicIndex === -1 || parts[publicIndex + 1] !== "product-images") {
    throw new Error("Invalid product image URL");
  }

  const filePath = parts.slice(publicIndex + 2).join("/");

  if (!filePath.startsWith("products/") || filePath.includes("..")) {
    throw new Error("Invalid product image path");
  }

  const { error } = await supabase.storage
    .from("product-images")
    .remove([filePath]);

  if (error) {
    console.error("Error deleting image:", error);
    throw error;
  }
};
