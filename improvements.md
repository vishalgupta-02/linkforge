# These Things need to be optimised or rewritten for better compatibility and future use

1. Main Landing Page
   - Each and every thing needs to be worked upon will take weeks but have to do it for better maintainability and open source.
   - AI writes sluggish codes and outdated things that can't be worked on if breaks (example - draganddrop component for links)

2. Dashboard
   - More unique and modern capabilities and design can be added
   - Things like better links, proper spacing, less clustered and design taste,etc.

3. Links in Dashboard
   - Better drag & drop feature and needs to be optimised for better user experience.
   - Not working in mobile screens or smaller devices
   - congested so needs more spacing
   - premium design is what I want

4. Analytics Page or Dashboard
   - looks decent for now but I think can be improved
   - display stats in days, weeks and months

5. Public profile
   - looks good in v1 but will be made complex for v2 with more features and styles
   - better ux and ui for the public and followers

6. Settings page
   - good for now
   - complexity will be increased when more things added in v2

> Note: All things and improvements will be done in v2 after completing 6 months or less

## Date -> 10-05-2026

1. Add counts to the link model for better links creation limits [Done]
2. add links create api in the dashboard and links page [Done]
3. Check for the issues and follow the roadmap
4. We are 10 days behind the schedule, try to stay on the track and complete before 6 months, more than 1 month if possible

## Date -> 10-05-26

1. Added profile or avatar upload input area and configure properly
2. Make the profile tab fully functional
3. Make the links fully functional too
4. Research whether the theme should be saved in DB or locally
5. Make changes in the color according to the theme of the Shadcn [Done]
6. Keep the logo in the footer look more good [Done]

## Date -> 14-05-2026

1. Added the clickevent controller and services, needs some fixes and cleaning
2. Controller v/s services, click-event v/s analytics - learned about them today
3. tried adding the centralised theme changer but failed even after using AI - didn't nderstand the context properly or what I said
4. Have to study the whole project and list down what I have done and what not
5. need to launch before the september 1 [Most important]

## Date -> 15-05-26

1. Added the analytics in the app for the dashboard
2. add the date range query params in the analytics for better search

## Date -> 17-05-26

1. day 59 is pending too
2. day 60
3. day 61
4. Connecting the redis with the nodejs was quite easy I thought but it was not
5. ioredis is the client used for redis connecting both Node and Redis.

## Date -> 21-05-26

1. what a silly way to feel dumb, I was not sending any response just using the custom wrapper -> ApiResponse in analytics dashboard
2. this is the flow after BullMQ
   request
   ↓
   recordClickEvent()
   ↓
   prisma.clickEvent.create()
   ↓
   redirect

- this is the flow after BullMQ -
  request
  ↓
  enqueueClickEvent()
  ↓
  BullMQ queue
  ↓
  redirect instantly
  ↓
  worker later:
  ↓
  prisma.clickEvent.create()

3. Old service responsibility
   event ingestion + persistence

4. New service responsibility
   event ingestion only
5. Responsiblitiy Division

| Layer            | Responsibility |
| ---------------- | -------------- |
| controller       | orchestrate    |
| tracking.service | enqueue        |
| BullMQ           | transport      |
| worker           | process        |
| Prisma           | persist        |

6. Retry timeline

| Attempt    | Delay     |
| ---------- | --------- |
| 1          | immediate |
| 2          | 1s        |
| 3          | 2s        |
| final fail | 4s        |
