CREATE TABLE "users" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "username" varchar UNIQUE NOT NULL,
  "password_hash" varchar NOT NULL,
  "created_at" timestamp DEFAULT now()
);

CREATE TABLE "user_groups" (
  "id" serial PRIMARY KEY,
  "name" varchar NOT NULL,
  "owner_id" uuid NOT NULL,
  "created_at" timestamp DEFAULT now()
);

CREATE TABLE "user_group_members" (
  "user_id" uuid NOT NULL,
  "group_id" integer NOT NULL,
  "joined_at" timestamp DEFAULT now(),
  PRIMARY KEY ("user_id", "group_id")
);

CREATE TABLE "group_invites" (
  "id" serial PRIMARY KEY,
  "group_id" integer NOT NULL,
  "inviter_id" uuid NOT NULL,
  "invitee_id" uuid NOT NULL,
  "status" varchar NOT NULL DEFAULT 'pending',
  "created_at" timestamp DEFAULT now()
);

CREATE TABLE "categories" (
  "id" serial PRIMARY KEY,
  "name" varchar NOT NULL,
  "user_id" uuid
);

CREATE TABLE "transactions" (
  "id" serial PRIMARY KEY,
  "amount" integer NOT NULL,
  "description" varchar,
  "user_id" uuid NOT NULL,
  "group_id" integer,
  "category_id" integer,
  "is_essential" boolean DEFAULT false,
  "created_at" timestamp DEFAULT now()
);

CREATE TABLE "custom_items" (
  "id" serial PRIMARY KEY,
  "name" varchar NOT NULL,
  "user_id" uuid NOT NULL,
  "last_category_id" integer
);

COMMENT ON COLUMN "group_invites"."status" IS 'pending | accepted | declined';
COMMENT ON COLUMN "categories"."user_id" IS 'NULL = глобальная';
COMMENT ON COLUMN "transactions"."group_id" IS 'NULL = только личная';

ALTER TABLE "user_groups" ADD FOREIGN KEY ("owner_id") REFERENCES "users" ("id") ON DELETE CASCADE;
ALTER TABLE "user_group_members" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE;
ALTER TABLE "user_group_members" ADD FOREIGN KEY ("group_id") REFERENCES "user_groups" ("id") ON DELETE CASCADE;
ALTER TABLE "group_invites" ADD FOREIGN KEY ("group_id") REFERENCES "user_groups" ("id") ON DELETE CASCADE;
ALTER TABLE "group_invites" ADD FOREIGN KEY ("inviter_id") REFERENCES "users" ("id") ON DELETE CASCADE;
ALTER TABLE "group_invites" ADD FOREIGN KEY ("invitee_id") REFERENCES "users" ("id") ON DELETE CASCADE;
ALTER TABLE "categories" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE;
ALTER TABLE "transactions" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE;
ALTER TABLE "transactions" ADD FOREIGN KEY ("group_id") REFERENCES "user_groups" ("id") ON DELETE SET NULL;
ALTER TABLE "transactions" ADD FOREIGN KEY ("category_id") REFERENCES "categories" ("id") ON DELETE SET NULL;
ALTER TABLE "custom_items" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE;
ALTER TABLE "custom_items" ADD FOREIGN KEY ("last_category_id") REFERENCES "categories" ("id") ON DELETE SET NULL;