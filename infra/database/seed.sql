------------------------------------------------ User 1 Example ------------------------------------------------------

-- Story 1 — Sarah, new user, zero links:

-- One INSERT into "User" table
-- Real UUID, real email, real name
-- Plan FREE, no stripe IDs

INSERT INTO "User" (id, "fullName", email, password, "userName", plan, "createdAt", "updatedAt") VALUES ('019cef9d-7b37-752b-97cc-574ed70f5fc3', 'Sarah Banerjee', 'sarahbanerjee@gamil.com','$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TgxwgK8BZwj.Kb1YVVdNfHJNULiq', 'sarahqueen', 'FREE'::"Plan", NOW(), NOW())

------------------------------------------------ User 2 Example ------------------------------------------------------

-- Story 2 — John, free user, 8 links, 2 hidden:

-- One INSERT into "User" table
-- Eight INSERTs into "Link" table with his userId
-- Two of those links have public = false

INSERT INTO "User" (id, "fullName", email,password, "userName", plan, "createdAt", "updatedAt") VALUES ('019cef9d-7b37-73e8-9e04-d40b9662df66', 'John', 'john@gamil.com','$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TgxwgK8BZwj.Kb1YVVdNfHJNULiq', 'jobless', 'FREE'::"Plan", NOW(), NOW())

-- 1st link
INSERT INTO "Link" (id, title, url, "order", public, "userId", "createdAt", "updatedAt") VALUES ('019cefc0-8423-7de6-bc57-59733eb3a70c', 'My work', 'https://something.com',1, false, '019cef9d-7b37-73e8-9e04-d40b9662df66', NOW(),  NOW())

-- 2nd link
INSERT INTO "Link" (id, title, url, "order", public, "userId", "createdAt", "updatedAt") VALUES ('019cefc0-8423-7a20-875b-49c93e1e032f', 'My work', 'https://something1s.com',2, false, '019cef9d-7b37-73e8-9e04-d40b9662df66', NOW(),  NOW())

-- 3rd link
INSERT INTO "Link" (id, title, url, "order", public, "userId", "createdAt", "updatedAt") VALUES ('019cefc0-8423-73a0-9cbf-d9b2d5ab7814', 'My life', 'https://somethingfds.com',3, true, '019cef9d-7b37-73e8-9e04-d40b9662df66', NOW(),  NOW())

-- 4th link
INSERT INTO "Link" (id, title, url, "order", public, "userId", "createdAt", "updatedAt") VALUES ('019cefc0-8423-708a-993f-f58596ee8af0', 'My life', 'https://somethingsdfsd.com',4, true, '019cef9d-7b37-73e8-9e04-d40b9662df66', NOW(),  NOW())

-- 5th link
INSERT INTO "Link" (id, title, url, "order", public, "userId", "createdAt", "updatedAt") VALUES ('019cefc0-8423-7fb8-9682-93b36ad10280', 'My life', 'https://somethingdsfs.com',5, true, '019cef9d-7b37-73e8-9e04-d40b9662df66', NOW(),  NOW())

-- 6th link
INSERT INTO "Link" (id, title, url, "order", public, "userId", "createdAt", "updatedAt") VALUES ('019cefc0-8423-7081-b97d-bd2fa1958678', 'Social media', 'https://somethingsdf.com',6, true, '019cef9d-7b37-73e8-9e04-d40b9662df66', NOW(),  NOW())

-- 7th link
INSERT INTO "Link" (id, title, url, "order", public, "userId", "createdAt", "updatedAt") VALUES ('019cefc0-8423-7e9d-8ce1-2e50101404f8', 'Social media', 'https://somethingfdg.com',7, true, '019cef9d-7b37-73e8-9e04-d40b9662df66', NOW(),  NOW())

-- 8th link
INSERT INTO "Link" (id, title, url, "order", public, "userId", "createdAt", "updatedAt") VALUES ('019cefc0-8423-7d0e-a129-e201278cdcb5', 'Social media', 'https://somethinggds.com',8, true, '019cef9d-7b37-73e8-9e04-d40b9662df66', NOW(),  NOW())

------------------------------------------------ User 3 Example ------------------------------------------------------

-- Story 3 — Priya, the Pro user with sections.

-- One INSERT for Priya into "User" — plan is PRO
-- Three INSERTs into "LinkSection" — Social Media, My Work, Shop
-- Fifteen INSERTs into "Link" — distributed across the 3 sections using their sectionIds

