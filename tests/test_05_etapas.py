# ═══════════════════════════════════════════════════════════
# Teste 05 — CRUD de Etapas + Alocação de Funcionários
# Valida operações de CRUD e gestão de alocação N:M.
# ═══════════════════════════════════════════════════════════

import requests


class TestEtapasListar:
    """Testes de listagem de etapas."""

    def test_listar_etapas_sem_token_retorna_401(self, base_url: str):
        """GET /api/etapas sem token deve retornar 401."""
        resp = requests.get(f"{base_url}/api/etapas")
        assert resp.status_code == 401

    def test_listar_etapas_com_token(self, base_url: str, admin_headers: dict):
        """GET /api/etapas deve retornar lista com relações."""
        resp = requests.get(f"{base_url}/api/etapas", headers=admin_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)
        assert len(data) >= 1

    def test_etapas_incluem_aeronave_e_funcionarios(
        self, base_url: str, admin_headers: dict
    ):
        """Cada etapa deve incluir aeronave e funcionários alocados."""
        resp = requests.get(f"{base_url}/api/etapas", headers=admin_headers)
        etapa = resp.json()[0]
        assert "aeronave" in etapa
        assert "funcionarios" in etapa


class TestEtapasCriar:
    """Testes de criação de etapas."""

    def test_criar_etapa_como_admin(self, base_url: str, admin_headers: dict):
        """POST /api/etapas deve criar etapa vinculada a uma aeronave."""
        # Pegar aeronave existente
        aeros = requests.get(
            f"{base_url}/api/aeronaves", headers=admin_headers
        ).json()
        aero_id = aeros[0]["id"]

        resp = requests.post(
            f"{base_url}/api/etapas",
            headers=admin_headers,
            json={
                "nome": "Etapa QA Teste",
                "prazo": "2026-12-31",
                "status": "PENDENTE",
                "aeronaveId": aero_id,
            },
        )
        assert resp.status_code == 201
        data = resp.json()
        assert data["nome"] == "Etapa QA Teste"
        assert data["status"] == "PENDENTE"

    def test_criar_etapa_com_funcionarios(self, base_url: str, admin_headers: dict):
        """POST /api/etapas com funcionarioIds deve alocar automaticamente."""
        aeros = requests.get(
            f"{base_url}/api/aeronaves", headers=admin_headers
        ).json()
        aero_id = aeros[0]["id"]

        funcs = requests.get(
            f"{base_url}/api/funcionarios", headers=admin_headers
        ).json()
        func_ids = [f["id"] for f in funcs[:2]]

        resp = requests.post(
            f"{base_url}/api/etapas",
            headers=admin_headers,
            json={
                "nome": "Etapa Com Alocação QA",
                "prazo": "2026-12-31",
                "aeronaveId": aero_id,
                "funcionarioIds": func_ids,
            },
        )
        assert resp.status_code == 201
        data = resp.json()
        assert len(data.get("funcionarios", [])) == len(func_ids)

    def test_criar_etapa_sem_campos_obrigatorios(
        self, base_url: str, admin_headers: dict
    ):
        """POST /api/etapas sem nome/prazo/aeronaveId deve retornar 400."""
        resp = requests.post(
            f"{base_url}/api/etapas",
            headers=admin_headers,
            json={"nome": "Incompleta"},
        )
        assert resp.status_code == 400

    def test_operador_nao_pode_criar_etapa(
        self, base_url: str, operador_headers: dict
    ):
        """POST /api/etapas como operador deve retornar 403."""
        resp = requests.post(
            f"{base_url}/api/etapas",
            headers=operador_headers,
            json={
                "nome": "Etapa Op",
                "prazo": "2026-12-31",
                "aeronaveId": 1,
            },
        )
        assert resp.status_code == 403


class TestEtapasAtualizar:
    """Testes de atualização de etapas."""

    def test_atualizar_status_da_etapa(self, base_url: str, admin_headers: dict):
        """PUT /api/etapas/:id deve atualizar o status."""
        aeros = requests.get(
            f"{base_url}/api/aeronaves", headers=admin_headers
        ).json()
        aero_id = aeros[0]["id"]

        create_resp = requests.post(
            f"{base_url}/api/etapas",
            headers=admin_headers,
            json={
                "nome": "Etapa Atualizar QA",
                "prazo": "2026-12-31",
                "aeronaveId": aero_id,
            },
        )
        etapa_id = create_resp.json()["id"]

        resp = requests.put(
            f"{base_url}/api/etapas/{etapa_id}",
            headers=admin_headers,
            json={"status": "EM_ANDAMENTO"},
        )
        assert resp.status_code == 200
        assert resp.json()["status"] == "EM_ANDAMENTO"


