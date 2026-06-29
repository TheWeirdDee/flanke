/**
 * Flanke — one-shot DynamoDB table provisioner. LOCKED (PRD §6, §7).
 *
 * Creates table `flanke` (PAY_PER_REQUEST) with 3 GSIs:
 *   GSI1 — ALL projection         (workspace feed + membership)
 *   GSI2 — INCLUDE 7 attrs        (monitor worker scheduling)
 *   GSI3 — ALL projection         (signal type filter)
 *
 * Idempotent: skips if the table exists; polls until ACTIVE if it is creating.
 *
 * Run: npx tsx scripts/create-table.ts
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import {
  DynamoDBClient,
  CreateTableCommand,
  DescribeTableCommand,
  type CreateTableCommandInput,
  type GlobalSecondaryIndexDescription,
} from "@aws-sdk/client-dynamodb";

import { GSI1, GSI2, GSI3, GSI2_INCLUDE_ATTRS, TABLE_NAME } from "@/lib/db/schema";

const TABLE = process.env.DYNAMODB_TABLE_NAME ?? TABLE_NAME;
const client = new DynamoDBClient({ region: process.env.AWS_REGION });

const definition: CreateTableCommandInput = {
  TableName: TABLE,
  BillingMode: "PAY_PER_REQUEST",
  AttributeDefinitions: [
    { AttributeName: "PK", AttributeType: "S" },
    { AttributeName: "SK", AttributeType: "S" },
    { AttributeName: "GSI1PK", AttributeType: "S" },
    { AttributeName: "GSI1SK", AttributeType: "S" },
    { AttributeName: "GSI2PK", AttributeType: "S" },
    { AttributeName: "GSI2SK", AttributeType: "S" },
    { AttributeName: "GSI3PK", AttributeType: "S" },
    { AttributeName: "GSI3SK", AttributeType: "S" },
  ],
  KeySchema: [
    { AttributeName: "PK", KeyType: "HASH" },
    { AttributeName: "SK", KeyType: "RANGE" },
  ],
  GlobalSecondaryIndexes: [
    {
      IndexName: GSI1,
      KeySchema: [
        { AttributeName: "GSI1PK", KeyType: "HASH" },
        { AttributeName: "GSI1SK", KeyType: "RANGE" },
      ],
      Projection: { ProjectionType: "ALL" },
    },
    {
      IndexName: GSI2,
      KeySchema: [
        { AttributeName: "GSI2PK", KeyType: "HASH" },
        { AttributeName: "GSI2SK", KeyType: "RANGE" },
      ],
      Projection: {
        ProjectionType: "INCLUDE",
        NonKeyAttributes: [...GSI2_INCLUDE_ATTRS],
      },
    },
    {
      IndexName: GSI3,
      KeySchema: [
        { AttributeName: "GSI3PK", KeyType: "HASH" },
        { AttributeName: "GSI3SK", KeyType: "RANGE" },
      ],
      Projection: { ProjectionType: "ALL" },
    },
  ],
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function describe(): Promise<{
  status: string;
  gsis: GlobalSecondaryIndexDescription[];
}> {
  const res = await client.send(new DescribeTableCommand({ TableName: TABLE }));
  return {
    status: res.Table?.TableStatus ?? "UNKNOWN",
    gsis: res.Table?.GlobalSecondaryIndexes ?? [],
  };
}

async function waitForActive(): Promise<void> {
  for (;;) {
    const { status, gsis } = await describe();
    const gsisActive = gsis.every((g) => g.IndexStatus === "ACTIVE");
    if (status === "ACTIVE" && gsisActive) {
      console.log(`Table "${TABLE}" is ACTIVE.`);
      for (const g of gsis) {
        console.log(`  - ${g.IndexName}: ${g.IndexStatus}`);
      }
      return;
    }
    console.log(`Waiting… table=${status}, GSIs=${gsis.map((g) => g.IndexStatus).join(",")}`);
    await sleep(3000);
  }
}

async function main(): Promise<void> {
  console.log(`Provisioning DynamoDB table "${TABLE}" (region ${process.env.AWS_REGION})…`);

  try {
    await client.send(new CreateTableCommand(definition));
    console.log("CreateTable submitted — polling until ACTIVE…");
  } catch (err) {
    if (err instanceof Error && err.name === "ResourceInUseException") {
      console.log("Table already exists — skipping create, verifying status…");
    } else {
      throw err;
    }
  }

  await waitForActive();
  console.log("Done.");
}

main().catch((err) => {
  console.error("create-table failed:", err);
  process.exit(1);
});
