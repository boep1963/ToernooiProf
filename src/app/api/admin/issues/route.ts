import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { validateSuperAdmin } from '@/lib/admin';
import {
  isAllowedImageType,
  processIssueImageToStorage,
  SUPPORTED_FORMATS,
  MAX_IMAGES_PER_ISSUE,
} from '@/lib/issueImageUtils';
import { addEmailToQueue, generateNewIssueEmail } from '@/lib/emailQueue';

export type IssueStatus = 'not_started' | 'in_progress' | 'done';
export type IssueType = 'bug' | 'feature';

export interface AdminIssue {
  id: string;
  title: string;
  description: string;
  type: IssueType;
  images: string[];
  status: IssueStatus;
  completedAt: string | null;
  hans_tested: boolean;
  pierre_tested: boolean;
  createdAt: string;
  updatedAt: string;
}

function parseBool(value: unknown): boolean {
  if (value === true || value === 'true' || value === '1') return true;
  return false;
}

/**
 * GET /api/admin/issues
 * List all issues, sorted by updatedAt desc. Optional query: status, type.
 */
export async function GET(request: NextRequest) {
  const authResult = await validateSuperAdmin(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status') as IssueStatus | null;
    const typeFilter = searchParams.get('type') as IssueType | null;

    const query = db.collection('admin_issues').orderBy('updatedAt', 'desc').limit(500);

    const snapshot = await query.get();
    let issues: AdminIssue[] = snapshot.docs.map((doc) => {
      const d = doc.data() as Record<string, unknown>;
      return {
        id: doc.id,
        title: String(d.title ?? ''),
        description: String(d.description ?? ''),
        type: (d.type as IssueType) || 'bug',
        images: Array.isArray(d.images) ? (d.images as string[]) : [],
        status: (d.status as IssueStatus) || 'not_started',
        completedAt: d.completedAt != null ? String(d.completedAt) : null,
        hans_tested: parseBool(d.hans_tested),
        pierre_tested: parseBool(d.pierre_tested),
        createdAt: String(d.createdAt ?? ''),
        updatedAt: String(d.updatedAt ?? ''),
      };
    });

    if (statusFilter) {
      issues = issues.filter((i) => i.status === statusFilter);
    }
    if (typeFilter) {
      issues = issues.filter((i) => i.type === typeFilter);
    }

    return NextResponse.json({ success: true, issues });
  } catch (error) {
    console.error('[ADMIN ISSUES] GET error:', error);
    return NextResponse.json(
      { error: 'Fout bij ophalen issues.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/issues
 * Create a new issue. Body: FormData with title, type, status, hans_tested, pierre_tested, and optional image files.
 */
export async function POST(request: NextRequest) {
  const authResult = await validateSuperAdmin(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const formData = await request.formData();
    const title = (formData.get('title') as string)?.trim();
    if (!title) {
      return NextResponse.json(
        { error: 'Titel is verplicht.' },
        { status: 400 }
      );
    }

    const type = ((formData.get('type') as string) || 'bug') as IssueType;
    if (type !== 'bug' && type !== 'feature') {
      return NextResponse.json(
        { error: 'Type moet "bug" of "feature" zijn.' },
        { status: 400 }
      );
    }

    const status = ((formData.get('status') as string) || 'not_started') as IssueStatus;
    const validStatuses: IssueStatus[] = ['not_started', 'in_progress', 'done'];
    const issueStatus = validStatuses.includes(status) ? status : 'not_started';

    const description = (formData.get('description') as string)?.trim() ?? '';
    const hans_tested = parseBool(formData.get('hans_tested'));
    const pierre_tested = parseBool(formData.get('pierre_tested'));

    const imageDataUrls: string[] = [];
    const fileKeys = ['image0', 'image1', 'image2', 'images'];
    for (const key of fileKeys) {
      const file = formData.get(key) as File | null;
      if (file && file.size > 0 && file.type) {
        if (!isAllowedImageType(file.type)) {
          return NextResponse.json(
            { error: `Alleen ${SUPPORTED_FORMATS} zijn toegestaan voor afbeeldingen.` },
            { status: 400 }
          );
        }
        const buf = Buffer.from(await file.arrayBuffer());
        const dataUrl = await processIssueImageToStorage(buf);
        imageDataUrls.push(dataUrl);
        if (imageDataUrls.length >= MAX_IMAGES_PER_ISSUE) break;
      }
    }
    if (imageDataUrls.length < formData.getAll('images').length && formData.getAll('images').length > 0) {
      for (const f of formData.getAll('images') as File[]) {
        if (imageDataUrls.length >= MAX_IMAGES_PER_ISSUE) break;
        if (f && f.size > 0 && f.type && isAllowedImageType(f.type)) {
          const buf = Buffer.from(await f.arrayBuffer());
          imageDataUrls.push(await processIssueImageToStorage(buf));
        }
      }
    }
    while (imageDataUrls.length > MAX_IMAGES_PER_ISSUE) {
      imageDataUrls.pop();
    }

    const now = new Date().toISOString();
    const completedAt = issueStatus === 'done' ? now : null;

    const data: Record<string, unknown> = {
      title,
      description,
      type,
      images: imageDataUrls,
      status: issueStatus,
      completedAt,
      hans_tested,
      pierre_tested,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await db.collection('admin_issues').add(data);
    const issue: AdminIssue = {
      id: docRef.id,
      title,
      description,
      type,
      images: imageDataUrls,
      status: issueStatus,
      completedAt,
      hans_tested,
      pierre_tested,
      createdAt: now,
      updatedAt: now,
    };

    try {
      const email = generateNewIssueEmail('ToernooiProf', title, type, description || undefined);
      await addEmailToQueue(email);
    } catch (queueError) {
      console.error('[ADMIN ISSUES] E-mail queue error (issue created):', queueError);
    }

    return NextResponse.json({ success: true, issue });
  } catch (error) {
    console.error('[ADMIN ISSUES] POST error:', error);
    return NextResponse.json(
      { error: 'Fout bij aanmaken issue.' },
      { status: 500 }
    );
  }
}
