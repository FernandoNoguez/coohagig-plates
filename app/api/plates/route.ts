import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

const DB_NAME = "plates_app";
const COLLECTION_NAME = "plates";

function normalizePlate(value: string) {
  return value.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const plate = normalizePlate(body?.plate ?? "");

    if (!plate) {
      return NextResponse.json(
        { error: "Informe uma placa válida." },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    await collection.createIndex({ plate: 1 }, { unique: true });

    const existing = await collection.findOne({ plate });
    if (existing) {
      return NextResponse.json(
        { message: "Placa já cadastrada.", plate },
        { status: 200 },
      );
    }

    await collection.insertOne({
      plate,
      createdAt: new Date(),
    });

    return NextResponse.json({ message: "Placa cadastrada com sucesso.", plate });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao cadastrar placa." },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = normalizePlate(searchParams.get("query") ?? "");

    if (!query) {
      return NextResponse.json(
        { error: "Informe um termo para busca." },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const matches = await collection
      .find({ plate: { $regex: escaped, $options: "i" } })
      .sort({ plate: 1 })
      .limit(50)
      .toArray();

    return NextResponse.json({
      query,
      exists: matches.length > 0,
      matches: matches.map((item) => item.plate),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao buscar placas." },
      { status: 500 },
    );
  }
}
