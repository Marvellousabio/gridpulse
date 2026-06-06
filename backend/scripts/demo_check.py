"""Pre-demo smoke — run before every presentation."""

from __future__ import annotations

import asyncio
import sys

import httpx

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:5000"


async def main() -> int:
    errors: list[str] = []
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            h = (await client.get(f"{BASE}/v1/health")).json()
            assert h.get("ok") is True, h
            print("health OK", "cencori" if h.get("cencoriEnabled") else "rules-only")
        except Exception as exc:
            errors.append(f"health: {exc}")

        try:
            nodes = (await client.get(f"{BASE}/v1/nodes")).json()
            assert len(nodes) == 12, f"expected 12 nodes, got {len(nodes)}"
            print("nodes OK", len(nodes))
        except Exception as exc:
            errors.append(f"nodes: {exc}")

        try:
            clusters = (await client.get(f"{BASE}/v1/clusters/availability")).json()
            assert len(clusters) == 6
            print("clusters OK")
        except Exception as exc:
            errors.append(f"clusters: {exc}")

        try:
            r = (await client.post(f"{BASE}/v1/orchestrate/rebalance", json={"clusterId": "Ikeja"})).json()
            rid = r["runId"]
            final = None
            for _ in range(40):
                final = (await client.get(f"{BASE}/v1/orchestrate/rebalance/{rid}")).json()
                if final.get("graphPhase") == "DONE" and len(final.get("audit", {}).get("reasoningTrace", [])) >= 5:
                    break
                await asyncio.sleep(0.25)
            assert final and final["graphPhase"] == "DONE"
            intent = final["settlement"]["intents"][0]
            assert intent["status"] in ("CLEARED", "PROOF_VERIFIED", "DISPUTED"), intent["status"]
            print("rebalance OK", intent["status"])
        except Exception as exc:
            errors.append(f"rebalance: {exc}")

        try:
            settlements = (await client.get(f"{BASE}/v1/settlements")).json()
            assert isinstance(settlements, list) and len(settlements) >= 1
            print("settlements OK", len(settlements))
        except Exception as exc:
            errors.append(f"settlements: {exc}")

        try:
            ledger = (await client.get(f"{BASE}/v1/ledger/clean-energy")).json()
            assert isinstance(ledger, list) and len(ledger) >= 1
            print("ledger OK")
        except Exception as exc:
            errors.append(f"ledger: {exc}")

    if errors:
        print("FAILED:")
        for e in errors:
            print(" -", e)
        return 1
    print("ALL CHECKS PASSED")
    return 0


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
