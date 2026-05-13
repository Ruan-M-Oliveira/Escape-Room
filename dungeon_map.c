
#define UNICODE
#define _UNICODE
#include <windows.h>
#include <math.h>
#include <stdlib.h>

#pragma comment(lib, "gdi32.lib")
#pragma comment(lib, "user32.lib")
#pragma comment(lib, "msimg32.lib")

#define WND_W 1120
#define WND_H  800

/* ─── Palette ─────────────────────────────────────────── */
#define C_BG        RGB(12, 8, 28)
#define C_FLOOR     RGB(22, 15, 44)
#define C_FLOOR2    RGB(30, 20, 55)
#define C_WALL      RGB(55, 38, 90)
#define C_OUTLINE   RGB(95, 68, 148)
#define C_CORR      RGB(14, 9, 32)
#define C_TEXT      RGB(220, 195, 255)
#define C_DIM       RGB(130, 110, 170)
#define C_TORCH     RGB(255, 160, 40)
#define C_TORCH2    RGB(255, 220, 110)
#define C_SEAL_B    RGB(80, 140, 255)
#define C_SEAL_P    RGB(170, 70, 255)
#define C_SEAL_C    RGB(50, 220, 210)
#define C_TOK_V     RGB(45, 210, 75)
#define C_TOK_F     RGB(220, 52, 60)
#define C_GOLD      RGB(255, 210, 0)
#define C_GOLD2     RGB(255, 245, 130)
#define C_SGREEN    RGB(55, 215, 95)

/* ─── Helpers ─────────────────────────────────────────── */
static void SetPen(HDC dc, int style, int w, COLORREF c) {
    HPEN p = CreatePen(style, w, c); SelectObject(dc, p);
}
static void SetBrush(HDC dc, COLORREF c) {
    HBRUSH b = CreateSolidBrush(c); SelectObject(dc, b);
}
static void SetFont(HDC dc, int size, BOOL bold, const WCHAR* name) {
    HFONT f = CreateFontW(size, 0, 0, 0,
        bold ? FW_BOLD : FW_NORMAL, 0, 0, 0,
        DEFAULT_CHARSET, OUT_DEFAULT_PRECIS,
        CLIP_DEFAULT_PRECIS, ANTIALIASED_QUALITY,
        DEFAULT_PITCH, name);
    SelectObject(dc, f);
}

/* Draw a "glow" ring by blending concentric ellipses toward bg */
static void DrawGlow(HDC dc, int cx, int cy, int rx, int ry,
                     COLORREF col, int steps)
{
    int sr = GetRValue(col), sg = GetGValue(col), sb = GetBValue(col);
    for (int i = steps; i >= 1; i--) {
        float t = (float)i / steps;
        int r = (int)(sr * t + 12 * (1 - t));
        int g = (int)(sg * t +  8 * (1 - t));
        int b = (int)(sb * t + 28 * (1 - t));
        COLORREF gc = RGB(r, g, b);
        SetPen(dc, PS_NULL, 1, gc);
        SetBrush(dc, gc);
        int ex = (int)(rx * (1.0f + 0.07f * i));
        int ey = (int)(ry * (1.0f + 0.07f * i));
        Ellipse(dc, cx - ex, cy - ey, cx + ex, cy + ey);
    }
}

/* Draw room with stone-tile floor and wall outline */
static void DrawRoom(HDC dc, int x, int y, int w, int h) {
    /* Floor fill */
    SetPen(dc, PS_NULL, 1, C_FLOOR);
    SetBrush(dc, C_FLOOR);
    Rectangle(dc, x, y, x + w, y + h);

    /* Stone tile grid */
    SetPen(dc, PS_SOLID, 1, C_FLOOR2);
    int tile = 28;
    for (int tx = x; tx < x + w; tx += tile)
        MoveToEx(dc, tx, y, NULL), LineTo(dc, tx, y + h);
    for (int ty = y; ty < y + h; ty += tile)
        MoveToEx(dc, x, ty, NULL), LineTo(dc, x + w, ty);

    /* Wall outline (thick) */
    SetPen(dc, PS_SOLID, 4, C_WALL);
    SelectObject(dc, GetStockObject(NULL_BRUSH));
    Rectangle(dc, x, y, x + w, y + h);

    /* Inner beveled outline */
    SetPen(dc, PS_SOLID, 1, C_OUTLINE);
    Rectangle(dc, x + 5, y + 5, x + w - 5, y + h - 5);
}

