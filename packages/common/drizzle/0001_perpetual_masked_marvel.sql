ALTER TABLE "users" ALTER COLUMN "role" SET DATA TYPE user_role;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'student';