'use client';

import { useState, useEffect } from 'react';
import { Product, Category, Subcategory, SubcategoryAttribute } from '@/types/product';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { uploadImage, deleteImage } from '@/lib/storage';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import Image from 'next/image';
import { X, Plus } from 'lucide-react';

interface ProductFormProps {
  product?: Product;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ProductForm({ product, onSuccess, onCancel }: ProductFormProps) {
  const [name, setName] = useState(product?.name || '');
  const [description, setDescription] = useState(product?.description || '');
  const [price, setPrice] = useState(product?.price?.toString() || '');
  const [brand, setBrand] = useState(product?.brand || '');
  const [buyingPrice, setBuyingPrice] = useState(product?.buying_price?.toString() || '');
  const [discount, setDiscount] = useState(product?.discount?.toString() || '0');
  const [categoryId, setCategoryId] = useState(product?.category_id || '');
  const [subcategoryId, setSubcategoryId] = useState(product?.subcategory_id || '');
  const [attributes, setAttributes] = useState<Record<string, any>>(product?.attributes || {});
  const [images, setImages] = useState<string[]>(product?.images || []);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [subcategoryAttributes, setSubcategoryAttributes] = useState<SubcategoryAttribute[]>([]);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase.from('categories').select('*').order('name');
      if (error) {
        toast.error('Failed to load categories');
      } else {
        setCategories(data || []);
      }
    };
    fetchCategories();
  }, []);

  // Fetch subcategories when category changes
  useEffect(() => {
    if (!categoryId) {
      setSubcategories([]);
      setSubcategoryId('');
      return;
    }
    const fetchSubcategories = async () => {
      const { data, error } = await supabase
        .from('subcategories')
        .select('*')
        .eq('category_id', categoryId)
        .order('name');
      if (error) {
        toast.error('Failed to load subcategories');
      } else {
        setSubcategories(data || []);
      }
    };
    fetchSubcategories();
  }, [categoryId]);

  // Fetch attributes when subcategory changes
  useEffect(() => {
    if (!subcategoryId) {
      setSubcategoryAttributes([]);
      setAttributes({});
      return;
    }
    const fetchAttributes = async () => {
      const { data, error } = await supabase
        .from('subcategory_attributes')
        .select('*')
        .eq('subcategory_id', subcategoryId)
        .order('name');
      if (error) {
        toast.error('Failed to load attributes');
      } else {
        setSubcategoryAttributes(data || []);
        // Initialize attributes with empty values
        const initialAttrs: Record<string, any> = {};
        data?.forEach(attr => {
          initialAttrs[attr.name] = product?.attributes?.[attr.name] || '';
        });
        setAttributes(initialAttrs);
      }
    };
    fetchAttributes();
  }, [subcategoryId, product?.attributes]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setUploading(true);
    try {
      const newImages = [];
      for (const file of Array.from(files)) {
        const url = await uploadImage(file);
        newImages.push(url);
      }
      setImages([...images, ...newImages]);
      toast.success('Images uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = async (index: number) => {
    const imageToRemove = images[index];
    try {
      await deleteImage(imageToRemove);
      setImages(images.filter((_, i) => i !== index));
      toast.success('Image removed');
    } catch (error) {
      toast.error('Failed to remove image');
    }
  };

  const handleAttributeChange = (name: string, value: any) => {
    setAttributes(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const productData = {
      name,
      description,
      price: parseFloat(price),
      brand: brand || null,
      buying_price: buyingPrice ? parseFloat(buyingPrice) : null,
      discount: parseFloat(discount) || 0,
      category_id: categoryId || null,
      subcategory_id: subcategoryId || null,
      attributes,
      images,
    };

    try {
      if (product) {
        // Update
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', product.id);

        if (error) throw error;
        toast.success('Product updated successfully');
      } else {
        // Create
        const { error } = await supabase
          .from('products')
          .insert(productData);

        if (error) throw error;
        toast.success('Product created successfully');
      }
      onSuccess();
    } catch (error) {
      toast.error('Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{product ? 'Edit Product' : 'Create New Product'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="brand">Brand</Label>
              <Input
                id="brand"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="mt-1"
              rows={4}
            />
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="buyingPrice">Buying Price</Label>
              <Input
                id="buyingPrice"
                type="number"
                step="0.01"
                value={buyingPrice}
                onChange={(e) => setBuyingPrice(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="price">Selling Price</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="discount">Discount (%)</Label>
              <Input
                id="discount"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          {/* Category & Subcategory */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="subcategory">Subcategory</Label>
              <Select value={subcategoryId} onValueChange={setSubcategoryId} disabled={!categoryId}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select subcategory" />
                </SelectTrigger>
                <SelectContent>
                  {subcategories.map(sub => (
                    <SelectItem key={sub.id} value={sub.id}>{sub.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Dynamic Attributes */}
          {subcategoryAttributes.length > 0 && (
            <div>
              <Label className="text-lg font-semibold">Product Specifications</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                {subcategoryAttributes.map(attr => (
                  <div key={attr.id}>
                    <Label htmlFor={attr.name}>{attr.name}</Label>
                    {attr.type === 'select' ? (
                      <Select
                        value={attributes[attr.name] || ''}
                        onValueChange={(value) => handleAttributeChange(attr.name, value)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder={`Select ${attr.name}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {attr.options?.map(option => (
                            <SelectItem key={option} value={option}>{option}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        id={attr.name}
                        type={attr.type === 'number' ? 'number' : 'text'}
                        value={attributes[attr.name] || ''}
                        onChange={(e) => handleAttributeChange(attr.name, e.target.value)}
                        className="mt-1"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Images */}
          <div>
            <Label htmlFor="images">Product Images</Label>
            <Input
              id="images"
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading}
              className="mt-1"
            />
            {uploading && <p className="text-sm text-muted-foreground mt-1">Uploading...</p>}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              {images.map((image, index) => (
                <div key={index} className="relative group">
                  <Image
                    src={image}
                    alt={`Product image ${index + 1}`}
                    width={150}
                    height={150}
                    className="object-cover rounded-lg border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeImage(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={saving} className="flex-1">
              {saving ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}