import dbConnect from "@/lib/dbConnect";
import Metal from "@/models/metals";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const metalSchema = z
  .object({
    metalName: z
      .string()
      .trim()
      .min(3, "metal name should be atleast 3 char long"),
  })
  .strict(); // don't allow extra fields

// GET /api/metal
export async function GET(): Promise<NextResponse> {
  try {
    await dbConnect(); // connect to database
    const metals = await Metal.find();
    return NextResponse.json(
      { status: "success", message: "fetched all metals", data: metals },
      { status: 200 }
    );
  } catch (error: unknown) {
    const errMsg =
      error instanceof Error ? error.message : "Internal Server Error";
    console.log(`GET /api/metal error : ${errMsg}`);
    return NextResponse.json(
      { status: "error", message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// POST /api/metals
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const parseRes = metalSchema.safeParse(body);

    if (!parseRes.success) {
      return NextResponse.json(
        { status: "error", message: "invalid request body" },
        { status: 400 }
      );
    }

    const { metalName } = parseRes.data;
    await dbConnect();

    const metalAlreadyExists = await Metal.findOne({ metalName }).lean();
    if (!metalAlreadyExists) {
      const newMetal = await Metal.create({ metalName });
      return NextResponse.json(
        {
          status: "success",
          message: "metal created successfully",
          data: newMetal,
        },
        { status: 201 }
      );
    }
    return NextResponse.json(
      { status: "error", message: "metal already exists" },
      { status: 409 }
    );
  } catch (error: unknown) {
    const errMsg =
      error instanceof Error ? error.message : "Internal Server Error";
    console.log(`GET /api/metal error : ${errMsg}`);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
