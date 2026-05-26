# ═══════════════════════════════════════════════════════════
# Teste 04 — CRUD de Peças
# Valida operações de CRUD + relação com aeronave.
# ═══════════════════════════════════════════════════════════

import requests


class TestPecasListar:
    """Testes de listagem de peças."""

    def test_listar_pecas_sem_token_retorna_401(self, base_url: str):
        """GET /api/pecas sem token deve retornar 401."""
        resp = requests.get(f"{base_url}/api/pecas")
        assert resp.status_code == 401

    def test_listar_pecas_com_token(self, base_url: str, admin_headers: dict):
        """GET /api/pecas deve retornar uma lista."""
        resp = requests.get(f"{base_url}/api/pecas", headers=admin_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)
        assert len(data) >= 1

    def test_pecas_incluem_aeronave_relacionada(
        self, base_url: str, admin_headers: dict
    ):
        """Cada peça deve incluir dados da aeronave vinculada."""
        resp = requests.get(f"{base_url}/api/pecas", headers=admin_headers)
        pecas_com_aeronave = [p for p in resp.json() if p.get("aeronave")]
        if pecas_com_aeronave:
            assert "codigo" in pecas_com_aeronave[0]["aeronave"]


class TestPecasCriar:
    """Testes de criação de peças."""

    def test_criar_peca_como_admin(self, base_url: str, admin_headers: dict):
        """POST /api/pecas como admin deve criar e retornar 201."""
        resp = requests.post(
            f"{base_url}/api/pecas",
            headers=admin_headers,
            json={
                "nome": "Peça QA Teste",
                "tipo": "NACIONAL",
                "fornecedor": "Fornecedor QA",
                "status": "EM_PRODUCAO",
            },
        )
        assert resp.status_code == 201
        data = resp.json()
        assert data["nome"] == "Peça QA Teste"
        assert data["tipo"] == "NACIONAL"

    def test_criar_peca_com_aeronave(self, base_url: str, admin_headers: dict):
        """POST /api/pecas com aeronaveId deve vincular corretamente."""
        # Pegar uma aeronave existente
        aero_resp = requests.get(f"{base_url}/api/aeronaves", headers=admin_headers)
        aero_id = aero_resp.json()[0]["id"]

        resp = requests.post(
            f"{base_url}/api/pecas",
            headers=admin_headers,
            json={
                "nome": "Peça Vinculada QA",
                "tipo": "IMPORTADA",
                "fornecedor": "Global Supplier",
                "aeronaveId": aero_id,
            },
        )
        assert resp.status_code == 201
        assert resp.json().get("aeronaveId") == aero_id

    def test_criar_peca_sem_campos_obrigatorios(
        self, base_url: str, admin_headers: dict
    ):
        """POST /api/pecas sem nome/tipo/fornecedor deve retornar 400."""
        resp = requests.post(
            f"{base_url}/api/pecas",
            headers=admin_headers,
            json={"nome": "Incompleta"},
        )
        assert resp.status_code == 400

    def test_operador_nao_pode_criar_peca(
        self, base_url: str, operador_headers: dict
    ):
        """POST /api/pecas como operador deve retornar 403."""
        resp = requests.post(
            f"{base_url}/api/pecas",
            headers=operador_headers,
            json={
                "nome": "Peça Op",
                "tipo": "NACIONAL",
                "fornecedor": "Op Corp",
            },
        )
        assert resp.status_code == 403


class TestPecasAtualizar:
    """Testes de atualização de peças."""

    def test_atualizar_peca(self, base_url: str, admin_headers: dict):
        """PUT /api/pecas/:id deve atualizar corretamente."""
        # Criar
        create_resp = requests.post(
            f"{base_url}/api/pecas",
            headers=admin_headers,
            json={
                "nome": "Peça Original",
                "tipo": "NACIONAL",
                "fornecedor": "Original Corp",
            },
        )
        peca_id = create_resp.json()["id"]

        resp = requests.put(
            f"{base_url}/api/pecas/{peca_id}",
            headers=admin_headers,
            json={"nome": "Peça Atualizada", "status": "PRONTA"},
        )
        assert resp.status_code == 200
        assert resp.json()["nome"] == "Peça Atualizada"
        assert resp.json()["status"] == "PRONTA"


class TestPecasExcluir:
    """Testes de exclusão de peças."""

    def test_excluir_peca_como_admin(self, base_url: str, admin_headers: dict):
        """DELETE /api/pecas/:id como admin deve retornar 204."""
        create_resp = requests.post(
            f"{base_url}/api/pecas",
            headers=admin_headers,
            json={
                "nome": "Peça Para Excluir",
                "tipo": "IMPORTADA",
                "fornecedor": "Del Corp",
            },
        )
        peca_id = create_resp.json()["id"]
        resp = requests.delete(
            f"{base_url}/api/pecas/{peca_id}", headers=admin_headers
        )
        assert resp.status_code == 204

    def test_excluir_peca_inexistente(self, base_url: str, admin_headers: dict):
        """DELETE /api/pecas/999999 deve retornar 404."""
        resp = requests.delete(
            f"{base_url}/api/pecas/999999", headers=admin_headers
        )
        assert resp.status_code == 404
