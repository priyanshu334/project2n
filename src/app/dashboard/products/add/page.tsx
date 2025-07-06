// app/add-product/page.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { uploadFile, uploadMultipleFiles } from "@/lib/upload";
import Image from "next/image";
import { Save, X, Upload, Edit2, Trash2, PlayCircle } from "lucide-react";

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

// Type definitions
type ItemType = {
  _id: string;
  itemForName: string;
};

type CategoryType = {
  _id: string;
  categoryName: string;
  parentCategoryId?: string;
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
  id: string;
  size: string;
  weight: string;
  height: string;
  stock: string;
  materialDetails: string;
};

export default function AddProduct() {
  const router = useRouter();

  // Refs for file inputs
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const previewImageInputRef = useRef<HTMLInputElement>(null);
  const [productName, setProductName] = useState("");
  const [makingCharge, setMakingCharge] = useState("");
  const [discount, setDiscount] = useState("");

  // API Data states
  const [allItems, setAllItems] = useState<ItemType[]>([]);
  const [allCategories, setAllCategories] = useState<CategoryType[]>([]);
  const [allMetals, setAllMetals] = useState<MetalType[]>([]);
  const [allMaterials, setAllMaterials] = useState<MaterialType[]>([]);

  // Loading states
  const [loading, setLoading] = useState({
    items: false,
    categories: false,
    metals: false,
    materials: false,
  });

  // Selected Values
  const [selectedItems, setSelectedItems] = useState<ItemType[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<CategoryType[]>(
    []
  );
  const [selectedMetal, setSelectedMetal] = useState("");
  const [selectedMaterial, setSelectedMaterial] = useState("");

  // Media States
  const [images, setImages] = useState<string[]>([]);
  const [video, setVideo] = useState<string | null>(null);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [previewImageFiles, setPreviewImageFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Details Section
  const [currentDetail, setCurrentDetail] = useState<DetailType>({
    id: "",
    size: "",
    weight: "",
    height: "",
    stock: "",
    materialDetails: "",
  });

  const [detailsList, setDetailsList] = useState<DetailType[]>([]);
  const [editingDetailId, setEditingDetailId] = useState<string | null>(null);
  const [productDesc, setProductDesc] = useState("");

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading((prev) => ({ ...prev, items: true }));
        const response = await fetch("/api/item-fors");
        const result = await response.json();
        if (result.status === "success") {
          setAllItems(result.data);
        }
      } catch (error) {
        console.error("Failed to fetch items:", error);
      } finally {
        setLoading((prev) => ({ ...prev, items: false }));
      }
    };

    const fetchCategories = async () => {
      try {
        setLoading((prev) => ({ ...prev, categories: true }));
        const response = await fetch("/api/categories");
        const result = await response.json();
        if (result.status === "success") {
          setAllCategories(result.data);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setLoading((prev) => ({ ...prev, categories: false }));
      }
    };

    const fetchMetals = async () => {
      try {
        setLoading((prev) => ({ ...prev, metals: true }));
        const response = await fetch("/api/metals");
        const result = await response.json();
        console.log(result);
        if (result.status === "success") {
          setAllMetals(result.data);
        }
      } catch (error) {
        console.error("Failed to fetch metals:", error);
      } finally {
        setLoading((prev) => ({ ...prev, metals: false }));
      }
    };

    const fetchMaterials = async () => {
      try {
        setLoading((prev) => ({ ...prev, materials: true }));
        const response = await fetch("/api/materials");
        const result = await response.json();
        if (result.status === "success") {
          setAllMaterials(result.data);
        }
      } catch (error) {
        console.error("Failed to fetch materials:", error);
      } finally {
        setLoading((prev) => ({ ...prev, materials: false }));
      }
    };

    fetchItems();
    fetchCategories();
    fetchMetals();
    fetchMaterials();
  }, []);

  const handleItemSelect = (itemId: string) => {
    const item = allItems.find((i) => i._id === itemId);
    if (item && !selectedItems.some((i) => i._id === itemId)) {
      setSelectedItems([...selectedItems, item]);
    }
  };
  const handleCategorySelect = (categoryId: string) => {
    const category = allCategories.find((c) => c._id === categoryId);
    if (category && !selectedCategories.some((c) => c._id === categoryId)) {
      setSelectedCategories([...selectedCategories, category]);
    }
  };
  const removeItem = (id: string) => {
    setSelectedItems(selectedItems.filter((item) => item._id !== id));
  };
  const removeCategory = (id: string) => {
    setSelectedCategories(
      selectedCategories.filter((category) => category._id !== id)
    );
  };
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      // Store the file objects for later upload
      setImageFiles([...imageFiles, ...files]);
      // Create preview URLs for display
      const newImages = files.map((file) => URL.createObjectURL(file));
      setImages([...images, ...newImages]);
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      // Store the file object for later upload
      setVideoFile(file);
      // Create preview URL for display
      setVideo(URL.createObjectURL(file));
    }
  };
  const handlePreviewImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      // Store the file objects for later upload
      setPreviewImageFiles([...previewImageFiles, ...files]);
      // Create preview URLs for display
      const newImages = files.map((file) => URL.createObjectURL(file));
      setPreviewImages([...previewImages, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);

    const newImageFiles = [...imageFiles];
    newImageFiles.splice(index, 1);
    setImageFiles(newImageFiles);
  };
  const removeVideo = () => {
    setVideo(null);
    setVideoFile(null);
  };
  const removePreviewImage = (index: number) => {
    const newImages = [...previewImages];
    newImages.splice(index, 1);
    setPreviewImages(newImages);

    const newPreviewImageFiles = [...previewImageFiles];
    newPreviewImageFiles.splice(index, 1);
    setPreviewImageFiles(newPreviewImageFiles);
  };
  const handleDetailChange = (field: keyof DetailType, value: string) => {
    setCurrentDetail({
      ...currentDetail,
      [field]: value,
    });
  };

  const handleAddDetail = () => {
    if (editingDetailId) {
      setDetailsList(
        detailsList.map((detail) =>
          detail.id === editingDetailId
            ? { ...currentDetail, id: editingDetailId }
            : detail
        )
      );
      setEditingDetailId(null);
    } else {
      const newDetail = {
        ...currentDetail,
        id: Date.now().toString(),
      };
      setDetailsList([...detailsList, newDetail]);
    }

    // Reset form
    setCurrentDetail({
      id: "",
      size: "",
      weight: "",
      height: "",
      stock: "",
      materialDetails: "",
    });
  };

  // Edit Detail
  const handleEditDetail = (detail: DetailType) => {
    setCurrentDetail(detail);
    setEditingDetailId(detail.id);
  };

  // Delete Detail
  const handleDeleteDetail = (id: string) => {
    setDetailsList(detailsList.filter((detail) => detail.id !== id));
    if (editingDetailId === id) {
      setEditingDetailId(null);
      setCurrentDetail({
        id: "",
        size: "",
        weight: "",
        height: "",
        stock: "",
        materialDetails: "",
      });
    }
  };

  // Save Product

  const handleSaveProduct = async () => {
    try {
      setIsUploading(true);

      if (!process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID) {
        throw new Error("APPWRITE BUCKET ID NOT DEFINED IN ENV");
      }
      // Define your Appwrite bucket IDs
      const PRODUCT_IMAGES_BUCKET_ID =
        process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID;
      const PRODUCT_VIDEOS_BUCKET_ID =
        process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID;
      const PREVIEW_IMAGES_BUCKET_ID =
        process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID;

      // Upload all files and get their URLs
      let imageUrls: string[] = [];
      let videoUrl: string | null = null;
      let previewImageUrls: string[] = [];

      // Upload product images if any
      if (imageFiles.length > 0) {
        imageUrls = await uploadMultipleFiles(
          imageFiles,
          PRODUCT_IMAGES_BUCKET_ID
        );
      }

      // Upload video if any
      if (videoFile) {
        videoUrl = await uploadFile(videoFile, PRODUCT_VIDEOS_BUCKET_ID);
      }

      // Upload preview images if any
      if (previewImageFiles.length > 0) {
        previewImageUrls = await uploadMultipleFiles(
          previewImageFiles,
          PREVIEW_IMAGES_BUCKET_ID
        );
      }

      const formattedDetails = detailsList.map((detail) => ({
        size: parseFloat(detail.size) || 0,
        weight: parseFloat(detail.weight) || 0,
        height: parseFloat(detail.height) || 0,
        stock: parseInt(detail.stock) || 0,
        description: detail.materialDetails,
      }));

      // Prepare the product data with file URLs
      const productData = {
        productName: productName,
        making: parseFloat(makingCharge) || 0,
        discount: parseFloat(discount) || 0,
        itemFor: selectedItems.map((item) => item._id),
        category: selectedCategories.map((category) => category._id),
        material: selectedMaterial,
        metal: selectedMetal,
        media: {
          images: imageUrls.length > 0 ? imageUrls : ["placeholder-image-url"], // Ensure at least one image
          video: videoUrl || "placeholder-video-url", // Ensure video is not null
          previewImages: previewImageUrls,
        },
        details: formattedDetails,
        description: productDesc,
      };

      console.log("Product data with file URLs:", productData);

      // Here you would send productData to your API
      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to create product");
      }

      console.log("Product created successfully:", result);

      // Navigate back to product list on success
      router.push("/dashboard/products");
    } catch (error) {
      console.error("Failed to save product:", error);
      // Implement proper error handling for the user
      alert(
        `Error saving product: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Add New Product
              </h1>
              <p className="text-gray-500 mt-1">
                Create a new jewelry product with detailed specifications
              </p>
            </div>
            <div className="space-x-3">
              <Button
                variant="outline"
                className="border-gray-300 text-gray-700"
                onClick={() => router.push("/")}
              >
                Cancel
              </Button>

              <Button
                onClick={handleSaveProduct}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <span className="animate-spin mr-2">⟳</span>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Save size={18} className="mr-2" />
                    Save Product
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Product Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Enter the core details of your product
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
                      placeholder="e.g. 25%"
                      value={makingCharge}
                      onChange={(e) => setMakingCharge(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="discount">Discount (%)</Label>
                    <Input
                      id="discount"
                      placeholder="e.g. 10%"
                      value={discount}
                      onChange={(e) => setDiscount(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* Item Selection */}
                <div>
                  <Label>Items</Label>
                  <Select onValueChange={handleItemSelect}>
                    <SelectTrigger className="mt-1">
                      <SelectValue
                        placeholder={
                          loading.items ? "Loading items..." : "Select items"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {allItems.map((item) => (
                          <SelectItem key={item._id} value={item._id}>
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
                            className="ml-1 p-1 hover:bg-indigo-100 rounded-full"
                          >
                            <X size={14} />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Category Selection */}
                <div>
                  <Label>Categories</Label>
                  <Select onValueChange={handleCategorySelect}>
                    <SelectTrigger className="mt-1">
                      <SelectValue
                        placeholder={
                          loading.categories
                            ? "Loading categories..."
                            : "Select categories"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {allCategories.map((category) => (
                          <SelectItem key={category._id} value={category._id}>
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
                            className="ml-1 p-1 hover:bg-blue-100 rounded-full"
                          >
                            <X size={14} />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Metal & Material */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Metal</Label>
                    <Select onValueChange={setSelectedMetal}>
                      <SelectTrigger className="mt-1">
                        <SelectValue
                          placeholder={
                            loading.metals
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
                    <Select onValueChange={setSelectedMaterial}>
                      <SelectTrigger className="mt-1">
                        <SelectValue
                          placeholder={
                            loading.materials
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

            {/* Media Upload Section */}
            <Card>
              <CardHeader>
                <CardTitle>Media</CardTitle>
                <CardDescription>
                  Upload product images and videos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Product Images */}
                <div>
                  <Label className="mb-2 block">Product Images</Label>

                  {/* Uploaded Images Display */}
                  {images.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
                      {images.map((image, index) => (
                        <div key={index} className="relative group">
                          <div className="h-32 w-full relative rounded-lg overflow-hidden border border-gray-200">
                            <Image
                              src={image}
                              alt={`Product image ${index + 1}`}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <button
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={16} className="text-red-500" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Image Upload Button */}
                  <div>
                    <input
                      type="file"
                      ref={imageInputRef}
                      onChange={handleImageUpload}
                      multiple
                      accept="image/*"
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full py-8 border-dashed border-2"
                      onClick={() => imageInputRef.current?.click()}
                    >
                      <Upload size={20} className="mr-2 text-gray-500" />
                      Upload Images
                    </Button>
                  </div>
                </div>

                {/* Product Video */}
                <div>
                  <Label className="mb-2 block">Product Video</Label>

                  {/* Uploaded Video Display */}
                  {video && (
                    <div className="mb-4 relative group">
                      <div className="relative rounded-lg overflow-hidden border border-gray-200 aspect-video">
                        <video
                          src={video}
                          controls
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        onClick={removeVideo}
                        className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={16} className="text-red-500" />
                      </button>
                    </div>
                  )}

                  {/* Video Upload Button */}
                  {!video && (
                    <div>
                      <input
                        type="file"
                        ref={videoInputRef}
                        onChange={handleVideoUpload}
                        accept="video/*"
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full py-8 border-dashed border-2"
                        onClick={() => videoInputRef.current?.click()}
                      >
                        <PlayCircle size={20} className="mr-2 text-gray-500" />
                        Upload Video
                      </Button>
                    </div>
                  )}
                </div>

                {/* Preview Images */}
                <div>
                  <Label className="mb-2 block">Preview Images</Label>

                  {/* Uploaded Preview Images Display */}
                  {previewImages.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
                      {previewImages.map((image, index) => (
                        <div key={index} className="relative group">
                          <div className="h-32 w-full relative rounded-lg overflow-hidden border border-gray-200">
                            <Image
                              src={image}
                              alt={`Preview image ${index + 1}`}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <button
                            onClick={() => removePreviewImage(index)}
                            className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={16} className="text-red-500" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Preview Image Upload Button */}
                  <div>
                    <input
                      type="file"
                      ref={previewImageInputRef}
                      onChange={handlePreviewImageUpload}
                      multiple
                      accept="image/*"
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full py-8 border-dashed border-2"
                      onClick={() => previewImageInputRef.current?.click()}
                    >
                      <Upload size={20} className="mr-2 text-gray-500" />
                      Upload Preview Images
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Details & Description */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Details & Description</CardTitle>
                <CardDescription>Add product specifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Details Form */}
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h3 className="font-medium text-lg mb-3">Product Details</h3>

                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="size">Size</Label>
                      <Input
                        id="size"
                        placeholder="e.g. 7mm"
                        value={currentDetail.size}
                        onChange={(e) =>
                          handleDetailChange("size", e.target.value)
                        }
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="weight">Weight</Label>
                      <Input
                        id="weight"
                        placeholder="e.g. 3g"
                        value={currentDetail.weight}
                        onChange={(e) =>
                          handleDetailChange("weight", e.target.value)
                        }
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="height">Height</Label>
                      <Input
                        id="height"
                        placeholder="e.g. 10mm"
                        value={currentDetail.height}
                        onChange={(e) =>
                          handleDetailChange("height", e.target.value)
                        }
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="stock">Stock</Label>
                      <Input
                        id="stock"
                        placeholder="e.g. 50"
                        value={currentDetail.stock}
                        onChange={(e) =>
                          handleDetailChange("stock", e.target.value)
                        }
                        className="mt-1"
                        type="number"
                      />
                    </div>

                    <div>
                      <Label htmlFor="materialDetails">Material Details</Label>
                      <Textarea
                        id="materialDetails"
                        placeholder="Enter material details"
                        value={currentDetail.materialDetails}
                        onChange={(e) =>
                          handleDetailChange("materialDetails", e.target.value)
                        }
                        className="mt-1"
                        rows={3}
                      />
                    </div>

                    <Button onClick={handleAddDetail} className="w-full">
                      {editingDetailId ? "Update Detail" : "Add Detail"}
                    </Button>
                  </div>
                </div>

                {/* Details Table */}
                {detailsList.length > 0 && (
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead className="text-xs">Size</TableHead>
                          <TableHead className="text-xs">Weight</TableHead>
                          <TableHead className="text-xs">Height</TableHead>
                          <TableHead className="text-xs">Stock</TableHead>
                          <TableHead className="text-xs">
                            Material Details
                          </TableHead>
                          <TableHead className="text-xs">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {detailsList.map((detail) => (
                          <TableRow key={detail.id}>
                            <TableCell className="text-sm">
                              {detail.size}
                            </TableCell>
                            <TableCell className="text-sm">
                              {detail.weight}
                            </TableCell>
                            <TableCell className="text-sm">
                              {detail.height}
                            </TableCell>
                            <TableCell className="text-sm">
                              {detail.stock}
                            </TableCell>
                            <TableCell className="text-sm">
                              {detail.materialDetails}
                            </TableCell>
                            <TableCell className="space-x-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0"
                                onClick={() => handleEditDetail(detail)}
                              >
                                <Edit2 size={14} />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 text-red-500"
                                onClick={() => handleDeleteDetail(detail.id)}
                              >
                                <Trash2 size={14} />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}

                {/* Product Description */}
                <div>
                  <Label htmlFor="productDescription">
                    Product Description
                  </Label>
                  <Textarea
                    id="productDescription"
                    placeholder="Enter detailed product description"
                    value={productDesc}
                    onChange={(e) => setProductDesc(e.target.value)}
                    className="mt-1"
                    rows={6}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Save Button (Mobile) */}
            <div className="lg:hidden">
              <Button
                onClick={handleSaveProduct}
                className="bg-indigo-600 hover:bg-indigo-700 text-white w-full"
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <span className="animate-spin mr-2">⟳</span>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Save size={18} className="mr-2" />
                    Save Product
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
