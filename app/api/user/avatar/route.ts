import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabase-storage";

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const BUCKET = "avatars";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session.isLoggedIn) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No se ha enviado ningún archivo" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Solo se permiten imágenes" }, { status: 400 });
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json({ error: "La imagen no puede superar los 5 MB" }, { status: 400 });
    }

    const ext = file.name.split(".").pop() ?? "jpg";
    const filePath = `${session.userId}/${Date.now()}.${ext}`;

    // Delete previous avatar file if it exists
    const existingUser = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { avatar: true },
    });

    if (existingUser?.avatar) {
      const url = existingUser.avatar;
      const marker = `/object/public/${BUCKET}/`;
      const idx = url.indexOf(marker);
      if (idx !== -1) {
        const oldPath = url.slice(idx + marker.length);
        await supabaseAdmin.storage.from(BUCKET).remove([oldPath]);
      }
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error("Supabase upload error:", uploadError);
      return NextResponse.json({ error: "Error al subir la imagen" }, { status: 500 });
    }

    const { data: publicUrlData } = supabaseAdmin.storage
      .from(BUCKET)
      .getPublicUrl(filePath);

    await prisma.user.update({
      where: { id: session.userId },
      data: { avatar: publicUrlData.publicUrl },
    });

    return NextResponse.json({ avatarUrl: publicUrlData.publicUrl });
  } catch (error) {
    console.error("Avatar upload error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