/* Horizontal corridor */
static void DrawHCorr(HDC dc, int x1, int x2, int cy, int hw) {
    SetPen(dc, PS_NULL, 1, C_CORR);
    SetBrush(dc, C_CORR);
    Rectangle(dc, x1, cy - hw, x2, cy + hw);
    /* top/bottom wall lines */
    SetPen(dc, PS_SOLID, 2, C_WALL);
    MoveToEx(dc, x1, cy - hw, NULL); LineTo(dc, x2, cy - hw);
    MoveToEx(dc, x1, cy + hw, NULL); LineTo(dc, x2, cy + hw);
}

/* Vertical corridor */
static void DrawVCorr(HDC dc, int y1, int y2, int cx, int hw) {
    SetPen(dc, PS_NULL, 1, C_CORR);
    SetBrush(dc, C_CORR);
    Rectangle(dc, cx - hw, y1, cx + hw, y2);
    SetPen(dc, PS_SOLID, 2, C_WALL);
    MoveToEx(dc, cx - hw, y1, NULL); LineTo(dc, cx - hw, y2);
    MoveToEx(dc, cx + hw, y1, NULL); LineTo(dc, cx + hw, y2);
}

/* Magic seal door */
static void DrawSeal(HDC dc, int cx, int cy, BOOL horiz,
                     const WCHAR* sym, COLORREF col1, COLORREF col2)
{
    /* glow background */
    DrawGlow(dc, cx, cy, 20, 20, col1, 6);

    /* seal circle */
    SetPen(dc, PS_SOLID, 2, col2);
    SetBrush(dc, RGB(20, 10, 45));
    Ellipse(dc, cx - 18, cy - 18, cx + 18, cy + 18);

    /* door bars */
    SetPen(dc, PS_SOLID, 5, RGB(60, 45, 100));
    if (horiz) {
        MoveToEx(dc, cx - 22, cy - 5, NULL); LineTo(dc, cx + 22, cy - 5);
        MoveToEx(dc, cx - 22, cy + 5, NULL); LineTo(dc, cx + 22, cy + 5);
    } else {
        MoveToEx(dc, cx - 5, cy - 22, NULL); LineTo(dc, cx - 5, cy + 22);
        MoveToEx(dc, cx + 5, cy - 22, NULL); LineTo(dc, cx + 5, cy + 22);
    }

    /* symbol text */
    SetFont(dc, 13, TRUE, L"Segoe UI");
    SetBkMode(dc, TRANSPARENT);
    SetTextColor(dc, col2);
    RECT tr = {cx - 18, cy - 10, cx + 18, cy + 10};
    DrawTextW(dc, sym, -1, &tr, DT_CENTER | DT_VCENTER | DT_SINGLELINE);
}

/* Token (circle with V or F + label) */
static void DrawToken(HDC dc, int cx, int cy, BOOL isTrue, WCHAR label) {
    COLORREF col = isTrue ? C_TOK_V : C_TOK_F;
    DrawGlow(dc, cx, cy, 16, 16, col, 4);

    SetPen(dc, PS_SOLID, 2, col);
    SetBrush(dc, RGB(18, 12, 38));
    Ellipse(dc, cx - 14, cy - 14, cx + 14, cy + 14);

    SetFont(dc, 14, TRUE, L"Segoe UI");
    SetBkMode(dc, TRANSPARENT);
    SetTextColor(dc, col);
    WCHAR sym[2] = {isTrue ? L'V' : L'F', 0};
    RECT r1 = {cx - 14, cy - 9, cx + 14, cy + 9};
    DrawTextW(dc, sym, -1, &r1, DT_CENTER | DT_VCENTER | DT_SINGLELINE);

    /* label below */
    SetFont(dc, 11, FALSE, L"Segoe UI");
    SetTextColor(dc, C_DIM);
    WCHAR lb[2] = {label, 0};
    RECT r2 = {cx - 10, cy + 14, cx + 10, cy + 26};
    DrawTextW(dc, lb, -1, &r2, DT_CENTER | DT_TOP | DT_SINGLELINE);
}

/* Torch sconce */
static void DrawTorch(HDC dc, int cx, int cy) {
    DrawGlow(dc, cx, cy, 22, 22, C_TORCH, 5);
    SetPen(dc, PS_SOLID, 1, C_TORCH);
    SetBrush(dc, C_TORCH2);
    Ellipse(dc, cx - 5, cy - 7, cx + 5, cy + 7);
    SetBrush(dc, C_TORCH);
    Ellipse(dc, cx - 3, cy, cx + 3, cy + 9);
}

