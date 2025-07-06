import dbConnect from "@/lib/dbConnect";
import Metal from "@/models/metals";
import { NextRequest, NextResponse } from "next/server";
import metalSchema from "@/validations/metal.validation";
import mongoObjectIdSchema from "@/validations/mongoObjectId.validate";

// GET /api/metal/[id]
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
    const metal = await Metal.findById(id).lean();

    if (!metal)
      return NextResponse.json(
        { status: "error", message: "metal not found" },
        { status: 404 }
      );

    return NextResponse.json(
      { status: "success", data: metal },
      { status: 200 }
    );
  } catch (error: unknown) {
    const errMsg =
      error instanceof Error ? error.message : "Internal Server Error";
    console.log(`GET /api/metal/[id] error : ${errMsg}`);
    return NextResponse.json(
      { status: "error", message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// DELETE /api/metal/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log(req.headers);
    const { id } = await params;
    console.log(`id : ${id}`);
    const validation = mongoObjectIdSchema.safeParse(id);
    if (!validation.success)
      return NextResponse.json(
        { status: "error", message: "invalid ID" },
        { status: 400 }
      );

    await dbConnect();
    const deletedMetal = await Metal.findByIdAndDelete(id);

    if (!deletedMetal)
      return NextResponse.json(
        { status: "error", message: "metal not found" },
        { status: 404 }
      );

    return NextResponse.json(
      { status: "success", message: "metal deleted" },
      { status: 200 }
    );
  } catch (error: unknown) {
    const errMsg =
      error instanceof Error ? error.message : "Internal Server Error";
    console.log(`DELETE /api/metal error : ${errMsg}`);
    return NextResponse.json(
      { status: "error", message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const body = await req.json();

    // Validate inputs
    const validateId = mongoObjectIdSchema.safeParse(id);
    const validateBody = metalSchema.safeParse(body);

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

    const updatedMetal = await Metal.findByIdAndUpdate(
      id,
      { metalName: body.metalName },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedMetal) {
      return NextResponse.json(
        { status: "error", message: "Metal not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        status: "success",
        message: "Metal updated successfully",
        data: updatedMetal,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const errMsg =
      error instanceof Error ? error.message : "Internal Server Error";
    console.error(`PATCH /api/metal/[id] error: ${errMsg}`);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
