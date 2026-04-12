import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import prisma from "@/app/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const parsedId = parseInt(id);
    if (isNaN(parsedId)) {
      return new Response(JSON.stringify({ error: "Invalid ID" }), {
        status: 400,
      });
    }
    const pictures = await prisma.callSheetPicture.findMany({
      where: { callSheetId: parsedId },
    });
    return new Response(JSON.stringify(pictures));
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Failed to fetch pictures" }), {
      status: 500,
    });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const parsedId = parseInt(id);
    if (isNaN(parsedId)) {
      return new Response(JSON.stringify({ error: "Invalid ID" }), {
        status: 400,
      });
    }

    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return new Response(JSON.stringify({ error: "No files provided" }), {
        status: 400,
      });
    }

    // Save files to public/uploads/call-sheets/<id>/
    const uploadDir = join(
      process.cwd(),
      "public",
      "uploads",
      "call-sheets",
      String(parsedId),
    );
    await mkdir(uploadDir, { recursive: true });

    const savedPictures = await Promise.all(
      files.map(async (file) => {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Sanitize filename and make it unique
        const ext = file.name.split(".").pop() ?? "jpg";
        const safeName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const filePath = join(uploadDir, safeName);

        await writeFile(filePath, buffer);

        // Store the public URL path
        const url = `/uploads/call-sheets/${parsedId}/${safeName}`;

        return prisma.callSheetPicture.create({
          data: { callSheetId: parsedId, url },
        });
      }),
    );

    return new Response(JSON.stringify(savedPictures), { status: 201 });
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ error: "Failed to upload pictures" }),
      {
        status: 500,
      },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const parsedId = parseInt(id);
    if (isNaN(parsedId)) {
      return new Response(JSON.stringify({ error: "Invalid ID" }), {
        status: 400,
      });
    }

    const { pictureId } = (await request.json()) as { pictureId: number };
    if (!pictureId) {
      return new Response(JSON.stringify({ error: "pictureId required" }), {
        status: 400,
      });
    }

    await prisma.callSheetPicture.delete({ where: { id: pictureId } });
    return new Response(JSON.stringify({ deleted: true }));
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Failed to delete picture" }), {
      status: 500,
    });
  }
}
