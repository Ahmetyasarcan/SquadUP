# -*- coding: utf-8 -*-
"""
SquadUp - Teknoloji Secimi ve Gerceklendirme Dokumani
5. Hafta Fonksiyonel Programlama Lab Foyu - PDF Uretici
"""

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib.colors import HexColor, white
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
)

OUTPUT = r"c:\Users\Ahmet\.gemini\antigravity\scratch\squadup\mobile\SquadUp_Teknoloji_Secimi_Raporu.pdf"

BLUE   = HexColor("#1a365d")
LBLUE  = HexColor("#2b6cb0")
LLBLUE = HexColor("#ebf8ff")
GRAY   = HexColor("#f7f7f7")
DGRAY  = HexColor("#4a5568")
BGRAY  = HexColor("#e2e8f0")
GREEN  = HexColor("#276749")
LGRAY  = HexColor("#718096")

def S(name, **kw): return ParagraphStyle(name, **kw)

ST = {
    "title":  S("t",  fontName="Helvetica-Bold", fontSize=15, textColor=white,  leading=22, alignment=TA_CENTER),
    "sub":    S("s",  fontName="Helvetica",      fontSize=9.5,textColor=HexColor("#bee3f8"), leading=13, alignment=TA_CENTER),
    "info":   S("i",  fontName="Helvetica",      fontSize=8.5,textColor=HexColor("#a0aec0"), leading=12, alignment=TA_CENTER),
    "h":      S("h",  fontName="Helvetica-Bold", fontSize=11, textColor=BLUE,   leading=16, spaceBefore=10, spaceAfter=3),
    "h2":     S("h2", fontName="Helvetica-Bold", fontSize=10, textColor=LBLUE,  leading=15, spaceBefore=6,  spaceAfter=2),
    "body":   S("b",  fontName="Helvetica",      fontSize=9.5,textColor=DGRAY,  leading=14, spaceAfter=3,   alignment=TA_JUSTIFY),
    "check":  S("c",  fontName="Helvetica",      fontSize=9.5,textColor=GREEN,  leading=13, leftIndent=10,  spaceAfter=2),
    "bullet": S("bu", fontName="Helvetica",      fontSize=9.5,textColor=DGRAY,  leading=13, leftIndent=10,  spaceAfter=2),
    "label":  S("l",  fontName="Helvetica-Bold", fontSize=9,  textColor=BLUE,   leading=13),
    "footer": S("f",  fontName="Helvetica",      fontSize=8,  textColor=LGRAY,  alignment=TA_CENTER),
}

def p(txt, st="body"):  return Paragraph(txt, ST[st])
def h(txt):             return p(txt, "h")
def h2(txt):            return p(txt, "h2")
def body(txt):          return p(txt, "body")
def bullet(txt):        return p("•  " + txt, "bullet")
def check(txt):         return p("✓  " + txt, "check")
def sp(n=5):            return Spacer(1, n)
def hr():               return HRFlowable(width="100%", thickness=0.5, color=BGRAY, spaceAfter=3, spaceBefore=2)

def header():
    data = [[
        p("SquadUp — Teknoloji Secimi ve Gerceklendirme Dokumani", "title"),
        p("5. Hafta Fonksiyonel Programlama Laboratuvari", "sub"),
        p("[Ogrenci Adi — Ogrenci Numarasi]  •  2025", "info"),
    ]]
    return Table([[data[0]]], colWidths=[15.5*cm],
                 style=TableStyle([
                     ("BACKGROUND",   (0,0),(-1,-1), BLUE),
                     ("TOPPADDING",   (0,0),(-1,-1), 14),
                     ("BOTTOMPADDING",(0,0),(-1,-1), 14),
                     ("LEFTPADDING",  (0,0),(-1,-1), 14),
                     ("RIGHTPADDING", (0,0),(-1,-1), 14),
                 ]))

def section_box(title, content_rows):
    """Baslikli kutu - icerik satirlari icerir"""
    rows = [[Paragraph(title, ParagraphStyle("bt", fontName="Helvetica-Bold", fontSize=10,
                                              textColor=white, leading=14))]]
    header_style = [
        ("BACKGROUND",   (0,0),(-1,0), LBLUE),
        ("TOPPADDING",   (0,0),(-1,0), 5),
        ("BOTTOMPADDING",(0,0),(-1,0), 5),
        ("LEFTPADDING",  (0,0),(-1,-1), 8),
        ("RIGHTPADDING", (0,0),(-1,-1), 8),
        ("GRID", (0,0),(-1,-1), 0.4, BGRAY),
    ]
    for i, row in enumerate(content_rows):
        rows.append(row)
        if i % 2 == 0:
            header_style.append(("BACKGROUND", (0,i+1),(-1,i+1), white))
        else:
            header_style.append(("BACKGROUND", (0,i+1),(-1,i+1), GRAY))

    header_style += [
        ("TOPPADDING",   (0,1),(-1,-1), 5),
        ("BOTTOMPADDING",(0,1),(-1,-1), 5),
        ("FONTNAME",     (0,1),(-1,-1), "Helvetica"),
        ("FONTSIZE",     (0,1),(-1,-1), 9.5),
        ("TEXTCOLOR",    (0,1),(-1,-1), DGRAY),
    ]
    return Table(rows, colWidths=[15.5*cm], style=TableStyle(header_style))

