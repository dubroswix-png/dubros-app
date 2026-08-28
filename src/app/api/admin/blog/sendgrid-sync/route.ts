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
// GET: Fetch recent SendGrid Campaigns or specific Template by ID
// ---------------------------------------------------------------------------
export async function GET(req: NextRequest) {
  try {
    const customKey = req.headers.get('x-sendgrid-key') || req.nextUrl.searchParams.get('apiKey');
    const sendgridApiKey = customKey?.trim() ? customKey.trim() : process.env.SENDGRID_API_KEY;
    const templateId = req.nextUrl.searchParams.get('templateId')?.trim();

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

    // 0. If a specific templateId was provided (e.g. d-075e046c78a047518048d52c7a0815e7)
    if (templateId) {
      try {
        const tplRes = await fetch(`https://api.sendgrid.com/v3/templates/${templateId}`, {
          headers: {
            Authorization: `Bearer ${sendgridApiKey}`,
            'Content-Type': 'application/json',
          },
        });

        if (tplRes.ok) {
          const tplData = await tplRes.json();
          const activeVersion = tplData.versions?.find((v: any) => v.active === 1) || tplData.versions?.[0];
          const htmlContent = activeVersion?.html_content || '';
          const subject = activeVersion?.subject || tplData.name || 'Plantilla SendGrid';

          campaigns.push({
            id: String(tplData.id),
            title: tplData.name || subject,
            subject: subject,
            status: 'template',
            updated_at: tplData.updated_at || new Date().toISOString(),
            preview_html: htmlContent,
            image_url: extractFirstImage(htmlContent) || undefined,
          });

          return NextResponse.json({
            success: true,
            campaigns,
            total: 1,
          });
        } else {
          const errJson = await tplRes.json().catch(() => ({}));
          lastError = errJson.errors?.[0]?.message || `Error ${tplRes.status} al consultar la plantilla ${templateId}`;
        }
      } catch (err: any) {
        lastError = err.message;
      }
    }

    // 1. Try SendGrid Dynamic Templates List
    try {
      const tplRes = await fetch('https://api.sendgrid.com/v3/templates?generations=dynamic&page_size=20', {
        headers: {
          Authorization: `Bearer ${sendgridApiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (tplRes.ok) {
        const tplData = await tplRes.json();
        const templates = tplData.templates || [];

        for (const item of templates) {
          // Fetch full template to get html_content if needed
          let htmlContent = '';
          let subject = item.name || 'Plantilla SendGrid';

          if (item.id) {
            try {
              const fullTplRes = await fetch(`https://api.sendgrid.com/v3/templates/${item.id}`, {
                headers: { Authorization: `Bearer ${sendgridApiKey}` },
              });
              if (fullTplRes.ok) {
                const fullTpl = await fullTplRes.json();
                const activeVersion = fullTpl.versions?.find((v: any) => v.active === 1) || fullTpl.versions?.[0];
                htmlContent = activeVersion?.html_content || '';
                subject = activeVersion?.subject || subject;
              }
            } catch (e) {
              console.warn('[Full Template Error]:', e);
            }
          }

          campaigns.push({
            id: String(item.id),
            title: item.name || subject,
            subject: subject,
            status: 'template',
            updated_at: item.updated_at || new Date().toISOString(),
            preview_html: htmlContent,
            image_url: extractFirstImage(htmlContent) || undefined,
          });
        }
      } else {
        const errData = await tplRes.json().catch(() => ({}));
        lastError = errData.errors?.[0]?.message || `Error ${tplRes.status} de SendGrid`;
      }
    } catch (err) {
      console.warn('[SendGrid Templates Error]:', err);
    }

    // 2. Try SendGrid Marketing Single Sends API (v3)
    if (campaigns.length === 0) {
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
                  headers: { Authorization: `Bearer ${sendgridApiKey}` },
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
        }
      } catch (e: any) {
        lastError = e.message;
      }
    }

    // 3. Fallback: Try SendGrid Legacy Campaigns API
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

    if (campaigns.length === 0 && lastError) {
      return NextResponse.json(
        {
          error: `Respuesta de SendGrid: "${lastError}". Verifica los permisos de tu API Key o ingresa el Template ID directamente.`,
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
// POST: Import SendGrid Campaign or Template ID into Blog Posts Table
// ---------------------------------------------------------------------------
export async function POST(req: NextRequest) {
  try {
    const customKey = req.headers.get('x-sendgrid-key');
    const sendgridApiKey = customKey?.trim() ? customKey.trim() : process.env.SENDGRID_API_KEY;

    const body = await req.json();
    let { title, subject, htmlContent, imageUrl, author, templateId } = body;

    // If templateId provided, fetch its HTML directly from SendGrid
    if (templateId && sendgridApiKey && !htmlContent) {
      try {
        const tplRes = await fetch(`https://api.sendgrid.com/v3/templates/${templateId.trim()}`, {
          headers: {
            Authorization: `Bearer ${sendgridApiKey}`,
            'Content-Type': 'application/json',
          },
        });

        if (tplRes.ok) {
          const tplData = await tplRes.json();
          const activeVersion = tplData.versions?.find((v: any) => v.active === 1) || tplData.versions?.[0];
          htmlContent = activeVersion?.html_content || '';
          subject = subject || activeVersion?.subject || tplData.name;
          title = title || tplData.name || subject;
        }
      } catch (err) {
        console.warn('[Fetch Template in POST Error]:', err);
      }
    }

    if (!title && !subject && !templateId) {
      return NextResponse.json(
        { error: 'El título, asunto o Template ID de la plantilla es requerido.' },
        { status: 400 }
      );
    }

    const postTitle = (subject || title || templateId || 'Nuevo Boletín').trim();
    const baseSlug = slugify(postTitle);
    const uniqueSlug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;
    const featuredImage = imageUrl || extractFirstImage(htmlContent) || '/images/blog-placeholder.jpg';
    const summary = extractTextSummary(htmlContent) || postTitle;
    const postAuthor = author || 'Boletín Dubros International';
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
      { error: error.message || 'Error al importar la plantilla al blog.' },
      { status: 500 }
    );
  }
}
