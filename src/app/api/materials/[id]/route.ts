import dbConnect from "@/lib/dbConnect";
import Material from "@/models/materials";
import { NextRequest, NextResponse } from "next/server";
import materialSchema from "@/validations/material.validation";
import mongoObjectIdSchema from "@/validations/mongoObjectId.validate";

// GET /api/material/[id]
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
    const material = await Material.findById(id).lean();

    if (!material)
      return NextResponse.json(
        { status: "error", message: "material not found" },
        { status: 404 }
      );

    return NextResponse.json(
      { status: "success", data: material },
      { status: 200 }
    );
  } catch (error: unknown) {
    const errMsg =
      error instanceof Error ? error.message : "Internal Server Error";
    console.log(`GET /api/materials/[id] error : ${errMsg}`);
    return NextResponse.json(
      { status: "error", message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// DELETE /api/material/[id]
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
    const deletedMaterial = await Material.findByIdAndDelete(id);

    if (!deletedMaterial)
      return NextResponse.json(
        { status: "error", message: "material not found" },
        { status: 404 }
      );

    return NextResponse.json(
      { status: "success", message: "material deleted" },
      { status: 200 }
    );
  } catch (error: unknown) {
    const errMsg =
      error instanceof Error ? error.message : "Internal Server Error";
    console.log(`DELETE /api/materials/[id] error : ${errMsg}`);
    return NextResponse.json(
      { status: "error", message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// PATCH /api/material/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const body = await req.json();

    // Validate inputs
    const validateId = mongoObjectIdSchema.safeParse(id);
    const validateBody = materialSchema.safeParse(body);

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

    const updatedMaterial = await Material.findByIdAndUpdate(
      id,
      { materialName: body.materialName },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedMaterial) {
      return NextResponse.json(
        { status: "error", message: "Material not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        status: "success",
        message: "Material updated successfully",
        data: updatedMaterial,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const errMsg =
      error instanceof Error ? error.message : "Internal Server Error";
    console.error(`PATCH /api/material/[id] error: ${errMsg}`);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
