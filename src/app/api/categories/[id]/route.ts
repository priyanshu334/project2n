import dbConnect from "@/lib/dbConnect";
import { NextRequest, NextResponse } from "next/server";
import mongoObjectIdSchema from "@/validations/mongoObjectId.validate";
import Category from "@/models/categories";
import categorySchema from "@/validations/category.validate";

// GET api/categories/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const validation = mongoObjectIdSchema.safeParse(id);
    if (!validation.success)
      return NextResponse.json(
        { status: "error", message: "invalid ID" },
        { status: 400 }
      );

    await dbConnect();
    const category = await Category.findById(id).lean();

    if (!category)
      return NextResponse.json(
        { status: "error", message: "category not found" },
        { status: 404 }
      );

    return NextResponse.json(
      { status: "success", data: category },
      { status: 200 }
    );
  } catch (error: unknown) {
    const errMsg =
      error instanceof Error ? error.message : "Internal Server Error";
    console.log(`GET /api/categories/[id] error : ${errMsg}`);
    return NextResponse.json(
      { status: "error", message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// DELETE api/categories/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const validation = mongoObjectIdSchema.safeParse(id);
    if (!validation.success)
      return NextResponse.json(
        { status: "error", message: "invalid ID" },
        { status: 400 }
      );

    await dbConnect();
    const deletedCategory = await Category.findByIdAndDelete(id);

    if (!deletedCategory)
      return NextResponse.json(
        { status: "error", message: "category not found" },
        { status: 404 }
      );

    return NextResponse.json(
      { status: "success", message: "category deleted" },
      { status: 200 }
    );
  } catch (error: unknown) {
    const errMsg =
      error instanceof Error ? error.message : "Internal Server Error";
    console.log(`DELETE /api/categories/[id] error : ${errMsg}`);
    return NextResponse.json(
      { status: "error", message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// PATCH /api/itemFor/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const body = await req.json();

    // validate id
    const parseId = mongoObjectIdSchema.safeParse(id);
    if (!parseId.success) {
      return NextResponse.json(
        {
          status: "error",
          message: "Invalid ID",
        },
        { status: 400 }
      );
    }

    // validate body
    const parseBody = categorySchema.safeParse(body);
    if (!parseBody.success) {
      return NextResponse.json(
        {
          status: "error",
          message: "Invalid Request Body",
        },
        { status: 400 }
      );
    }

    const { categoryName, parentCategoryId } = parseBody.data;
    await dbConnect(); // connect to database

    // check if the category exists
    const categoryExists = await Category.findById(id).lean();
    if (!categoryExists) {
      return NextResponse.json(
        { status: "error", message: "category not found" },
        { status: 404 }
      );
    }

    const parentExists =
      parentCategoryId != null
        ? await Category.findById(parentCategoryId).lean()
        : true;
    // is parent id passed present in db
    if (!parentExists) {
      return NextResponse.json(
        { status: "error", message: "invalid parent category" },
        { status: 404 }
      );
    }

    // check parentID == categoryId
    if (parentCategoryId === id) {
      return NextResponse.json(
        {
          status: "error",
          message: "parentId should not be same as categoryID",
        },
        { status: 400 }
      );
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      {
        categoryName,
        parentCategoryId,
      },
      { new: true }
    );

    return NextResponse.json(
      {
        status: "success",
        message: "category updated successfully",
        data: updatedCategory,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const errMsg =
      error instanceof Error ? error.message : "Internal Server Error";
    console.error(`PATCH /api/categories/[id] error: ${errMsg}`);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
