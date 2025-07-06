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

interface Metal {
  _id: string;
  metalName: string;
}

export default function MetalsManagementPage() {
  const [metals, setMetals] = useState<Metal[]>([]);
  const [newMetal, setNewMetal] = useState("");
  const [editingMetal, setEditingMetal] = useState<Metal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch all metals on component mount
  useEffect(() => {
    fetchMetals();
  }, []);

  // Add effect to handle success message timeout
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const fetchMetals = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/metals");
      const result = await response.json();
      console.log(result);
      if (result.status === "success") {
        setMetals(result.data);
      } else {
        setError(result.message || "Failed to fetch metals");
      }
    } catch (err) {
      setError("An error occurred while fetching metals");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMetal = async () => {
    if (newMetal.trim()) {
      setIsSubmitting(true);
      setError(null);

      try {
        if (editingMetal) {
          // Update existing metal
          const response = await fetch(`/api/metals/${editingMetal._id}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ metalName: newMetal.trim() }),
          });

          const result = await response.json();

          if (result.status === "success") {
            // Update local state
            setMetals(
              metals.map((metal) =>
                metal._id === editingMetal._id
                  ? { ...metal, metalName: newMetal.trim() }
                  : metal
              )
            );
            setEditingMetal(null);
            setSuccessMessage("Metal updated successfully");
          } else {
            setError(result.message || "Failed to update metal");
          }
        } else {
          // Add new metal
          const response = await fetch("/api/metals", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ metalName: newMetal.trim() }),
          });

          const result = await response.json();

          if (result.status === "success") {
            // Add to local state
            setMetals([...metals, result.data]);
            setSuccessMessage("Metal added successfully");
          } else {
            setError(result.message || "Failed to add metal");
          }
        }
      } catch (err) {
        setError("An error occurred");
        console.error(err);
      } finally {
        setIsSubmitting(false);
        setNewMetal("");
      }
    }
  };

  const handleDeleteMetal = async (id: string) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/metals/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.status === "success") {
        // Update local state
        setMetals(metals.filter((metal) => metal._id !== id));

        // Cancel editing if the metal being edited is deleted
        if (editingMetal?._id === id) {
          setEditingMetal(null);
          setNewMetal("");
        }
        setSuccessMessage("Metal deleted successfully");
      } else {
        setError(result.message || "Failed to delete metal");
      }
    } catch (err) {
      setError("An error occurred while deleting metal");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditMetal = (metal: Metal) => {
    setEditingMetal(metal);
    setNewMetal(metal.metalName);
    setError(null);
  };

  const cancelEdit = () => {
    setEditingMetal(null);
    setNewMetal("");
    setError(null);
  };

  return (
    <div className="p-6 w-full mx-auto bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Metals Management</h1>

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
          placeholder="Enter Metal Name..."
          value={newMetal}
          onChange={(e) => setNewMetal(e.target.value)}
          className="mr-2"
          disabled={isSubmitting}
        />
        <Button
          onClick={handleAddMetal}
          disabled={!newMetal.trim() || isSubmitting}
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : null}
          {editingMetal ? "Update" : "Add New"}
        </Button>
        {editingMetal && (
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
          <TableCaption>All Metals List</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">S.NO.</TableHead>
              <TableHead>METAL</TableHead>
              <TableHead className="text-right">ACTIONS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {metals.length > 0 ? (
              metals.map((metal, index) => (
                <TableRow key={metal._id}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell>{metal.metalName}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEditMetal(metal)}
                      className="mr-2"
                      disabled={isSubmitting}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDeleteMetal(metal._id)}
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
                  No metals found. Add some metals to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
