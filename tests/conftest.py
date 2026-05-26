# ═══════════════════════════════════════════════════════════
# Aerocode V3 — QA Test Configuration (conftest.py)
# Fixtures compartilhadas para todos os testes.
# ═══════════════════════════════════════════════════════════

import os
import time
import pytest
import requests

# URL base da API (pode ser sobrescrita via variável de ambiente)
BASE_URL = os.getenv("API_URL", "http://localhost:3001")


def _login_com_retry(base_url: str, usuario: str, senha: str, max_retries: int = 3) -> dict:
    """
    Faz login com retry automático para lidar com o rate limiter (429).
    Espera 62 segundos quando recebe 429 e tenta novamente.
    """
    for attempt in range(max_retries):
        resp = requests.post(
            f"{base_url}/api/auth/login",
            json={"usuario": usuario, "senha": senha},
        )
        if resp.status_code == 200:
            return resp.json()
        if resp.status_code == 429:
            print(f"\n⏳ Rate limit atingido para '{usuario}'. Aguardando 62s (tentativa {attempt + 1}/{max_retries})...")
            time.sleep(62)
            continue
        raise AssertionError(f"Falha no login '{usuario}': {resp.status_code} — {resp.text}")
    raise AssertionError(f"Rate limit persistente para '{usuario}' após {max_retries} tentativas.")


@pytest.fixture(scope="session")
def base_url() -> str:
    """URL base da API do Aerocode."""
    return BASE_URL


@pytest.fixture(scope="session")
def admin_token(base_url: str) -> str:
    """Token JWT válido para o ADMINISTRADOR (session-scoped)."""
    data = _login_com_retry(base_url, "admin", "admin")
    assert "token" in data, "Resposta de login não contém token"
    return data["token"]


@pytest.fixture(scope="session")
def engenheiro_token(base_url: str) -> str:
    """Token JWT válido para o ENGENHEIRO."""
    data = _login_com_retry(base_url, "engenheiro", "engenheiro")
    return data["token"]


@pytest.fixture(scope="session")
def operador_token(base_url: str) -> str:
    """Token JWT válido para o OPERADOR."""
    data = _login_com_retry(base_url, "operador", "operador")
    return data["token"]


@pytest.fixture(scope="session")
def admin_headers(admin_token: str) -> dict:
    """Headers com token de ADMINISTRADOR."""
    return {"Authorization": f"Bearer {admin_token}"}


@pytest.fixture(scope="session")
def engenheiro_headers(engenheiro_token: str) -> dict:
    """Headers com token de ENGENHEIRO."""
    return {"Authorization": f"Bearer {engenheiro_token}"}


@pytest.fixture(scope="session")
def operador_headers(operador_token: str) -> dict:
    """Headers com token de OPERADOR."""
    return {"Authorization": f"Bearer {operador_token}"}
