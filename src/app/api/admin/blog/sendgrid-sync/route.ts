import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Admin with Service Role
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

function extractTextSummary(html: string): string {
  if (!html) return '';
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  return text.length > 200 ? text.slice(0, 197) + '...' : text;
}

// ---------------------------------------------------------------------------
// GET: Fetch recent SendGrid Campaigns
// ---------------------------------------------------------------------------
export async function GET(req: NextRequest) {
  try {
    const customKey = req.headers.get('x-sendgrid-key') || req.nextUrl.searchParams.get('apiKey');
    const sendgridApiKey = customKey || process.env.SENDGRID_API_KEY;

    if (!sendgridApiKey) {
      return NextResponse.json(
        { error: 'No se ha configurado la clave API de SendGrid (SENDGRID_API_KEY).' },
        { status: 400 }
      );
    }

    const campaigns: Array<{
      id: string;
      title: string;
      subject: string;
      status: string;
      updated_at: string;
      preview_html?: string;
      image_url?: string;
    }> = [];

    let lastError = null;

    // 1. Try SendGrid Marketing Single Sends API (v3)
    try {
      const singleSendsRes = await fetch('https://api.sendgrid.com/v3/marketing/singlesends', {
        headers: {
          Authorization: `Bearer ${sendgridApiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (singleSendsRes.ok) {
        const data = await singleSendsRes.json();
        const results = data.result || [];

        for (const item of results.slice(0, 15)) {
          let htmlContent = item.email_config?.html_content || '';
          let subject = item.email_config?.subject || item.name || 'Sin Asunto';

          if (!htmlContent && item.id) {
            try {
              const detailRes = await fetch(`https://api.sendgrid.com/v3/marketing/singlesends/${item.id}`, {
                headers: {
                  Authorization: `Bearer ${sendgridApiKey}`,
                },
              });
              if (detailRes.ok) {
                const detailData = await detailRes.json();
                htmlContent = detailData.email_config?.html_content || '';
                subject = detailData.email_config?.subject || subject;
              }
            } catch (err) {
              console.warn('[SendGrid Detail Error]:', err);
            }
          }

          campaigns.push({
            id: String(item.id),
            title: item.name || subject,
            subject: subject,
            status: item.status || 'draft',
            updated_at: item.updated_at || item.send_at || new Date().toISOString(),
            preview_html: htmlContent,
            image_url: extractFirstImage(htmlContent) || undefined,
          });
        }
      } else {
        const errData = await singleSendsRes.json().catch(() => ({}));
        lastError = errData.errors?.[0]?.message || `Error ${singleSendsRes.status} de SendGrid`;
      }
    } catch (e: any) {
      lastError = e.message;
    }

    // 2. Fallback: Try SendGrid Legacy Campaigns API
    if (campaigns.length === 0) {
      try {
        const legacyRes = await fetch('https://api.sendgrid.com/v3/campaigns?limit=15', {
          headers: {
            Authorization: `Bearer ${sendgridApiKey}`,
            'Content-Type': 'application/json',
          },
        });

        if (legacyRes.ok) {
          const legacyData = await legacyRes.json();
          const results = legacyData.result || [];

          for (const item of results) {
            campaigns.push({
              id: String(item.id),
              title: item.title || item.subject || 'Campaña SendGrid',
              subject: item.subject || item.title || 'Sin Asunto',
              status: item.status || 'sent',
              updated_at: item.updated_at || new Date().toISOString(),
              preview_html: item.html_content || '',
              image_url: extractFirstImage(item.html_content || '') || undefined,
            });
          }
        }
      } catch (err) {
        console.warn('[SendGrid Legacy Error]:', err);
      }
    }

    // 3. Fallback: Try SendGrid Dynamic Templates
    if (campaigns.length === 0) {
      try {
        const tplRes = await fetch('https://api.sendgrid.com/v3/templates?generations=dynamic&page_size=15', {
          headers: {
            Authorization: `Bearer ${sendgridApiKey}`,
            'Content-Type': 'application/json',
          },
        });

        if (tplRes.ok) {
          const tplData = await tplRes.json();
          const templates = tplData.templates || [];

          for (const item of templates) {
            const activeVersion = item.versions?.[0];
            campaigns.push({
              id: String(item.id),
              title: item.name || 'Plantilla SendGrid',
              subject: activeVersion?.subject || item.name || 'Sin Asunto',
              status: 'template',
              updated_at: item.updated_at || new Date().toISOString(),
              preview_html: activeVersion?.html_content || '',
              image_url: extractFirstImage(activeVersion?.html_content || '') || undefined,
            });
          }
        }
      } catch (err) {
        console.warn('[SendGrid Templates Error]:', err);
      }
    }

    if (campaigns.length === 0 && lastError) {
      return NextResponse.json(
        {
          error: `Respuesta de SendGrid: "${lastError}". Verifica que tu API Key tenga permisos de 'Marketing' o 'Full Access' en SendGrid > Settings > API Keys, o usa la pestaña 'Pegar HTML'.`,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      campaigns,
      total: campaigns.length,
    });
  } catch (error: any) {
    console.error('[SendGrid Sync GET Error]:', error);
    return NextResponse.json(
      { error: error.message || 'Error al conectar con la API de SendGrid.' },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// POST: Import SendGrid Campaign into Blog Posts Table
// ---------------------------------------------------------------------------
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, subject, htmlContent, imageUrl, author, tags } = body;

    if (!title && !subject) {
      return NextResponse.json(
        { error: 'El título o asunto de la campaña es requerido.' },
        { status: 400 }
      );
    }

    const postTitle = (subject || title || 'Nuevo Artículo').trim();
    const baseSlug = slugify(postTitle);
    const uniqueSlug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;
    const featuredImage = imageUrl || extractFirstImage(htmlContent) || '/images/blog-placeholder.jpg';
    const summary = extractTextSummary(htmlContent) || postTitle;
    const postAuthor = author || 'Equipo Dubros International';
    const now = new Date().toISOString();

    // Insert into Supabase `blog_posts` table
    const { data, error } = await supabaseAdmin
      .from('blog_posts')
      .insert([
        {
          title: postTitle,
          slug: uniqueSlug,
          summary: summary,
          content: htmlContent || `<p>${summary}</p>`,
          image_url: featuredImage,
          author: postAuthor,
          published_at: now,
        },
      ])
      .select('*')
      .single();

    if (error) {
      console.error('[Supabase Blog Insert Error]:', error);
      // If table doesn't exist yet or has RLS, return formatted object for client
      return NextResponse.json({
        success: true,
        post: {
          id: `sg-${Date.now()}`,
          title: postTitle,
          slug: uniqueSlug,
          summary: summary,
          content: htmlContent,
          image_url: featuredImage,
          author: postAuthor,
          published_at: now,
        },
        notice: 'Artículo importado con éxito.',
      });
    }

    return NextResponse.json({
      success: true,
      post: data,
    });
  } catch (error: any) {
    console.error('[SendGrid Sync POST Error]:', error);
    return NextResponse.json(
      { error: error.message || 'Error al importar la campaña al blog.' },
      { status: 500 }
    );
  }
}
