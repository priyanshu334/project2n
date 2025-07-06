// app/products/page.tsx (or your Product Management list page)
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  PlusCircle,
  Pencil,
  Trash2,
  PackageSearch,
  HelpCircle,
} from "lucide-react"; // Added icons
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { storage } from "@/lib/appwrite"; // Your Appwrite client initialization

// Define types for Material and Metal (if you fetch them for name mapping)
type MaterialType = {
  _id: string;
  materialName: string;
};

type MetalType = {
  _id: string;
  metalName: string;
};

// Updated Product type
type Product = {
  _id: string;
  productName: string;
  media: {
    images: string[];
    video: string | null; // Video can be null
    previewImages: string[];
  };
  making: number;
  discount: number;
  material: string; // Material ID
  metal: string; // Metal ID
  description: string;
  category: string[]; // Array of Category IDs
  itemFor: string[]; // Array of ItemFor IDs
  createdAt: string;
  updatedAt: string;
  // If your API returns populated material/metal objects, adjust the type:
  // material: MaterialType;
  // metal: MetalType;
};

// Appwrite bucket ID (ensure this is correct)
const BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID; // Replace with your actual bucket ID

if (!BUCKET_ID) {
  throw new Error("APPWRITE BUCKET NOT DEFINED IN ENV");
}

