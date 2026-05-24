# ═══════════════════════════════════════════════════════════
# Teste 09 — Dashboard (Estatísticas)
# ═══════════════════════════════════════════════════════════

import requests


class TestDashboardStats:
    def test_stats_sem_token_retorna_401(self, base_url):
        assert requests.get(f"{base_url}/api/dashboard/stats").status_code == 401

    def test_stats_retorna_contadores(self, base_url, admin_headers):
        resp = requests.get(f"{base_url}/api/dashboard/stats", headers=admin_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert "aircrafts" in data
        assert "parts" in data
        assert "stages" in data
        assert "tests" in data
        assert isinstance(data["aircrafts"], int)
        assert data["aircrafts"] >= 1

    def test_stats_valores_positivos(self, base_url, admin_headers):
        resp = requests.get(f"{base_url}/api/dashboard/stats", headers=admin_headers)
        data = resp.json()
        for key in ["aircrafts", "parts", "stages", "tests"]:
            assert data[key] >= 0


class TestDashboardRecentAircrafts:
    def test_recent_aircrafts_sem_token_retorna_401(self, base_url):
        assert requests.get(f"{base_url}/api/dashboard/recent-aircrafts").status_code == 401

    def test_recent_aircrafts_retorna_lista(self, base_url, admin_headers):
        resp = requests.get(f"{base_url}/api/dashboard/recent-aircrafts", headers=admin_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)
        assert len(data) >= 1

    def test_recent_aircrafts_tem_campos_esperados(self, base_url, admin_headers):
        resp = requests.get(f"{base_url}/api/dashboard/recent-aircrafts", headers=admin_headers)
        item = resp.json()[0]
        assert "id" in item
        assert "identifier" in item
        assert "model" in item
        assert "status" in item

    def test_recent_aircrafts_maximo_5(self, base_url, admin_headers):
        resp = requests.get(f"{base_url}/api/dashboard/recent-aircrafts", headers=admin_headers)
        assert len(resp.json()) <= 5
