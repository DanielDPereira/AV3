# ═══════════════════════════════════════════════════════════
# Teste 06 — CRUD de Testes
# Valida operações de CRUD para testes de aeronaves.
# ═══════════════════════════════════════════════════════════

import requests


class TestTestesListar:
    """Testes de listagem."""

    def test_listar_testes_sem_token_retorna_401(self, base_url: str):
        """GET /api/testes sem token deve retornar 401."""
        resp = requests.get(f"{base_url}/api/testes")
        assert resp.status_code == 401

    def test_listar_testes_com_token(self, base_url: str, admin_headers: dict):
        """GET /api/testes deve retornar uma lista."""
        resp = requests.get(f"{base_url}/api/testes", headers=admin_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)
        assert len(data) >= 1

    def test_testes_possuem_campos_esperados(
        self, base_url: str, admin_headers: dict
    ):
        """Cada teste deve ter tipo, resultado, aeronave."""
        resp = requests.get(f"{base_url}/api/testes", headers=admin_headers)
        teste = resp.json()[0]
        assert "tipo" in teste
        assert "resultado" in teste
        assert teste["tipo"] in ["ELETRICO", "HIDRAULICO", "AERODINAMICO"]
        assert teste["resultado"] in ["APROVADO", "REPROVADO"]


class TestTestesCriar:
    """Testes de criação."""

    def test_criar_teste_como_admin(self, base_url: str, admin_headers: dict):
        """POST /api/testes deve criar e retornar 201."""
        aeros = requests.get(
            f"{base_url}/api/aeronaves", headers=admin_headers
        ).json()
        aero_id = aeros[0]["id"]

        resp = requests.post(
            f"{base_url}/api/testes",
            headers=admin_headers,
            json={
                "tipo": "ELETRICO",
                "resultado": "APROVADO",
                "aeronaveId": aero_id,
            },
        )
        assert resp.status_code == 201
        data = resp.json()
        assert data["tipo"] == "ELETRICO"
        assert data["resultado"] == "APROVADO"

    def test_criar_teste_tipo_hidraulico(self, base_url: str, admin_headers: dict):
        """POST /api/testes com tipo HIDRAULICO."""
        aeros = requests.get(
            f"{base_url}/api/aeronaves", headers=admin_headers
        ).json()

        resp = requests.post(
            f"{base_url}/api/testes",
            headers=admin_headers,
            json={
                "tipo": "HIDRAULICO",
                "resultado": "REPROVADO",
                "aeronaveId": aeros[0]["id"],
            },
        )
        assert resp.status_code == 201
        assert resp.json()["tipo"] == "HIDRAULICO"
        assert resp.json()["resultado"] == "REPROVADO"

    def test_criar_teste_sem_campos_obrigatorios(
        self, base_url: str, admin_headers: dict
    ):
        """POST /api/testes sem tipo/resultado deve retornar 400."""
        resp = requests.post(
            f"{base_url}/api/testes",
            headers=admin_headers,
            json={"tipo": "ELETRICO"},
        )
        assert resp.status_code == 400

    def test_operador_nao_pode_criar_teste(
        self, base_url: str, operador_headers: dict
    ):
        """POST /api/testes como operador deve retornar 403."""
        resp = requests.post(
            f"{base_url}/api/testes",
            headers=operador_headers,
            json={"tipo": "ELETRICO", "resultado": "APROVADO"},
        )
        assert resp.status_code == 403


class TestTestesAtualizar:
    """Testes de atualização."""

    def test_atualizar_resultado_do_teste(self, base_url: str, admin_headers: dict):
        """PUT /api/testes/:id deve atualizar o resultado."""
        aeros = requests.get(
            f"{base_url}/api/aeronaves", headers=admin_headers
        ).json()

        create_resp = requests.post(
            f"{base_url}/api/testes",
            headers=admin_headers,
            json={
                "tipo": "AERODINAMICO",
                "resultado": "REPROVADO",
                "aeronaveId": aeros[0]["id"],
            },
        )
        teste_id = create_resp.json()["id"]

        resp = requests.put(
            f"{base_url}/api/testes/{teste_id}",
            headers=admin_headers,
            json={"resultado": "APROVADO"},
        )
        assert resp.status_code == 200
        assert resp.json()["resultado"] == "APROVADO"


class TestTestesExcluir:
    """Testes de exclusão."""

    def test_excluir_teste_como_admin(self, base_url: str, admin_headers: dict):
        """DELETE /api/testes/:id como admin deve retornar 204."""
        aeros = requests.get(
            f"{base_url}/api/aeronaves", headers=admin_headers
        ).json()

        create_resp = requests.post(
            f"{base_url}/api/testes",
            headers=admin_headers,
            json={
                "tipo": "ELETRICO",
                "resultado": "APROVADO",
                "aeronaveId": aeros[0]["id"],
            },
        )
        teste_id = create_resp.json()["id"]

        resp = requests.delete(
            f"{base_url}/api/testes/{teste_id}", headers=admin_headers
        )
        assert resp.status_code == 204

    def test_engenheiro_nao_pode_excluir_teste(
        self, base_url: str, admin_headers: dict, engenheiro_headers: dict
    ):
        """DELETE /api/testes/:id como engenheiro deve retornar 403."""
        aeros = requests.get(
            f"{base_url}/api/aeronaves", headers=admin_headers
        ).json()

        create_resp = requests.post(
            f"{base_url}/api/testes",
            headers=admin_headers,
            json={
                "tipo": "ELETRICO",
                "resultado": "APROVADO",
                "aeronaveId": aeros[0]["id"],
            },
        )
        teste_id = create_resp.json()["id"]

        resp = requests.delete(
            f"{base_url}/api/testes/{teste_id}", headers=engenheiro_headers
        )
        assert resp.status_code == 403
