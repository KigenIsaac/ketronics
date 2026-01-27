'use client';

import { useState, useEffect } from 'react';
import { Category, Subcategory, SubcategoryAttribute } from '@/types/product';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2 } from 'lucide-react';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [attributes, setAttributes] = useState<SubcategoryAttribute[]>([]);
  const [loading, setLoading] = useState(true);

  // For attributes tab
  const [selectedCatId, setSelectedCatId] = useState('');
  const [selectedSubId, setSelectedSubId] = useState('');

  // Forms
  const [categoryForm, setCategoryForm] = useState({ name: '', editing: null as string | null });
  const [subcategoryForm, setSubcategoryForm] = useState({ name: '', categoryId: '', editing: null as string | null });
  const [attributeForm, setAttributeForm] = useState({
    name: '',
    type: 'text' as 'text' | 'number' | 'select',
    options: [] as string[],
    displayInCard: false,
    subcategoryId: '',
    editing: null as string | null
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [catRes, subRes, attrRes] = await Promise.all([
      supabase.from('categories').select('*').order('name'),
      supabase.from('subcategories').select('*, category:categories(*)').order('name'),
      supabase.from('subcategory_attributes').select('*, subcategory:subcategories(*)').order('name')
    ]);

    setCategories(catRes.data || []);
    setSubcategories(subRes.data || []);
    setAttributes(attrRes.data || []);
    setLoading(false);
  };

  const saveCategory = async () => {
    if (!categoryForm.name.trim()) return;

    const data = { name: categoryForm.name.trim() };
    if (categoryForm.editing) {
      await supabase.from('categories').update(data).eq('id', categoryForm.editing);
      toast.success('Category updated');
    } else {
      await supabase.from('categories').insert(data);
      toast.success('Category created');
    }
    setCategoryForm({ name: '', editing: null });
    fetchData();
  };

  const deleteCategory = async (id: string) => {
    await supabase.from('categories').delete().eq('id', id);
    toast.success('Category deleted');
    fetchData();
  };

  const saveSubcategory = async () => {
    if (!subcategoryForm.name.trim() || !subcategoryForm.categoryId) return;

    const data = { name: subcategoryForm.name.trim(), category_id: subcategoryForm.categoryId };
    if (subcategoryForm.editing) {
      await supabase.from('subcategories').update(data).eq('id', subcategoryForm.editing);
      toast.success('Subcategory updated');
    } else {
      await supabase.from('subcategories').insert(data);
      toast.success('Subcategory created');
    }
    setSubcategoryForm({ name: '', categoryId: '', editing: null });
    fetchData();
  };

  const deleteSubcategory = async (id: string) => {
    await supabase.from('subcategories').delete().eq('id', id);
    toast.success('Subcategory deleted');
    fetchData();
  };

  const saveAttribute = async () => {
    if (!attributeForm.name.trim() || !attributeForm.subcategoryId) return;

    const data = {
      name: attributeForm.name.trim(),
      type: attributeForm.type,
      options: attributeForm.type === 'select' ? attributeForm.options : null,
      display_in_card: attributeForm.displayInCard,
      subcategory_id: attributeForm.subcategoryId
    };

    if (attributeForm.editing) {
      await supabase.from('subcategory_attributes').update(data).eq('id', attributeForm.editing);
      toast.success('Attribute updated');
    } else {
      await supabase.from('subcategory_attributes').insert(data);
      toast.success('Attribute created');
    }
    setAttributeForm({ name: '', type: 'text', options: [], displayInCard: false, subcategoryId: '', editing: null });
    fetchData();
  };

  const deleteAttribute = async (id: string) => {
    await supabase.from('subcategory_attributes').delete().eq('id', id);
    toast.success('Attribute deleted');
    fetchData();
  };

  if (loading) return <div className="p-4">Loading...</div>;

  const filteredSubcategories = subcategories.filter(sub => sub.category_id === selectedCatId);
  const filteredAttributes = attributes.filter(attr => attr.subcategory_id === selectedSubId);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Manage Categories & Attributes</h1>

      <Tabs defaultValue="categories" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="categories">Categories & Subcategories</TabsTrigger>
          <TabsTrigger value="attributes">Attributes</TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="space-y-8">
          {/* Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Categories
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Category
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{categoryForm.editing ? 'Edit' : 'Add'} Category</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Name</Label>
                        <Input
                          value={categoryForm.name}
                          onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                        />
                      </div>
                      <Button onClick={saveCategory}>
                        {categoryForm.editing ? 'Update' : 'Create'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map(cat => (
                    <TableRow key={cat.id}>
                      <TableCell>{cat.name}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setCategoryForm({ name: cat.name, editing: cat.id })}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteCategory(cat.id)}
                          className="ml-2"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Subcategories */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Subcategories
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Subcategory
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{subcategoryForm.editing ? 'Edit' : 'Add'} Subcategory</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Name</Label>
                        <Input
                          value={subcategoryForm.name}
                          onChange={(e) => setSubcategoryForm(prev => ({ ...prev, name: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label>Category</Label>
                        <Select
                          value={subcategoryForm.categoryId}
                          onValueChange={(value) => setSubcategoryForm(prev => ({ ...prev, categoryId: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map(cat => (
                              <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button onClick={saveSubcategory}>
                        {subcategoryForm.editing ? 'Update' : 'Create'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subcategories.map(sub => (
                    <TableRow key={sub.id}>
                      <TableCell>{sub.name}</TableCell>
                      <TableCell>{sub.category?.name}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSubcategoryForm({ name: sub.name, categoryId: sub.category_id, editing: sub.id })}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteSubcategory(sub.id)}
                          className="ml-2"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attributes" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Select Category & Subcategory</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Category</Label>
                  <Select value={selectedCatId} onValueChange={setSelectedCatId}>
                    <SelectTrigger>
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
                  <Label>Subcategory</Label>
                  <Select
                    value={selectedSubId}
                    onValueChange={setSelectedSubId}
                    disabled={!selectedCatId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select subcategory" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredSubcategories.map(sub => (
                        <SelectItem key={sub.id} value={sub.id}>{sub.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {selectedSubId && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Attributes for {subcategories.find(s => s.id === selectedSubId)?.name}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Attribute
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>{attributeForm.editing ? 'Edit' : 'Add'} Attribute</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Name</Label>
                          <Input
                            value={attributeForm.name}
                            onChange={(e) => setAttributeForm(prev => ({ ...prev, name: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label>Type</Label>
                          <Select
                            value={attributeForm.type}
                            onValueChange={(value: 'text' | 'number' | 'select') => setAttributeForm(prev => ({ ...prev, type: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="text">Text</SelectItem>
                              <SelectItem value="number">Number</SelectItem>
                              <SelectItem value="select">Select</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        {attributeForm.type === 'select' && (
                          <div>
                            <Label>Options (comma-separated)</Label>
                            <Input
                              value={attributeForm.options.join(', ')}
                              onChange={(e) => setAttributeForm(prev => ({ ...prev, options: e.target.value.split(',').map(s => s.trim()) }))}
                            />
                          </div>
                        )}
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="displayInCard"
                            checked={attributeForm.displayInCard}
                            onChange={(e) => setAttributeForm(prev => ({ ...prev, displayInCard: e.target.checked }))}
                          />
                          <Label htmlFor="displayInCard">Display in product card</Label>
                        </div>
                        <Button onClick={() => {
                          setAttributeForm(prev => ({ ...prev, subcategoryId: selectedSubId }));
                          saveAttribute();
                        }}>
                          {attributeForm.editing ? 'Update' : 'Create'}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Display in Card</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAttributes.map(attr => (
                      <TableRow key={attr.id}>
                        <TableCell>{attr.name}</TableCell>
                        <TableCell>{attr.type}</TableCell>
                        <TableCell>{attr.display_in_card ? 'Yes' : 'No'}</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setAttributeForm({
                              name: attr.name,
                              type: attr.type,
                              options: attr.options || [],
                              displayInCard: attr.display_in_card,
                              subcategoryId: attr.subcategory_id,
                              editing: attr.id
                            })}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteAttribute(attr.id)}
                            className="ml-2"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}