import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import mongoObjectIdSchema from "@/validations/mongoObjectId.validate";
import PriceUpdates from "@/models/priceUpdates";
import priceUpdatesSchema from "@/validations/priceUpdates.validate";
import Metal from "@/models/metals";
import Material from "@/models/materials";

// GET /api/price-updates/[id]
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
    const priceUpdate = await PriceUpdates.findById(id).lean();

    if (!priceUpdate)
      return NextResponse.json(
        { status: "error", message: "price-update not found" },
        { status: 404 }
      );

    return NextResponse.json(
      { status: "success", data: priceUpdate },
      { status: 200 }
    );
  } catch (error: unknown) {
    const errMsg =
      error instanceof Error ? error.message : "Internal Server Error";
    console.log(`GET /api/price-updates/[id] error : ${errMsg}`);
    return NextResponse.json(
      { status: "error", message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// DELETE /api/price-updates/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log(`DELETE /api/price-updates/:id → id: ${id}`);

    // Validate MongoDB ObjectId
    const validation = mongoObjectIdSchema.safeParse(id);
    if (!validation.success) {
      return NextResponse.json(
        { status: "error", message: "Invalid ID" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Delete the price update entry by ID
    const deletedPriceUpdate = await PriceUpdates.findByIdAndDelete(id);

    if (!deletedPriceUpdate) {
      return NextResponse.json(
        { status: "error", message: "Price update not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { status: "success", message: "Price update deleted successfully" },
      { status: 200 }
    );
  } catch (error: unknown) {
    const errMsg =
      error instanceof Error ? error.message : "Internal Server Error";
    console.error(`DELETE /api/price-updates error: ${errMsg}`);

    return NextResponse.json(
      { status: "error", message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// PATCH /api/price-updates/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const body = await req.json();

    // 1. validate id
    const parsedId = mongoObjectIdSchema.safeParse(id);

    if (!parsedId.success) {
      return NextResponse.json(
        {
          status: "error",
          message: "invalid price-update id",
        },
        { status: 400 }
      );
    }

    // 2. check if price-update with this id exists or not
    const existingPriceUpdate = await PriceUpdates.findById(id).lean();

    if (!existingPriceUpdate) {
      return NextResponse.json(
        {
          status: "error",
          message: "price-update entery not found",
        },
        { status: 404 }
      );
    }

    // validate body
    const parsedBody = priceUpdatesSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        {
          status: "error",
          message: "invalid price-update body",
        },
        { status: 400 }
      );
    }

    const { metalId, materialId, price } = parsedBody.data;

    dbConnect(); // connect to database

    const metalExists = await Metal.findById(metalId).lean();
    const materialExists = await Material.findById(materialId).lean();

    if (!metalExists) {
      return NextResponse.json(
        { status: "error", message: "invalid metal id" },
        { status: 404 }
      );
    }

    if (!materialExists) {
      return NextResponse.json(
        { status: "error", message: "invalid material id" },
        { status: 404 }
      );
    }

    const updatedPriceUpdate = await PriceUpdates.findByIdAndUpdate(
      id,
      {
        metalId,
        materialId,
        price,
      },
      { new: true }
    );

    return NextResponse.json(
      {
        status: "success",
        message: "price-update updated successful",
        data: updatedPriceUpdate,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const errMsg =
      error instanceof Error ? error.message : "Internal Server Error";
    console.error(`PATCH /api/price-update/[id] error: ${errMsg}`);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
