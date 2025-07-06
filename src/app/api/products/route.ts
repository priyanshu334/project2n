import { z } from "zod";
import { Types } from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/products";
import ItemFor from "@/models/itemFors";
import Category from "@/models/categories";
import Material from "@/models/materials";
import Metal from "@/models/metals";

const ObjectIdSchema = z.string().refine((val) => Types.ObjectId.isValid(val), {
  message: "Invalid ObjectId",
});

const MediaSchema = z.object({
  images: z.array(z.string()).min(1, "At least one image is required"),
  video: z.string().nonempty("Video is required"),
  previewImages: z.array(z.string()).optional(),
});

const DetailSchema = z.object({
  size: z.number({
    required_error: "Size is required",
  }),
  weight: z.number({
    required_error: "Weight is required",
  }),
  height: z.number({
    required_error: "Height is required",
  }),
  stock: z
    .number({
      required_error: "Stock quantity is required",
    })
    .int(),
  description: z
    .string({
      required_error: "Material description is required",
    })
    .min(1, "Description cannot be empty")
    .transform((val) => val.toLowerCase()),
});

const ProductSchema = z.object({
  productName: z
    .string({
      required_error: "Product name is required",
    })
    .min(3, "Product name should be at least 3 characters")
    .transform((val) => val.toLowerCase()),
  making: z
    .number({
      required_error: "Making percentage is required",
    })
    .min(0, "Making percentage cannot be less than 0")
    .max(100, "Making percentage cannot be greater than 100"),
  discount: z
    .number({
      required_error: "Discount percentage is required",
    })
    .min(0, "Discount percentage cannot be less than 0")
    .max(100, "Discount percentage cannot be greater than 100"),
  itemFor: z.array(ObjectIdSchema).min(1, "At least one itemFor is required"),
  category: z.array(ObjectIdSchema).min(1, "At least one category is required"),
  material: ObjectIdSchema,
  metal: ObjectIdSchema,
  media: MediaSchema,
  details: z.array(DetailSchema).min(1, "At least one detail is required"),
  description: z
    .string({
      required_error: "Product description is required",
    })
    .min(1, "Description cannot be empty")
    .transform((val) => val.toLowerCase()),
});

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const parseRes = ProductSchema.safeParse(body);

    // if validation fails
    if (!parseRes.success) {
      return NextResponse.json(
        {
          status: "error",
          message: "Invalid request body",
          errors: parseRes.error.format(),
        },
        { status: 400 }
      );
    }

    const {
      productName,
      making,
      discount,
      itemFor,
      category,
      material,
      metal,
      details,
      description,
      media,
    } = parseRes.data;
    await dbConnect();

    // 1. check if the product already exists
    const productExists = await Product.findOne({ productName }).lean();
    if (productExists) {
      return NextResponse.json(
        { message: "Product already exists" },
        { status: 409 }
      );
    }

    // 2. check if itemFor exists concurrently
    const itemForExists = await Promise.all(
      itemFor.map(async (id) => await ItemFor.findById(id).lean())
    );
    const notFoundItems = itemForExists
      .map((item, index) => (!item ? itemFor[index] : null))
      .filter(Boolean);

    if (notFoundItems.length > 0) {
      return NextResponse.json(
        { message: "Some items not found", data: notFoundItems },
        { status: 404 }
      );
    }

    // 3. check if category exists concurrently
    const categoryExists = await Promise.all(
      category.map(async (id) => await Category.findById(id).lean())
    );
    const notFoundCategories = categoryExists
      .map((category, index) => (!category ? category?.[index] : null))
      .filter(Boolean);

    if (notFoundCategories.length > 0) {
      return NextResponse.json(
        { message: "Some categories not found", data: notFoundCategories },
        { status: 404 }
      );
    }

    // 4. check if material exists
    const materialExists = await Material.findById(material).lean();
    if (!materialExists) {
      return NextResponse.json(
        { message: "Material not found", data: material },
        { status: 404 }
      );
    }

    // 5. check if metal exists
    const metalExists = await Metal.findById(metal).lean();
    if (!metalExists) {
      return NextResponse.json(
        { message: "Metal not found", data: metal },
        { status: 404 }
      );
    }

    // 6. write product to database
    const newProduct = await Product.create({
      productName,
      making,
      discount,
      itemFor,
      category,
      material,
      metal,
      details,
      description,
      media,
    });

    if (!newProduct) {
      return NextResponse.json(
        { message: "Failed to create new product" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Product added successfully" },
      { status: 200 }
    );
  } catch (error: unknown) {
    const errMsg =
      error instanceof Error ? error.message : "Internal Server Error";
    console.error(`POST /api/product error: ${errMsg}`);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET(): Promise<NextResponse> {
  try {
    await dbConnect();
    const products = await Product.find().lean();

    if (products.length === 0) {
      return NextResponse.json(
        { message: "No products found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Success", data: products },
      { status: 200 }
    );
  } catch (error) {
    const errMsg =
      error instanceof Error ? error.message : "Internal Server Error";
    console.error(`GET /api/product error: ${errMsg}`);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
