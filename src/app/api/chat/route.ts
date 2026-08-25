import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // 1. Recibimos los datos desde nuestro frontend
    const body = await request.json();
    const { thread, message } = body;

    if (!thread || !message) {
      return NextResponse.json(
        { error: 'Faltan parámetros requeridos (thread o message)' },
        { status: 400 }
      );
    }

    // 2. Definimos la URL de FastAPI (usamos variable de entorno por si ngrok cambia de URL)
    const fastApiUrl = process.env.FASTAPI_URL || 'https://cb9c-200-115-151-147.ngrok-free.app/bubble-message';

    // 3. Hacemos la llamada al servidor de FastAPI tal como lo hacía Bubble
    const response = await fetch(fastApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: thread,
        message: message,
      }),
    });

    if (!response.ok) {
      throw new Error(`Error del servidor FastAPI: ${response.status}`);
    }

    // 4. Obtenemos la respuesta
    const data = await response.json();

    // La respuesta esperada es: { user_id: string, thread_id: string, response: string }
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[API Chat] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno conectando con el servicio de IA' },
      { status: 500 }
    );
  }
}