class TestEtapasAlocacao:
    """Testes de alocação/desalocação de funcionários em etapas."""

    def test_alocar_funcionario_em_etapa(self, base_url: str, admin_headers: dict):
        """POST /api/etapas/:id/funcionarios deve alocar."""
        aeros = requests.get(
            f"{base_url}/api/aeronaves", headers=admin_headers
        ).json()
        aero_id = aeros[0]["id"]

        # Criar etapa
        etapa_resp = requests.post(
            f"{base_url}/api/etapas",
            headers=admin_headers,
            json={
                "nome": "Etapa Alocação QA",
                "prazo": "2026-12-31",
                "aeronaveId": aero_id,
            },
        )
        etapa_id = etapa_resp.json()["id"]

        # Pegar funcionário
        funcs = requests.get(
            f"{base_url}/api/funcionarios", headers=admin_headers
        ).json()
        func_id = funcs[0]["id"]

        resp = requests.post(
            f"{base_url}/api/etapas/{etapa_id}/funcionarios",
            headers=admin_headers,
            json={"funcionarioId": func_id},
        )
        assert resp.status_code == 201

    def test_desalocar_funcionario_de_etapa(self, base_url: str, admin_headers: dict):
        """DELETE /api/etapas/:id/funcionarios/:fid deve desalocar."""
        aeros = requests.get(
            f"{base_url}/api/aeronaves", headers=admin_headers
        ).json()
        aero_id = aeros[0]["id"]

        # Criar etapa
        etapa_resp = requests.post(
            f"{base_url}/api/etapas",
            headers=admin_headers,
            json={
                "nome": "Etapa Desalocar QA",
                "prazo": "2026-12-31",
                "aeronaveId": aero_id,
            },
        )
        etapa_id = etapa_resp.json()["id"]

        funcs = requests.get(
            f"{base_url}/api/funcionarios", headers=admin_headers
        ).json()
        func_id = funcs[0]["id"]

        # Alocar
        requests.post(
            f"{base_url}/api/etapas/{etapa_id}/funcionarios",
            headers=admin_headers,
            json={"funcionarioId": func_id},
        )

        # Desalocar
        resp = requests.delete(
            f"{base_url}/api/etapas/{etapa_id}/funcionarios/{func_id}",
            headers=admin_headers,
        )
        assert resp.status_code == 204


class TestEtapasExcluir:
    """Testes de exclusão de etapas."""

    def test_excluir_etapa_como_admin(self, base_url: str, admin_headers: dict):
        """DELETE /api/etapas/:id como admin deve retornar 204."""
        aeros = requests.get(
            f"{base_url}/api/aeronaves", headers=admin_headers
        ).json()
        aero_id = aeros[0]["id"]

        create_resp = requests.post(
            f"{base_url}/api/etapas",
            headers=admin_headers,
            json={
                "nome": "Etapa Para Excluir QA",
                "prazo": "2026-12-31",
                "aeronaveId": aero_id,
            },
        )
        etapa_id = create_resp.json()["id"]

        resp = requests.delete(
            f"{base_url}/api/etapas/{etapa_id}", headers=admin_headers
        )
        assert resp.status_code == 204

    def test_engenheiro_nao_pode_excluir_etapa(
        self, base_url: str, admin_headers: dict, engenheiro_headers: dict
    ):
        """DELETE /api/etapas/:id como engenheiro deve retornar 403."""
        aeros = requests.get(
            f"{base_url}/api/aeronaves", headers=admin_headers
        ).json()
        aero_id = aeros[0]["id"]

        create_resp = requests.post(
            f"{base_url}/api/etapas",
            headers=admin_headers,
            json={
                "nome": "Etapa No Delete QA",
                "prazo": "2026-12-31",
                "aeronaveId": aero_id,
            },
        )
        etapa_id = create_resp.json()["id"]

        resp = requests.delete(
            f"{base_url}/api/etapas/{etapa_id}", headers=engenheiro_headers
        )
        assert resp.status_code == 403
