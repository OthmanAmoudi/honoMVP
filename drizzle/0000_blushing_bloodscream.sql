CREATE TABLE `todos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`content` text,
	`completed` integer,
	`createdAt` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
