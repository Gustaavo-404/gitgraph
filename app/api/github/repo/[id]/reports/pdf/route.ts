import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import { generatePdfHtml } from '@/components/reports/PdfTemplate';
import fs from 'fs/promises';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const projectId = id;

    // Buscar dados do relatório
    const baseUrl = new URL(request.url).origin;
    const reportsUrl = `${baseUrl}/api/github/repo/${projectId}/reports`;
    const cookieHeader = request.headers.get('cookie');
    const fetchOptions: RequestInit = {
      cache: 'no-store',
      headers: cookieHeader ? { cookie: cookieHeader } : undefined,
    };
    const res = await fetch(reportsUrl, fetchOptions);
    if (!res.ok) {
      throw new Error(`Failed to fetch report: ${res.status} ${res.statusText}`);
    }
    const report = await res.json();

    // Carregar logo como base64 (fallback para placeholder)
    let logoDataUrl = '';
    try {
      const logoPath = path.join(process.cwd(), 'public', 'logo.png');
      const logoBuffer = await fs.readFile(logoPath);
      logoDataUrl = `data:image/png;base64,${logoBuffer.toString('base64')}`;
    } catch (error) {
      console.warn('Logo not found, using placeholder');
    }

    // Data de geração
    const generatedAt = new Date().toLocaleString('en-US', {
      timeZone: 'America/Sao_Paulo',
      dateStyle: 'full',
      timeStyle: 'short',
    });

    // Gerar HTML
    const fullHtml = generatePdfHtml({
      report,
      projectId,
      generatedAt,
      logoUrl: logoDataUrl,
    });

    // Gerar PDF com margens zero
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 800 });
    await page.setContent(fullHtml, {
      waitUntil: ['networkidle0', 'load', 'domcontentloaded'],
    });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0px',
        right: '0px',
        bottom: '0px',
        left: '0px',
      },
      preferCSSPageSize: true,
    });

    await browser.close();

    const pdf = Buffer.from(pdfBuffer);

    return new NextResponse(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="gitgraph-report-${projectId}.pdf"`,
      },
    });

  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate PDF',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}