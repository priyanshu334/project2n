import dbConnect from "@/lib/dbConnect";
import Product from "@/models/products";
import { NextResponse, NextRequest } from "next/server";
import { z } from "zod";
import { Types } from "mongoose";
import ItemFor from "@/models/itemFors";
import Category from "@/models/categories";
import Material from "@/models/materials";
import Metal from "@/models/metals";
import mongoObjectIdSchema from "@/validations/mongoObjectId.validate";

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

// GET /api/products/[id]
// export async function GET(
//   req: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const { id } = params;
//     const validation = mongoObjectIdSchema.safeParse(id);
//     if (!validation.success)
//       return NextResponse.json(
//         { status: "error", message: "invalid ID" },
//         { status: 400 }
//       );

//     await dbConnect();
//     const priceUpdate = await Product.findById(id).lean();

//     if (!priceUpdate)
//       return NextResponse.json(
//         { status: "error", message: "product not found" },
//         { status: 404 }
//       );

//     return NextResponse.json(
//       { status: "success", data: priceUpdate },
//       { status: 200 }
//     );
//   } catch (error: unknown) {
//     const errMsg =
//       error instanceof Error ? error.message : "Internal Server Error";
//     console.log(`GET /api/products/[id] error : ${errMsg}`);
//     return NextResponse.json(
//       { status: "error", message: "Internal Server Error" },
//       { status: 500 }
//     );
//   }
// }

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;

    // Validate ID
    const validation = mongoObjectIdSchema.safeParse(id);
    if (!validation.success) {
      return NextResponse.json(
        { status: "error", message: "Invalid product ID" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find product
    const product = await Product.findById(id)
      .populate("itemFor")
      .populate("category")
      .populate("material")
      .populate("metal")
      .lean();

    if (!product) {
      return NextResponse.json(
        { status: "error", message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { status: "success", data: product },
      { status: 200 }
    );
  } catch (error: unknown) {
    const errMsg =
      error instanceof Error ? error.message : "Internal Server Error";
    console.error(`GET /api/product/[id] error: ${errMsg}`);
    return NextResponse.json(
      { status: "error", message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// DELETE /api/products/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const validation = ObjectIdSchema.safeParse(id);

    if (!validation.success)
      return NextResponse.json(
        { status: "error", message: "invalid ID" },
        { status: 400 }
      );

    await dbConnect();

    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct)
      return NextResponse.json(
        { status: "error", message: "product not found" },
        { status: 404 }
      );

    return NextResponse.json(
      { status: "success", message: "product deleted" },
      { status: 200 }
    );
  } catch (error: unknown) {
    const errMsg =
      error instanceof Error ? error.message : "Internal Server Error";
    console.log(`DELETE /api/product error : ${errMsg}`);
    return NextResponse.json(
      { status: "error", message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// PATCH /api/products/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const body = await req.json();

    // Validate inputs
    const validateId = ObjectIdSchema.safeParse(id);
    const parseRes = ProductSchema.safeParse(body);

    // if id validaiton fails
    if (!validateId.success) {
      return NextResponse.json(
        {
          status: "error",
          message: "Invalid product Id",
          errors: validateId.error.format(),
        },
        { status: 400 }
      );
    }

    // if body validation fails
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

    // 1. check if the product doesn't exists
    const productExists = await Product.findById(validateId.data).lean();

    if (!productExists) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
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
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
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
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedProduct) {
      return NextResponse.json(
        { status: "error", message: "Failed Updating Product" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        status: "success",
        message: "Product updated successfully",
        data: updatedProduct,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const errMsg =
      error instanceof Error ? error.message : "Internal Server Error";
    console.error(`PATCH /api/product/[id] error: ${errMsg}`);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
