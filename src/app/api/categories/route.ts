import dbConnect from "@/lib/dbConnect";
import Category from "@/models/categories";
import categorySchema from "@/validations/category.validate";
import { NextRequest, NextResponse } from "next/server";

export async function GET(): Promise<NextResponse> {
  try {
    await dbConnect(); // connect to database
    const categoryList = await Category.find();
    return NextResponse.json(
      {
        status: "success",
        message: "Fetched all category entries",
        data: categoryList,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const errMsg =
      error instanceof Error ? error.message : "Internal Server Error";
    console.log(`GET /api/category error: ${errMsg}`);
    return NextResponse.json(
      { status: "error", message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const parseRes = categorySchema.safeParse(body);

    // if validation fails return error
    if (!parseRes.success) {
      return NextResponse.json(
        { status: "error", message: "Invalid request body" },
        { status: 400 }
      );
    }

    const { categoryName, parentCategoryId } = parseRes.data;

    dbConnect(); // connect to database
    // check if the category !exists && parent category exists
    const categoryExists = await Category.findOne({
      categoryName,
    });
    if (categoryExists) {
      return NextResponse.json(
        { status: "error", message: "category already exists" },
        { status: 409 }
      );
    }

    const parentExists =
      parentCategoryId != null
        ? await Category.findById(parentCategoryId)
        : true;

    if (!parentExists) {
      return NextResponse.json(
        { status: "error", message: "parentCategory not found" },
        { status: 409 }
      );
    }

    // now the category is not present and the parent category is present or is null
    // create new category
    const newCategory = await Category.create({
      categoryName,
      parentCategoryId,
    });

    return NextResponse.json(
      {
        status: "success",
        message: "category created successfully",
        data: newCategory,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const errMsg =
      error instanceof Error ? error.message : "Internal Server Error";
    console.log(`POST /api/category
         error: ${errMsg}`);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
