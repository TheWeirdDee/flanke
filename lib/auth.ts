import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { db, TABLE } from "./db/client";
import { Keys } from "./db/schema";
import { PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) {
        const membership = await resolveWorkspace(user.id, user.email ?? "");
        token.workspaceId = membership.workspaceId;
        token.role = membership.role;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.sub!;
      session.user.workspaceId = token.workspaceId as string;
      session.user.role = token.role as "OWNER" | "MEMBER";
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
});

async function resolveWorkspace(userId: string, email: string) {
  const existing = await db.send(
    new QueryCommand({
      TableName: TABLE,
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :prefix)",
      ExpressionAttributeValues: {
        ":pk": Keys.userMembership.pk(userId),
        ":prefix": "MEMBER#",
      },
      Limit: 1,
    })
  );

  if (existing.Items?.[0]) {
    return {
      workspaceId: existing.Items[0].workspaceId as string,
      role: existing.Items[0].role as "OWNER" | "MEMBER",
    };
  }

  const workspaceId = crypto.randomUUID();
  const now = new Date().toISOString();

  await Promise.all([
    db.send(
      new PutCommand({
        TableName: TABLE,
        Item: {
          PK: Keys.workspace.pk(workspaceId),
          SK: Keys.workspace.sk(),
          entityType: "WORKSPACE",
          workspaceId,
          name: `${email.split("@")[0]}'s workspace`,
          slug: workspaceId.slice(0, 8),
          plan: "FREE",
          competitorCount: 0,
          createdAt: now,
          updatedAt: now,
        },
      })
    ),
    db.send(
      new PutCommand({
        TableName: TABLE,
        Item: {
          PK: Keys.userMembership.pk(userId),
          SK: Keys.userMembership.sk(workspaceId),
          GSI1PK: Keys.userMembership.gsi1pk(workspaceId),
          GSI1SK: Keys.userMembership.gsi1sk(userId),
          entityType: "USER_MEMBERSHIP",
          userId,
          workspaceId,
          email,
          role: "OWNER",
          joinedAt: now,
          createdAt: now,
          updatedAt: now,
        },
      })
    ),
  ]);

  return { workspaceId, role: "OWNER" as const };
}
