import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; 
import amqp from 'amqplib';

export const runtime = "nodejs";
export const maxDuration = 60;

// 1. DISPARA A GERAÇÃO EM SEGUNDO PLANO (Sua rota atual)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const projectId = id;

    // 1. BUSCAR DADOS DO RELATÓRIO DO GITHUB
    const baseUrl = new URL(request.url).origin;
    const reportsUrl = `${baseUrl}/api/github/repo/${projectId}/reports`;
    const cookieHeader = request.headers.get('cookie');
    
    const fetchOptions: RequestInit = {
      cache: 'no-store',
      headers: cookieHeader ? { cookie: cookieHeader } : undefined,
    };
    
    const res = await fetch(reportsUrl, fetchOptions);
    if (!res.ok) {
      throw new Error(`Failed to fetch report metrics: ${res.status} ${res.statusText}`);
    }
    const report = await res.json();

    // 2. SALVAR NO BANCO COM STATUS 'PENDING'
    const analytics = await prisma.repositoryAnalytics.create({
      data: {
        projectId,
        status: 'PENDING',
        reportJson: report, 
      },
    });

    // 3. CONECTAR AO CLOUDAMQP E ENVIAR PARA A FILA
    const queueUrl = process.env.QUEUE_URL;
    if (!queueUrl) {
      throw new Error("QUEUE_URL não encontrada nas variáveis de ambiente (.env)");
    }

    const connection = await amqp.connect(queueUrl);
    const channel = await connection.createChannel();
    
    const queueName = 'gitgraph_pdf_queue';

    // Garante que a fila existe no RabbitMQ
    await channel.assertQueue(queueName, { durable: true });

    const queuePayload = {
      analyticsId: analytics.id,
      projectId: projectId,
    };

    // Despacha para a fila
    channel.sendToQueue(
      queueName, 
      Buffer.from(JSON.stringify(queuePayload)), 
      { persistent: true } 
    );

    await channel.close();
    await connection.close();

    console.log(`🚀 [Next.js] Evento enviado para a fila. Analytics ID: ${analytics.id}`);

    // 4. RETORNA RESPOSTA IMEDIATA PARA O FRONT-END
    return NextResponse.json(
      {
        success: true,
        message: 'Geração do relatório iniciada em background.',
        analyticsId: analytics.id,
        status: 'PENDING',
      },
      { status: 202 } 
    );

  } catch (error) {
    console.error('Error starting async PDF generation:', error);
    return NextResponse.json(
      {
        error: 'Failed to initiate report generation',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// 2. NOVA ROTA: CONSULTA O STATUS DO PDF (Adicionado para resolver o erro)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Pega o relatório mais recente desse projeto no banco
    const analytics = await prisma.repositoryAnalytics.findFirst({
      where: { projectId: id },
      orderBy: { createdAt: 'desc' }
    });

    if (!analytics) {
      return NextResponse.json({ error: 'Relatório não encontrado' }, { status: 404 });
    }

    // Retorna se está PENDING, COMPLETED ou FAILED, junto com a URL se já tiver sido gerada
    return NextResponse.json({
      status: analytics.status,
      pdfUrl: analytics.pdfUrl 
    });

  } catch (error) {
    console.error('Error checking PDF status:', error);
    return NextResponse.json(
      { error: 'Failed to check status' },
      { status: 500 }
    );
  }
}