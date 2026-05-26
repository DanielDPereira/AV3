# ═══════════════════════════════════════════════════════════
# Teste 03 — CRUD de Aeronaves
# Valida todas as operações CRUD + controle de permissão.
# ═══════════════════════════════════════════════════════════

import requests
import uuid


class TestAeronavesListar:
    """Testes de listagem de aeronaves."""

    def test_listar_aeronaves_sem_token_retorna_401(self, base_url: str):
        """GET /api/aeronaves sem token deve retornar 401."""
        resp = requests.get(f"{base_url}/api/aeronaves")
        assert resp.status_code == 401

    def test_listar_aeronaves_com_token_retorna_lista(
        self, base_url: str, admin_headers: dict
    ):
        """GET /api/aeronaves deve retornar uma lista."""
        resp = requests.get(f"{base_url}/api/aeronaves", headers=admin_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)
        assert len(data) >= 1  # Seed cria pelo menos 4

    def test_listar_aeronaves_retorna_campos_esperados(
        self, base_url: str, admin_headers: dict
    ):
        """Cada aeronave deve conter id, codigo, modelo, tipo, capacidade, alcance."""
        resp = requests.get(f"{base_url}/api/aeronaves", headers=admin_headers)
        aero = resp.json()[0]
        campos = ["id", "codigo", "modelo", "tipo", "capacidade", "alcance"]
        for campo in campos:
            assert campo in aero, f"Campo '{campo}' não encontrado"

    def test_operador_pode_listar_aeronaves(
        self, base_url: str, operador_headers: dict
    ):
        """Operador deve conseguir listar aeronaves (somente leitura)."""
        resp = requests.get(f"{base_url}/api/aeronaves", headers=operador_headers)
        assert resp.status_code == 200


class TestAeronavesCriar:
    """Testes de criação de aeronaves."""

    def test_criar_aeronave_como_admin(self, base_url: str, admin_headers: dict):
        """POST /api/aeronaves como admin deve criar e retornar 201."""
        codigo = f"TEST-{uuid.uuid4().hex[:6].upper()}"
        resp = requests.post(
            f"{base_url}/api/aeronaves",
            headers=admin_headers,
            json={
                "codigo": codigo,
                "modelo": "Teste QA Model",
                "tipo": "COMERCIAL",
                "capacidade": 100,
                "alcance": 5000,
            },
        )
        assert resp.status_code == 201
        data = resp.json()
        assert data["codigo"] == codigo
        assert data["modelo"] == "Teste QA Model"

    def test_criar_aeronave_como_engenheiro(
        self, base_url: str, engenheiro_headers: dict
    ):
        """POST /api/aeronaves como engenheiro deve funcionar."""
        codigo = f"ENG-{uuid.uuid4().hex[:6].upper()}"
        resp = requests.post(
            f"{base_url}/api/aeronaves",
            headers=engenheiro_headers,
            json={
                "codigo": codigo,
                "modelo": "Engenheiro Model",
                "tipo": "MILITAR",
                "capacidade": 50,
                "alcance": 3000,
            },
        )
        assert resp.status_code == 201

    def test_operador_nao_pode_criar_aeronave(
        self, base_url: str, operador_headers: dict
    ):
        """POST /api/aeronaves como operador deve retornar 403."""
        resp = requests.post(
            f"{base_url}/api/aeronaves",
            headers=operador_headers,
            json={
                "codigo": "OP-001",
                "modelo": "Operador Model",
                "tipo": "COMERCIAL",
                "capacidade": 100,
                "alcance": 5000,
            },
        )
        assert resp.status_code == 403

    def test_criar_aeronave_sem_campos_obrigatorios(
        self, base_url: str, admin_headers: dict
    ):
        """POST /api/aeronaves sem campos obrigatórios deve retornar 400."""
        resp = requests.post(
            f"{base_url}/api/aeronaves",
            headers=admin_headers,
            json={"codigo": "INC-001"},
        )
        assert resp.status_code == 400

    def test_criar_aeronave_com_codigo_duplicado(
        self, base_url: str, admin_headers: dict
    ):
        """POST /api/aeronaves com código duplicado deve retornar 409."""
        codigo = f"DUP-{uuid.uuid4().hex[:6].upper()}"
        payload = {
            "codigo": codigo,
            "modelo": "Dup Model",
            "tipo": "COMERCIAL",
            "capacidade": 100,
            "alcance": 5000,
        }
        # Primeira criação
        requests.post(f"{base_url}/api/aeronaves", headers=admin_headers, json=payload)
        # Segunda com mesmo código
        resp = requests.post(
            f"{base_url}/api/aeronaves", headers=admin_headers, json=payload
        )
        assert resp.status_code == 409


