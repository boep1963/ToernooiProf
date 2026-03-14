import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { validateSuperAdmin } from '@/lib/admin';
import {
  isAllowedImageType,
  processIssueImageToStorage,
  MAX_IMAGES_PER_ISSUE,
} from '@/lib/issueImageUtils';
import type { AdminIssue, IssueStatus, IssueType } from '../../route';

interface RouteParams {
  params: Promise<{ id: string }>;
}

function parseBool(value: unknown): boolean {
  if (value === true || value === 'true' || value === '1') return true;
  return false;
}

/**
 * GET /api/admin/issues/:id
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const authResult = await validateSuperAdmin(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { id } = await params;
    const docRef = db.collection('admin_issues').doc(id);
    const snap = await docRef.get();

    if (!snap.exists) {
      return NextResponse.json(
        { error: 'Issue niet gevonden.' },
        { status: 404 }
      );
    }

    const d = snap.data() as Record<string, unknown>;
    const issue: AdminIssue = {
      id: snap.id,
      title: String(d.title ?? ''),
      type: (d.type as IssueType) || 'bug',
      images: Array.isArray(d.images) ? (d.images as string[]) : [],
      status: (d.status as IssueStatus) || 'not_started',
      completedAt: d.completedAt != null ? String(d.completedAt) : null,
      hans_tested: parseBool(d.hans_tested),
      pierre_tested: parseBool(d.pierre_tested),
      createdAt: String(d.createdAt ?? ''),
      updatedAt: String(d.updatedAt ?? ''),
    };

    return NextResponse.json({ success: true, issue });
  } catch (error) {
    console.error('[ADMIN ISSUES] GET [id] error:', error);
    return NextResponse.json(
      { error: 'Fout bij ophalen issue.' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/issues/:id
 * Update issue. JSON body: title?, type?, status?, hans_tested?, pierre_tested?, images?
 * When status changes to 'done', completedAt is set; when changing away, completedAt cleared.
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const authResult = await validateSuperAdmin(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { id } = await params;
    const docRef = db.collection('admin_issues').doc(id);
    const snap = await docRef.get();

    if (!snap.exists) {
      return NextResponse.json(
        { error: 'Issue niet gevonden.' },
        { status: 404 }
      );
    }

    const contentType = request.headers.get('content-type') || '';
    let updates: Record<string, unknown>;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const title = (formData.get('title') as string)?.trim();
      const type = (formData.get('type') as string) || undefined;
      const status = (formData.get('status') as string) || undefined;
      const hans_tested = formData.get('hans_tested');
      const pierre_tested = formData.get('pierre_tested');
      const existingImagesJson = formData.get('existingImages') as string | null;
      let images: string[] = existingImagesJson ? JSON.parse(existingImagesJson) : (snap.data()?.images as string[]) || [];

      const newImages: string[] = [];
      for (let i = 0; i < MAX_IMAGES_PER_ISSUE; i++) {
        const file = formData.get(`image${i}`) as File | null;
        if (file && file.size > 0 && file.type && isAllowedImageType(file.type)) {
          const buf = Buffer.from(await file.arrayBuffer());
          newImages.push(await processIssueImageToStorage(buf));
        }
      }
      if (newImages.length > 0) {
        images = [...images, ...newImages].slice(0, MAX_IMAGES_PER_ISSUE);
      }

      updates = {
        ...(title !== undefined && title !== null && { title }),
        ...(type !== undefined && type !== null && { type }),
        ...(status !== undefined && status !== null && { status }),
        ...(hans_tested !== undefined && hans_tested !== null && { hans_tested: parseBool(hans_tested) }),
        ...(pierre_tested !== undefined && pierre_tested !== null && { pierre_tested: parseBool(pierre_tested) }),
        images,
      };
    } else {
      const body = await request.json();
      updates = { ...body };
      delete (updates as Record<string, unknown>).id;

      const newStatus = updates.status as IssueStatus | undefined;
      if (newStatus !== undefined) {
        if (newStatus === 'done') {
          updates.completedAt = new Date().toISOString();
        } else {
          updates.completedAt = null;
        }
      }
      updates.updatedAt = new Date().toISOString();
    }

    const now = new Date().toISOString();
    const merged = { ...(snap.data() as Record<string, unknown>), ...updates, updatedAt: now };
    if (merged.status === 'done' && merged.completedAt == null) {
      merged.completedAt = now;
    } else if (merged.status !== 'done') {
      merged.completedAt = null;
    }

    await docRef.update(merged);

    const updated = await docRef.get();
    const d = updated.data() as Record<string, unknown>;
    const issue: AdminIssue = {
      id: updated.id,
      title: String(d.title ?? ''),
      type: (d.type as IssueType) || 'bug',
      images: Array.isArray(d.images) ? (d.images as string[]) : [],
      status: (d.status as IssueStatus) || 'not_started',
      completedAt: d.completedAt != null ? String(d.completedAt) : null,
      hans_tested: parseBool(d.hans_tested),
      pierre_tested: parseBool(d.pierre_tested),
      createdAt: String(d.createdAt ?? ''),
      updatedAt: String(d.updatedAt ?? ''),
    };

    return NextResponse.json({ success: true, issue });
  } catch (error) {
    console.error('[ADMIN ISSUES] PATCH error:', error);
    return NextResponse.json(
      { error: 'Fout bij bijwerken issue.' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/issues/:id
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const authResult = await validateSuperAdmin(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { id } = await params;
    const docRef = db.collection('admin_issues').doc(id);
    const snap = await docRef.get();

    if (!snap.exists) {
      return NextResponse.json(
        { error: 'Issue niet gevonden.' },
        { status: 404 }
      );
    }

    await docRef.delete();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[ADMIN ISSUES] DELETE error:', error);
    return NextResponse.json(
      { error: 'Fout bij verwijderen issue.' },
      { status: 500 }
    );
  }
}
