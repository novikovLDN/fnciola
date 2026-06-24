ALTER TABLE "sessions" ADD COLUMN "device_label" text;--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "user_agent" text;--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "ip" text;--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "last_seen_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "public_id" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "last_login_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "last_ip" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "last_user_agent" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "signup_ip" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "signup_user_agent" text;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_public_id_unique" UNIQUE("public_id");