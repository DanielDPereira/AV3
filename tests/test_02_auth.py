# ═══════════════════════════════════════════════════════════
# Teste 02 — Autenticação (Login, Logout, /me)
# Valida fluxos de autenticação JWT.
# NOTA: O rate limiter permite 5 tentativas/min por IP.
#       Os testes são organizados para minimizar chamadas.
# ═══════════════════════════════════════════════════════════

import requests


class TestLoginValido:
    """Testes de login com credenciais válidas (3 chamadas)."""

    def test_login_admin(self, base_url: str):
        resp = requests.post(f"{base_url}/api/auth/login",
            json={"usuario": "admin", "senha": "admin"})
        assert resp.status_code == 200
        data = resp.json()
        assert "token" in data
        assert "funcionario" in data
        func = data["funcionario"]
        assert func["usuario"] == "admin"
        assert func["nivelPermissao"] == "ADMINISTRADOR"
        # Não deve conter senha
        assert "senha" not in func
        assert "senhaHash" not in func
        # Campos completos
        assert "id" in func
        assert "nome" in func

    def test_login_engenheiro(self, base_url: str):
        resp = requests.post(f"{base_url}/api/auth/login",
            json={"usuario": "engenheiro", "senha": "engenheiro"})
        assert resp.status_code == 200
        assert resp.json()["funcionario"]["nivelPermissao"] == "ENGENHEIRO"

    def test_login_operador(self, base_url: str):
        resp = requests.post(f"{base_url}/api/auth/login",
            json={"usuario": "operador", "senha": "operador"})
        assert resp.status_code == 200
        assert resp.json()["funcionario"]["nivelPermissao"] == "OPERADOR"


class TestLoginInvalido:
    """Testes de login com credenciais inválidas (2 chamadas)."""

    def test_usuario_inexistente_retorna_401(self, base_url: str):
        resp = requests.post(f"{base_url}/api/auth/login",
            json={"usuario": "naoexiste", "senha": "123"})
        assert resp.status_code == 401
        assert "error" in resp.json()

    def test_senha_incorreta_retorna_401(self, base_url: str):
        resp = requests.post(f"{base_url}/api/auth/login",
            json={"usuario": "admin", "senha": "senhaerrada"})
        assert resp.status_code == 401


class TestLoginValidacao:
    """Testes de validação de campos — NÃO faz login real."""

    def test_sem_campos_retorna_400_ou_429(self, base_url: str):
        """Body vazio deve retornar 400 (ou 429 se rate limiter agir primeiro)."""
        resp = requests.post(f"{base_url}/api/auth/login", json={})
        assert resp.status_code in (400, 429)


class TestLogout:
    """POST /api/auth/logout."""

    def test_logout_retorna_sucesso(self, base_url: str):
        resp = requests.post(f"{base_url}/api/auth/logout")
        assert resp.status_code == 200
        assert "mensagem" in resp.json()


class TestMe:
    """GET /api/auth/me."""

    def test_me_com_token_valido(self, base_url: str, admin_headers: dict):
        resp = requests.get(f"{base_url}/api/auth/me", headers=admin_headers)
        assert resp.status_code == 200
        func = resp.json()["funcionario"]
        assert func["usuario"] == "admin"
        assert "senhaHash" not in func

    def test_me_sem_token_retorna_401(self, base_url: str):
        assert requests.get(f"{base_url}/api/auth/me").status_code == 401

    def test_me_com_token_invalido_retorna_401(self, base_url: str):
        resp = requests.get(f"{base_url}/api/auth/me",
            headers={"Authorization": "Bearer token-invalido"})
        assert resp.status_code == 401
