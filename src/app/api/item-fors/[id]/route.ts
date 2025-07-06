import dbConnect from "@/lib/dbConnect";
import ItemFor from "@/models/itemFors";
import { NextRequest, NextResponse } from "next/server";
import itemForSchema from "@/validations/itemFor.validation";
import mongoObjectIdSchema from "@/validations/mongoObjectId.validate";

// GET /api/item-fors/[id]
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
    const itemFor = await ItemFor.findById(id).lean();

    if (!itemFor)
      return NextResponse.json(
        { status: "error", message: "item not found" },
        { status: 404 }
      );

    return NextResponse.json(
      { status: "success", data: itemFor },
      { status: 200 }
    );
  } catch (error: unknown) {
    const errMsg =
      error instanceof Error ? error.message : "Internal Server Error";
    console.log(`GET /api/item-fors/[id] error : ${errMsg}`);
    return NextResponse.json(
      { status: "error", message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// DELETE /api/itemFor/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log(`id : ${id}`);
    const validation = mongoObjectIdSchema.safeParse(id);
    if (!validation.success)
      return NextResponse.json(
        { status: "error", message: "invalid ID" },
        { status: 400 }
      );

    await dbConnect();
    const deletedItemFor = await ItemFor.findByIdAndDelete(id);

    if (!deletedItemFor)
      return NextResponse.json(
        { status: "error", message: "itemFor not found" },
        { status: 404 }
      );

    return NextResponse.json(
      { status: "success", message: "itemFor deleted" },
      { status: 200 }
    );
  } catch (error: unknown) {
    const errMsg =
      error instanceof Error ? error.message : "Internal Server Error";
    console.log(`DELETE /api/itemFor error : ${errMsg}`);
    return NextResponse.json(
      { status: "error", message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// PATCH /api/item-fors/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const body = await req.json();

    // Validate inputs
    const validateId = mongoObjectIdSchema.safeParse(id);
    const validateBody = itemForSchema.safeParse(body);

    if (!validateId.success || !validateBody.success) {
      return NextResponse.json(
        {
          status: "error",
          message: "Invalid ID or request body",
        },
        { status: 400 }
      );
    }

    await dbConnect();

    const updatedItemFor = await ItemFor.findByIdAndUpdate(
      id,
      { itemForName: body.itemForName },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedItemFor) {
      return NextResponse.json(
        { status: "error", message: "itemFor not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        status: "success",
        message: "itemFor updated successfully",
        data: updatedItemFor,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const errMsg =
      error instanceof Error ? error.message : "Internal Server Error";
    console.error(`PATCH /api/item-fors/[id] error: ${errMsg}`);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
