"""
elizaOS-inspired M2M settlement layer (hackathon MVP).

Patterns borrowed from elizaOS ecosystem:
- Per-operator agent identities + wallet addresses (A2A / M2M)
- Proof-gated verify-before-clear (VERIFY_PAYMENT → SETTLE_JOB)
- Immutable tx anchor on clear (devnet-simulated; swap for plugin-x402 on mainnet)
"""

from __future__ import annotations

import hashlib
import uuid
from datetime import datetime, timezone
from typing import Any

# Operator franchise → elizaOS-style agent + M2M wallet (Base Sepolia devnet placeholders)
OPERATOR_AGENTS: dict[str, dict[str, str]] = {
    "OP-FRANCHISE-021": {
        "elizaAgentId": "gridpulse-agent-ikeja-li",
        "m2mWallet": "0xIkejaLi4f8a2b9c1d3e5f7a0b2c4d6e8f0a2b4c6",
    },
    "OP-FRANCHISE-008": {
        "elizaAgentId": "gridpulse-agent-yaba-li",
        "m2mWallet": "0xYabaLi1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7",
    },
    "OP-FRANCHISE-033": {
        "elizaAgentId": "gridpulse-agent-lekki-h2",
        "m2mWallet": "0xLekkiH27c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3",
    },
    "OP-FRANCHISE-012": {
        "elizaAgentId": "gridpulse-agent-surulere",
        "m2mWallet": "0xSurul12d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8",
    },
    "OP-FRANCHISE-004": {
        "elizaAgentId": "gridpulse-agent-apapa",
        "m2mWallet": "0xApapa9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a3b4c5",
    },
    "OP-FRANCHISE-002": {
        "elizaAgentId": "gridpulse-agent-ikorodu",
        "m2mWallet": "0xIkorod2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8",
    },
}

NGN_PER_KWH_EQ = 185.0


def _iso_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def agent_for_operator(operator_id: str) -> dict[str, str]:
    return OPERATOR_AGENTS.get(
        operator_id,
        {
            "elizaAgentId": f"gridpulse-agent-{operator_id[-6:].lower()}",
            "m2mWallet": f"0x{hashlib.sha256(operator_id.encode()).hexdigest()[:40]}",
        },
    )


def verify_telemetry_proof(proof_ref: str, cluster_id: str, nodes: list[dict[str, Any]]) -> bool:
    """Proof must match signed IoT telemetry hash for the cluster."""
    if not proof_ref or not proof_ref.startswith("0xproof"):
        return False
    payload = cluster_id + "|".join(
        f"{n['node']['nodeId']}:{n['availableKwhEq']}:{n['node']['powerSource']['gridAvailable']}"
        for n in sorted(nodes, key=lambda x: x["node"]["nodeId"])
    )
    expected = f"0xproof{hashlib.sha256(payload.encode()).hexdigest()[:40]}"
    return proof_ref == expected


def build_m2m_tx_hash(intent: dict[str, Any]) -> str:
    """Simulated on-chain settlement anchor (elizaOS M2M clear receipt)."""
    material = "|".join(
        [
            intent.get("proofRef", ""),
            intent.get("payer", ""),
            intent.get("payee", ""),
            str(intent.get("kwhEq", 0)),
            intent.get("payerAgentId", ""),
            intent.get("payeeAgentId", ""),
        ]
    )
    return f"0x{hashlib.sha256(material.encode()).hexdigest()}"


def enrich_intent(intent: dict[str, Any]) -> dict[str, Any]:
    payer_agent = agent_for_operator(intent["payer"])
    payee_agent = agent_for_operator(intent["payee"])
    kwh = float(intent.get("kwhEq", 0))
    return {
        **intent,
        "intentId": intent.get("intentId") or f"INT-{uuid.uuid4().hex[:8]}",
        "payerAgentId": payer_agent["elizaAgentId"],
        "payeeAgentId": payee_agent["elizaAgentId"],
        "payerWallet": payer_agent["m2mWallet"],
        "payeeWallet": payee_agent["m2mWallet"],
        "amountNgn": round(kwh * NGN_PER_KWH_EQ, 2),
        "protocol": "gridpulse-eliza-m2m-v1",
        "settlementRail": "elizaOS-m2m-simulated",
    }


def verify_intent(intent: dict[str, Any], cluster_id: str, nodes: list[dict[str, Any]]) -> dict[str, Any]:
    proof_ref = intent.get("proofRef")
    if not proof_ref:
        raise ValueError("proofRef required for verification")
    if not verify_telemetry_proof(proof_ref, cluster_id, nodes):
        raise ValueError("Telemetry proof hash mismatch — settlement blocked")

    updated = {**intent, "status": "PROOF_VERIFIED", "verifiedAt": _iso_now()}
    updated["verification"] = {
        "method": "IOT_TELEMETRY_HASH",
        "clusterId": cluster_id,
        "verifiedBy": "gridpulse-eliza-verifier",
    }
    return updated


def clear_intent(intent: dict[str, Any]) -> dict[str, Any]:
    if intent.get("status") != "PROOF_VERIFIED":
        raise ValueError("Intent must be PROOF_VERIFIED before clear")

    tx_hash = build_m2m_tx_hash(intent)
    return {
        **intent,
        "status": "CLEARED",
        "txHash": tx_hash,
        "clearedAt": _iso_now(),
        "settlement": {
            "rail": "elizaOS-m2m",
            "action": "SETTLE_JOB",
            "receipt": tx_hash,
        },
    }


def list_agent_registry() -> list[dict[str, str]]:
    rows = []
    for operator_id, agent in OPERATOR_AGENTS.items():
        rows.append(
            {
                "operatorId": operator_id,
                "elizaAgentId": agent["elizaAgentId"],
                "m2mWallet": agent["m2mWallet"],
                "role": "M2M_SETTLEMENT",
            }
        )
    return rows
