# BN / Plug Gods (PLUGGODS) content server — Vast.ai

**Home:** Branding Novation server stack (Plug Gods / PLUGGODS shape — Coolify + Caddy/Traefik + Supabase + n8n).  
**Not Chubb:** Do **not** deploy GPU/content workers on client 8 GB boxes (e.g. Chubb `2.31.205.218`).  
**Related:** Origin `branding-novation/server-stack-bootstrap` (portable Coolify/Supabase/n8n kit). DMG Coolify reference host historically `65.21.109.247` (`ubuntu-8gb-hel1-1`).

---

## Hard rule

| Do | Don’t |
| --- | --- |
| Put content/GPU stack on **BN / PLUGGODS host + Vast** | Install ComfyUI / Vast CLI / GPU runners on client Dedicated 8 GB boxes |
| Expose a BN content API clients can call | Grow any client bot box into a media farm |
| Keep Vast API keys only on BN | Put Vast secrets in client Coolify env |

Client Hermes/UGC skills stay **idea/orchestration**. Generate/render runs here.

---

## Architecture

```
[Client Hermes / n8n]  --HTTPS job-->  [BN/PLUGGODS content control plane]
                                            |
                                            +--> queue + object storage (BN Coolify)
                                            |
                                            +--> Vast.ai GPU instance (ComfyUI / video worker)
                                            |
                                            +--<-- artifact URL back to client
```

### A. Control plane (always-on — BN server)

| Service | Role |
| --- | --- |
| `bn-content-api` | Accept jobs (auth token), enqueue, return job id + status |
| Redis / Postgres | Queue + job metadata |
| MinIO / S3-compatible or Coolify volume | Inputs + finished MP4/PNG |
| `bn-vast-orchestrator` | Create/destroy Vast instances, run job, tear down (or warm pool) |
| TLS FQDN | e.g. `content.brandingnovations.com` → BN IP |

### B. Vast.ai workers (GPU, on-demand)

| Piece | Intent |
| --- | --- |
| Template image | ComfyUI (or BN-pinned fork) + workflow pack + ffmpeg |
| Instance policy | Spot/on-demand; auto-destroy after idle N min |
| Secrets | Vast API key **only on BN** |
| Network | Worker pulls job from BN; pushes artifacts back; no client inbound |

### C. Client attach (optional)

- BN webhook: `POST /v1/jobs` with service token  
- Thin Hermes skill on client posts prompt → polls BN → returns URL  
- No Vast credentials on the client host  

---

## Recipe import (from client UGC → BN workflows)

Copy **prompts/schemas only**, not live client Hermes volumes:

1. Faceless / Higgsfield-style prompt packs → BN Comfy/Vast workflow pack  
2. UGC idea JSON (`prompt`, `aspect`, `duration`, `brand`) → BN job schema  
3. Brand voice docs → BN content style presets  

Never install on client boxes: Vast CLI, ComfyUI, CUDA stacks, large model weights.

---

## Phased rollout (BN / PLUGGODS only)

| Phase | Outcome |
| --- | --- |
| **0 — Access** | BN Coolify project `bn-content`; Vast API key in BN secrets |
| **1 — Control plane** | `bn-content-api` + storage + TLS FQDN on BN |
| **2 — Vast smoke** | One GPU: still + short clip artifact |
| **3 — Orchestrator** | Job → rent → run → upload → destroy; idle ≈ $0 |
| **4 — Client wire** | Optional thin client skill → BN API |

---

## Blockers

1. Confirm which BN/PLUGGODS host runs content (HEL1 DMG Coolify vs newer Fleet/64 GB).  
2. Vast.ai API key in BN secrets.  
3. DNS for `content.*` on a BN zone.

---

## SKU note

Content renders are an **add-on** beside bot tiers (Light / Dedicated / Fleet). Price $/job or monthly Vast retain after Phase 2 burn rate.

---

## Decisions

### Decided

1. Content/Vast lives on **BN / Plug Gods server + Vast**, never on Chubb or other client 8 GB hosts.  
2. Clients keep UGC orchestration; heavy render is remote.

### Open

3. Exact BN host + Vast key handoff.  
4. Warm pool vs pure on-demand.  
5. Brand domain for content API.
