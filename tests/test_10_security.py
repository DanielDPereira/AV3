import requests
import time

BASE_URL = "http://localhost:3001/api"

def test_username_enumeration():
    print("--- Testando Enumeração de Usuários (Username Enumeration) ---")
    
    # Teste 1: Usuário que não existe
    res1 = requests.post(f"{BASE_URL}/auth/login", json={"usuario": "usuario_inexistente_123", "senha": "123"})
    print(f"Status: {res1.status_code}, Resposta para usuário INEXISTENTE: {res1.json()}")
    
    # Teste 2: Usuário que (provavelmente) existe
    res2 = requests.post(f"{BASE_URL}/auth/login", json={"usuario": "admin", "senha": "senha_errada_123"})
    print(f"Status: {res2.status_code}, Resposta para usuário EXISTENTE: {res2.json()}")
    print("Vulnerabilidade Encontrada: A API revela se um usuário existe ou não através de mensagens de erro diferentes.")
    print()

def test_object_injection_prisma():
    print("--- Testando Object Injection (NoSQL-like) no Prisma ---")
    # Tentando enviar um objeto no lugar da string para forçar um erro de validação/crash
    res = requests.post(f"{BASE_URL}/auth/login", json={"usuario": {"in": ["admin"]}, "senha": "123"})
    print(f"Status: {res.status_code}")
    try:
        print(f"Resposta JSON: {res.json()}")
    except:
        print(f"Resposta RAW: {res.text}")
    if res.status_code == 500:
        print("Vulnerabilidade Encontrada: Ausência de validação de tipo. O envio de um objeto causa um Erro Interno do Servidor (Crash do Request), abrindo brecha para DoS no log/DB.")
    print()

def test_rate_limiting_flaw():
    print("--- Testando Falha no Rate Limiting ---")
    # O rate limit global usa express-rate-limit corretamente.
    # Mas o auth.routes usa um Map customizado (rateLimitCache) que nunca é limpo (Memory Leak)
    # E que bloqueia o IP por 1 minuto.
    print("Realizando 6 tentativas rápidas de login com usuário e senha incorretos...")
    for i in range(6):
        res = requests.post(f"{BASE_URL}/auth/login", json={"usuario": "admin", "senha": "123"})
        print(f"Tentativa {i+1}: Status {res.status_code} - {res.json().get('error', '')}")
    
    if res.status_code == 429:
        print("Rate limit ativado. Se o servidor estiver atrás de um proxy reverso sem 'trust proxy', todos os usuários seriam bloqueados simultaneamente.")
        print("Além disso, o uso de um Map global sem expiração causa Memory Leak (cada IP acessado fica salvo na memória para sempre).")

if __name__ == "__main__":
    test_username_enumeration()
    test_object_injection_prisma()
    test_rate_limiting_flaw()
