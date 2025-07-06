"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Trash2,
  Pencil,
  PlusCircle,
  DollarSign,
  //   RefreshCcw,
} from "lucide-react";
import axios from "axios";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface PriceUpdate {
  _id: string;
  metalId: string;
  materialId: string;
  price: number;
}

interface Metal {
  _id: string;
  metalName: string;
}

interface Material {
  _id: string;
  materialName: string;
}

export default function PriceUpdatesPage() {
  const [updates, setUpdates] = useState<PriceUpdate[]>([]);
  const [metals, setMetals] = useState<Metal[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [form, setForm] = useState({
    metalId: "",
    materialId: "",
    price: "",
  });
  const [editId, setEditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  //   const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [updatesRes, metalsRes, materialsRes] = await Promise.all([
        axios.get("/api/price-updates"),
        axios.get("/api/metals"),
        axios.get("/api/materials"),
      ]);

      setUpdates(updatesRes.data.data);
      setMetals(metalsRes.data.data);
      setMaterials(materialsRes.data.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  //   const refreshData = async () => {
  //     setRefreshing(true);
  //     await fetchData();
  //     setTimeout(() => setRefreshing(false), 500);
  //   };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async () => {
    try {
      if (editId) {
        await axios.patch(`/api/price-updates/${editId}`, {
          ...form,
          price: parseFloat(form.price),
        });
      } else {
        await axios.post("/api/price-updates", {
          ...form,
          price: parseFloat(form.price),
        });
      }
      setForm({ metalId: "", materialId: "", price: "" });
      setEditId(null);
      fetchData();
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const handleEdit = (update: PriceUpdate) => {
    setForm({
      metalId: update.metalId,
      materialId: update.materialId,
      price: update.price.toString(),
    });
    setEditId(update._id);
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/api/price-updates/${id}`);
      fetchData();
    } catch (error) {
      console.error("Error deleting record:", error);
    }
  };

  const cancelEdit = () => {
    setForm({ metalId: "", materialId: "", price: "" });
    setEditId(null);
  };

  // Helper function to find metal name by ID
  const getMetalName = (id: string) => {
    const metal = metals.find((m) => m._id === id);
    return metal ? metal.metalName : id;
  };

  // Helper function to find material name by ID
  const getMaterialName = (id: string) => {
    const material = materials.find((m) => m._id === id);
    return material ? material.materialName : id;
  };

  return (
    <div className="w-full p-6 space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Manage Price Updates</h2>
        {/* <Button
          variant="outline"
          size="sm"
          onClick={refreshData}
          className="flex items-center gap-2"
          disabled={refreshing}
        >
          <RefreshCcw
            size={16}
            className={`${refreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </Button> */}
      </div>

      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="bg-gray-50 border-b border-gray-200">
          <CardTitle className="text-xl flex items-center gap-2">
            {editId ? (
              <>
                <Pencil size={20} className="text-blue-500" />
                Edit Price Update
              </>
            ) : (
              <>
                <PlusCircle size={20} className="text-green-500" />
                Add New Price Update
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="metalId" className="text-sm font-medium">
                Metal
              </Label>
              <Select
                value={form.metalId}
                onValueChange={(value) => handleSelectChange("metalId", value)}
              >
                <SelectTrigger className="h-12 w-full">
                  <SelectValue placeholder="Select Metal" />
                </SelectTrigger>
                <SelectContent>
                  {metals.map((metal) => (
                    <SelectItem key={metal._id} value={metal._id}>
                      {metal.metalName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="materialId" className="text-sm font-medium">
                Material
              </Label>
              <Select
                value={form.materialId}
                onValueChange={(value) =>
                  handleSelectChange("materialId", value)
                }
              >
                <SelectTrigger className="h-12 w-full">
                  <SelectValue placeholder="Select Material" />
                </SelectTrigger>
                <SelectContent>
                  {materials.map((material) => (
                    <SelectItem key={material._id} value={material._id}>
                      {material.materialName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price" className="text-sm font-medium">
                Price (₹)
              </Label>
              <div className="relative">
                <Input
                  id="price"
                  name="price"
                  value={form.price}
                  onChange={handleInputChange}
                  placeholder="Enter price"
                  type="number"
                  className="h-12 pl-10"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleSubmit}
              disabled={!form.metalId || !form.materialId || !form.price}
              className={`px-6 ${
                editId
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-green-600 hover:bg-green-700"
              }`}
              size="lg"
            >
              {editId ? "Update Price" : "Add Price"}
            </Button>

            {editId && (
              <Button variant="outline" onClick={cancelEdit} size="lg">
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex justify-center items-center p-12 bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin h-8 w-8 border-4 border-gray-200 rounded-full border-t-blue-600"></div>
            <p className="text-gray-500 font-medium">Loading price data...</p>
          </div>
        </div>
      ) : (
        <Card>
          <CardHeader className="bg-gray-50 border-b border-gray-200">
            <CardTitle className="text-xl">Price List</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold">Metal</TableHead>
                  <TableHead className="font-semibold">Material</TableHead>
                  <TableHead className="font-semibold">Price (₹)</TableHead>
                  <TableHead className="text-right font-semibold">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {updates.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center py-12 text-gray-500"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <DollarSign size={40} className="text-gray-300" />
                        <p>No price updates found. Add your first one above.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  updates.map((update) => (
                    <TableRow
                      key={update._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <TableCell className="font-medium">
                        {getMetalName(update.metalId)}
                      </TableCell>
                      <TableCell>
                        {getMaterialName(update.materialId)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-700 border-green-200 px-2.5 py-1"
                        >
                          ₹{update.price.toFixed(2)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(update)}
                            className="border-blue-200 text-blue-600 hover:bg-blue-50"
                          >
                            <Pencil size={16} className="mr-1" />
                            Edit
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-red-200 text-red-600 hover:bg-red-50"
                              >
                                <Trash2 size={16} className="mr-1" />
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Confirm Deletion
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete the price
                                  entry for
                                  <span className="font-semibold">
                                    {" "}
                                    {getMetalName(update.metalId)}{" "}
                                  </span>
                                  with
                                  <span className="font-semibold">
                                    {" "}
                                    {getMaterialName(update.materialId)}
                                  </span>
                                  ? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-red-600 hover:bg-red-700 text-white"
                                  onClick={() => handleDelete(update._id)}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
