import dbConnect from "@/lib/dbConnect";
import ItemFor from "@/models/itemFors";
import itemForSchema from "@/validations/itemFor.validation";
import { NextRequest, NextResponse } from "next/server";

// GET /api/itemFor
export async function GET(): Promise<NextResponse> {
  try {
    await dbConnect(); // connect to database
    const itemForList = await ItemFor.find();
    return NextResponse.json(
      {
        status: "success",
        message: "Fetched all itemFor entries",
        data: itemForList,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const errMsg =
      error instanceof Error ? error.message : "Internal Server Error";
    console.log(`GET /api/itemFor error: ${errMsg}`);
    return NextResponse.json(
      { status: "error", message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// POST /api/itemFor
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const parseRes = itemForSchema.safeParse(body);

    if (!parseRes.success) {
      return NextResponse.json(
        { status: "error", message: "Invalid request body" },
        { status: 400 }
      );
    }

    const { itemForName } = parseRes.data;
    await dbConnect();

    const itemForExists = await ItemFor.findOne({ itemForName });
    if (!itemForExists) {
      const newItemFor = await ItemFor.create({ itemForName });
      return NextResponse.json(
        {
          status: "success",
          message: "itemFor created successfully",
          data: newItemFor,
        },
        { status: 201 }
      );
    }

    return NextResponse.json(
      { status: "error", message: "itemFor already exists" },
      { status: 409 }
    );
  } catch (error: unknown) {
    const errMsg =
      error instanceof Error ? error.message : "Internal Server Error";
    console.log(`POST /api/itemFor error: ${errMsg}`);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
