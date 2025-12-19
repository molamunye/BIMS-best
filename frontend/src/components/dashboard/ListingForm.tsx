import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
// import { supabase } from "@/integrations/supabase/client"; // Removed Supabase
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Upload, X, FileText, Loader2 } from "lucide-react";
import PaymentDialog from "@/components/payments/PaymentDialog";
import { api } from "@/lib/api";

interface ListingFormProps {
  onSuccess: () => void;
  listing?: any;
}

export default function ListingForm({ onSuccess, listing }: ListingFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>(listing?.images || []);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [documentName, setDocumentName] = useState<string>("");
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [pendingListingData, setPendingListingData] = useState<any>(null);

  const [formData, setFormData] = useState({
    type: listing?.type || "property",
    category_id: listing?.category_id || "",
    title: listing?.title || "",
    description: listing?.description || "",
    price: listing?.price || "",
    location: listing?.location || "",
    status: listing?.status || "active",
  });

  useEffect(() => {
    loadCategories();
  }, [formData.type]);

  const loadCategories = async () => {
    // Replaced Supabase fetch with static data for now
    // In a full migration, you'd fetch this from your Node.js backend
    if (formData.type === 'property') {
      setCategories([
        { id: '1', name: 'Apartment' },
        { id: '2', name: 'House' },
        { id: '3', name: 'Land' },
        { id: '4', name: 'Commercial' }
      ]);
    } else {
      setCategories([
        { id: '5', name: 'Sedan' },
        { id: '6', name: 'SUV' },
        { id: '7', name: 'Truck' },
        { id: '8', name: 'Luxury' }
      ]);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    // Validate files
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 5MB)`);
        return false;
      }
      return true;
    });

    if (imageFiles.length + validFiles.length > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }

    setImageFiles([...imageFiles, ...validFiles]);

    // Create preview URLs
    validFiles.forEach(file => {
      const url = URL.createObjectURL(file);
      setImagePreviewUrls(prev => [...prev, url]);
    });
  };

  const removeImage = (index: number) => {
    setImageFiles(imageFiles.filter((_, i) => i !== index));
    setImagePreviewUrls(imagePreviewUrls.filter((_, i) => i !== index));
  };

  const handleDocumentSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error("Only PDF files are allowed");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Document must be less than 10MB");
      return;
    }

    setDocumentFile(file);
    setDocumentName(file.name);
  };

  const removeDocument = () => {
    setDocumentFile(null);
    setDocumentName("");
  };

  const uploadImages = async (): Promise<string[]> => {
    if (imageFiles.length === 0) return imagePreviewUrls.filter(url => url.startsWith('http'));

    setUploadingImages(true);
    const uploadedUrls: string[] = [];

    // Keep existing URLs
    imagePreviewUrls.forEach(url => {
      if (url.startsWith('http')) {
        uploadedUrls.push(url);
      }
    });

    try {
      const formData = new FormData();
      imageFiles.forEach(file => {
        formData.append('files', file);
      });

      // Use the multiple upload endpoint
      const response = await api.post('/upload/multiple', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status !== 200) {
        throw new Error('Failed to upload images');
      }

      if (response.data.urls) {
        uploadedUrls.push(...response.data.urls);
      }
    } catch (error) {
      console.error('Image upload error:', error);
      toast.error("Failed to upload images");
    } finally {
      setUploadingImages(false);
    }

    return uploadedUrls;
  };

  const uploadDocument = async (): Promise<string | null> => {
    if (!documentFile) return null;

    setUploadingDoc(true);
    try {
      const formData = new FormData();
      formData.append('file', documentFile);

      const response = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status !== 200) {
        throw new Error('Failed to upload document');
      }

      setUploadingDoc(false);
      return response.data.url;
    } catch (error) {
      console.error('Document upload error:', error);
      toast.error("Failed to upload document");
      setUploadingDoc(false);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    // Upload images (Supabase storage might still work, or we skip for now if it fails)
    // For this migration, we will try to keep using Supabase Storage if possible, 
    // OR just send placeholder URLs if we want to fully decouple.
    // Let's try to keep image upload but catch errors gracefully.
    let imageUrls: string[] = [];
    try {
      imageUrls = await uploadImages();
    } catch (err) {
      console.error("Image upload failed", err);
      // Continue without images or show error?
    }

    // Upload document if provided
    let docUrl = null;
    if (documentFile) {
      try {
        docUrl = await uploadDocument();
      } catch (err) {
        console.error("Doc upload failed", err);
      }
    }

    const listingData = {
      ...formData,
      price: parseFloat(formData.price),
      images: imageUrls,
      metadata: docUrl ? { license_document: docUrl } : {},
      ownerId: user.id, // Backend needs to know owner (though middleware gets it from token)
    };

    try {
      if (listing) {
        // Update
        const response = await api.put(`/listings/${listing._id || listing.id}`, listingData);

        if (response.status !== 200) {
          throw new Error('Failed to update listing');
        }

        toast.success("Listing updated successfully");
      } else {
        // Create - Show payment dialog first
        // Store listing data for after payment
        setPendingListingData(listingData);
        setShowPaymentDialog(true);
        setLoading(false);
        return;
      }
      onSuccess();
      toast.success("Listing created successfully");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to create listing");
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async () => {
    if (!pendingListingData) return;

    setLoading(true);
    try {
      // Listing should already be created as draft, webhook will activate it
      // Just wait a moment for webhook to process, then refresh
      setTimeout(() => {
        onSuccess();
        toast.success("Payment successful! Your listing is being processed.");
        setPendingListingData(null);
        setShowPaymentDialog(false);
        setLoading(false);
      }, 2000);
    } catch (error: any) {
      console.error(error);
      toast.error("Payment successful, but there was an error processing your listing. Please contact support.");
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <Select
            value={formData.type}
            onValueChange={(value) => setFormData({ ...formData, type: value, category_id: "" })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="property">Property</SelectItem>
              <SelectItem value="vehicle">Vehicle</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select
            value={formData.category_id}
            onValueChange={(value) => setFormData({ ...formData, category_id: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
            rows={8}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="price">Price</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              required
            />
          </div>
        </div>

        {/* Property Images Upload */}
        <div className="space-y-2">
          <Label>Property Images (max 5)</Label>
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
            {imagePreviewUrls.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-4">
                {imagePreviewUrls.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-20 object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <label className="flex flex-col items-center gap-2 cursor-pointer">
              <Upload className="w-8 h-8 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Click to upload images</span>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageSelect}
                disabled={imagePreviewUrls.length >= 5}
              />
            </label>
          </div>
        </div>

        {/* License/Document Upload */}
        <div className="space-y-2">
          <Label>License Document (PDF)</Label>
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
            {documentName ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  <span className="text-sm">{documentName}</span>
                </div>
                <button
                  type="button"
                  onClick={removeDocument}
                  className="p-1 hover:bg-muted rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center gap-2 cursor-pointer">
                <FileText className="w-8 h-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Click to upload license PDF</span>
                <input
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={handleDocumentSelect}
                />
              </label>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => setFormData({ ...formData, status: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="sold">Sold</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button type="submit" className="w-full" disabled={loading || uploadingImages || uploadingDoc}>
          {loading || uploadingImages || uploadingDoc ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {uploadingImages ? "Uploading images..." : uploadingDoc ? "Uploading document..." : "Saving..."}
            </>
          ) : (
            listing ? "Update Listing" : "Create Listing"
          )}
        </Button>
      </form>

      <PaymentDialog
        open={showPaymentDialog}
        onOpenChange={setShowPaymentDialog}
        type="listing"
        listingData={pendingListingData}
        onSuccess={handlePaymentSuccess}
        amount={100}
      />
    </>
  );
}
