"use client";
import React, { useState, useEffect, useMemo } from "react";
import { 
  Trash2, 
  Edit, 
  Loader2, 
  Search, 
  Plus, 
  X, 
  Check,
  AlertCircle,
  CheckCircle 
} from "lucide-react";

interface ItemFor {
  _id: string;
  itemForName: string;
}

export default function ItemForManagementPage() {
  const [itemFor, setItemFor] = useState<ItemFor[]>([]);
  const [newItemFor, setNewItemFor] = useState("");
  const [editingItemFor, setEditingItemFor] = useState<ItemFor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch all items on component mount
  useEffect(() => {
    fetchItemFor();
  }, []);

  // Clear messages after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Filter items based on search term
  const filteredItems = useMemo(() => {
    if (!searchTerm) return itemFor;
    return itemFor.filter(item =>
      item.itemForName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [itemFor, searchTerm]);

  const fetchItemFor = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/item-fors");
      const result = await response.json();

      if (result.status === "success") {
        setItemFor(result.data);
      } else {
        setError(result.message || "Failed to fetch items");
      }
    } catch (err) {
      setError("An error occurred while fetching items");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddItemFor = async () => {
    if (newItemFor.trim()) {
      setIsSubmitting(true);
      setError(null);

      try {
        if (editingItemFor) {
          // Update existing item
          const response = await fetch(`/api/item-fors/${editingItemFor._id}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ itemForName: newItemFor.trim() }),
          });

          const result = await response.json();

          if (result.status === "success") {
            setSuccessMessage("Item updated successfully");
            // Update local state
            setItemFor(
              itemFor.map((item) =>
                item._id === editingItemFor._id
                  ? { ...item, itemForName: newItemFor.trim() }
                  : item
              )
            );
            setEditingItemFor(null);
          } else {
            setError(result.message || "Failed to update item");
          }
        } else {
          // Add new item
          const response = await fetch("/api/item-fors", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ itemForName: newItemFor.trim() }),
          });

          const result = await response.json();

          if (result.status === "success") {
            setSuccessMessage("Item added successfully");
            // Add to local state
            setItemFor([...itemFor, result.data]);
          } else {
            setError(result.message || "Failed to add item");
          }
        }
      } catch (err) {
        setError("An error occurred");
        console.error(err);
      } finally {
        setIsSubmitting(false);
        setNewItemFor("");
      }
    }
  };

  const handleDeleteItemFor = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/item-fors/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.status === "success") {
        setSuccessMessage("Item deleted successfully");
        // Update local state
        setItemFor(itemFor.filter((item) => item._id !== id));

        // Cancel editing if the item being edited is deleted
        if (editingItemFor?._id === id) {
          setEditingItemFor(null);
          setNewItemFor("");
        }
      } else {
        setError(result.message || "Failed to delete item");
      }
    } catch (err) {
      setError("An error occurred while deleting item");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditItemFor = (item: ItemFor) => {
    setEditingItemFor(item);
    setNewItemFor(item.itemForName);
    setError(null);
  };

  const cancelEdit = () => {
    setEditingItemFor(null);
    setNewItemFor("");
    setError(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddItemFor();
    }
    if (e.key === 'Escape') {
      cancelEdit();
    }
  };

  return (
    <div className="w-full bg-white shadow-sm rounded-lg border border-gray-200">
      {/* Header Section */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Item For Management</h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage items and their purposes
            </p>
          </div>
          <div className="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
            {itemFor.length} {itemFor.length === 1 ? 'item' : 'items'} total
          </div>
        </div>

        {/* Alert Messages */}
        {error && (
          <div className="mt-4 p-4 border border-red-200 rounded-lg bg-red-50 text-red-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">{error}</span>
            <button 
              onClick={() => setError(null)}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {successMessage && (
          <div className="mt-4 p-4 border border-green-200 rounded-lg bg-green-50 text-green-800 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">{successMessage}</span>
            <button 
              onClick={() => setSuccessMessage(null)}
              className="ml-auto text-green-600 hover:text-green-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Add/Edit Form */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {editingItemFor ? 'Edit Item Name' : 'Add New Item'}
              </label>
              <input
                type="text"
                placeholder="Enter item name..."
                value={newItemFor}
                onChange={(e) => setNewItemFor(e.target.value)}
                onKeyDown={handleKeyPress}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                disabled={isSubmitting}
              />
            </div>
            <div className="flex gap-2 sm:items-end">
              <button
                onClick={handleAddItemFor}
                disabled={!newItemFor.trim() || isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : editingItemFor ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                {editingItemFor ? "Update" : "Add Item"}
              </button>
              {editingItemFor && (
                <button
                  className="px-4 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
                  onClick={cancelEdit}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            />
          </div>
          <div className="mt-2 text-sm text-gray-600">
            Showing {filteredItems.length} of {itemFor.length} items
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
              <p className="text-gray-500">Loading items...</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 w-20">
                    S.NO.
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Item Name
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 w-32">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredItems.length > 0 ? (
                  filteredItems.map((item, index) => (
                    <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                        {index + 1}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-900">
                            {item.itemForName}
                          </span>
                          {editingItemFor?._id === item._id && (
                            <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                              Editing
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center gap-2">
                          <button
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors disabled:opacity-50"
                            onClick={() => handleEditItemFor(item)}
                            disabled={isSubmitting}
                            title="Edit item"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                            onClick={() => handleDeleteItemFor(item._id)}
                            disabled={isSubmitting}
                            title="Delete item"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-4 py-12 text-center text-gray-500">
                      {searchTerm ? (
                        <div className="space-y-2">
                          <p>No items found matching "{searchTerm}"</p>
                          <button
                            onClick={() => setSearchTerm("")}
                            className="text-blue-600 hover:text-blue-800 text-sm underline"
                          >
                            Clear search
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <p>No items found.</p>
                          <p className="text-sm text-gray-400">
                            Add your first item to get started!
                          </p>
                        </div>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}