def main():
    doc = SimpleDocTemplate(OUTPUT, pagesize=A4,
                            leftMargin=2*cm, rightMargin=2*cm,
                            topMargin=1.8*cm, bottomMargin=1.8*cm,
                            title="SquadUp Teknoloji Secimi Raporu")
    story = []

    # HEADER
    story.append(header())
    story.append(sp(12))

    # GIRIS
    story.append(h("Giris"))
    story.append(hr())
    story.append(body(
        "Bu dokuman, SquadUp mobil uygulamasinin gelistirilmesinde kullanilacak teknolojilerin "
        "secimini ve bu secimlerin gerceklerini icermektedir. "
        "Secimler; problemin yapisi, kullanici sayisi beklentisi ve gelistirme suresi "
        "dikkate alinarak yapilmistir."
    ))
    story.append(sp(8))

    # TABLO: Teknoloji Ozeti
    story.append(h("Teknoloji Secim Ozeti"))
    story.append(hr())

    summary_data = [
        [Paragraph("<b>Baslik</b>", ParagraphStyle("th", fontName="Helvetica-Bold", fontSize=9.5, textColor=white)),
         Paragraph("<b>Secim</b>", ParagraphStyle("th2", fontName="Helvetica-Bold", fontSize=9.5, textColor=white))],
        [p("2.1  Mobil Gelistirme Teknolojisi", "label"), p("Cross-platform — React Native")],
        [p("2.2  Veri Kaynagi",                 "label"), p("Bulut tabanli (Flask REST API + SQLite)")],
        [p("2.3  Ek Araclar / Kutuphaneler",    "label"), p("Zustand, React Navigation, Expo")],
    ]
    t = Table(summary_data, colWidths=[6*cm, 9.5*cm],
              style=TableStyle([
                  ("BACKGROUND", (0,0),(-1,0), BLUE),
                  ("TEXTCOLOR",  (0,0),(-1,0), white),
                  ("FONTNAME",   (0,0),(-1,0), "Helvetica-Bold"),
                  ("FONTSIZE",   (0,0),(-1,-1), 9.5),
                  ("GRID",       (0,0),(-1,-1), 0.4, BGRAY),
                  ("ROWBACKGROUNDS",(0,1),(-1,-1),[white, GRAY]),
                  ("TOPPADDING", (0,0),(-1,-1), 5),
                  ("BOTTOMPADDING",(0,0),(-1,-1), 5),
                  ("LEFTPADDING",(0,0),(-1,-1), 8),
              ]))
    story.append(t)
    story.append(sp(10))

    # 2.1
    story.append(h2("2.1  Mobil Gelistirme Teknolojisi: React Native (Cross-platform)"))
    story.append(body(
        "SquadUp, hem Android hem iOS kullanicilarina ulasmayi hedefleyen bir aktivite eslestirme "
        "platformudur. Bu nedenle <b>cross-platform</b> yaklasimi secilmistir. "
        "React Native; tek bir kod tabaniyla her iki platforma native performans sunmakta, "
        "JavaScript/TypeScript bilgisiyle hizla gelistirilebilmekte ve genis bir ekosisteme sahip bulunmaktadir."
    ))
    story.append(sp(4))
    gc_data = [
        [Paragraph("<b>Gercek</b>", ParagraphStyle("gh", fontName="Helvetica-Bold", fontSize=9, textColor=white)),
         Paragraph("<b>Aciklama</b>", ParagraphStyle("gh2", fontName="Helvetica-Bold", fontSize=9, textColor=white))],
        [p("Problem yapisi"), p("Kullanici eslestirme mantigi platform bagimsizdir")],
        [p("Kullanici sayisi"), p("Android + iOS pazar paylasimi icin tek kod tabanı yeterlidir")],
        [p("Gelistirme suresi"), p("Ayri native uygulama gelistirmeye gore ~2x hizlidir")],
    ]
    tg = Table(gc_data, colWidths=[4*cm, 11.5*cm],
               style=TableStyle([
                   ("BACKGROUND", (0,0),(-1,0), LBLUE), ("TEXTCOLOR",(0,0),(-1,0), white),
                   ("FONTSIZE", (0,0),(-1,-1), 9), ("GRID",(0,0),(-1,-1), 0.4, BGRAY),
                   ("ROWBACKGROUNDS",(0,1),(-1,-1),[white, GRAY]),
                   ("TOPPADDING",(0,0),(-1,-1),4),("BOTTOMPADDING",(0,0),(-1,-1),4),
                   ("LEFTPADDING",(0,0),(-1,-1),7),
               ]))
    story.append(tg)
    story.append(sp(8))

    # 2.2
    story.append(h2("2.2  Veri Kaynagi: Bulut Tabanli Veritabani (Flask REST API)"))
    story.append(body(
        "Uygulama, birden fazla kullanicinin ayni veri setini paylastigi bir sosyal platform oldugu icin "
        "<b>bulut tabanli</b> veri kaynagi zorunludur. Backend olarak <b>Flask</b> REST API, "
        "veri deposu olarak <b>SQLite</b> (gelistirme) ve produksiyonda <b>PostgreSQL</b> kullanilmaktadir. "
        "Mobil uygulama bu API'ye <code>fetch()</code> + <code>async/await</code> ile baglanmaktadir."
    ))
    for g in [
        "Birden fazla kullanicinin gercek zamanli eslesmesi icin merkezi veri zorunludur",
        "SQLite → PostgreSQL gecisi uygulama katmanini etkilemez (ORM soyutlamasi)",
        "Offline-first mantigi: yerel Zustand state'i ile anlik filtreleme desteklenir",
    ]:
        story.append(check(g))
    story.append(sp(8))

    # 2.3
    story.append(h2("2.3  Ek Araclar ve Kutuphaneler"))
    story.append(body("Asagidaki ek kutuphaneler kullanilmaktadir:"))
    lib_data = [
        [Paragraph("<b>Kutuphane</b>", ParagraphStyle("lh", fontName="Helvetica-Bold", fontSize=9, textColor=white)),
         Paragraph("<b>Kullanim Amaci</b>", ParagraphStyle("lh2", fontName="Helvetica-Bold", fontSize=9, textColor=white))],
        [p("Zustand"), p("Immutable state yonetimi — Redux'a gore minimal, performansli")],
        [p("React Navigation"), p("Ekranlar arasi gecis (Bottom Tab + Stack)"),],
        [p("Expo"), p("Hizli prototip ve build ortami")],
        [p("TypeScript"), p("Tip guvenligi — derleme zamaninda hata yakalama")],
    ]
    tl = Table(lib_data, colWidths=[3.5*cm, 12*cm],
               style=TableStyle([
                   ("BACKGROUND",(0,0),(-1,0), LBLUE),("TEXTCOLOR",(0,0),(-1,0), white),
                   ("FONTSIZE",(0,0),(-1,-1), 9),("GRID",(0,0),(-1,-1), 0.4, BGRAY),
                   ("ROWBACKGROUNDS",(0,1),(-1,-1),[white, GRAY]),
                   ("TOPPADDING",(0,0),(-1,-1),4),("BOTTOMPADDING",(0,0),(-1,-1),4),
                   ("LEFTPADDING",(0,0),(-1,-1),7),
               ]))
    story.append(tl)
    story.append(sp(10))

    # 2.4 GERCEKLENDIRME OZETI
    story.append(h("2.4  Genel Gerceklendirme ve Sonuc"))
    story.append(hr())
    story.append(body(
        "Secilen teknoloji seti, SquadUp'in temel gereksinimlerini karsilamak uzere "
        "ozenle secilmistir. \"Bildigim teknolojiyi kullandim\" yaklasiminin yerine "
        "\"probleme uygun teknolojiyi sectim\" yaklasimi benimsenmistir:"
    ))
    for txt in [
        "Cross-platform React Native: Sinirli gelistirme suresinde maksimum platform kapsamı",
        "Bulut API: Cok kullanicili sosyal platform icin veri tutarliligi zorunlulugu",
        "Zustand: Kucuk, okunabilir, test edilebilir state yonetimi",
        "TypeScript: Buyuyen bir kod tabaninda refactoring guvenligi",
    ]:
        story.append(check(txt))

    story.append(sp(14))
    story.append(HRFlowable(width="100%", thickness=0.8, color=BLUE, spaceAfter=4))
    story.append(p("Teslim formati: PDF  •  Onerilen uzunluk: 1-2 sayfa  •  2025", "footer"))

    doc.build(story)
    print("PDF olusturuldu:", OUTPUT)

if __name__ == "__main__":
    main()