/* Room label */
static void DrawLabel(HDC dc, int cx, int cy, const WCHAR* txt,
                      int size, COLORREF col)
{
    SetFont(dc, size, TRUE, L"Palatino Linotype");
    SetBkMode(dc, TRANSPARENT);
    SetTextColor(dc, col);
    RECT r = {cx - 90, cy - 12, cx + 90, cy + 12};
    DrawTextW(dc, txt, -1, &r, DT_CENTER | DT_VCENTER | DT_SINGLELINE);
}

/* ─── Main render ─────────────────────────────────────── */
static void Render(HDC dc) {
    /* Background */
    SetPen(dc, PS_NULL, 1, C_BG);
    SetBrush(dc, C_BG);
    Rectangle(dc, 0, 0, WND_W, WND_H);

    /* ── Room positions ──
       Layout (4 cols × 3 rows), room size 200×170
       Col x: 30, 290, 560, 840
       Row y: 30, 280, 530
    */
    int RX[4] = {30, 290, 560, 840};
    int RY[3] = {30, 280, 530};
    int RW = 200, RH = 170;

    /* corridors first (drawn under rooms) */
    int hw = 22; /* half-width of corridor */

    /* Horizontal corridors */
    /* row0: R0->R1, R1->R2 */
    DrawHCorr(dc, RX[0]+RW, RX[1],     RY[0]+RH/2, hw);
    DrawHCorr(dc, RX[1]+RW, RX[2],     RY[0]+RH/2, hw);
    /* row1: R3->R4, R4->R5, R5->R6 */
    DrawHCorr(dc, RX[0]+RW, RX[1],     RY[1]+RH/2, hw);
    DrawHCorr(dc, RX[1]+RW, RX[2],     RY[1]+RH/2, hw);
    DrawHCorr(dc, RX[2]+RW, RX[3],     RY[1]+RH/2, hw);
    /* row2: R7->R8, R8->R9 */
    DrawHCorr(dc, RX[1]+RW, RX[2],     RY[2]+RH/2, hw);
    DrawHCorr(dc, RX[2]+RW, RX[3],     RY[2]+RH/2, hw);

    /* Vertical corridors */
    /* col0: R0->R3 */
    DrawVCorr(dc, RY[0]+RH, RY[1],     RX[0]+RW/2, hw);
    /* col1: R1->R4, R4->R7 */
    DrawVCorr(dc, RY[0]+RH, RY[1],     RX[1]+RW/2, hw);
    DrawVCorr(dc, RY[1]+RH, RY[2],     RX[1]+RW/2, hw);
    /* col2: R2->R5, R5->R8 */
    DrawVCorr(dc, RY[0]+RH, RY[1],     RX[2]+RW/2, hw);
    DrawVCorr(dc, RY[1]+RH, RY[2],     RX[2]+RW/2, hw);
    /* col3: R6->R9 */
    DrawVCorr(dc, RY[1]+RH, RY[2],     RX[3]+RW/2, hw);

    /* ── Rooms ── */
    int i, j;
    for (j = 0; j < 3; j++)
        for (i = 0; i < 4; i++) {
            /* skip unused cells */
            if (j == 0 && i == 3) continue; /* no room at col3 row0 */
            if (j == 2 && i == 0) continue; /* no room at col0 row2 */
            DrawRoom(dc, RX[i], RY[j], RW, RH);
        }

    /* ── START glow ── */
    int s0cx = RX[0] + RW/2, s0cy = RY[0] + RH/2;
    DrawGlow(dc, s0cx, s0cy, 70, 60, C_SGREEN, 8);
    /* Gate arch (green) */
    SetPen(dc, PS_SOLID, 3, C_SGREEN);
    SelectObject(dc, GetStockObject(NULL_BRUSH));
    Arc(dc, s0cx-20, s0cy-28, s0cx+20, s0cy+10, s0cx+20, s0cy-9, s0cx-20, s0cy-9);
    MoveToEx(dc, s0cx-20, s0cy-9, NULL); LineTo(dc, s0cx-20, s0cy+8);
    MoveToEx(dc, s0cx+20, s0cy-9, NULL); LineTo(dc, s0cx+20, s0cy+8);

    /* ── FINAL glow ── */
    int fncx = RX[3] + RW/2, fncy = RY[2] + RH/2;
    DrawGlow(dc, fncx, fncy, 80, 65, C_GOLD, 10);
    /* star burst lines */
    SetPen(dc, PS_SOLID, 1, C_GOLD2);
    for (int a = 0; a < 8; a++) {
        double ang = a * 3.14159 / 4.0;
        MoveToEx(dc, fncx, fncy, NULL);
        LineTo(dc, fncx + (int)(55*cos(ang)), fncy + (int)(55*sin(ang)));
    }

    /* ── Seals on doors ── */
    /* Horizontal seals */
    DrawSeal(dc, (RX[0]+RW + RX[1])/2,     RY[0]+RH/2, TRUE, L"P\u2227Q",   C_SEAL_B, C_SEAL_C);
    DrawSeal(dc, (RX[1]+RW + RX[2])/2,     RY[0]+RH/2, TRUE, L"\u00acP\u2228R", C_SEAL_P, C_SEAL_B);
    DrawSeal(dc, (RX[0]+RW + RX[1])/2,     RY[1]+RH/2, TRUE, L"P\u2194Q",   C_SEAL_C, C_SEAL_P);
    DrawSeal(dc, (RX[1]+RW + RX[2])/2,     RY[1]+RH/2, TRUE, L"P\u2192Q",   C_SEAL_B, C_SEAL_C);
    DrawSeal(dc, (RX[2]+RW + RX[3])/2,     RY[1]+RH/2, TRUE, L"P\u2227Q",   C_SEAL_P, C_SEAL_B);
    DrawSeal(dc, (RX[1]+RW + RX[2])/2,     RY[2]+RH/2, TRUE, L"\u00acP\u2228R", C_SEAL_C, C_SEAL_P);
    DrawSeal(dc, (RX[2]+RW + RX[3])/2,     RY[2]+RH/2, TRUE, L"P\u2194Q",   C_SEAL_B, C_SEAL_C);

    /* Vertical seals */
    DrawSeal(dc, RX[0]+RW/2, (RY[0]+RH + RY[1])/2, FALSE, L"P\u2192Q",   C_SEAL_P, C_SEAL_C);
    DrawSeal(dc, RX[1]+RW/2, (RY[0]+RH + RY[1])/2, FALSE, L"P\u2227Q",   C_SEAL_C, C_SEAL_B);
    DrawSeal(dc, RX[2]+RW/2, (RY[0]+RH + RY[1])/2, FALSE, L"\u00acP\u2228R", C_SEAL_B, C_SEAL_P);
    DrawSeal(dc, RX[1]+RW/2, (RY[1]+RH + RY[2])/2, FALSE, L"P\u2194Q",   C_SEAL_P, C_SEAL_C);
    DrawSeal(dc, RX[2]+RW/2, (RY[1]+RH + RY[2])/2, FALSE, L"P\u2192Q",   C_SEAL_C, C_SEAL_B);
    DrawSeal(dc, RX[3]+RW/2, (RY[1]+RH + RY[2])/2, FALSE, L"P\u2227Q",   C_SEAL_B, C_SEAL_P);

    /* ── Tokens ── */
    /* Sala A (col1,row0) */
    DrawToken(dc, RX[1]+55,  RY[0]+60, TRUE,  L'P');
    DrawToken(dc, RX[1]+145, RY[0]+110,FALSE, L'Q');
    /* Sala B (col2,row0) */
    DrawToken(dc, RX[2]+55,  RY[0]+60, FALSE, L'P');
    DrawToken(dc, RX[2]+145, RY[0]+110,TRUE,  L'R');
    /* Sala C (col0,row1) */
    DrawToken(dc, RX[0]+55,  RY[1]+60, TRUE,  L'Q');
    DrawToken(dc, RX[0]+145, RY[1]+110,FALSE, L'R');
    /* Sala D (col1,row1) */
    DrawToken(dc, RX[1]+55,  RY[1]+60, FALSE, L'P');
    DrawToken(dc, RX[1]+145, RY[1]+110,TRUE,  L'Q');
    /* Sala E (col2,row1) */
    DrawToken(dc, RX[2]+55,  RY[1]+60, TRUE,  L'R');
    DrawToken(dc, RX[2]+145, RY[1]+110,FALSE, L'P');
    /* Sala F (col3,row1) */
    DrawToken(dc, RX[3]+55,  RY[1]+60, FALSE, L'Q');
    DrawToken(dc, RX[3]+145, RY[1]+110,TRUE,  L'R');
    /* Sala G (col1,row2) */
    DrawToken(dc, RX[1]+55,  RY[2]+60, TRUE,  L'P');
    DrawToken(dc, RX[1]+145, RY[2]+110,FALSE, L'Q');
    /* Sala H (col2,row2) */
    DrawToken(dc, RX[2]+55,  RY[2]+60, FALSE, L'R');
    DrawToken(dc, RX[2]+145, RY[2]+110,TRUE,  L'P');

    /* ── Torches (corners of each room) ── */
    int tx[4] = {10, -10, 10, -10};
    int ty[4] = {10, 10, -10, -10};
    int ti, tj;
    for (tj = 0; tj < 3; tj++)
        for (ti = 0; ti < 4; ti++) {
            if (tj == 0 && ti == 3) continue;
            if (tj == 2 && ti == 0) continue;
            int rx0 = RX[ti], ry0 = RY[tj];
            DrawTorch(dc, rx0 + 15,      ry0 + 15);
            DrawTorch(dc, rx0 + RW - 15, ry0 + 15);
            DrawTorch(dc, rx0 + 15,      ry0 + RH - 15);
            DrawTorch(dc, rx0 + RW - 15, ry0 + RH - 15);
        }

    /* ── Room labels ── */
    const WCHAR* names[4][3] = {
        {L"INÍCIO", L"Sala C", NULL},
        {L"Sala A", L"Sala D", L"Sala G"},
        {L"Sala B", L"Sala E", L"Sala H"},
        {NULL,      L"Sala F", L"FINAL"}
    };
    COLORREF lc[4][3] = {
        {C_SGREEN, C_TEXT, 0},
        {C_TEXT, C_TEXT, C_TEXT},
        {C_TEXT, C_TEXT, C_TEXT},
        {0, C_TEXT, C_GOLD}
    };
    int li, lj;
    for (li = 0; li < 4; li++)
        for (lj = 0; lj < 3; lj++) {
            if (!names[li][lj]) continue;
            DrawLabel(dc, RX[li]+RW/2, RY[lj]+RH - 22,
                      names[li][lj], 15, lc[li][lj]);
        }

    /* ── Title ── */
    SetFont(dc, 22, TRUE, L"Palatino Linotype");
    SetBkMode(dc, TRANSPARENT);
    SetTextColor(dc, C_GOLD);
    RECT tr = {0, WND_H - 40, WND_W, WND_H};
    DrawTextW(dc, L"⚔ Masmorra da Lógica  — Tokens: V=Verdadeiro  F=Falso",
              -1, &tr, DT_CENTER | DT_VCENTER | DT_SINGLELINE);
}

