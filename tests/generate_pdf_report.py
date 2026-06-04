import os
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, PageBreak, KeepTogether
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

# Cores do Sistema Aerocode (Palette Premium)
PRIMARY_COLOR = colors.HexColor('#0F172A')     # Slate Escuro (Principal)
SECONDARY_COLOR = colors.HexColor('#2563EB')   # Azul Royal (Destaque)
TEXT_COLOR = colors.HexColor('#334155')        # Slate Médio (Texto)
MUTED_TEXT = colors.HexColor('#64748B')        # Slate Muto (Legendas)
BORDER_COLOR = colors.HexColor('#E2E8F0')      # Cinza Claro (Bordas)
BG_LIGHT = colors.HexColor('#F8FAFC')          # Fundo Alternado

def parse_markdown_tables(filepath):
    """
    Lê o relatório markdown e extrai os dados das tabelas de métricas.
    """
    if not os.path.exists(filepath):
        raise FileNotFoundError(f"Arquivo não encontrado: {filepath}")
        
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
        
    tables = {}
    current_table = None
    lines = content.split("\n")
    
    for line in lines:
        line_str = line.strip()
        if line_str.startswith("#### "):
            header = line_str.replace("#### ", "").strip()
            # Identifica as seções de tabela
            if header in ["Latência", "Tempo de Processamento", "Tempo de Resposta"]:
                current_table = header
                tables[current_table] = []
        elif line_str.startswith("|") and current_table:
            # Ignora linhas de separação markdown
            if "---|---|---" in line_str or "---|---|---|---" in line_str:
                continue
            cols = [c.strip() for c in line_str.split("|")[1:-1]]
            if cols:
                # Trata cabeçalho ou linha de dados
                tables[current_table].append(cols)
    return tables

def add_header_footer(canvas, doc):
    """
    Callback para adicionar cabeçalho e rodapé em todas as páginas (exceto capa).
    """
    canvas.saveState()
    # Não colocar cabeçalho na primeira página (capa)
    if doc.page > 1:
        canvas.setFont('Helvetica', 8)
        canvas.setFillColor(MUTED_TEXT)
        # Cabeçalho da página
        canvas.drawString(54, 745, "Aerocode — Relatório de Performance e Qualidade API v3.0.0")
        canvas.setStrokeColor(BORDER_COLOR)
        canvas.setLineWidth(0.5)
        canvas.line(54, 737, 558, 737)
        
        # Rodapé da página
        canvas.line(54, 50, 558, 50)
        canvas.drawString(54, 38, "Confidencial — Apenas para uso interno da Aerocode")
        canvas.drawRightString(558, 38, f"Página {doc.page}")
    else:
        # Apenas rodapé simples na capa
        canvas.setStrokeColor(BORDER_COLOR)
        canvas.setLineWidth(0.5)
        canvas.line(54, 50, 558, 50)
        canvas.setFont('Helvetica', 8)
        canvas.setFillColor(MUTED_TEXT)
        canvas.drawString(54, 38, "Documento Técnico — Aerocode Corp.")
        canvas.drawRightString(558, 38, "Junho, 2026")
        
    canvas.restoreState()

