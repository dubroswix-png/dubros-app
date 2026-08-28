import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Admin with Service Role to allow inserting blog posts
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .slice(0, 80);
}

function extractFirstImage(html: string): string | null {
  if (!html) return null;
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match ? match[1] : null;
}

function extractTextSummary(textOrHtml: string): string {
  if (!textOrHtml) return '';
  const text = textOrHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  return text.length > 200 ? text.slice(0, 197) + '...' : text;
}

function cleanEmailHtml(html: string): string {
  if (!html) return '';
  // Remove common unsubscribe tracking footers if desired, keeping main newsletter body
  let cleaned = html
    .replace(/<table[^>]*class=["'][^"']*unsubscribe[^"']*["'][^>]*>[\s\S]*?<\/table>/gi, '')
    .replace(/<div[^>]*class=["'][^"']*unsubscribe[^"']*["'][^>]*>[\s\S]*?<\/div>/gi, '');
  return cleaned;
}

// ---------------------------------------------------------------------------
// POST: SendGrid Inbound Parse Webhook
// SendGrid sends multipart/form-data with fields: 'subject', 'html', 'text', 'from', 'to'
// ---------------------------------------------------------------------------
export async function POST(req: NextRequest) {
  try {
    let subject = '';
    let htmlContent = '';
    let textContent = '';
    let sender = 'Equipo Dubros International';

    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data') || contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await req.formData();
      subject = (formData.get('subject') as string) || '';
      htmlContent = (formData.get('html') as string) || '';
      textContent = (formData.get('text') as string) || '';
      const fromField = (formData.get('from') as string) || '';
      if (fromField) {
        sender = fromField.split('<')[0].replace(/"/g, '').trim() || fromField;
      }
    } else {
      // JSON Payload (e.g. testing or direct webhook forwarder)
      const body = await req.json().catch(() => ({}));
      subject = body.subject || body.title || '';
      htmlContent = body.html || body.htmlContent || body.content || '';
      textContent = body.text || body.summary || '';
      sender = body.from || body.author || sender;
    }

    if (!subject && !htmlContent && !textContent) {
      return NextResponse.json(
        { error: 'No se recibieron datos de correo válidos (subject/html/text faltantes).' },
        { status: 400 }
      );
    }

    const postTitle = (subject || 'Nuevo Boletín Dubros').trim();
    const baseSlug = slugify(postTitle);
    const uniqueSlug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;
    const finalHtml = cleanEmailHtml(htmlContent) || `<p>${textContent}</p>`;
    const featuredImage = extractFirstImage(finalHtml) || '/images/blog-placeholder.jpg';
    const summary = extractTextSummary(textContent || finalHtml) || postTitle;
    const now = new Date().toISOString();

    console.log(`[SendGrid Inbound Webhook] Publicando nuevo post: "${postTitle}"`);

    // Insert into Supabase `blog_posts` table
    const { data, error } = await supabaseAdmin
      .from('blog_posts')
      .insert([
        {
          title: postTitle,
          slug: uniqueSlug,
          summary: summary,
          content: finalHtml,
          image_url: featuredImage,
          author: sender,
          published_at: now,
        },
      ])
      .select('*')
      .single();

    if (error) {
      console.error('[SendGrid Webhook Supabase Error]:', error);
      // Return 200 to SendGrid so it doesn't retry infinitely
      return NextResponse.json({
        success: true,
        notice: 'Email recibido pero la tabla blog_posts arrojó un error.',
        error: error.message,
      });
    }

    return NextResponse.json({
      success: true,
      message: '¡Artículo de blog publicado automáticamente desde SendGrid!',
      post: data,
    });
  } catch (error: any) {
    console.error('[SendGrid Webhook Error]:', error);
    return NextResponse.json(
      { error: error.message || 'Error procesando webhook de SendGrid.' },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// GET: Webhook Health Check & Documentation
// ---------------------------------------------------------------------------
export async function GET() {
  return NextResponse.json({
    status: 'online',
    endpoint: '/api/blog/sendgrid-webhook',
    method: 'POST',
    description: 'SendGrid Inbound Parse Webhook para publicación automática en el Blog de Dubros.',
    supportedFormats: ['multipart/form-data', 'application/json'],
  });
}