/* ─── WinProc ─────────────────────────────────────────── */
LRESULT CALLBACK WndProc(HWND hw, UINT msg, WPARAM wp, LPARAM lp) {
    if (msg == WM_DESTROY) { PostQuitMessage(0); return 0; }
    if (msg == WM_PAINT) {
        PAINTSTRUCT ps;
        HDC dc = BeginPaint(hw, &ps);

        /* double-buffer */
        HDC mem = CreateCompatibleDC(dc);
        HBITMAP bmp = CreateCompatibleBitmap(dc, WND_W, WND_H);
        SelectObject(mem, bmp);

        Render(mem);
        BitBlt(dc, 0, 0, WND_W, WND_H, mem, 0, 0, SRCCOPY);

        DeleteObject(bmp); DeleteDC(mem);
        EndPaint(hw, &ps);
        return 0;
    }
    return DefWindowProcW(hw, msg, wp, lp);
}

/* ─── WinMain ─────────────────────────────────────────── */
int WINAPI WinMain(HINSTANCE hi, HINSTANCE hp, LPSTR cl, int cs) {
    WNDCLASSW wc = {0};
    wc.lpfnWndProc   = WndProc;
    wc.hInstance     = hi;
    wc.hbrBackground = (HBRUSH)(COLOR_WINDOW + 1);
    wc.lpszClassName = L"DungeonMap";
    wc.hCursor       = LoadCursor(NULL, IDC_ARROW);
    RegisterClassW(&wc);

    RECT wr = {0, 0, WND_W, WND_H};
    AdjustWindowRect(&wr, WS_OVERLAPPEDWINDOW, FALSE);
    HWND hw = CreateWindowW(L"DungeonMap",
        L"Masmorra da Lógica — Mapa",
        WS_OVERLAPPEDWINDOW,
        CW_USEDEFAULT, CW_USEDEFAULT,
        wr.right - wr.left, wr.bottom - wr.top,
        NULL, NULL, hi, NULL);

    ShowWindow(hw, cs);
    UpdateWindow(hw);

    MSG m;
    while (GetMessageW(&m, NULL, 0, 0)) {
        TranslateMessage(&m);
        DispatchMessageW(&m);
    }
    return (int)m.wParam;
}
