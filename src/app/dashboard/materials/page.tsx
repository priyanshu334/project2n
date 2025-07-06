"use client";
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, Edit, Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Material {
  _id: string;
  materialName: string;
}

export default function MaterialsManagementPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [newMaterial, setNewMaterial] = useState("");
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch all materials on component mount
  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/materials");
      const result = await response.json();

      if (result.status === "success") {
        setMaterials(result.data);
      } else {
        setError(result.message || "Failed to fetch materials");
      }
    } catch (err) {
      setError("An error occurred while fetching materials");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMaterial = async () => {
    if (newMaterial.trim()) {
      setIsSubmitting(true);
      setError(null);

      try {
        if (editingMaterial) {
          // Update existing material
          const response = await fetch(
            `/api/materials/${editingMaterial._id}`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ materialName: newMaterial.trim() }),
            }
          );

          const result = await response.json();

          if (result.status === "success") {
            setSuccessMessage("Material updated successfully");
            // Update local state
            setMaterials(
              materials.map((material) =>
                material._id === editingMaterial._id
                  ? { ...material, materialName: newMaterial.trim() }
                  : material
              )
            );
            setEditingMaterial(null);
          } else {
            setError(result.message || "Failed to update material");
          }
        } else {
          // Add new material
          const response = await fetch("/api/materials", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ materialName: newMaterial.trim() }),
          });

          const result = await response.json();

          if (result.status === "success") {
            setSuccessMessage("Material added successfully");
            // Add to local state
            setMaterials([...materials, result.data]);
          } else {
            setError(result.message || "Failed to add material");
          }
        }
      } catch (err) {
        setError("An error occurred");
        console.error(err);
      } finally {
        setIsSubmitting(false);
        setNewMaterial("");
        // Clear success message after 3 seconds
        if (successMessage) {
          setTimeout(() => setSuccessMessage(null), 3000);
        }
      }
    }
  };

  const handleDeleteMaterial = async (id: string) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/materials/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.status === "success") {
        setSuccessMessage("Material deleted successfully");
        // Update local state
        setMaterials(materials.filter((material) => material._id !== id));

        // Cancel editing if the material being edited is deleted
        if (editingMaterial?._id === id) {
          setEditingMaterial(null);
          setNewMaterial("");
        }
      } else {
        setError(result.message || "Failed to delete material");
      }
    } catch (err) {
      setError("An error occurred while deleting material");
      console.error(err);
    } finally {
      setIsSubmitting(false);
      // Clear success message after 3 seconds
      if (successMessage) {
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    }
  };

  const handleEditMaterial = (material: Material) => {
    setEditingMaterial(material);
    setNewMaterial(material.materialName);
    setError(null);
  };

  const cancelEdit = () => {
    setEditingMaterial(null);
    setNewMaterial("");
    setError(null);
  };

  return (
    <div className="p-6 w-full mx-auto bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Materials Management</h1>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {successMessage && (
        <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      <div className="flex mb-6">
        <Input
          placeholder="Enter Material Name..."
          value={newMaterial}
          onChange={(e) => setNewMaterial(e.target.value)}
          className="mr-2"
          disabled={isSubmitting}
        />
        <Button
          onClick={handleAddMaterial}
          disabled={!newMaterial.trim() || isSubmitting}
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : null}
          {editingMaterial ? "Update" : "Add New"}
        </Button>
        {editingMaterial && (
          <Button
            variant="outline"
            className="ml-2"
            onClick={cancelEdit}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <Table>
          <TableCaption>List of Materials</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">S.NO.</TableHead>
              <TableHead>MATERIAL</TableHead>
              <TableHead className="text-right">ACTIONS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {materials.length > 0 ? (
              materials.map((material, index) => (
                <TableRow key={material._id}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell>{material.materialName}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEditMaterial(material)}
                      className="mr-2"
                      disabled={isSubmitting}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDeleteMaterial(material._id)}
                      disabled={isSubmitting}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-4">
                  No materials found. Add some materials to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