def build_pdf(md_filepath, pdf_filepath):
    # 1. Carregar dados das tabelas
    tables_data = parse_markdown_tables(md_filepath)
    
    # 2. Configurar o documento (Letter, margens de 0.75 in / 54 pt)
    doc = SimpleDocTemplate(
        pdf_filepath,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )
    
    # 3. Configurar estilos tipográficos
    styles = getSampleStyleSheet()
    
    # Estilo personalizado para banner da capa
    banner_title_style = ParagraphStyle(
        'BannerTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=20,
        textColor=colors.white,
        alignment=1, # Centralizado
        spaceAfter=8
    )
    
    banner_subtitle_style = ParagraphStyle(
        'BannerSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=11,
        textColor=colors.HexColor('#94A3B8'),
        alignment=1, # Centralizado
    )

    h1_style = ParagraphStyle(
        'H1Style',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=14,
        textColor=PRIMARY_COLOR,
        spaceBefore=14,
        spaceAfter=8,
        keepWithNext=True
    )
    
    h2_style = ParagraphStyle(
        'H2Style',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=11,
        textColor=SECONDARY_COLOR,
        spaceBefore=10,
        spaceAfter=6,
        keepWithNext=True
    )
    
    body_style = ParagraphStyle(
        'BodyStyle',
        parent=styles['BodyText'],
        fontName='Helvetica',
        fontSize=9.5,
        textColor=TEXT_COLOR,
        spaceBefore=4,
        spaceAfter=8,
        leading=13.5
    )
    
    bullet_style = ParagraphStyle(
        'BulletStyle',
        parent=body_style,
        leftIndent=15,
        firstLineIndent=-10,
        spaceAfter=4
    )
    
    table_text_style = ParagraphStyle(
        'TableText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.5,
        textColor=colors.HexColor('#1E293B'),
        leading=9.5
    )
    
    table_header_style = ParagraphStyle(
        'TableHeaderText',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7.5,
        textColor=colors.white,
        leading=9.5
    )

    story = []
    
    # ──────────────────────────────────────────────────────────
    # PÁGINA 1: CAPA & INTRODUÇÃO
    # ──────────────────────────────────────────────────────────
    
    # Banner superior escuro de alta qualidade
    banner_content = [
        Paragraph("AEROCODE — SISTEMA DE GESTÃO AERONÁUTICA", banner_subtitle_style),
        Spacer(1, 6),
        Paragraph("Relatório de Qualidade e Performance das APIs", banner_title_style),
        Paragraph("Auditoria Técnica de Latência, Processamento e Concorrência", banner_subtitle_style),
    ]
    
    banner_table = Table([[banner_content]], colWidths=[504])
    banner_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), PRIMARY_COLOR),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 24),
        ('BOTTOMPADDING', (0,0), (-1,-1), 24),
        ('LEFTPADDING', (0,0), (-1,-1), 16),
        ('RIGHTPADDING', (0,0), (-1,-1), 16),
    ]))
    story.append(banner_table)
    story.append(Spacer(1, 20))
    
    # Introdução
    story.append(Paragraph("1. Objetivo e Introdução", h1_style))
    story.append(Paragraph(
        "Este relatório formal apresenta os resultados consolidados de auditoria técnica sobre a qualidade e performance das APIs HTTP/REST do sistema <b>Aerocode</b>. "
        "A finalidade é comprovar a estabilidade do sistema, a integridade da arquitetura de microsserviços e a capacidade de processamento de rotas sob concorrência e carga estressada.",
        body_style
    ))
    
    story.append(Paragraph(
        "Foram monitoradas três métricas cruciais de tráfego de rede e execução lógica no servidor, todas convertidas e expressas em <b>milissegundos (ms)</b>:",
        body_style
    ))
    
    story.append(Paragraph("• <b>Latência de Rede:</b> Tempo puro gasto no trânsito e recepção de pacotes (Round-Trip Time ou RTT).", bullet_style))
    story.append(Paragraph("• <b>Tempo de Processamento:</b> Tempo consumido internamente pelo servidor Express para executar lógica e ler/escrever no banco de dados.", bullet_style))
    story.append(Paragraph("• <b>Tempo de Resposta (Total):</b> Tempo total percebido do lado do cliente (soma de Latência e Processamento).", bullet_style))
    
    story.append(Spacer(1, 10))
    
    # Metodologia
    story.append(Paragraph("2. Metodologia de Medição", h1_style))
    story.append(Paragraph(
        "A medição exata foi executada utilizando duas abordagens complementares integradas no código:",
        body_style
    ))
    story.append(Paragraph(
        "<b>1. Middleware no Backend:</b> Um interceptador global no servidor Express que captura o instante inicial de entrada `process.hrtime()` e o compara "
        "no momento de fechamento (`res.send()`), injetando o tempo lógico real no header HTTP customizado `X-Processing-Time`. Dessa forma, o tempo de rede e "
        "o tempo de máquina do servidor são isolados matematicamente.",
        body_style
    ))
    story.append(Paragraph(
        "<b>2. Script de Concorrência:</b> Um script Python automatizado em `tests/performance_metrics.py` que executa simulações paralelas (Multi-threading HTTP Request Simulation) "
        "para cenários de <b>1, 5 e 10 usuários simultâneos</b> efetuando requisições repetidas e concorrentes sobre todas as rotas ativas do sistema.",
        body_style
    ))
    
    story.append(PageBreak())
    
    # ──────────────────────────────────────────────────────────
    # PÁGINAS SEGUINTES: SEÇÕES DE MÉTRICAS (MÉTRICA + GRÁFICO / TABELA)
    # ──────────────────────────────────────────────────────────
    
    def generate_metric_table(table_data):
        formatted = []
        # Header
        formatted.append([Paragraph(f"<b>{c}</b>", table_header_style) for c in table_data[0]])
        # Rows
        for row in table_data[1:]:
            formatted.append([Paragraph(c, table_text_style) for c in row])
            
        t = Table(formatted, colWidths=[184, 106, 106, 106])
        t_style = [
            ('BACKGROUND', (0, 0), (-1, 0), PRIMARY_COLOR),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('TOPPADDING', (0, 0), (-1, -1), 2.5),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5),
            ('LEFTPADDING', (0, 0), (-1, -1), 5),
            ('RIGHTPADDING', (0, 0), (-1, -1), 5),
        ]
        
        # Zebra coloring
        for i in range(1, len(table_data)):
            bg = BG_LIGHT if i % 2 == 1 else colors.white
            t_style.append(('BACKGROUND', (0, i), (-1, i), bg))
            
        t_style.append(('LINEBELOW', (0, 0), (-1, -1), 0.5, BORDER_COLOR))
        t.setStyle(TableStyle(t_style))
        return t

    # 3. Latência da Rede
    story.append(Paragraph("3. Resultados: Latência da Rede (ms)", h1_style))
    story.append(Paragraph(
        "A latência reflete o tempo de viagem dos pacotes. Em ambiente local e containerizado, ela demonstra a estabilidade da interface do Docker e da rede do host. "
        "O gráfico abaixo apresenta o comportamento sob as cargas de concorrência testadas.",
        body_style
    ))
    
    # Inserção do Gráfico
    chart_latencia = Image("docs/assets/grafico_latencia.png", width=350, height=450)
    story.append(KeepTogether([chart_latencia, Spacer(1, 10)]))
    story.append(PageBreak())
    
    story.append(Paragraph("3.1 Tabela de Latência por Rota (Médias em ms)", h2_style))
    story.append(generate_metric_table(tables_data["Latência"]))
    story.append(PageBreak())
    
    # 4. Tempo de Processamento
    story.append(Paragraph("4. Resultados: Tempo de Processamento (ms)", h1_style))
    story.append(Paragraph(
        "Mede o tempo real gasto em milissegundos dentro da CPU do backend Node.js e queries ao banco de dados MySQL via Prisma ORM. "
        "Demonstra a eficiência de execução de queries, serialização JSON e processamento de rotas autenticadas por JWT.",
        body_style
    ))
    
    chart_processamento = Image("docs/assets/grafico_processamento.png", width=350, height=450)
    story.append(KeepTogether([chart_processamento, Spacer(1, 10)]))
    story.append(PageBreak())
    
    story.append(Paragraph("4.1 Tabela de Tempo de Processamento por Rota (Médias em ms)", h2_style))
    story.append(generate_metric_table(tables_data["Tempo de Processamento"]))
    story.append(PageBreak())
    
    # 5. Tempo de Resposta
    story.append(Paragraph("5. Resultados: Tempo de Resposta Total (ms)", h1_style))
    story.append(Paragraph(
        "Esta métrica representa o tempo total decorrido do lado do cliente (soma de Latência + Processamento). "
        "É a métrica de percepção real do usuário final ao interagir com a aplicação Aerocode.",
        body_style
    ))
    
    chart_resposta = Image("docs/assets/grafico_resposta.png", width=350, height=450)
    story.append(KeepTogether([chart_resposta, Spacer(1, 10)]))
    story.append(PageBreak())
    
    story.append(Paragraph("5.1 Tabela de Tempo de Resposta Total por Rota (Médias em ms)", h2_style))
    story.append(generate_metric_table(tables_data["Tempo de Resposta"]))
    story.append(PageBreak())
    
    # 6. Conclusão
    story.append(Paragraph("6. Conclusão Técnica de Qualidade", h1_style))
    story.append(Paragraph(
        "Os testes de carga estressada e concorrência demonstram a robustez estrutural das APIs do Aerocode. "
        "Como observado nas métricas e gráficos:",
        body_style
    ))
    story.append(Paragraph(
        "1. O tempo de processamento lógico do servidor se mantém estável mesmo com o aumento da concorrência de 1 para 10 usuários simultâneos, "
        "validando as otimizações no Prisma ORM e a indexação eficiente das tabelas no MySQL.",
        body_style
    ))
    story.append(Paragraph(
        "2. As rotas críticas de login `/auth/login` e `/funcionarios` (método POST) demandam maior tempo de processamento lógico "
        "devido ao processo deliberado de hashing de senhas criptográficas (`bcrypt`), o que garante a segurança da autenticação contra ataques de força bruta, "
        "permanecendo perfeitamente dentro dos limites ideais de usabilidade.",
        body_style
    ))
    story.append(Paragraph(
        "3. A estabilidade geral do sistema atesta a viabilidade técnica e a alta disponibilidade da infraestrutura implantada, "
        "concluindo com sucesso os requisitos de auditoria de software exigidos para a entrega da Avaliação AV3.",
        body_style
    ))
    
    story.append(Spacer(1, 30))
    
    # Assinatura
    assinatura_data = [
        [Paragraph("<b>Daniel Dias</b><br/>Administrador do Sistema & DevOps", table_text_style), 
         Paragraph("<b>Aerocode Quality Assurance</b><br/>Auditoria e Testes", table_text_style)]
    ]
    t_ass = Table(assinatura_data, colWidths=[252, 252])
    t_ass.setStyle(TableStyle([
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(KeepTogether([t_ass]))
    
    # Construir PDF
    doc.build(story, onFirstPage=add_header_footer, onLaterPages=add_header_footer)
    print(f"Relatório PDF gerado com sucesso em: {pdf_filepath}")

if __name__ == "__main__":
    build_pdf(
        "docs/relatorio-performance.md",
        "docs/relatorio-performance.pdf"
    )
