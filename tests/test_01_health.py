# ═══════════════════════════════════════════════════════════
# Teste 01 — Health Check
# Valida que o servidor está rodando e respondendo.
# ═══════════════════════════════════════════════════════════

import requests


class TestHealthCheck:
    """Testes de saúde do servidor."""

    def test_health_endpoint_returns_200(self, base_url: str):
        """GET /api/health deve retornar 200."""
        resp = requests.get(f"{base_url}/api/health")
        assert resp.status_code == 200

    def test_health_response_has_status_ok(self, base_url: str):
        """A resposta deve conter status 'ok'."""
        resp = requests.get(f"{base_url}/api/health")
        data = resp.json()
        assert data["status"] == "ok"

    def test_health_response_has_service_name(self, base_url: str):
        """A resposta deve conter o nome do serviço."""
        resp = requests.get(f"{base_url}/api/health")
        data = resp.json()
        assert "service" in data
        assert "Aerocode" in data["service"]

    def test_health_response_has_version(self, base_url: str):
        """A resposta deve conter a versão."""
        resp = requests.get(f"{base_url}/api/health")
        data = resp.json()
        assert data["version"] == "3.0.0"

    def test_health_response_has_timestamp(self, base_url: str):
        """A resposta deve conter um timestamp ISO."""
        resp = requests.get(f"{base_url}/api/health")
        data = resp.json()
        assert "timestamp" in data
        # Formato ISO 8601
        assert "T" in data["timestamp"]

    def test_unknown_route_returns_404(self, base_url: str):
        """Rota inexistente deve retornar 404."""
        resp = requests.get(f"{base_url}/api/rota-inexistente")
        assert resp.status_code == 404
