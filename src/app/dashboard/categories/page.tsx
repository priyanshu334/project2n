"use client";
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pencil, Trash2, Loader2, Search, Plus, Filter } from "lucide-react";
import { toast } from "sonner";

// Define Category type
interface Category {
  _id: string;
  categoryName: string;
  parentCategoryId: string | null;
}

export default function CategoryManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [parentFilter, setParentFilter] = useState("all");
  const [newCategory, setNewCategory] = useState({
    categoryName: "",
    parentCategoryId: null as string | null,
  });

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/categories");
      console.log(response);
      const result = await response.json();
      console.log(result);

      if (result.status === "success") {
        setCategories(result.data);
      } else {
        toast.error("Failed to fetch categories");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to connect to the server");
    } finally {
      setLoading(false);
    }
  };

  // Filter categories based on search term and parent filter
  const filteredCategories = useMemo(() => {
    let filtered = categories;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((category) =>
        category.categoryName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by parent category
    if (parentFilter !== "all") {
      if (parentFilter === "root") {
        filtered = filtered.filter((category) => !category.parentCategoryId);
      } else if (parentFilter === "child") {
        filtered = filtered.filter((category) => category.parentCategoryId);
      }
    }

    return filtered;
  }, [categories, searchTerm, parentFilter]);

  const handleAddCategory = async () => {
    if (newCategory.categoryName.trim()) {
      setSubmitting(true);

      try {
        if (editingCategory) {
          // Edit existing category
          const response = await fetch(
            `/api/categories/${editingCategory._id}`,
            {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                categoryName: newCategory.categoryName,
                parentCategoryId: newCategory.parentCategoryId,
              }),
            }
          );

          const result = await response.json();

          if (result.status === "success") {
            toast.success("Category updated successfully");
            fetchCategories(); // Refresh the list
          } else {
            toast.error(result.message || "Failed to update category");
          }
        } else {
          // Add new category
          const response = await fetch("/api/categories", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              categoryName: newCategory.categoryName,
              parentCategoryId: newCategory.parentCategoryId,
            }),
          });

          const result = await response.json();

          if (result.status === "success") {
            toast.success("Category created successfully");
            fetchCategories(); // Refresh the list
          } else {
            toast.error(result.message || "Failed to create category");
          }
        }
      } catch (error) {
        toast.error("An unexpected error occurred");
        console.error(error);
      } finally {
        setSubmitting(false);
        resetForm();
      }
    }
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setNewCategory({
      categoryName: category.categoryName,
      parentCategoryId: category.parentCategoryId,
    });
    setIsDialogOpen(true);
  };

  const handleDeleteCategory = async (id: string) => {
    if (confirm("Are you sure you want to delete this category?")) {
      try {
        const response = await fetch(`/api/categories/${id}`, {
          method: "DELETE",
        });

        const result = await response.json();

        if (result.status === "success") {
          toast.success("Category deleted successfully");
          fetchCategories(); // Refresh the list
        } else {
          toast.error(result.message || "Failed to delete category");
        }
      } catch (error) {
        console.error(error);
        toast.error("An unexpected error occurred");
      }
    }
  };

  const resetForm = () => {
    setIsDialogOpen(false);
    setEditingCategory(null);
    setNewCategory({ categoryName: "", parentCategoryId: null });
  };

  // Find category name by ID
  const getCategoryNameById = (id: string | null) => {
    if (!id) return "None";
    const category = categories.find((cat) => cat._id === id);
    return category ? category.categoryName : "Unknown";
  };

  // Get unique parent categories for filter
  const parentCategories = useMemo(() => {
    const parents = categories.filter(cat => cat.parentCategoryId === null);
    return parents;
  }, [categories]);

  return (
    <div className="w-full bg-white shadow-sm rounded-lg border border-gray-200">
      {/* Header Section */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Category Management</h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage your product categories and hierarchies
            </p>
          </div>
          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}
          >
            <DialogTrigger asChild>
              <Button className="bg-blue-600 text-white hover:bg-blue-700 shadow-sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-lg">
                  {editingCategory ? "Edit Category" : "Add New Category"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Category Name
                  </label>
                  <Input
                    placeholder="Enter category name"
                    value={newCategory.categoryName}
                    onChange={(e) =>
                      setNewCategory({
                        ...newCategory,
                        categoryName: e.target.value,
                      })
                    }
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Parent Category
                  </label>
                  <Select
                    value={newCategory.parentCategoryId || "none"}
                    onValueChange={(value) =>
                      setNewCategory({
                        ...newCategory,
                        parentCategoryId: value === "none" ? null : value,
                      })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select parent category (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {categories.map(
                        (category) =>
                          // Don't allow a category to be its own parent
                          editingCategory?._id !== category._id && (
                            <SelectItem key={category._id} value={category._id}>
                              {category.categoryName}
                            </SelectItem>
                          )
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleAddCategory}
                  className="w-full bg-green-600 text-white hover:bg-green-700"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {editingCategory ? "Updating..." : "Saving..."}
                    </>
                  ) : editingCategory ? (
                    "Update Category"
                  ) : (
                    "Save Category"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filter Section */}
        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-50 border-gray-200 focus:bg-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <Select value={parentFilter} onValueChange={setParentFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="root">Root Categories</SelectItem>
                <SelectItem value="child">Child Categories</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredCategories.length} of {categories.length} categories
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    S.NO.
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Category Name
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Parent Category
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredCategories.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-12 text-center text-gray-500">
                      {searchTerm || parentFilter !== "all" ? (
                        <div className="space-y-2">
                          <p>No categories found matching your criteria.</p>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setSearchTerm("");
                              setParentFilter("all");
                            }}
                            className="text-sm"
                          >
                            Clear filters
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <p>No categories found.</p>
                          <p className="text-sm text-gray-400">
                            Create your first category to get started!
                          </p>
                        </div>
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredCategories.map((category, index) => (
                    <tr key={category._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-900">
                            {category.categoryName}
                          </span>
                          {!category.parentCategoryId && (
                            <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                              Root
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {getCategoryNameById(category.parentCategoryId)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditCategory(category)}
                            className="hover:bg-gray-100"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteCategory(category._id)}
                            className="bg-red-500 text-white hover:bg-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}