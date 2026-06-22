-- Set hasSeenWelcome to true for all existing users (they don't need to see the welcome slides)
UPDATE "User" SET "hasSeenWelcome" = true WHERE "hasSeenWelcome" = false;
