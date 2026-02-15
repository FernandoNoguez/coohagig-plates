import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";

const DB_NAME = "plates_app";
const COLLECTION_NAME = "users";

export type UserRole = "user" | "admin";

export type UserDocument = {
  _id: ObjectId;
  user: string;
  email: string;
  role: UserRole;
  passwordHash: string;
  passwordSalt: string;
  createdAt: Date;
};

async function getCollection() {
  const client = await clientPromise;
  return client.db(DB_NAME).collection<UserDocument>(COLLECTION_NAME);
}

export async function findUserByUsername(username: string) {
  const collection = await getCollection();
  return collection.findOne({ user: username });
}

export async function findUserByEmail(email: string) {
  const collection = await getCollection();
  return collection.findOne({ email });
}

export async function createUser({
  user,
  email,
  role,
  passwordHash,
  passwordSalt,
}: {
  user: string;
  email: string;
  role: UserRole;
  passwordHash: string;
  passwordSalt: string;
}) {
  const collection = await getCollection();
  await collection.createIndex({ user: 1 }, { unique: true });
  await collection.createIndex({ email: 1 }, { unique: true });

  return collection.insertOne({
    user,
    email,
    role,
    passwordHash,
    passwordSalt,
    createdAt: new Date(),
  });
}
