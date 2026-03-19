import prisma from "@/app/db";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const parsedId = parseInt(id);
    if (isNaN(parsedId)) {
      return new Response(JSON.stringify({ error: "Invalid ID" }), { status: 400 });
    }
    const sheet = await prisma.callSheet.delete({ where: { id: parsedId } });
    return new Response(JSON.stringify(sheet));
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Failed to delete" }), { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const parsedId = parseInt(id);
    if (isNaN(parsedId)) {
      return new Response(JSON.stringify({ error: "Invalid ID" }), { status: 400 });
    }
    const data = await request.json();
    const sheet = await prisma.callSheet.update({
      where: { id: parsedId },
      data,
    });
    return new Response(JSON.stringify(sheet));
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Failed to update" }), { status: 500 });
  }
}