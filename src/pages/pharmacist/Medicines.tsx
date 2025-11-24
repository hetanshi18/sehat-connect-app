import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { Medicine } from '@/types/pharmacy';
import { Plus, Pencil, Trash2, Search, ArrowLeft, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';

export default function Medicines() {
  const navigate = useNavigate();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [filteredMedicines, setFilteredMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    stock_quantity: '',
    manufacturer: '',
    prescription_required: false,
    image_url: '',
    status: 'in_stock' as 'in_stock' | 'out_of_stock' | 'discontinued',
  });
  const [submitting, setSubmitting] = useState(false);
  const [showCsvUpload, setShowCsvUpload] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);

  useEffect(() => {
    fetchMedicines();
  }, []);

  useEffect(() => {
    filterMedicines();
  }, [searchTerm, medicines]);

  const fetchMedicines = async () => {
    try {
      const { data, error } = await supabase
        .from('medicines')
        .select('*')
        .order('name');

      if (error) throw error;
      setMedicines((data || []) as Medicine[]);
    } catch (error: any) {
      console.error('Error fetching medicines:', error);
      toast({
        title: 'Error',
        description: 'Failed to load medicines',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filterMedicines = () => {
    let filtered = medicines;
    if (searchTerm) {
      filtered = filtered.filter(m =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredMedicines(filtered);
  };

  const handleAdd = () => {
    setEditingMedicine(null);
    setFormData({
      name: '',
      description: '',
      category: '',
      price: '',
      stock_quantity: '',
      manufacturer: '',
      prescription_required: false,
      image_url: '',
      status: 'in_stock',
    });
    setShowDialog(true);
  };

  const handleEdit = (medicine: Medicine) => {
    setEditingMedicine(medicine);
    setFormData({
      name: medicine.name,
      description: medicine.description || '',
      category: medicine.category,
      price: medicine.price.toString(),
      stock_quantity: medicine.stock_quantity.toString(),
      manufacturer: medicine.manufacturer || '',
      prescription_required: medicine.prescription_required,
      image_url: medicine.image_url || '',
      status: medicine.status,
    });
    setShowDialog(true);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.category || !formData.price || !formData.stock_quantity) {
      toast({
        title: 'Validation error',
        description: 'Please fill all required fields',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);

    try {
      const medicineData = {
        name: formData.name,
        description: formData.description || null,
        category: formData.category,
        price: parseFloat(formData.price),
        stock_quantity: parseInt(formData.stock_quantity),
        manufacturer: formData.manufacturer || null,
        prescription_required: formData.prescription_required,
        image_url: formData.image_url || null,
        status: formData.status,
      };

      if (editingMedicine) {
        const { error } = await supabase
          .from('medicines')
          .update(medicineData)
          .eq('id', editingMedicine.id);

        if (error) throw error;
        toast({ title: 'Success', description: 'Medicine updated successfully' });
      } else {
        const { error } = await supabase
          .from('medicines')
          .insert(medicineData);

        if (error) throw error;
        toast({ title: 'Success', description: 'Medicine added successfully' });
      }

      setShowDialog(false);
      fetchMedicines();
    } catch (error: any) {
      console.error('Error saving medicine:', error);
      toast({
        title: 'Error',
        description: 'Failed to save medicine',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCsvUpload = async () => {
    if (!csvFile) {
      toast({ title: 'Error', description: 'Please select a CSV file', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      const text = await csvFile.text();
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      
      // Expected headers: name,description,category,price,stock_quantity,manufacturer,prescription_required,status
      const requiredHeaders = ['name', 'category', 'price'];
      const hasRequiredHeaders = requiredHeaders.every(h => headers.includes(h));
      
      if (!hasRequiredHeaders) {
        toast({ 
          title: 'Error', 
          description: 'CSV must contain at least: name, category, price',
          variant: 'destructive' 
        });
        setSubmitting(false);
        return;
      }

      const medicines = [];
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
        const values = lines[i].split(',').map(v => v.trim());
        const medicine: any = {};
        
        headers.forEach((header, idx) => {
          medicine[header] = values[idx] || null;
        });

        // Parse required fields
        medicine.price = parseFloat(medicine.price);
        medicine.stock_quantity = parseInt(medicine.stock_quantity) || 0;
        medicine.prescription_required = medicine.prescription_required === 'true' || medicine.prescription_required === '1';
        medicine.status = medicine.status || 'in_stock';

        medicines.push(medicine);
      }

      if (medicines.length === 0) {
        toast({ title: 'Error', description: 'No valid medicines found in CSV', variant: 'destructive' });
        setSubmitting(false);
        return;
      }

      // Insert medicines in batch
      const { error } = await supabase.from('medicines').insert(medicines);

      if (error) throw error;

      toast({ title: 'Success', description: `${medicines.length} medicines uploaded successfully` });
      setShowCsvUpload(false);
      setCsvFile(null);
      fetchMedicines();
    } catch (error: any) {
      console.error('CSV upload error:', error);
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this medicine?')) return;

    try {
      const { error } = await supabase
        .from('medicines')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: 'Success', description: 'Medicine deleted successfully' });
      fetchMedicines();
    } catch (error: any) {
      console.error('Error deleting medicine:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete medicine',
        variant: 'destructive',
      });
    }
  };

  return (
    <DashboardLayout role="pharmacist">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/pharmacist/dashboard')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Medicines</h1>
              <p className="text-muted-foreground">Manage your medicine inventory</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => setShowCsvUpload(true)} variant="outline">
              <Upload className="mr-2 h-4 w-4" />
              Upload CSV
            </Button>
            <Button onClick={handleAdd}>
              <Plus className="mr-2 h-4 w-4" />
              Add Medicine
            </Button>
          </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search medicines..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map(i => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Rx Required</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMedicines.map(medicine => (
                <TableRow key={medicine.id}>
                  <TableCell className="font-medium">{medicine.name}</TableCell>
                  <TableCell>{medicine.category}</TableCell>
                  <TableCell>₹{medicine.price.toFixed(2)}</TableCell>
                  <TableCell>
                    <span className={medicine.stock_quantity < 10 ? 'text-orange-600 font-medium' : ''}>
                      {medicine.stock_quantity}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={medicine.status === 'in_stock' ? 'default' : 'secondary'}>
                      {medicine.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {medicine.prescription_required ? (
                      <Badge variant="outline">Yes</Badge>
                    ) : (
                      <Badge variant="secondary">No</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => handleEdit(medicine)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="destructive"
                        onClick={() => handleDelete(medicine.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

        {/* CSV Upload Dialog */}
        <Dialog open={showCsvUpload} onOpenChange={setShowCsvUpload}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Medicines from CSV</DialogTitle>
              <DialogDescription>
                Upload a CSV file with columns: name, description, category, price, stock_quantity, manufacturer, prescription_required (true/false), status
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>CSV File</Label>
                <Input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                />
                <p className="text-xs text-muted-foreground">
                  Required columns: name, category, price
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCsvUpload(false)}>
                Cancel
              </Button>
              <Button onClick={handleCsvUpload} disabled={!csvFile || submitting}>
                {submitting ? 'Uploading...' : 'Upload'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingMedicine ? 'Edit Medicine' : 'Add Medicine'}</DialogTitle>
            <DialogDescription>
              {editingMedicine ? 'Update medicine information' : 'Add a new medicine to inventory'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g., Antibiotics, Pain Relief"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="manufacturer">Manufacturer</Label>
              <Input
                id="manufacturer"
                value={formData.manufacturer}
                onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price (₹) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock">Stock Quantity *</Label>
              <Input
                id="stock"
                type="number"
                value={formData.stock_quantity}
                onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(v: any) => setFormData({ ...formData, status: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in_stock">In Stock</SelectItem>
                  <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                  <SelectItem value="discontinued">Discontinued</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Image URL</Label>
              <Input
                id="image"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div className="col-span-2 flex items-center space-x-2">
              <Checkbox
                id="prescription"
                checked={formData.prescription_required}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, prescription_required: checked as boolean })
                }
              />
              <Label htmlFor="prescription">Prescription Required</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Saving...' : editingMedicine ? 'Update' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </DashboardLayout>
  );
}
