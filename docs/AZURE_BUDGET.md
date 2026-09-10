# Azure Korea budget recommendation — 2026-09-09

Research only: no Azure resources were inspected through the user's account, provisioned, resized, stopped, or deleted. No deployment/application configuration changed.

## Current direction: existing personal $200 trial, 16 GiB, no PAYG (2026-09-09)

User rejects PAYG because of billing-control concerns and says an existing personal account has $200 trial credit. New target is one 16-GiB VM for the remaining trial period (up to 30 days), total spending target $190. This supersedes the three/four-month and PAYG-dependent options below. No account creation, eligibility workaround, subscription upgrade or deployment was performed.

Live Korea Central ordinary Linux Consumption meters rechecked:

| VM (all 4 vCPU / 16 GiB) | Hourly compute | 720-hour compute | With 128-GiB E10 SSD + one IPv4 |
|---|---:|---:|---:|
| D4as_v5 | $0.212 | $152.64 | $165.84 |
| **D4as_v6 — preferred if available** | **$0.224** | **$161.28** | **$174.48** |
| D4s_v5 | $0.236 | $169.92 | $183.12 |
| D4s_v6 | $0.248 | $178.56 | $191.76 |

Totals allow one full month of E10 LRS Standard SSD at $9.60 plus IPv4 at $0.005/hour ($3.60 for 720 hours); disk I/O, added backups/logging/network use and other resources are excluded. No free disk benefit assumed. Preferred option leaves $15.52 within the user's $190 target, or $25.52 of an unused $200 credit. Do not select optional paid Bastion, NAT Gateway or marketplace software without pricing/authorization.

Proposed setup: D4as_v6, compatible Ubuntu Server 24.04 Gen2/NVMe image, 128-GiB Standard SSD, local PostgreSQL/pgvector, production API and static web behind one HTTPS proxy. Dasv6 requires NVMe-compatible images; account/region quota and capacity must be checked in the portal. D4as_v5 is the fallback if v6 is unavailable. Suitable starting capacity for this RAG app plus light additional projects, not a measured load guarantee.

Keep the trial spending limit enabled; it caps covered spending at the credit amount, not a custom $190 (budgets are alerts, not hard limits). Use the subscription's actual expiry/remaining credit: the initial 30-day clock is not restarted by creating a VM. Plan off-Azure database/config backups before expiry, e.g. day 27–28, rather than relying on disabled resources for retention. Gemini charges remain separate.

