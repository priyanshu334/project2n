import dbConnect from "@/lib/dbConnect";
import Material from "@/models/materials";
import Metal from "@/models/metals";
import PriceUpdates from "@/models/priceUpdates";
import priceUpdatesSchema from "@/validations/priceUpdates.validate";

import { NextRequest, NextResponse } from "next/server";

// GET /api/price-updates
export async function GET(): Promise<NextResponse> {
  try {
    await dbConnect(); // connect to database
    const priceUpdates = await PriceUpdates.find();
    return NextResponse.json(
      {
        status: "success",
        message: "fetched all price-updates",
        data: priceUpdates,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const errMsg =
      error instanceof Error ? error.message : "Internal Server Error";
    console.log(`GET /api/price-updates error: ${errMsg}`);
    return NextResponse.json(
      { status: "error", message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// POST /api/price-updates
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const parseRes = priceUpdatesSchema.safeParse(body);
    if (!parseRes.success) {
      return NextResponse.json(
        { status: "error", message: "invalid request body" },
        { status: 400 }
      );
    }

    const { metalId, materialId, price } = parseRes.data;
    await dbConnect();

    const metalExists = await Metal.findById(metalId).lean();
    if (!metalExists) {
      return NextResponse.json(
        { status: "error", message: "invalid metalId" },
        { status: 400 }
      );
    }

    const materialExists = await Material.findById(materialId).lean();
    if (!materialExists) {
      return NextResponse.json(
        { status: "error", message: "invalid materialId" },
        { status: 400 }
      );
    }

    const newPriceUpdate = await PriceUpdates.create({
      metalId,
      materialId,
      price,
    });
    return NextResponse.json(
      {
        status: "success",
        message: "price-update created successfully",
        data: newPriceUpdate,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const errMsg =
      error instanceof Error ? error.message : "Internal Server Error";
    console.log(`POST /api/material error: ${errMsg}`);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
