import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";

const DB_NAME = "plates_app";
const COLLECTION_NAME = "users";

export type UserDocument = {
  _id: ObjectId;
  user: string;
  email: string;
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

export async function createUser({
  user,
  email,
  passwordHash,
  passwordSalt,
}: {
  user: string;
  email: string;
  passwordHash: string;
  passwordSalt: string;
}) {
  const collection = await getCollection();
  await collection.createIndex({ user: 1 }, { unique: true });
  await collection.createIndex({ email: 1 }, { unique: true });

  return collection.insertOne({
    user,
    email,
    passwordHash,
    passwordSalt,
    createdAt: new Date(),
  });
}