INSERT INTO "User" (id, "fullName", email,password,"userName", plan, "createdAt", "updatedAt") VALUES ('019cf0b6-fd33-777b-95b3-8a3a9e77e61f', 'Priya sharma', 'priyasharma@gamil.com','$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TgxwgK8BZwj.Kb1YVVdNfHJNULiq', 'priyacodes', 'PRO'::"Plan", NOW(), NOW())

-- Link Section 

-- 1st section

INSERT INTO "LinkSection" (id, title, "position", "userId", "createdAt", "updatedAt") VALUES ('019cf0d8-95d9-75fa-a14b-2b34dc744fc0', 'Social media', 1, '019cf0b6-fd33-777b-95b3-8a3a9e77e61f', NOW(),  NOW())

-- 2nd section

INSERT INTO "LinkSection" (id, title, "position", "userId", "createdAt", "updatedAt") VALUES ('019cf0d8-95d9-763f-b8ff-1a7db7e8991b', 'My work', 2, '019cf0b6-fd33-777b-95b3-8a3a9e77e61f', NOW(),  NOW())

-- 3rd section

INSERT INTO "LinkSection" (id, title,"position", "userId", "createdAt", "updatedAt") VALUES ('019cf0d8-95d9-7e32-bd90-d885042534f0', 'Shop', 3, '019cf0b6-fd33-777b-95b3-8a3a9e77e61f', NOW(),  NOW())

-- ALL links

-- 1st link
INSERT INTO "Link" (id, title, url, "order", public, "userId", "sectionId", "createdAt", "updatedAt") VALUES ('019cf0b7-5bad-7a06-a6a3-a9b62d5cd32c', 'Social media', 'https://instagram.com',1, true, '019cf0b6-fd33-777b-95b3-8a3a9e77e61f', '019cf0d8-95d9-7e32-bd90-d885042534f0',NOW(),  NOW())

-- 2nd link
INSERT INTO "Link" (id, title, url, "order", public, "userId", "sectionId","createdAt", "updatedAt") VALUES ('019cf0b7-5bad-741a-abf0-ce4ba7f0a02d', 'Social media', 'https://facebook.com',2, true, '019cf0b6-fd33-777b-95b3-8a3a9e77e61f', '019cf0d8-95d9-7e32-bd90-d885042534f0',NOW(),  NOW())

-- 3rd link
INSERT INTO "Link" (id, title, url, "order", public, "userId", "sectionId","createdAt", "updatedAt") VALUES ('019cf0b7-5bad-79e4-8c0a-ecbcd25f0288', 'Social media', 'https://twitter.com',3, true, '019cf0b6-fd33-777b-95b3-8a3a9e77e61f','019cf0d8-95d9-7e32-bd90-d885042534f0' ,NOW(),  NOW())

-- 4th link
INSERT INTO "Link" (id, title, url, "order", public, "userId", "sectionId","createdAt", "updatedAt") VALUES ('019cf0b7-5bad-7235-8bb6-baf90a79d58e', 'Social media', 'https://youtube.com',4, true, '019cf0b6-fd33-777b-95b3-8a3a9e77e61f', '019cf0d8-95d9-7e32-bd90-d885042534f0',NOW(),  NOW())

-- 5th link
INSERT INTO "Link" (id, title, url, "order", public, "userId", "sectionId","createdAt", "updatedAt") VALUES ('019cf0b7-5bad-7a26-b36a-ee8164436055', 'Social media', 'https://linkedin.com',5, true, '019cf0b6-fd33-777b-95b3-8a3a9e77e61f', '019cf0d8-95d9-7e32-bd90-d885042534f0',NOW(),  NOW())

-- 6th link
INSERT INTO "Link" (id, title, url, "order", public, "userId", "sectionId","createdAt", "updatedAt") VALUES ('019cf0b7-5bad-72c9-b771-63a052b2299f', 'My work', 'https://portfolio.com',6, true, '019cf0b6-fd33-777b-95b3-8a3a9e77e61f', '019cf0d8-95d9-763f-b8ff-1a7db7e8991b',NOW(),  NOW())

-- 7th link
INSERT INTO "Link" (id, title, url, "order", public, "userId","sectionId", "createdAt", "updatedAt") VALUES ('019cf0b7-5bad-7b2f-a0c5-0cee0267a12f', 'My work', 'https://latest-project.com',7, true, '019cf0b6-fd33-777b-95b3-8a3a9e77e61f','019cf0d8-95d9-763f-b8ff-1a7db7e8991b', NOW(),  NOW())