class TestAeronavesAtualizar:
    """Testes de atualização de aeronaves."""

    def test_atualizar_aeronave_como_admin(self, base_url: str, admin_headers: dict):
        """PUT /api/aeronaves/:id como admin deve funcionar."""
        # Cria uma aeronave para atualizar
        codigo = f"UPD-{uuid.uuid4().hex[:6].upper()}"
        create_resp = requests.post(
            f"{base_url}/api/aeronaves",
            headers=admin_headers,
            json={
                "codigo": codigo,
                "modelo": "Original",
                "tipo": "COMERCIAL",
                "capacidade": 100,
                "alcance": 5000,
            },
        )
        aero_id = create_resp.json()["id"]

        resp = requests.put(
            f"{base_url}/api/aeronaves/{aero_id}",
            headers=admin_headers,
            json={"modelo": "Atualizado"},
        )
        assert resp.status_code == 200
        assert resp.json()["modelo"] == "Atualizado"

    def test_atualizar_aeronave_inexistente(self, base_url: str, admin_headers: dict):
        """PUT /api/aeronaves/999999 deve retornar 404."""
        resp = requests.put(
            f"{base_url}/api/aeronaves/999999",
            headers=admin_headers,
            json={"modelo": "Nada"},
        )
        assert resp.status_code == 404


class TestAeronavesExcluir:
    """Testes de exclusão de aeronaves."""

    def test_excluir_aeronave_como_admin(self, base_url: str, admin_headers: dict):
        """DELETE /api/aeronaves/:id como admin deve retornar 204."""
        codigo = f"DEL-{uuid.uuid4().hex[:6].upper()}"
        create_resp = requests.post(
            f"{base_url}/api/aeronaves",
            headers=admin_headers,
            json={
                "codigo": codigo,
                "modelo": "To Delete",
                "tipo": "COMERCIAL",
                "capacidade": 100,
                "alcance": 5000,
            },
        )
        aero_id = create_resp.json()["id"]

        resp = requests.delete(
            f"{base_url}/api/aeronaves/{aero_id}", headers=admin_headers
        )
        assert resp.status_code == 204

    def test_engenheiro_nao_pode_excluir_aeronave(
        self, base_url: str, admin_headers: dict, engenheiro_headers: dict
    ):
        """DELETE /api/aeronaves/:id como engenheiro deve retornar 403."""
        codigo = f"NODEL-{uuid.uuid4().hex[:6].upper()}"
        create_resp = requests.post(
            f"{base_url}/api/aeronaves",
            headers=admin_headers,
            json={
                "codigo": codigo,
                "modelo": "No Delete",
                "tipo": "COMERCIAL",
                "capacidade": 100,
                "alcance": 5000,
            },
        )
        aero_id = create_resp.json()["id"]

        resp = requests.delete(
            f"{base_url}/api/aeronaves/{aero_id}", headers=engenheiro_headers
        )
        assert resp.status_code == 403


class TestAeronavesBuscarPorId:
    """Testes de busca por ID."""

    def test_buscar_aeronave_por_id(self, base_url: str, admin_headers: dict):
        """GET /api/aeronaves/:id deve retornar a aeronave com relações."""
        resp = requests.get(f"{base_url}/api/aeronaves", headers=admin_headers)
        aero_id = resp.json()[0]["id"]

        resp2 = requests.get(
            f"{base_url}/api/aeronaves/{aero_id}", headers=admin_headers
        )
        assert resp2.status_code == 200
        data = resp2.json()
        assert data["id"] == aero_id
        # Deve incluir relações
        assert "pecas" in data
        assert "etapas" in data
        assert "testes" in data

    def test_buscar_aeronave_inexistente(self, base_url: str, admin_headers: dict):
        """GET /api/aeronaves/999999 deve retornar 404."""
        resp = requests.get(f"{base_url}/api/aeronaves/999999", headers=admin_headers)
        assert resp.status_code == 404