export default function ProductManagementPage() {
  // Renamed for clarity if it's a page
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [allMaterials, setAllMaterials] = useState<MaterialType[]>([]);
  const [allMetals, setAllMetals] = useState<MetalType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch products, materials, and metals concurrently
        const [productsResponse, materialsResponse, metalsResponse] =
          await Promise.all([
            fetch("/api/products"),
            fetch("/api/materials"), // Assuming this is your API endpoint for materials
            fetch("/api/metals"), // Assuming this is your API endpoint for metals
          ]);

        // Process Products
        if (!productsResponse.ok) {
          const errorData = await productsResponse.json();
          throw new Error(errorData.message || "Failed to fetch products");
        }
        const productsData = await productsResponse.json();
        if (
          productsData &&
          productsData.data &&
          Array.isArray(productsData.data)
        ) {
          setProducts(productsData.data);
        } else {
          throw new Error("Invalid product data format received from API");
        }

        // Process Materials
        if (materialsResponse.ok) {
          const materialsData = await materialsResponse.json();
          if (
            materialsData &&
            materialsData.data &&
            Array.isArray(materialsData.data)
          ) {
            setAllMaterials(materialsData.data);
          } else {
            console.warn("Materials data is not in expected format or empty.");
            setAllMaterials([]);
          }
        } else {
          console.warn(
            "Failed to fetch materials. Names might not be displayed."
          );
          setAllMaterials([]);
        }

        // Process Metals
        if (metalsResponse.ok) {
          const metalsData = await metalsResponse.json();
          if (metalsData && metalsData.data && Array.isArray(metalsData.data)) {
            setAllMetals(metalsData.data);
          } else {
            console.warn("Metals data is not in expected format or empty.");
            setAllMetals([]);
          }
        } else {
          console.warn("Failed to fetch metals. Names might not be displayed.");
          setAllMetals([]);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An unknown error occurred";
        setError(errorMessage);
        console.error("Error fetching initial data:", err);
        toast.error("Failed to load data", { description: errorMessage });
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const calculateAverageMaking = () => {
    if (products.length === 0) return 0;
    const totalMaking = products.reduce(
      (sum, product) => sum + (product.making || 0),
      0
    );
    return Math.round(totalMaking / products.length);
  };

  const calculateAverageDiscount = () => {
    if (products.length === 0) return 0;
    const totalDiscount = products.reduce(
      (sum, product) => sum + (product.discount || 0),
      0
    );
    return Math.round(totalDiscount / products.length);
  };

  const handleDelete = async (id: string, productName: string) => {
    // Optional: Add a confirmation dialog before deleting
    if (
      !confirm(
        `Are you sure you want to delete "${productName}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete product");
      }

      setProducts(products.filter((product) => product._id !== id));
      toast.success("Product Deleted", {
        description: `"${productName}" has been successfully removed.`,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete product";
      console.error("Error deleting product:", err);
      toast.error("Deletion Failed", { description: errorMessage });
    }
  };

  const getImageUrl = (fileId: string) => {
    if (!fileId) return "/placeholder.jpg"; // Ensure you have a placeholder image
    try {
      if (fileId.startsWith("http")) return fileId;
      const url = storage.getFileView(BUCKET_ID || "", fileId);
      return url.toString(); // Ensure it's a string
    } catch (error) {
      console.error(
        "Error generating Appwrite image URL:",
        error,
        "File ID:",
        fileId,
        "Bucket ID:",
        BUCKET_ID
      );
      return "/placeholder.jpg";
    }
  };

  const getMainProductImage = (product: Product) => {
    if (product.media?.images?.length > 0) {
      return getImageUrl(product.media.images[0]);
    }
    if (product.media?.previewImages?.length > 0) {
      return getImageUrl(product.media.previewImages[0]);
    }
    return "/placeholder.jpg";
  };

  const formatMaterialName = (materialId: string) => {
    if (!allMaterials.length) return materialId || "N/A"; // Show ID if materials list isn't loaded
    const material = allMaterials.find((m) => m._id === materialId);
    return material ? material.materialName : materialId || "Unknown";
  };

  const formatMetalName = (metalId: string) => {
    if (!allMetals.length) return metalId || "N/A"; // Show ID if metals list isn't loaded
    const metal = allMetals.find((m) => m._id === metalId);
    return metal ? metal.metalName : metalId || "Unknown";
  };

  // Function to handle navigation to edit page
  const handleEdit = (productId: string) => {
    router.push(`/dashboard/products/${productId}`); // Corrected route
  };

  // Function to handle navigation to add page
  const handleAddProduct = () => {
    router.push("/products/add");
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p className="mt-4 text-lg text-gray-700">Loading products...</p>
      </div>
    );
  }

  if (error && !products.length) {
    // Show critical error if no products could be loaded
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50 p-4">
        <HelpCircle size={48} className="text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-red-700 mb-2">
          Failed to Load Products
        </h2>
        <p className="text-gray-600 mb-4 text-center">{error}</p>
        <Button onClick={() => window.location.reload()} variant="outline">
          Try Again
        </Button>
        <p className="text-gray-500 text-sm mt-2">Or Add new Product</p>
        <Button
          onClick={() => router.push("/dashboard/products/add")}
          variant="outline"
          className="mt-2 bg-indigo-600 text-white flex items-center gap-2 rounded-lg px-10 py-5 shadow-md transition-all whitespace-nowrap"
        >
          <PlusCircle size={18} className="mr-2" />
          Add New Product
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-4 sm:p-6">
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                Product Management
              </h1>
              <p className="text-gray-500 mt-1 text-sm sm:text-base">
                Manage your jewelry product catalog.
              </p>
            </div>
            <Button
              onClick={handleAddProduct}
              className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2 rounded-lg px-4 py-2 shadow-md transition-all whitespace-nowrap"
            >
              <PlusCircle size={18} />
              <span>Add New Product</span>
            </Button>
          </div>
          {error &&
            products.length > 0 && ( // Non-critical error (e.g. failed to load materials but products are there)
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-300 text-yellow-700 rounded-md text-sm">
                <strong>Warning:</strong> {error} Some information like
                material/metal names might not be fully displayed.
              </div>
            )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 md:mb-8">
          {[
            { title: "Total Products", value: products.length.toString() },
            {
              title: "Avg. Making Charge",
              value: `${calculateAverageMaking()}%`,
            },
            { title: "Avg. Discount", value: `${calculateAverageDiscount()}%` },
          ].map((stat) => (
            <div
              key={stat.title}
              className="bg-white p-4 sm:p-5 rounded-xl shadow-sm border border-gray-200"
            >
              <div className="text-xs sm:text-sm font-medium text-gray-500 mb-1">
                {stat.title}
              </div>
              <div className="text-xl sm:text-2xl font-bold text-gray-800">
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
              Product Catalog
            </h2>
          </div>
          {products.length === 0 && !loading && (
            <div className="text-center py-12 px-4">
              <PackageSearch size={48} className="text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-1">
                No Products Found
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                It looks like there are no products in your catalog yet.
              </p>
              <Button
                onClick={handleAddProduct}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <PlusCircle size={18} className="mr-2" />
                Add Your First Product
              </Button>
            </div>
          )}

          {products.length > 0 && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 hover:bg-gray-100">
                    <TableHead className="text-gray-600 font-semibold pl-4 sm:pl-6 py-3">
                      Product
                    </TableHead>
                    <TableHead className="text-gray-600 font-semibold py-3">
                      Details
                    </TableHead>
                    <TableHead className="text-gray-600 font-semibold py-3">
                      Categories
                    </TableHead>
                    <TableHead className="text-gray-600 font-semibold py-3 text-right pr-4 sm:pr-6">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow
                      key={product._id}
                      className="hover:bg-gray-50/50 transition-colors border-b border-gray-100 last:border-b-0"
                    >
                      <TableCell className="py-3 pl-4 sm:pl-6 align-top">
                        <div className="flex items-start space-x-3 sm:space-x-4 max-w-xs sm:max-w-sm md:max-w-md">
                          <div className="h-16 w-16 sm:h-20 sm:w-20 relative rounded-md overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                            <Image
                              src={getMainProductImage(product)}
                              alt={product.productName}
                              fill
                              sizes="(max-width: 640px) 80px, 100px"
                              className="object-cover"
                              onError={(e) => {
                                e.currentTarget.src = "/placeholder.jpg";
                              }} // Fallback for broken images
                            />
                          </div>
                          <div className="pt-1">
                            <div className="font-medium text-gray-800 text-sm sm:text-base leading-tight">
                              {product.productName}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              ID: {product._id}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-3 align-top text-xs sm:text-sm">
                        <div className="space-y-1">
                          <Badge
                            variant="outline"
                            className="bg-blue-50 text-blue-700 border-blue-200 font-medium py-0.5 px-1.5 text-[11px] sm:text-xs"
                          >
                            Making: {product.making || 0}%
                          </Badge>
                          <Badge
                            variant="outline"
                            className="bg-green-50 text-green-700 border-green-200 font-medium py-0.5 px-1.5 text-[11px] sm:text-xs"
                          >
                            Discount: {product.discount || 0}%
                          </Badge>
                          <Badge
                            variant="outline"
                            className="bg-amber-50 text-amber-700 border-amber-200 font-medium py-0.5 px-1.5 text-[11px] sm:text-xs whitespace-nowrap"
                          >
                            Material: {formatMaterialName(product.material)}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="bg-purple-50 text-purple-700 border-purple-200 font-medium py-0.5 px-1.5 text-[11px] sm:text-xs whitespace-nowrap"
                          >
                            Metal: {formatMetalName(product.metal)}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="py-3 align-top text-xs sm:text-sm">
                        <div className="space-y-1">
                          <Badge
                            variant="secondary"
                            className="font-normal py-0.5 px-1.5 text-[11px] sm:text-xs"
                          >
                            Categories: {product.category?.length || 0}
                          </Badge>
                          <Badge
                            variant="secondary"
                            className="font-normal py-0.5 px-1.5 text-[11px] sm:text-xs"
                          >
                            Items For: {product.itemFor?.length || 0}
                          </Badge>
                          {/* To display names, you'd fetch allCategories/allItems and map IDs to names here */}
                        </div>
                      </TableCell>
                      <TableCell className="py-3 pr-4 sm:pr-6 text-right align-top">
                        <div className="flex flex-col sm:flex-row justify-end items-end sm:items-center gap-1 sm:gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(product._id)}
                            className="border-gray-300 text-gray-700 hover:text-indigo-600 hover:border-indigo-400 hover:bg-indigo-50 rounded-md text-xs px-2.5 py-1.5"
                          >
                            <Pencil size={14} className="mr-1 sm:mr-1.5" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleDelete(product._id, product.productName)
                            }
                            className="border-gray-300 text-gray-700 hover:text-red-600 hover:border-red-400 hover:bg-red-50 rounded-md text-xs px-2.5 py-1.5"
                          >
                            <Trash2 size={14} className="mr-1 sm:mr-1.5" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {products.length > 0 && (
            <div className="p-3 sm:p-4 bg-gray-50 text-gray-500 text-xs sm:text-sm border-t border-gray-200">
              Showing {products.length} of {products.length} products.{" "}
              {/* Update if pagination is added */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