-- 8th link
INSERT INTO "Link" (id, title, url, "order", public, "userId","sectionId", "createdAt", "updatedAt") VALUES ('019cf0b7-5bad-7c24-87df-52b298e27cdf', 'My work', 'https://github.com',8, true, '019cf0b6-fd33-777b-95b3-8a3a9e77e61f', '019cf0d8-95d9-763f-b8ff-1a7db7e8991b',NOW(),  NOW())

-- 9th link
INSERT INTO "Link" (id, title, url, "order", public, "userId","sectionId", "createdAt", "updatedAt") VALUES ('019cf0b7-5bad-724b-a4f9-4af8c62d8a01', 'My work', 'https://dribble.com',9, true, '019cf0b6-fd33-777b-95b3-8a3a9e77e61f','019cf0d8-95d9-763f-b8ff-1a7db7e8991b', NOW(),  NOW())

-- 10th link
INSERT INTO "Link" (id, title, url, "order", public, "userId","sectionId", "createdAt", "updatedAt") VALUES ('019cf0b7-5bad-7fb1-b1c5-d6f77e28eb4b', 'My work', 'https://case-study.com',10, true, '019cf0b6-fd33-777b-95b3-8a3a9e77e61f','019cf0d8-95d9-763f-b8ff-1a7db7e8991b', NOW(),  NOW())

-- 11th link
INSERT INTO "Link" (id, title, url, "order", public, "userId","sectionId", "createdAt", "updatedAt") VALUES ('019cf0b7-5bad-7d7d-9e81-af09a3e83585', 'Shop', 'https://buy-presets.com',11, true, '019cf0b6-fd33-777b-95b3-8a3a9e77e61f', '019cf0d8-95d9-75fa-a14b-2b34dc744fc0', NOW(),  NOW())

-- 12th link
INSERT INTO "Link" (id, title, url, "order", public, "userId","sectionId", "createdAt", "updatedAt") VALUES ('019cf0b7-5bad-7421-81a4-ec5365762e8f', 'Shop', 'https://merch-store.com',12, true, '019cf0b6-fd33-777b-95b3-8a3a9e77e61f', '019cf0d8-95d9-75fa-a14b-2b34dc744fc0', NOW(),  NOW())

-- 13th link
INSERT INTO "Link" (id, title, url, "order", public, "userId","sectionId", "createdAt", "updatedAt") VALUES ('019cf0b7-5bad-7eb4-824c-85db8429769e', 'Shop', 'https://online-course.com',13, true, '019cf0b6-fd33-777b-95b3-8a3a9e77e61f', '019cf0d8-95d9-75fa-a14b-2b34dc744fc0' ,NOW(),  NOW())

-- 14th link
INSERT INTO "Link" (id, title, url, "order", public, "userId","sectionId", "createdAt", "updatedAt") VALUES ('019cf0b7-5bad-7278-95be-fc4db1a5cd70', 'Shop', 'https://commission-work.com',14, true, '019cf0b6-fd33-777b-95b3-8a3a9e77e61f', '019cf0d8-95d9-75fa-a14b-2b34dc744fc0' , NOW(),  NOW())

-- 15th link
INSERT INTO "Link" (id, title, url, "order", public, "userId","sectionId", "createdAt", "updatedAt") VALUES ('019cf0b7-5bad-786d-9e02-f44d39c280ca', 'Shop', 'https://donations.com',15, true, '019cf0b6-fd33-777b-95b3-8a3a9e77e61f', '019cf0d8-95d9-75fa-a14b-2b34dc744fc0', NOW(),  NOW())

------------------------------------------------ User 4 Example ------------------------------------------------------

INSERT INTO "User" (id, "fullName", email, "userName", plan, "createdAt", "updatedAt") VALUES ('019cef9d-7b37-7b87-9438-a06bed688a8f', 'Sarah Banerjee', 'sarahbanerjee@gamil.com', 'sarahqueen', 'FREE'::"Plan", NOW(), NOW())

------------------------------------------------ User 5 Example ------------------------------------------------------

INSERT INTO "User" (id, "fullName", email, "userName", plan, "createdAt", "updatedAt") VALUES ('019cef9d-7b37-7391-97f8-676e2e165567', 'Sarah Banerjee', 'sarahbanerjee@gamil.com', 'sarahqueen', 'FREE'::"Plan", NOW(), NOW())

------------------------------------------------ User 6 Example ------------------------------------------------------

INSERT INTO "User" (id, "fullName", email, "userName", plan, "createdAt", "updatedAt") VALUES ('019cef9d-7b37-732c-9716-03aa68a9574f', 'Sarah Banerjee', 'sarahbanerjee@gamil.com', 'sarahqueen', 'FREE'::"Plan", NOW(), NOW())