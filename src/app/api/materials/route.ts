import dbConnect from "@/lib/dbConnect";
import Material from "@/models/materials";
import materialSchema from "@/validations/material.validation";
import { NextRequest, NextResponse } from "next/server";

// GET /api/material
export async function GET(): Promise<NextResponse> {
  try {
    await dbConnect(); // connect to database
    const materials = await Material.find();
    return NextResponse.json(
      { status: "success", message: "fetched all materials", data: materials },
      { status: 200 }
    );
  } catch (error: unknown) {
    const errMsg =
      error instanceof Error ? error.message : "Internal Server Error";
    console.log(`GET /api/material error: ${errMsg}`);
    return NextResponse.json(
      { status: "error", message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// POST /api/material
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const parseRes = materialSchema.safeParse(body);
    if (!parseRes.success) {
      return NextResponse.json(
        { status: "error", message: "invalid request body" },
        { status: 400 }
      );
    }

    const { materialName } = parseRes.data;
    await dbConnect();

    const materialAlreadyExists = await Material.findOne({ materialName });
    if (!materialAlreadyExists) {
      const newMaterial = await Material.create({ materialName });
      return NextResponse.json(
        {
          status: "success",
          message: "material created successfully",
          data: newMaterial,
        },
        { status: 201 }
      );
    }
    return NextResponse.json(
      { status: "error", message: "material already exists" },
      { status: 409 }
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
