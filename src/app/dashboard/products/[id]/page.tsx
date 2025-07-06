// app/products/edit/[id]/page.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { uploadFile, uploadMultipleFiles } from "@/lib/upload"; // Ensure this path is correct
import Image from "next/image";
import {
  Save,
  X,
  Upload,
  PlayCircle,
  Loader2, // For loading spinner
  Edit2, // For edit icon in details table
  Trash2, // For delete icon in details table
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

// Type definitions
type ItemType = {
  _id: string;
  itemForName: string;
  // Add other fields if present and needed from product.itemFor objects
};

type CategoryType = {
  _id: string;
  categoryName: string;
  parentCategoryId?: string;
  // Add other fields if present and needed from product.category objects
};

type MetalType = {
  _id: string;
  metalName: string;
};

type MaterialType = {
  _id: string;
  materialName: string;
};

type DetailType = {
  id: string; // Client-side unique key
  _id?: string; // Database ID
  size: string;
  weight: string;
  height: string;
  stock: string;
  materialDetails: string;
};

// Type for the product data structure received from the API
// Based on the provided sample: productResult.data
type APIProductDataType = {
  _id: string;
  productName: string;
  making: number;
  discount: number;
  itemFor: ItemType[]; // Array of ItemType objects
  category: CategoryType[]; // Array of CategoryType objects
  material: MaterialType; // Material object
  metal: MetalType; // Metal object
  media: {
    images: string[];
    video: string | null;
    previewImages: string[];
  };
  details: Array<{
    _id?: string;
    size: number;
    weight: number;
    height: number;
    stock: number;
    description: string; // Corresponds to materialDetails in DetailType
  }>;
  description: string;
  // Add other fields like createdAt, updatedAt, __v if needed
};

if (!process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID) {
  process.exit(1);
}
// Define your Appwrite bucket IDs
const PRODUCT_IMAGES_BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID;
const PRODUCT_VIDEOS_BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID;
const PREVIEW_IMAGES_BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID;

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const previewImageInputRef = useRef<HTMLInputElement>(null);

  const [productName, setProductName] = useState("");
  const [makingCharge, setMakingCharge] = useState("");
  const [discount, setDiscount] = useState("");
  const [productDesc, setProductDesc] = useState("");

  const [allItems, setAllItems] = useState<ItemType[]>([]);
  const [allCategories, setAllCategories] = useState<CategoryType[]>([]);
  const [allMetals, setAllMetals] = useState<MetalType[]>([]);
  const [allMaterials, setAllMaterials] = useState<MaterialType[]>([]);

  const [selectedItems, setSelectedItems] = useState<ItemType[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<CategoryType[]>(
    []
  );
  const [selectedMetal, setSelectedMetal] = useState(""); // Stores ID
  const [selectedMaterial, setSelectedMaterial] = useState(""); // Stores ID

  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [existingVideo, setExistingVideo] = useState<string | null>(null);
  const [existingPreviewImages, setExistingPreviewImages] = useState<string[]>(
    []
  );

  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [newVideoFile, setNewVideoFile] = useState<File | null>(null);
  const [newVideoPreview, setNewVideoPreview] = useState<string | null>(null);
  const [newPreviewImageFiles, setNewPreviewImageFiles] = useState<File[]>([]);
  const [newPreviewImagePreviews, setNewPreviewImagePreviews] = useState<
    string[]
  >([]);

  const [currentDetail, setCurrentDetail] = useState<DetailType>({
    id: String(new Date().getTime()),
    size: "",
    weight: "",
    height: "",
    stock: "",
    materialDetails: "",
  });
  const [detailsList, setDetailsList] = useState<DetailType[]>([]);
  const [editingDetailId, setEditingDetailId] = useState<string | null>(null);

  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [loadingApis, setLoadingApis] = useState({
    items: false,
    categories: false,
    metals: false,
    materials: false,
  });

  useEffect(() => {
    if (!productId) {
      toast.error("Product ID is missing.");
      router.push("/products"); // Consider redirecting to a relevant admin path
      return;
    }

    const fetchApiData = async <T,>(
      endpoint: string,
      setter: React.Dispatch<React.SetStateAction<T[]>>,
      apiKey: keyof typeof loadingApis
    ): Promise<void> => {
      setLoadingApis((prev) => ({ ...prev, [apiKey]: true }));
      try {
        const response = await fetch(`/api/${endpoint}`);
        const result = await response.json();
        if (result.status === "success" && Array.isArray(result.data)) {
          setter(result.data);
        } else {
          throw new Error(result.message || `Failed to fetch ${apiKey}`);
        }
      } catch (error) {
        console.error(`Failed to fetch ${apiKey}:`, error);
        toast.error(`Failed to load ${apiKey}`, {
          description: error instanceof Error ? error.message : String(error),
        });
      } finally {
        setLoadingApis((prev) => ({ ...prev, [apiKey]: false }));
      }
    };

    const loadInitialData = async () => {
      setIsLoadingPage(true);
      try {
        await Promise.all([
          fetchApiData<ItemType>("item-fors", setAllItems, "items"),
          fetchApiData<CategoryType>(
            "categories",
            setAllCategories,
            "categories"
          ),
          fetchApiData<MetalType>("metals", setAllMetals, "metals"),
          fetchApiData<MaterialType>("materials", setAllMaterials, "materials"),
        ]);

        const productResponse = await fetch(`/api/products/${productId}`);
        if (!productResponse.ok) {
          const errData = await productResponse.json();
          throw new Error(
            errData.message ||
              `Failed to fetch product (status: ${productResponse.status})`
          );
        }
        const productResult = await productResponse.json();

        if (productResult.status !== "success" || !productResult.data) {
          throw new Error(productResult.message || "Product data is invalid");
        }
        const productData: APIProductDataType = productResult.data;

        setProductName(productData.productName || "");
        setMakingCharge(String(productData.making || ""));
        setDiscount(String(productData.discount || ""));
        setProductDesc(productData.description || "");

        setSelectedMetal(productData.metal?._id || "");
        setSelectedMaterial(productData.material?._id || "");

        console.log(productData.itemFor);
        setSelectedItems(productData.itemFor || []);
        setSelectedCategories(productData.category || []);

        setExistingImages(productData.media?.images || []);
        setExistingVideo(productData.media?.video || null);
        setExistingPreviewImages(productData.media?.previewImages || []);

        setDetailsList(
          productData.details?.map((d) => ({
            id: d._id || String(new Date().getTime() + Math.random()),
            _id: d._id,
            size: String(d.size || ""),
            weight: String(d.weight || ""),
            height: String(d.height || ""),
            stock: String(d.stock || ""),
            materialDetails: d.description || "", // 'description' from API maps to 'materialDetails'
          })) || []
        );
      } catch (error) {
        console.error("Failed to load initial data for edit page:", error);
        toast.error("Error loading product data", {
          description: error instanceof Error ? error.message : String(error),
        });
        router.push("/dashboard/products"); // Consider redirecting to a relevant admin path
      } finally {
        setIsLoadingPage(false);
      }
    };

    loadInitialData();
  }, [productId, router]);

  const handleItemSelect = (itemId: string) => {
    const item = allItems.find((i) => i._id === itemId);
    if (item && !selectedItems.some((i) => i._id === itemId)) {
      setSelectedItems([...selectedItems, item]);
    }
  };
  const removeItem = (id: string) =>
    setSelectedItems(selectedItems.filter((item) => item._id !== id));

  const handleCategorySelect = (categoryId: string) => {
    const category = allCategories.find((c) => c._id === categoryId);
    if (category && !selectedCategories.some((c) => c._id === categoryId)) {
      setSelectedCategories([...selectedCategories, category]);
    }
  };
  const removeCategory = (id: string) =>
    setSelectedCategories(
      selectedCategories.filter((category) => category._id !== id)
    );

  const handleNewImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setNewImageFiles((prev) => [...prev, ...files]);
      const previewUrls = files.map((file) => URL.createObjectURL(file));
      setNewImagePreviews((prev) => [...prev, ...previewUrls]);
      if (imageInputRef.current) imageInputRef.current.value = ""; // Reset file input
    }
  };
  const removeExistingImage = (index: number) =>
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  const removeNewImage = (index: number) => {
    URL.revokeObjectURL(newImagePreviews[index]);
    setNewImageFiles((prev) => prev.filter((_, i) => i !== index));
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleNewVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (newVideoPreview) URL.revokeObjectURL(newVideoPreview);
      setNewVideoFile(file);
      setNewVideoPreview(URL.createObjectURL(file));
      if (videoInputRef.current) videoInputRef.current.value = ""; // Reset file input
    }
  };
  const removeExistingVideo = () => {
    setExistingVideo(null);
    // If you want to allow uploading a new video immediately after removing existing one,
    // ensure the upload button becomes visible/active.
  };
  const removeNewVideo = () => {
    if (newVideoPreview) URL.revokeObjectURL(newVideoPreview);
    setNewVideoFile(null);
    setNewVideoPreview(null);
  };

  const handleNewPreviewImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setNewPreviewImageFiles((prev) => [...prev, ...files]);
      const previewUrls = files.map((file) => URL.createObjectURL(file));
      setNewPreviewImagePreviews((prev) => [...prev, ...previewUrls]);
      if (previewImageInputRef.current) previewImageInputRef.current.value = ""; // Reset file input
    }
  };
  const removeExistingPreviewImage = (index: number) =>
    setExistingPreviewImages((prev) => prev.filter((_, i) => i !== index));
  const removeNewPreviewImage = (index: number) => {
    URL.revokeObjectURL(newPreviewImagePreviews[index]);
    setNewPreviewImageFiles((prev) => prev.filter((_, i) => i !== index));
    setNewPreviewImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDetailChange = (
    field: keyof Omit<DetailType, "id" | "_id">,
    value: string
  ) => {
    setCurrentDetail((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddOrUpdateDetail = () => {
    if (
      !currentDetail.size &&
      !currentDetail.weight &&
      !currentDetail.stock &&
      !currentDetail.materialDetails
    ) {
      toast.warning("Please fill at least one field for the detail.");
      return;
    }
    if (editingDetailId) {
      setDetailsList(
        detailsList.map((d) =>
          d.id === editingDetailId
            ? { ...currentDetail, id: editingDetailId, _id: d._id }
            : d
        )
      );
      setEditingDetailId(null);
    } else {
      const newDetailWithId = {
        ...currentDetail,
        id: String(new Date().getTime() + Math.random()),
      };
      setDetailsList([...detailsList, newDetailWithId]);
    }
    setCurrentDetail({
      id: String(new Date().getTime()),
      size: "",
      weight: "",
      height: "",
      stock: "",
      materialDetails: "",
    });
  };

  const handleEditDetail = (detailToEdit: DetailType) => {
    setCurrentDetail(detailToEdit);
    setEditingDetailId(detailToEdit.id);
  };

  const handleDeleteDetail = (idToDelete: string) => {
    setDetailsList(detailsList.filter((d) => d.id !== idToDelete));
    if (editingDetailId === idToDelete) {
      setEditingDetailId(null);
      setCurrentDetail({
        id: String(new Date().getTime()),
        size: "",
        weight: "",
        height: "",
        stock: "",
        materialDetails: "",
      });
    }
  };

  const handleUpdateProduct = async () => {
    setIsUpdating(true);
    try {
      let uploadedNewImageUrls: string[] = [];
      if (newImageFiles.length > 0) {
        uploadedNewImageUrls = await uploadMultipleFiles(
          newImageFiles,
          PRODUCT_IMAGES_BUCKET_ID
        );
      }

      let uploadedNewVideoUrl: string | null = null;
      if (newVideoFile) {
        uploadedNewVideoUrl = await uploadFile(
          newVideoFile,
          PRODUCT_VIDEOS_BUCKET_ID
        );
      }

      let uploadedNewPreviewImageUrls: string[] = [];
      if (newPreviewImageFiles.length > 0) {
        uploadedNewPreviewImageUrls = await uploadMultipleFiles(
          newPreviewImageFiles,
          PREVIEW_IMAGES_BUCKET_ID
        );
      }

      const finalImages = [...existingImages, ...uploadedNewImageUrls];
      const finalVideo = newVideoFile ? uploadedNewVideoUrl : existingVideo; // If new file uploaded, use its URL, else keep existing.
      const finalPreviewImages = [
        ...existingPreviewImages,
        ...uploadedNewPreviewImageUrls,
      ];

      const formattedDetails = detailsList.map((detail) => ({
        ...(detail._id && { _id: detail._id }), // Conditionally include _id if it exists (for updates)
        size: parseFloat(detail.size) || 0,
        weight: parseFloat(detail.weight) || 0,
        height: parseFloat(detail.height) || 0,
        stock: parseInt(detail.stock, 10) || 0,
        description: detail.materialDetails,
      }));

      const productUpdateData = {
        productName,
        making: parseFloat(makingCharge) || 0,
        discount: parseFloat(discount) || 0,
        itemFor: selectedItems.map((item) => item._id),
        category: selectedCategories.map((category) => category._id),
        material: selectedMaterial, // Should be an ID
        metal: selectedMetal, // Should be an ID
        media: {
          images: finalImages,
          video: finalVideo,
          previewImages: finalPreviewImages,
        },
        details: formattedDetails,
        description: productDesc,
      };

      const response = await fetch(`/api/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productUpdateData),
      });

      const result = await response.json();
      if (!response.ok || result.status !== "success") {
        throw new Error(result.message || "Failed to update product");
      }

      toast.success("Product updated successfully!");
      router.push("/dashboard/products");
    } catch (error) {
      console.error("Failed to update product:", error);
      toast.error("Error updating product", {
        description: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    return () => {
      [
        ...newImagePreviews,
        newVideoPreview,
        ...newPreviewImagePreviews,
      ].forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, [newImagePreviews, newVideoPreview, newPreviewImagePreviews]);

  if (isLoadingPage) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
        <p className="mt-4 text-lg text-gray-700">Loading product details...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="container mx-auto p-4 sm:p-6">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                Edit Product
              </h1>
              <p className="text-gray-500 mt-1 text-sm sm:text-base">
                Update details for:{" "}
                <span className="font-semibold">
                  {productName || "product"}
                </span>
              </p>
            </div>
            <div className="flex space-x-2 sm:space-x-3 w-full sm:w-auto">
              <Button
                variant="outline"
                className="border-gray-300 text-gray-700 flex-grow sm:flex-grow-0"
                onClick={() => router.push("/dashboard/products")}
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateProduct}
                className="bg-indigo-600 hover:bg-indigo-700 text-white flex-grow sm:flex-grow-0"
                disabled={isUpdating || isLoadingPage}
              >
                {isUpdating ? (
                  <>
                    <Loader2 size={18} className="mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save size={18} className="mr-2" />
                    Update Product
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Update the core details of the product.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="productName">Product Name</Label>
                  <Input
                    id="productName"
                    placeholder="Enter product name"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="makingCharge">Making Charge (%)</Label>
                    <Input
                      id="makingCharge"
                      type="number"
                      placeholder="e.g. 25"
                      value={makingCharge}
                      onChange={(e) => setMakingCharge(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="discount">Discount (%)</Label>
                    <Input
                      id="discount"
                      type="number"
                      placeholder="e.g. 10"
                      value={discount}
                      onChange={(e) => setDiscount(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label>Items For</Label>
                  <Select
                    onValueChange={handleItemSelect}
                    value=""
                    disabled={loadingApis.items}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue
                        placeholder={
                          loadingApis.items
                            ? "Loading items..."
                            : "Select items to add"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {allItems.map((item) => (
                          <SelectItem
                            key={item._id}
                            value={item._id}
                            disabled={selectedItems.some(
                              (si) => si._id === item._id
                            )}
                          >
                            {item.itemForName}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {selectedItems.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {selectedItems.map((item) => (
                        <Badge
                          key={item._id}
                          variant="secondary"
                          className="flex items-center gap-1 bg-indigo-50 text-indigo-700 pl-3"
                        >
                          {item.itemForName}
                          <button
                            onClick={() => removeItem(item._id)}
                            className="ml-1 p-0.5 hover:bg-indigo-100 rounded-full"
                          >
                            <X size={14} />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <Label>Categories</Label>
                  <Select
                    onValueChange={handleCategorySelect}
                    value=""
                    disabled={loadingApis.categories}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue
                        placeholder={
                          loadingApis.categories
                            ? "Loading categories..."
                            : "Select categories to add"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {allCategories.map((category) => (
                          <SelectItem
                            key={category._id}
                            value={category._id}
                            disabled={selectedCategories.some(
                              (sc) => sc._id === category._id
                            )}
                          >
                            {category.categoryName}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {selectedCategories.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {selectedCategories.map((category) => (
                        <Badge
                          key={category._id}
                          variant="secondary"
                          className="flex items-center gap-1 bg-blue-50 text-blue-700 pl-3"
                        >
                          {category.categoryName}
                          <button
                            onClick={() => removeCategory(category._id)}
                            className="ml-1 p-0.5 hover:bg-blue-100 rounded-full"
                          >
                            <X size={14} />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Metal</Label>
                    <Select
                      onValueChange={setSelectedMetal}
                      value={selectedMetal}
                      disabled={loadingApis.metals}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue
                          placeholder={
                            loadingApis.metals
                              ? "Loading metals..."
                              : "Select metal"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {allMetals.map((metal) => (
                            <SelectItem key={metal._id} value={metal._id}>
                              {metal.metalName}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Material</Label>
                    <Select
                      onValueChange={setSelectedMaterial}
                      value={selectedMaterial}
                      disabled={loadingApis.materials}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue
                          placeholder={
                            loadingApis.materials
                              ? "Loading materials..."
                              : "Select material"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {allMaterials.map((material) => (
                            <SelectItem key={material._id} value={material._id}>
                              {material.materialName}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Media</CardTitle>
                <CardDescription>
                  Update product images, video, and preview images.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Product Images */}
                <div>
                  <Label className="mb-2 block font-medium">
                    Product Images
                  </Label>
                  {existingImages.length > 0 && (
                    <p className="text-xs text-gray-500 mb-2">
                      Existing Images ({existingImages.length}):
                    </p>
                  )}
                  {existingImages.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-4">
                      {existingImages.map((image, index) => (
                        <div
                          key={`existing-img-${index}-${productId}`}
                          className="relative group aspect-square"
                        >
                          <Image
                            src={image}
                            alt={`Existing image ${index + 1}`}
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                            className="object-cover rounded-md border border-gray-200"
                          />
                          <button
                            onClick={() => removeExistingImage(index)}
                            className="absolute top-1 right-1 bg-white/70 hover:bg-white rounded-full p-0.5 shadow-md opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
                          >
                            <X size={14} className="text-red-600" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {newImagePreviews.length > 0 && (
                    <p className="text-xs text-gray-500 mb-2">
                      New Images to Upload ({newImagePreviews.length}):
                    </p>
                  )}
                  {newImagePreviews.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-4">
                      {newImagePreviews.map((preview, index) => (
                        <div
                          key={`new-img-${index}`}
                          className="relative group aspect-square"
                        >
                          <Image
                            src={preview}
                            alt={`New image ${index + 1}`}
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                            className="object-cover rounded-md border border-dashed border-indigo-400"
                          />
                          <button
                            onClick={() => removeNewImage(index)}
                            className="absolute top-1 right-1 bg-white/70 hover:bg-white rounded-full p-0.5 shadow-md opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
                          >
                            <X size={14} className="text-red-600" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div>
                    <input
                      type="file"
                      ref={imageInputRef}
                      onChange={handleNewImageUpload}
                      multiple
                      accept="image/*"
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full py-6 border-dashed border-2"
                      onClick={() => imageInputRef.current?.click()}
                    >
                      <Upload size={18} className="mr-2 text-gray-500" /> Add
                      Product Images
                    </Button>
                  </div>
                </div>

                {/* Product Video */}
                <div>
                  <Label className="mb-2 block font-medium">
                    Product Video
                  </Label>
                  {existingVideo && (
                    <div className="mb-3 relative group">
                      <p className="text-xs text-gray-500 mb-1">
                        Current Video:
                      </p>
                      <div className="relative rounded-lg overflow-hidden border border-gray-200 aspect-video bg-slate-100">
                        <video
                          src={existingVideo}
                          controls
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <button
                        onClick={removeExistingVideo}
                        className="absolute top-1 right-1 bg-white/70 hover:bg-white rounded-full p-0.5 shadow-md opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
                      >
                        <X size={14} className="text-red-600" />
                      </button>
                    </div>
                  )}
                  {newVideoPreview && (
                    <div className="mb-3 relative group">
                      <p className="text-xs text-gray-500 mb-1">
                        New Video to Upload:
                      </p>
                      <div className="relative rounded-lg overflow-hidden border border-dashed border-indigo-400 aspect-video bg-slate-100">
                        <video
                          src={newVideoPreview}
                          controls
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <button
                        onClick={removeNewVideo}
                        className="absolute top-1 right-1 bg-white/70 hover:bg-white rounded-full p-0.5 shadow-md opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
                      >
                        <X size={14} className="text-red-600" />
                      </button>
                    </div>
                  )}
                  {/* Show upload/replace button if no new video is staged */}
                  {!newVideoFile && (
                    <div>
                      <input
                        type="file"
                        ref={videoInputRef}
                        onChange={handleNewVideoUpload}
                        accept="video/*"
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full py-6 border-dashed border-2"
                        onClick={() => videoInputRef.current?.click()}
                      >
                        <PlayCircle size={18} className="mr-2 text-gray-500" />
                        {existingVideo ? "Replace Video" : "Upload New Video"}
                      </Button>
                    </div>
                  )}
                </div>

                {/* Preview Images */}
                <div>
                  <Label className="mb-2 block font-medium">
                    Preview Images (Thumbnails)
                  </Label>
                  {existingPreviewImages.length > 0 && (
                    <p className="text-xs text-gray-500 mb-2">
                      Existing Preview Images ({existingPreviewImages.length}):
                    </p>
                  )}
                  {existingPreviewImages.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-4">
                      {existingPreviewImages.map((image, index) => (
                        <div
                          key={`existing-preview-img-${index}-${productId}`}
                          className="relative group aspect-square"
                        >
                          <Image
                            src={image}
                            alt={`Existing preview ${index + 1}`}
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                            className="object-cover rounded-md border border-gray-200"
                          />
                          <button
                            onClick={() => removeExistingPreviewImage(index)}
                            className="absolute top-1 right-1 bg-white/70 hover:bg-white rounded-full p-0.5 shadow-md opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
                          >
                            <X size={14} className="text-red-600" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {newPreviewImagePreviews.length > 0 && (
                    <p className="text-xs text-gray-500 mb-2">
                      New Preview Images to Upload (
                      {newPreviewImagePreviews.length}):
                    </p>
                  )}
                  {newPreviewImagePreviews.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-4">
                      {newPreviewImagePreviews.map((preview, index) => (
                        <div
                          key={`new-preview-img-${index}`}
                          className="relative group aspect-square"
                        >
                          <Image
                            src={preview}
                            alt={`New preview ${index + 1}`}
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                            className="object-cover rounded-md border border-dashed border-indigo-400"
                          />
                          <button
                            onClick={() => removeNewPreviewImage(index)}
                            className="absolute top-1 right-1 bg-white/70 hover:bg-white rounded-full p-0.5 shadow-md opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
                          >
                            <X size={14} className="text-red-600" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div>
                    <input
                      type="file"
                      ref={previewImageInputRef}
                      onChange={handleNewPreviewImageUpload}
                      multiple
                      accept="image/*"
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full py-6 border-dashed border-2"
                      onClick={() => previewImageInputRef.current?.click()}
                    >
                      <Upload size={18} className="mr-2 text-gray-500" /> Add
                      Preview Images
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Details Section */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Details and Description</CardTitle>
                <CardDescription>
                  Manage different sizes, weights, and stock levels.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Form to add/edit detail */}
                <div className="p-4 border rounded-md bg-slate-50 space-y-3">
                  <h3 className="text-md font-semibold text-gray-700">
                    {editingDetailId
                      ? "Edit Product Detail"
                      : "Product Details"}
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="detailSize" className="text-xs">
                        Size
                      </Label>
                      <Input
                        id="detailSize"
                        value={currentDetail.size}
                        onChange={(e) =>
                          handleDetailChange("size", e.target.value)
                        }
                        placeholder="e.g. 7, M, 18k"
                        className="mt-1 text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="detailWeight" className="text-xs">
                        Weight (gm)
                      </Label>
                      <Input
                        id="detailWeight"
                        type="number"
                        value={currentDetail.weight}
                        onChange={(e) =>
                          handleDetailChange("weight", e.target.value)
                        }
                        placeholder="e.g. 5.5"
                        className="mt-1 text-sm"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="detailHeight" className="text-xs">
                        Height (mm)
                      </Label>
                      <Input
                        id="detailHeight"
                        type="number"
                        value={currentDetail.height}
                        onChange={(e) =>
                          handleDetailChange("height", e.target.value)
                        }
                        placeholder="e.g. 10"
                        className="mt-1 text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="detailStock" className="text-xs">
                        Stock
                      </Label>
                      <Input
                        id="detailStock"
                        type="number"
                        value={currentDetail.stock}
                        onChange={(e) =>
                          handleDetailChange("stock", e.target.value)
                        }
                        placeholder="e.g. 100"
                        className="mt-1 text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="detailMaterialDesc" className="text-xs">
                      Product Description
                    </Label>
                    <Textarea
                      id="detailMaterialDesc"
                      value={currentDetail.materialDetails}
                      onChange={(e) =>
                        handleDetailChange("materialDetails", e.target.value)
                      }
                      placeholder="e.g. 22K Gold, Ring size 12"
                      className="mt-1 min-h-[60px] text-sm"
                    />
                  </div>
                  <Button
                    onClick={handleAddOrUpdateDetail}
                    className="w-full bg-indigo-500 hover:bg-indigo-600 text-sm"
                  >
                    {editingDetailId
                      ? "Update Product Detail"
                      : "Add Product Detail"}
                  </Button>
                  {editingDetailId && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditingDetailId(null);
                        setCurrentDetail({
                          id: String(new Date().getTime()),
                          size: "",
                          weight: "",
                          height: "",
                          stock: "",
                          materialDetails: "",
                        });
                      }}
                      className="w-full text-sm"
                    >
                      Cancel Edit
                    </Button>
                  )}
                </div>

                {/* List of details */}
                {detailsList.length > 0 && (
                  <div className="mt-6 space-y-3">
                    <h3 className="text-md font-semibold text-gray-700">
                      Added Products ({detailsList.length})
                    </h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs">Size</TableHead>
                          <TableHead className="text-xs">Weight</TableHead>
                          <TableHead className="text-xs">Height</TableHead>
                          <TableHead className="text-xs">Stock</TableHead>
                          <TableHead className="text-xs">
                            Product Description
                          </TableHead>
                          <TableHead className="text-xs text-right">
                            Actions
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {detailsList.map((detail) => (
                          <TableRow key={detail.id}>
                            <TableCell className="text-sm">
                              {detail.size || "-"}
                            </TableCell>
                            <TableCell className="text-sm">
                              {detail.weight ? `${detail.weight} gm` : "-"}
                            </TableCell>
                            <TableCell className="text-sm">
                              {detail.height ? `${detail.height} mm` : "-"}
                            </TableCell>
                            <TableCell className="text-sm">
                              {detail.stock || "-"}
                            </TableCell>
                            <TableCell className="text-sm">
                              {detail.materialDetails || "-"}
                            </TableCell>
                            <TableCell className="text-right space-x-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => handleEditDetail(detail)}
                              >
                                <Edit2 size={14} className="text-blue-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => handleDeleteDetail(detail.id)}
                              >
                                <Trash2 size={14} className="text-red-600" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
                {detailsList.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No variants added yet.
                  </p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Product Description</CardTitle>
                <CardDescription>
                  Provide a detailed description for the product.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  id="productDesc"
                  value={productDesc}
                  onChange={(e) => setProductDesc(e.target.value)}
                  placeholder="Write about the product..."
                  className="min-h-[120px]"
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
