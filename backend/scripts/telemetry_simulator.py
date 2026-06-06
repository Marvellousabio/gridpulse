#!/usr/bin/env python3
"""
Standalone mock IoT telemetry generator for EC2 / local demo.

Posts polymorphic station payloads to GridPulse API (simulates AWS IoT Core → API ingest).

Usage:
  python scripts/telemetry_simulator.py
  python scripts/telemetry_simulator.py --scenario grid_outage_yaba --interval 3
  python scripts/telemetry_simulator.py --trigger-agent
"""

from __future__ import annotations

import argparse
import os
import random
import sys
import time
from datetime import datetime, timezone

import httpx

# Allow running from backend/ root
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.telemetry import generate_telemetry_snapshot  # noqa: E402


def main() -> None:
    parser = argparse.ArgumentParser(description="GridPulse mock IoT telemetry simulator")
    parser.add_argument("--api-url", default=os.getenv("API_BASE_URL", "http://localhost:5000"))
    parser.add_argument("--interval", type=float, default=5.0, help="Seconds between posts")
    parser.add_argument("--scenario", choices=["grid_outage_yaba", "normal", "random"], default="random")
    parser.add_argument("--trigger-agent", action="store_true", help="POST /api/agent/cycle after each ingest")
    parser.add_argument("--once", action="store_true", help="Send one batch and exit")
    args = parser.parse_args()

    base = args.api_url.rstrip("/")
    print(f"GridPulse telemetry simulator → {base}/api/telemetry/ingest")

    with httpx.Client(timeout=15.0) as client:
        while True:
            force = None if args.scenario == "random" else args.scenario
            if args.scenario == "random" and random.random() < 0.15:
                force = "grid_outage_yaba"

            readings = generate_telemetry_snapshot(force)
            response = client.post(f"{base}/api/telemetry/ingest", json=readings)
            response.raise_for_status()
            ts = datetime.now(timezone.utc).isoformat()
            print(f"[{ts}] ingested {len(readings)} stations (scenario={force or 'random'})")

            if args.trigger_agent or force == "grid_outage_yaba":
                agent_resp = client.post(
                    f"{base}/api/agent/cycle",
                    json={"force_scenario": force} if force else {},
                )
                agent_resp.raise_for_status()
                body = agent_resp.json()
                print(f"  agent cycle {body.get('cycle_id', '?')[:8]}… alerts={len(body.get('alerts', []))}")

            if args.once:
                break
            time.sleep(args.interval)


if __name__ == "__main__":
    main()
