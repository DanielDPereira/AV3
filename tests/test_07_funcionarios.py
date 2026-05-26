# ═══════════════════════════════════════════════════════════
# Teste 07 — CRUD de Funcionários (Admin-only)
# ═══════════════════════════════════════════════════════════

import requests
import uuid


class TestFuncionariosPermissao:
    def test_engenheiro_nao_acessa(self, base_url, engenheiro_headers):
        resp = requests.get(f"{base_url}/api/funcionarios", headers=engenheiro_headers)
        assert resp.status_code == 403

    def test_operador_nao_acessa(self, base_url, operador_headers):
        resp = requests.get(f"{base_url}/api/funcionarios", headers=operador_headers)
        assert resp.status_code == 403


class TestFuncionariosListar:
    def test_listar_como_admin(self, base_url, admin_headers):
        resp = requests.get(f"{base_url}/api/funcionarios", headers=admin_headers)
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)
        assert len(resp.json()) >= 3

    def test_nao_expoe_senha(self, base_url, admin_headers):
        resp = requests.get(f"{base_url}/api/funcionarios", headers=admin_headers)
        for f in resp.json():
            assert "senhaHash" not in f


class TestFuncionariosCriar:
    def test_criar_como_admin(self, base_url, admin_headers):
        u = f"qa_{uuid.uuid4().hex[:8]}"
        resp = requests.post(f"{base_url}/api/funcionarios", headers=admin_headers,
            json={"nome": "QA User", "usuario": u, "senha": "123456", "nivelPermissao": "OPERADOR"})
        assert resp.status_code == 201
        assert resp.json()["usuario"] == u

    def test_usuario_duplicado_retorna_409(self, base_url, admin_headers):
        u = f"dup_{uuid.uuid4().hex[:8]}"
        p = {"nome": "Dup", "usuario": u, "senha": "123"}
        requests.post(f"{base_url}/api/funcionarios", headers=admin_headers, json=p)
        resp = requests.post(f"{base_url}/api/funcionarios", headers=admin_headers, json=p)
        assert resp.status_code == 409

    def test_sem_campos_obrigatorios_retorna_400(self, base_url, admin_headers):
        resp = requests.post(f"{base_url}/api/funcionarios", headers=admin_headers, json={"nome": "X"})
        assert resp.status_code == 400

    def test_novo_funcionario_faz_login(self, base_url, admin_headers):
        u = f"new_{uuid.uuid4().hex[:8]}"
        requests.post(f"{base_url}/api/funcionarios", headers=admin_headers,
            json={"nome": "New", "usuario": u, "senha": "pass123"})
        login = requests.post(f"{base_url}/api/auth/login", json={"usuario": u, "senha": "pass123"})
        assert login.status_code == 200


class TestFuncionariosAtualizar:
    def test_atualizar_nome(self, base_url, admin_headers):
        u = f"upd_{uuid.uuid4().hex[:8]}"
        c = requests.post(f"{base_url}/api/funcionarios", headers=admin_headers,
            json={"nome": "Old", "usuario": u, "senha": "123"})
        fid = c.json()["id"]
        resp = requests.put(f"{base_url}/api/funcionarios/{fid}", headers=admin_headers, json={"nome": "New"})
        assert resp.status_code == 200
        assert resp.json()["nome"] == "New"


class TestFuncionariosSoftDelete:
    def test_soft_delete(self, base_url, admin_headers):
        u = f"del_{uuid.uuid4().hex[:8]}"
        c = requests.post(f"{base_url}/api/funcionarios", headers=admin_headers,
            json={"nome": "Del", "usuario": u, "senha": "123"})
        fid = c.json()["id"]
        resp = requests.delete(f"{base_url}/api/funcionarios/{fid}", headers=admin_headers)
        assert resp.status_code == 204
        get = requests.get(f"{base_url}/api/funcionarios/{fid}", headers=admin_headers)
        assert get.status_code == 200
        assert get.json()["ativo"] is False
