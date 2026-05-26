# ═══════════════════════════════════════════════════════════
# Teste 08 — Relatórios (Geração + Download TXT)
# ═══════════════════════════════════════════════════════════

import requests


class TestRelatoriosListar:
    def test_listar_sem_token_retorna_401(self, base_url):
        assert requests.get(f"{base_url}/api/relatorios").status_code == 401

    def test_listar_com_token(self, base_url, admin_headers):
        resp = requests.get(f"{base_url}/api/relatorios", headers=admin_headers)
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)

    def test_relatorios_incluem_aeronave(self, base_url, admin_headers):
        resp = requests.get(f"{base_url}/api/relatorios", headers=admin_headers)
        for r in resp.json():
            if r.get("aeronave"):
                assert "codigo" in r["aeronave"]


class TestRelatoriosGerar:
    def test_gerar_relatorio_como_admin(self, base_url, admin_headers):
        aeros = requests.get(f"{base_url}/api/aeronaves", headers=admin_headers).json()
        aero_id = aeros[0]["id"]
        resp = requests.post(f"{base_url}/api/relatorios", headers=admin_headers,
            json={"aeronaveId": aero_id})
        assert resp.status_code == 201
        data = resp.json()
        assert "nomeArquivo" in data
        assert "conteudo" in data
        assert len(data["conteudo"]) > 0

    def test_relatorio_contem_dados_da_aeronave(self, base_url, admin_headers):
        aeros = requests.get(f"{base_url}/api/aeronaves", headers=admin_headers).json()
        aero = aeros[0]
        resp = requests.post(f"{base_url}/api/relatorios", headers=admin_headers,
            json={"aeronaveId": aero["id"]})
        conteudo = resp.json()["conteudo"]
        assert aero["codigo"] in conteudo

    def test_gerar_sem_aeronaveId_retorna_400(self, base_url, admin_headers):
        resp = requests.post(f"{base_url}/api/relatorios", headers=admin_headers, json={})
        assert resp.status_code == 400

    def test_gerar_com_aeronave_inexistente_retorna_404(self, base_url, admin_headers):
        resp = requests.post(f"{base_url}/api/relatorios", headers=admin_headers,
            json={"aeronaveId": 999999})
        assert resp.status_code == 404

    def test_operador_nao_pode_gerar(self, base_url, operador_headers):
        resp = requests.post(f"{base_url}/api/relatorios", headers=operador_headers,
            json={"aeronaveId": 1})
        assert resp.status_code == 403


class TestRelatoriosDownload:
    def test_download_txt_retorna_conteudo(self, base_url, admin_headers):
        """GET /api/relatorios/:id/download deve retornar text/plain."""
        # Gerar um relatório primeiro
        aeros = requests.get(f"{base_url}/api/aeronaves", headers=admin_headers).json()
        create = requests.post(f"{base_url}/api/relatorios", headers=admin_headers,
            json={"aeronaveId": aeros[0]["id"]})
        rel_id = create.json()["id"]

        resp = requests.get(f"{base_url}/api/relatorios/{rel_id}/download", headers=admin_headers)
        assert resp.status_code == 200
        assert "text/plain" in resp.headers.get("Content-Type", "")
        assert len(resp.text) > 0

    def test_download_tem_content_disposition(self, base_url, admin_headers):
        aeros = requests.get(f"{base_url}/api/aeronaves", headers=admin_headers).json()
        create = requests.post(f"{base_url}/api/relatorios", headers=admin_headers,
            json={"aeronaveId": aeros[0]["id"]})
        rel_id = create.json()["id"]

        resp = requests.get(f"{base_url}/api/relatorios/{rel_id}/download", headers=admin_headers)
        assert "attachment" in resp.headers.get("Content-Disposition", "")

    def test_download_relatorio_inexistente_retorna_404(self, base_url, admin_headers):
        resp = requests.get(f"{base_url}/api/relatorios/999999/download", headers=admin_headers)
        assert resp.status_code == 404


class TestRelatoriosExcluir:
    def test_excluir_como_admin(self, base_url, admin_headers):
        aeros = requests.get(f"{base_url}/api/aeronaves", headers=admin_headers).json()
        create = requests.post(f"{base_url}/api/relatorios", headers=admin_headers,
            json={"aeronaveId": aeros[0]["id"]})
        rel_id = create.json()["id"]
        resp = requests.delete(f"{base_url}/api/relatorios/{rel_id}", headers=admin_headers)
        assert resp.status_code == 204
