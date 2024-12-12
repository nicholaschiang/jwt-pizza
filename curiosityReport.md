# Curiosity Report

One of the topics that we did not cover in-depth during class was the process of handling database migrations alongside a continuous deployment pipeline.
As I generally prefer learning through experimentation, I decided to spend some time building out a [Svelte port](https://github.com/nicholaschiang/dolce/tree/main/svelte-ui) of an old project of mine and setting up a fancy CI/CD pipeline for it using GitHub Actions.
I decided to use [Svelte](https://svelte.dev/) as it [does not have a virtual DOM](https://svelte.dev/blog/virtual-dom-is-pure-overhead) and is used by [this guy](https://www.ekzhang.com/), who seems very cool.

By the end of my work, I had a cleanly structured [repository](https://github.com/nicholaschiang/dolce) that:
- runs 11 checks on every commit (including an integration test suite written with Cypress);
- automatically deploys `main` to production (both the database migrations and the two server-rendered applications);
- and handles automatically updating a [CHANGELOG](https://github.com/nicholaschiang/dolce/blob/main/CHANGELOG.md) and [GitHub releases](https://github.com/nicholaschiang/dolce/releases) by taking advantage of [the conventional commit format](https://www.conventionalcommits.org/en/v1.0.0/).

To do so, I had to handle re-structuring the repository to be somewhat of a mono-repo that contains two applications (one Remix application and one Svelte app) that are both continuously deployed to Vercel and have serverless backing services (the Remix app uses Supabase Postgres while the Svelte app uses Neon Postgres).

The old app can be found here: https://clothes.nicholaschiang.com/

The new Svelte port can be found here: https://collections.nicholaschiang.com/

### Context

Continuous deployment is very convenient to preview your changes in a production-like environment very quickly, without toil.
In the class project, we demonstrated deploying a UI's static assets to AWS S3 on every commit.
However, in a real world application, changes often involve database migrations.
UI changes will break if they do not use a backing service with the compatible database schema.
Thus, it is required that continuous deployment also update the database in preview environments alongside the UI code.

### Solution

There are many services that advertise making continuous deployment easy for database migrations.
Managed Postgres platforms like [Supabase](https://supabase.com/docs/guides/deployment/branching) and [Neon](https://neon.tech/docs/guides/branching-intro) have built-in features for branching.

I decided to repurpose [an old project](https://github.com/nicholaschiang/dolce) to investigate this further.
Given my frontend experience, I decided to keep everything in a single code base and do everything in Typescript.
I chose to use [Drizzle](https://orm.drizzle.team/) as my ORM, as it is much more flexible than incumbent solutions like [Prisma](https://www.prisma.io/) or [Kysely](https://www.kysely.dev/), and because I wanted to try something new.
For this project, `main` is production.
Preview environments are for individual feature branches and are vetted before they make it to `main`.

On every push to `main`, I have [a GitHub Action](https://github.com/nicholaschiang/dolce/blob/main/.github/workflows/migrate.yml) that applies the latest migrations to my production database.
Currently, the production database is hosted on [Neon](https://neon.tech/) for convenience and price.
Eventually, I will move to [Fly](https://fly.io/) (to reduce latency between my server and the end-user) and manage my own Postgres containers.
However, [Fly](https://fly.io/) is much more expensive (than simply hosting static files on Vercel) and the performance benefits are negligible for a personal project (~50ms at most).

### Performance

Somewhat tangential to this class, but I was heavily inspired by [this project](https://github.com/ekzhang/classes.wtf) to investigate the performance of my application.
I realize that to achieve ultimate performance, my tech decisions were not ideal.
However, I think the benefits of a relational database at this scale and for this project outweigh the performance bottlenecks.
With that being said, Postgres is quite fast and is usually fast enough.

I spent quite a bit of time learning how to understand the Postgres `EXPLAIN` output and how to speed up `SELECT` statements.
By creating a single Postgres index, I was able to reduce the query time for the `/collections` page from ~90ms to ~5ms locally ([`29f718740`](https://github.com/nicholaschiang/dolce/commit/29f7187405c93630782dff76bf7094053c42b861)).
A basic query to get "Prada" collections takes ~5ms locally and ~25ms in production:

#### Production

In production, there is some additional latency associated with Neon that I need to investigate further.
However, ~25ms is still quite fast and is typically indistinguishable from instantaneous for a real user.

![collections](./collections.png)

#### Locally

```
postgres=# explain (analyze, buffers) select distinct on ("Collection"."name") "Collection"."id", "Collection"."name", "Collection"."date", "Collection"."location", "Look"."number", "Image"."url" from "Collection" left join "Look" on "Look"."collectionId" = "Collection"."id" left join "Image" on "Image"."lookId" = "Look"."id" where ("Look"."number" = 1 and "Collection"."name" ilike '%dior%') order by "Collection"."name" desc;
                                                                               QUERY PLAN
------------------------------------------------------------------------------------------------------------------------------------------------------------------------
 Unique  (cost=12671.52..12672.63 rows=206 width=153) (actual time=88.662..88.705 rows=179 loops=1)
   Buffers: shared hit=7456
   ->  Sort  (cost=12671.52..12672.08 rows=222 width=153) (actual time=88.657..88.670 rows=179 loops=1)
         Sort Key: "Collection".name DESC
         Sort Method: quicksort  Memory: 56kB
         Buffers: shared hit=7456
         ->  Hash Right Join  (cost=2372.82..12662.87 rows=222 width=153) (actual time=27.578..88.258 rows=179 loops=1)
               Hash Cond: ("Image"."lookId" = "Look".id)
               Buffers: shared hit=7456
               ->  Seq Scan on "Image"  (cost=0.00..9177.42 rows=296142 width=105) (actual time=0.031..31.160 rows=296142 loops=1)
                     Buffers: shared hit=6216
               ->  Hash  (cost=2370.28..2370.28 rows=203 width=56) (actual time=27.162..27.163 rows=179 loops=1)
                     Buckets: 1024  Batches: 1  Memory Usage: 24kB
                     Buffers: shared hit=1240
                     ->  Nested Loop  (cost=0.42..2370.28 rows=203 width=56) (actual time=0.585..27.015 rows=179 loops=1)
                           Buffers: shared hit=1240
                           ->  Seq Scan on "Collection"  (cost=0.00..767.12 rows=206 width=48) (actual time=0.555..23.710 rows=183 loops=1)
                                 Filter: (name ~~* '%dior%'::text)
                                 Rows Removed by Filter: 20227
                                 Buffers: shared hit=512
                           ->  Index Scan using "Look_collectionId_number_key" on "Look"  (cost=0.42..7.78 rows=1 width=12) (actual time=0.017..0.017 rows=1 loops=183)
                                 Index Cond: (("collectionId" = "Collection".id) AND (number = 1))
                                 Buffers: shared hit=728
 Planning:
   Buffers: shared hit=46 dirtied=1
 Planning Time: 1.831 ms
 Execution Time: 88.808 ms
(27 rows)

Time: 93.344 ms
postgres=# CREATE INDEX idx_gin ON public."Collection" USING gin (name gin_trgm_ops);
CREATE INDEX
Time: 152.687 ms
postgres=# CREATE INDEX idx_image_look ON public."Image" USING hash ("lookId");
CREATE INDEX
Time: 221.699 ms
postgres=# explain (analyze, buffers) select distinct on ("Collection"."name") "Collection"."id", "Collection"."name", "Collection"."date", "Collection"."location", "Look"."number", "Image"."url" from "Collection" left join "Look" on "Look"."collectionId" = "Collection"."id" left join "Image" on "Image"."lookId" = "Look"."id" where ("Look"."number" = 1 and "Collection"."name" ilike '%dior%') order by "Collection"."name" desc;
                                                                            QUERY PLAN
------------------------------------------------------------------------------------------------------------------------------------------------------------------
 Unique  (cost=2323.74..2324.85 rows=206 width=153) (actual time=4.776..4.882 rows=179 loops=1)
   Buffers: shared hit=1258
   ->  Sort  (cost=2323.74..2324.30 rows=222 width=153) (actual time=4.772..4.799 rows=179 loops=1)
         Sort Key: "Collection".name DESC
         Sort Method: quicksort  Memory: 56kB
         Buffers: shared hit=1258
         ->  Nested Loop Left Join  (cost=23.01..2315.09 rows=222 width=153) (actual time=0.469..4.005 rows=179 loops=1)
               Buffers: shared hit=1258
               ->  Nested Loop  (cost=23.01..2017.25 rows=203 width=56) (actual time=0.424..2.642 rows=179 loops=1)
                     Buffers: shared hit=899
                     ->  Bitmap Heap Scan on "Collection"  (cost=22.59..414.09 rows=206 width=48) (actual time=0.308..0.988 rows=183 loops=1)
                           Recheck Cond: (name ~~* '%dior%'::text)
                           Heap Blocks: exact=166
                           Buffers: shared hit=171
                           ->  Bitmap Index Scan on idx_gin  (cost=0.00..22.54 rows=206 width=0) (actual time=0.162..0.162 rows=183 loops=1)
                                 Index Cond: (name ~~* '%dior%'::text)
                                 Buffers: shared hit=5
                     ->  Index Scan using "Look_collectionId_number_key" on "Look"  (cost=0.42..7.78 rows=1 width=12) (actual time=0.008..0.008 rows=1 loops=183)
                           Index Cond: (("collectionId" = "Collection".id) AND (number = 1))
                           Buffers: shared hit=728
               ->  Index Scan using idx_image_look on "Image"  (cost=0.00..1.46 rows=1 width=105) (actual time=0.007..0.007 rows=1 loops=179)
                     Index Cond: ("lookId" = "Look".id)
                     Buffers: shared hit=359
 Planning:
   Buffers: shared hit=67
 Planning Time: 1.314 ms
 Execution Time: 4.983 ms
(27 rows)

Time: 10.000 ms
```