- [Live VM/disk/IP query](https://prices.azure.com/api/retail/prices?%24filter=armRegionName%20eq%20%27koreacentral%27%20and%20priceType%20eq%20%27Consumption%27%20and%20((serviceName%20eq%20%27Virtual%20Machines%27%20and%20(armSkuName%20eq%20%27Standard_D4as_v5%27%20or%20armSkuName%20eq%20%27Standard_D4as_v6%27%20or%20armSkuName%20eq%20%27Standard_D4s_v5%27%20or%20armSkuName%20eq%20%27Standard_D4s_v6%27))%20or%20(productName%20eq%20%27Standard%20SSD%20Managed%20Disks%27%20and%20(meterName%20eq%20%27E10%20LRS%20Disk%27%20or%20meterName%20eq%20%27E6%20LRS%20Disk%27))%20or%20(serviceName%20eq%20%27Virtual%20Network%27%20and%20meterName%20eq%20%27Standard%20IPv4%20Static%20Public%20IP%27)))
- [Dasv6 specifications and NVMe requirement](https://learn.microsoft.com/en-us/azure/virtual-machines/sizes/general-purpose/dasv6-series)
- [Trial spending-limit behavior](https://learn.microsoft.com/en-us/azure/cost-management-billing/manage/spending-limit)

## After the ordinary Free Account $200 credit is exhausted (2026-09-09)

User confirmed the ordinary $200 trial credit has already been consumed and asked whether the remaining free services can host this app. This is separate from obtaining Student credit. Public-offer research only; subscription status, remaining benefits and Korea availability are still unknown.

- **PAYG upgrade is required to continue using the expired/consumed Free Trial subscription.** Free allowances can continue, but usage outside allowances is billable. Upgrade is not authorized by this research request. Microsoft warns that paid resources disabled with the trial can be re-enabled on upgrade and incur charges: inspect the historical Monarch VM, disks and other resources before any upgrade. Do not delete resources/data without authorization.
- Confirm the free-service expiry date and each exact meter in the subscription's Free services grid. The general free-services page describes the first 12 months from account creation; the upgrade article uses different wording (“12 months after the upgrade”). Do not promise a fresh 12-month period based on upgrading; the actual portal entitlement/expiry must govern.
- **New finding:** the ordinary Free Account catalog explicitly lists two 64-GB **P6** SSDs, 1 GB snapshot and 2 million I/O operations for 12 months. Earlier estimates conservatively charged for Standard SSD E4/E6; this newly verified P6 allowance is a different SKU and must be confirmed on this account. It is not a blanket free-disk allowance.

| Component | Conditional free option | Fit / limitations |
|---|---|---|
| React frontend | Static Web Apps Free, always-free | 100 GB monthly bandwidth/subscription; 250 MB per deployed environment, 500 MB total per app; does not directly host this Fastify process |
| PostgreSQL + pgvector | Flexible Server Burstable B1MS, 750 hours/month, 32 GB DB and 32 GB backup, first-year allowance | Enable `vector`, configure TLS/firewall, initialize schema and migrate data; don't enable extra HA/storage/backup features assuming they are free |
| API VM | B2ats_v2, 2 vCPU/1 GiB, 750 hours/month, first-year allowance | Reasonable low-load starting hypothesis with DB external; exact region/SKU quota and app memory need verification |
| VM OS disk | Exact 64-GB P6 allowance above | If VM, disk and PG are all covered, a single standard IPv4 remains about $3.65/month at the previously verified $0.005/hour, before extras |
| Alternative API | Linux App Service F1, always-free: shared CPU, 1 GB RAM/storage, 60 CPU-minutes/day | Demo/testing only, no SLA/production support. CPU minutes are not wall-clock uptime. Quota exhaustion and idle unloading can interrupt work; no Always On on F1 |
| Alternative API | Container Apps Consumption: 180,000 vCPU-seconds, 360,000 GiB-seconds, 2M requests/month/subscription | Scale-to-zero can keep light-use compute within the grant; not an unlimited always-on VM, idle replicas and related resources may cost money |

Potential near-zero setup: free B2ats_v2 API + free P6 disk + free PostgreSQL, with built static web on that VM or Static Web Apps. Budget IPv4 and other extras explicitly. A $0-in-free-allowances demo candidate is Static Web Apps Free + App Service F1 + free PostgreSQL, but it needs production build packaging, runtime compatibility, migrations/TLS, authentication cookie/CORS configuration and small-upload/restart tests. It is not deployment-ready or a guaranteed $0 invoice.

The current API returns before ingestion finishes (`setImmediate`, in-memory text map). App Service can unload after 20 minutes without incoming requests; Container Apps can scale to zero. Both make durable background ingestion/retry handling important. Container Apps is therefore not the first recommendation for deploying the existing flow unchanged. Do not propose keepalive traffic to bypass free-tier restrictions. Extra registry/logging/storage/egress can be billable. Gemini billing remains separate.

If the 12-month PostgreSQL/VM benefits have expired, the always-free frontend/API offers do not by themselves provide this app's PostgreSQL/pgvector database. Cosmos DB/Azure SQL are not drop-in replacements. Do not claim an indefinitely free full-stack Azure deployment for the current design.

Sources checked:

- [Free Account continuation and charging rules](https://learn.microsoft.com/en-us/azure/cost-management-billing/manage/avoid-charges-free-account)
- [Upgrade warning: disabled paid resources can reactivate](https://learn.microsoft.com/en-us/azure/cost-management-billing/manage/upgrade-azure-subscription)
- [Free services catalog with VM, PostgreSQL and P6 disk allowances](https://azure.microsoft.com/en-au/pricing/free-services/)
- [Inspect actual free-service usage](https://learn.microsoft.com/en-us/azure/cost-management-billing/manage/check-free-service-usage)
- [Static Web Apps exact quotas](https://learn.microsoft.com/en-us/azure/static-web-apps/quotas)
- [Linux App Service F1 pricing and limitations](https://azure.microsoft.com/en-us/pricing/details/app-service/linux/)
- [App Service idle unloading](https://learn.microsoft.com/en-us/azure/app-service/configure-common)
- [Container Apps allocation-based billing and grants](https://learn.microsoft.com/en-us/azure/container-apps/billing)
- [Budget alerts do not stop consumption](https://learn.microsoft.com/en-us/azure/cost-management-billing/costs/tutorial-acm-create-budgets)

## Revised recommendation: three months acceptable (2026-09-09 follow-up)

The user relaxed the four-month target to roughly three months and requested another comparison. This supersedes the duration constraint below, which is retained as the original research.

Preferred simple setup: **Korea Central B1ms (1 vCPU / 2 GiB), Ubuntu Server, E6 64-GiB Standard SSD, one regional Standard IPv4, local PostgreSQL/pgvector + compiled Fastify API + static web/HTTPS proxy, 24/7.** No new-customer free-service allowance is assumed. At 730 hours/month: compute $18.98 + SSD $4.80 + IPv4 $3.65 = **$27.43/month; $82.29 for three months**, leaving $17.71 of a full unused $100 credit for variable charges. This is a light-use sizing recommendation, not a measured performance guarantee.

| Region / configuration | Monthly base | Three-month base |
|---|---:|---:|
| Korea Central B1ms, 2 GiB RAM, 32-GiB SSD | $25.03 | $75.09 |
| Korea Central B1ms, 2 GiB RAM, 64-GiB SSD — preferred | $27.43 | $82.29 |
| Korea Central B2als_v2, 4 GiB RAM, 32-GiB SSD | $40.214 | $120.642 |
| Korea South B2als_v2, 4 GiB RAM, 32-GiB SSD | $37.586 | $112.758 |

Requeried ordinary Linux retail VM meters: Central B1ms $0.026/hour, Central B2als_v2 $0.0468/hour, South B2als_v2 $0.0432/hour. Also verified South E4 $2.40/month, E6 $4.80/month, regional IPv4 $0.005/hour. Central disk/IP rates remain as recorded below. Three months use 2,190 hours for comparison; September 9–December 9 is 2,184 hours. Actual invoice periods/operations can differ.

Four-GiB options therefore need either additional credit or a shorter lifetime: roughly 2.49 months Central / 2.66 months South before variable charges; reserving $10 reduces those to about 2.24 / 2.39 months. They do not fit a full three-month $100 budget under the stated configuration. Adding 64-GiB storage to these adds $2.40/month.

Deployment still requires the production-build changes below. Keep the database private, take off-VM backups, cap log growth and upload concurrency, and test memory/CPU credits before adding other backends. An optional small swap file is emergency memory headroom, not equivalent to additional RAM. Two static sites are a more realistic addition than two heavy full-stack apps. Student benefits can still improve the setup if confirmed, but are no longer prerequisites for this recommendation. No deploy or resize has been authorized.

## Constraint and recommendation

- User budget: $100 Azure for Students credit over four months, Korea region, this RAG app first; one or two additional small projects only if resources permit.
- Assume 24/7 operation and 730 hours/month for comparisons. Four calendar months from September 9 contain 2,928 hours, slightly more than the 2,920-hour comparison. Prices are USD retail estimates, not a subscription quote.
- Preferred conditional setup: Korea Central B2ats_v2 (2 vCPU, 1 GiB) for the compiled Fastify API and static web/proxy; PostgreSQL Flexible Server B1MS using the student's free database allowance. Free VM eligibility further reduces cost. Confirm both allowances have at least four months remaining and that the account can deploy the exact SKUs in Korea Central.
- Student credit alone does NOT establish eligibility for the new-customer 12-month free services. The historical $200 trial in this repo makes checking actual entitlement especially important.
- Without the database allowance: paid B2ats_v2 with local pgvector fits the monetary budget but 1 GiB is a constrained demo configuration requiring load tests. B1ms with local pgvector has more useful memory but slightly exceeds $100 over four months before extras; use a daily deallocation schedule if downtime is acceptable, or increase budget.

## Verified retail meters

Official Retail Prices API queried on 2026-09-09. Linux Consumption / ordinary Virtual Machines products only; Windows, Cloud Services, Spot, and Low Priority rows excluded.

| Korea Central resource | Resources | Rate | 730-hour monthly cost |
|---|---|---:|---:|
| Standard_B2ats_v2 | 2 vCPU / 1 GiB | $0.0117/hour | $8.541 |
| Standard_B1ms | 1 vCPU / 2 GiB | $0.026/hour | $18.98 |
| Standard_B2als_v2 | 2 vCPU / 4 GiB | $0.0468/hour | $34.164 |
| Standard_B2s | 2 vCPU / 4 GiB | $0.052/hour | $37.96 |
| Standard_D4as_v5 | 4 vCPU / 16 GiB | $0.212/hour | $154.76 |
| E4 LRS Standard SSD | 32 GiB | $2.40/month | $2.40 |
| E6 LRS Standard SSD | 64 GiB | $4.80/month | $4.80 |
| Standard IPv4 static public IP | One regional address | $0.005/hour | $3.65 |

The E4 LRS Disk Operations meter is $0.002 per 10,000 operations. Disk operations, extra backups/snapshots, excess network transfer, domains, and any paid Gemini usage are excluded from the base totals. Do not assume disks are free. A 64-GiB OS image requires budgeting E6 instead of E4.

Korea South comparison: B1ms is also $0.026/hour; B2als_v2 is $0.0432/hour ($31.536/month compute alone), still above the entire monthly budget. ARM B2pts_v2/B2pls_v2 had no ordinary VM price rows in the queried Korea Central results; do not assume regional availability from the global free-offer list.

| Configuration | Base/month | Base/four 730-hour months |
|---|---:|---:|
| Free B2ats_v2 + free PostgreSQL + E4 + one IPv4 | $6.05 | $24.20 |
| Paid B2ats_v2 + free PostgreSQL + E4 + one IPv4 | $14.591 | $58.364 |
| Paid B2ats_v2 + local PostgreSQL + E4 + one IPv4 | $14.591 | $58.364 |
| Paid B1ms + local PostgreSQL + E4 + one IPv4 | $25.03 | $100.12 |
| Paid B2als_v2 + local PostgreSQL + E4 + one IPv4 | $40.214 | $160.856 |

## Deployment prerequisites, not yet implemented

- Gemini generation/embeddings run remotely; no GPU or local model host is needed. Gemini billing is separate from Azure credit.
- Current compose runs `tsx watch` and Vite development servers; do not use that configuration for the small production VM. Build off-VM, deploy compiled API and static web, omit mobile tooling/pgAdmin/dev watchers, limit log retention, and keep one HTTPS proxy/public IP.
- Free PostgreSQL offer currently lists 750 hours/month of B1MS, 32 GB storage and 32 GB backup for eligible first-year accounts. Keep within the exact offer settings; avoid optional HA/geo-backup/excess storage charges. Enable the `vector` extension, configure verified TLS and restricted network access, and test schema/bootstrap/migrations and restore before switching databases.
- A 1-GiB API VM with a separate database is a reasonable light-use starting hypothesis, not a measured capacity result. Start with this app; add static sites freely within storage limits, but measure memory/CPU credits and upload peaks before adding other API services. Three active full-stack apps are not guaranteed.
- B-series vCPUs are burstable, not sustained full-core capacity. Monitor CPU credits, memory, disk use and ingestion latency. Keep upload concurrency low; a swap file can be an emergency buffer, not replacement RAM.
- Ingestion currently uses in-process background work/in-memory text. Avoid automatic scale-to-zero or shutdown during ingestion; test restarts and failure recovery.
- For a single 2-GiB B1ms VM without free benefits, 20 hours/day gives roughly $21.87/month base on the same average-month basis. Deallocate (not just guest shutdown); disk/public IP still cost money. Allow a few dollars for variable usage and accept the daily outage explicitly.
- Check actual free-service usage, Korea SKU/quota availability, remaining credit/expiry and existing billable resources before creating anything. Historical Monarch D4as_v5 would exhaust this budget quickly if still billable; do not assume it is running or alter it without authorization.

## Primary sources

- [Azure for Students: credit and free allowances](https://azure.microsoft.com/en-us/free/students/)
- [Retail Prices API reference](https://learn.microsoft.com/en-us/rest/api/cost-management/retail-prices/azure-retail-prices)
- [Korea Central VM price query](https://prices.azure.com/api/retail/prices?%24filter=armRegionName%20eq%20%27koreacentral%27%20and%20serviceName%20eq%20%27Virtual%20Machines%27%20and%20priceType%20eq%20%27Consumption%27%20and%20(armSkuName%20eq%20%27Standard_B1ms%27%20or%20armSkuName%20eq%20%27Standard_B2als_v2%27%20or%20armSkuName%20eq%20%27Standard_B2ats_v2%27%20or%20armSkuName%20eq%20%27Standard_D4as_v5%27%20or%20armSkuName%20eq%20%27Standard_B2s%27))
- [Korea Central disk price query](https://prices.azure.com/api/retail/prices?%24filter=armRegionName%20eq%20%27koreacentral%27%20and%20serviceName%20eq%20%27Storage%27%20and%20(productName%20eq%20%27Standard%20SSD%20Managed%20Disks%27%20or%20productName%20eq%20%27Standard%20HDD%20Managed%20Disks%27))
- [Public IP price query](https://prices.azure.com/api/retail/prices?%24filter=armRegionName%20eq%20%27koreacentral%27%20and%20serviceName%20eq%20%27Virtual%20Network%27)
- [Basv2 specifications and CPU credits](https://learn.microsoft.com/en-us/azure/virtual-machines/sizes/general-purpose/basv2-series)
- [Managed disk sizes and billing](https://azure.microsoft.com/en-us/pricing/details/managed-disks/)
- [Bandwidth pricing](https://azure.microsoft.com/en-us/pricing/details/bandwidth/)
- [Enable pgvector on Azure PostgreSQL](https://learn.microsoft.com/en-us/azure/postgresql/extensions/how-to-use-pgvector)

Public prices do not verify the user's subscription benefits, permitted regions, capacity, quotas, or measured application performance. Recheck the portal estimate before deployment.
