import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { auth } from "@/auth";

const DB_NAME = "plates_app";
const COLLECTION_NAME = "plates";

function normalizePlate(value: string) {
  return value.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
}


async function ensureAuthenticated() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  return null;
}

async function getCollection() {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  return db.collection(COLLECTION_NAME);
}

export async function POST(request: Request) {
  try {
    const unauthorizedResponse = await ensureAuthenticated();
    if (unauthorizedResponse) {
      return unauthorizedResponse;
    }

    const body = await request.json();
    const plate = normalizePlate(body?.plate ?? "");

    if (!plate) {
      return NextResponse.json(
        { error: "Informe uma placa válida." },
        { status: 400 },
      );
    }

    const collection = await getCollection();

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

    const latest = await collection.find().sort({ createdAt: -1 }).limit(5).toArray();

    return NextResponse.json({
      message: "Placa cadastrada com sucesso.",
      plate,
      latest: latest.map((item) => item.plate),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao cadastrar placa." },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const unauthorizedResponse = await ensureAuthenticated();
    if (unauthorizedResponse) {
      return unauthorizedResponse;
    }

    const body = await request.json();
    const plate = normalizePlate(body?.plate ?? "");

    if (!plate) {
      return NextResponse.json(
        { error: "Informe uma placa válida para remover." },
        { status: 400 },
      );
    }

    const collection = await getCollection();
    const result = await collection.deleteOne({ plate });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Placa não encontrada para remoção." },
        { status: 404 },
      );
    }

    const latest = await collection.find().sort({ createdAt: -1 }).limit(5).toArray();

    return NextResponse.json({
      message: "Placa removida com sucesso.",
      plate,
      latest: latest.map((item) => item.plate),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao remover placa." },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  try {
    const unauthorizedResponse = await ensureAuthenticated();
    if (unauthorizedResponse) {
      return unauthorizedResponse;
    }

    const { searchParams } = new URL(request.url);
    const recentOnly = searchParams.get("recent") === "1";

    const collection = await getCollection();

    if (recentOnly) {
      const latest = await collection.find().sort({ createdAt: -1 }).limit(5).toArray();
      return NextResponse.json({
        latest: latest.map((item) => item.plate),
      });
    }

    const query = normalizePlate(searchParams.get("query") ?? "");

    if (!query) {
      return NextResponse.json(
        { error: "Informe um termo para busca." },
        { status: 400 },
      );
    }

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
