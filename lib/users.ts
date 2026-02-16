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
  isActive: boolean;
  passwordHash: string;
  passwordSalt: string;
  createdAt: Date;
};

export type PublicUser = {
  id: string;
  user: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
};

async function getCollection() {
  const client = await clientPromise;
  return client.db(DB_NAME).collection<UserDocument>(COLLECTION_NAME);
}

function toPublicUser(document: UserDocument): PublicUser {
  return {
    id: document._id.toString(),
    user: document.user,
    email: document.email,
    role: document.role,
    isActive: document.isActive,
    createdAt: document.createdAt,
  };
}

export async function ensureUserIndexes() {
  const collection = await getCollection();
  await collection.createIndex({ user: 1 }, { unique: true });
  await collection.createIndex({ email: 1 }, { unique: true });
}

export async function findUserByUsername(username: string) {
  const collection = await getCollection();
  return collection.findOne({ user: username });
}

export async function findUserByEmail(email: string) {
  const collection = await getCollection();
  return collection.findOne({ email });
}

export async function listUsers() {
  const collection = await getCollection();
  const users = await collection.find().sort({ createdAt: -1 }).toArray();
  return users.map(toPublicUser);
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
  await ensureUserIndexes();

  return collection.insertOne({
    _id: new ObjectId(),
    user,
    email,
    role,
    isActive: true,
    passwordHash,
    passwordSalt,
    createdAt: new Date(),
  });
}

export async function updateUserById(
  id: string,
  payload: Partial<Pick<UserDocument, "user" | "email" | "role" | "isActive">>,
) {
  const collection = await getCollection();
  const _id = new ObjectId(id);

  await collection.updateOne({ _id }, { $set: payload });
  const updated = await collection.findOne({ _id });

  return updated ? toPublicUser(updated) : null;
}

export async function deleteUserById(id: string) {
  const collection = await getCollection();
  const _id = new ObjectId(id);
  return collection.deleteOne({ _id });
}

export async function findPublicUserById(id: string) {
  const collection = await getCollection();
  const _id = new ObjectId(id);
  const user = await collection.findOne({ _id });
  return user ? toPublicUser(user) : null;
}
