# -*- coding: utf-8 -*-
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib.colors import HexColor, white
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
)

OUTPUT = r"c:\Users\Ahmet\.gemini\antigravity\scratch\squadup\SquadUp_Mimari_Tasarim_Raporu.pdf"

BLUE   = HexColor("#0f172a")
LBLUE  = HexColor("#0ea5e9")
BGRAY  = HexColor("#e2e8f0")
DGRAY  = HexColor("#1e293b")
GRAY   = HexColor("#f8fafc")

def S(name, **kw): return ParagraphStyle(name, **kw)

ST = {
    "title":  S("t",  fontName="Helvetica-Bold", fontSize=16, textColor=white,  leading=22, alignment=TA_CENTER),
    "sub":    S("s",  fontName="Helvetica",      fontSize=10, textColor=HexColor("#38bdf8"), leading=14, alignment=TA_CENTER),
    "h":      S("h",  fontName="Helvetica-Bold", fontSize=12, textColor=BLUE,   leading=18, spaceBefore=12, spaceAfter=6),
    "body":   S("b",  fontName="Helvetica",      fontSize=10, textColor=DGRAY,  leading=14, spaceAfter=4,   alignment=TA_JUSTIFY),
    "bullet": S("bu", fontName="Helvetica",      fontSize=10, textColor=DGRAY,  leading=14, leftIndent=12,  spaceAfter=3),
    "footer": S("f",  fontName="Helvetica",      fontSize=8,  textColor=HexColor("#94a3b8"), alignment=TA_CENTER),
}

def p(txt, st="body"):  return Paragraph(txt, ST[st])
def h(txt):             return p(txt, "h")
def bullet(txt):        return p("•  " + txt, "bullet")
def sp(n=5):            return Spacer(1, n)
def hr():               return HRFlowable(width="100%", thickness=0.5, color=BGRAY, spaceAfter=6, spaceBefore=4)

def header():
    data = [[
        p("SquadUp — Mobil Uygulama Mimari Tasarim Raporu", "title"),
        p("6. Hafta Fonksiyonel Programlama Laboratuvari", "sub"),
    ]]
    return Table([[data[0]]], colWidths=[16.5*cm],
                 style=TableStyle([
                     ("BACKGROUND",   (0,0),(-1,-1), BLUE),
                     ("TOPPADDING",   (0,0),(-1,-1), 16),
                     ("BOTTOMPADDING",(0,0),(-1,-1), 16),
                 ]))

def main():
    doc = SimpleDocTemplate(OUTPUT, pagesize=A4,
                            leftMargin=2.2*cm, rightMargin=2.2*cm,
                            topMargin=2*cm, bottomMargin=2*cm)
    story = []

    # HEADER
    story.append(header())
    story.append(sp(20))

    # 1. AMAC
    story.append(h("1. Laboratuvarin Amaci"))
    story.append(hr())
    story.append(p(
        "Bu raporun amaci, SquadUp mobil uygulamasinin temel yazilim mimarisini, "
        "bilesenlerini ve veri akisini sematik olarak ifade etmektir. "
        "Bu dokuman, projenin son planlama asamasini temsil eder."
    ))
    story.append(sp(10))

    # 2. BILESENLER
    story.append(h("2. Mimari Bilesenlerin Belirlenmesi"))
    story.append(hr())
    story.append(p("Uygulamayi olusturan temel bilesenler su sekildedir:"))
    story.append(bullet("<b>Kullanici Arayuzu (UI):</b> React Native / Expo tabanli modern ve karanlik tema arayuzu."))
    story.append(bullet("<b>Is Mantigi:</b> Flask API uzerinde kosan eslesme algoritmaları ve rozet sistemi."))
    story.append(bullet("<b>Veri Kaynagi:</b> Supabase PostgreSQL bulut veritabani ve JWT tabanli dogrulama."))
    story.append(sp(10))

    # 3. KATMANLI YAPI
    story.append(h("3. Katmanli Yapi"))
    story.append(hr())
    story.append(p("Uygulama, sorumluluklarin net ayrilmasi icin 3 ana katmanda kurgulanmistir:"))
    
    layer_data = [
        [p("<b>Katman</b>", "body"), p("<b>Sorumluluk</b>", "body")],
        [p("Sunum Katmanı (Mobile)", "body"), p("Kullanici etkilesimi ve arayuz gosterimi")],
        [p("Is Mantigi Katmani (API)", "body"), p("Uygulama kurallari ve veri isleme")],
        [p("Veri Katmani (DB)", "body"), p("Kalıcı veri depolama ve erisim")]
    ]
    t = Table(layer_data, colWidths=[5.5*cm, 11*cm],
              style=TableStyle([
                  ("GRID", (0,0),(-1,-1), 0.5, BGRAY),
                  ("BACKGROUND", (0,0),(-1,0), HexColor("#f1f5f9")),
                  ("VALIGN", (0,0),(-1,-1), "MIDDLE"),
                  ("PADDING", (0,0),(-1,-1), 6),
              ]))
    story.append(t)
    story.append(sp(10))

    # 4. VERI AKISI
    story.append(h("4. Veri Akisi"))
    story.append(hr())
    story.append(p(
        "Kullanicinin bir islem baslatmasiyla (orn: Arkadas Ekle) verinin akis semasi:"
    ))
    story.append(bullet("Kullanici UI uzerinden bir istegi tetikler."))
    story.append(bullet("Istek, JWT token ile birlikte Flask API'ye ulasir."))
    story.append(bullet("API, veritabani (Supabase) uzerinde kural kontrollerini yapar."))
    story.append(bullet("Basarili islem sonucunda veritabani guncellenir ve UI'ya geri bildirim doner."))
    
    story.append(sp(30))
    story.append(HRFlowable(width="100%", thickness=1, color=BLUE))
    story.append(p("SquadUp Proje Dokumantasyonu - 2026", "footer"))

    doc.build(story)
    print("PDF olusturuldu:", OUTPUT)

if __name__ == "__main__":
    main()
