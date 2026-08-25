import { DomainError, cancelOrder, confirmOrder, markDelivered, markDeliveryFailed, markOrderStatus, markOutForDelivery, markPaymentPaid, updateEnquiry } from "@/lib/operations";
import { requireAdmin } from "@/lib/require-admin";
import { revalidateStoreCatalog } from "@/lib/revalidate-store";
import { DeliveryZone, OrderStatus, PaymentMethod } from "@prisma/client";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { id } = await context.params;
  const body = await request.json();
  const action = String(body.action ?? "");

  try {
    if (action === "confirm") await confirmOrder(id);
    else if (action === "cancel") await cancelOrder(id);
    else if (action === "paid") {
      await markPaymentPaid(id, {
        mpesaCode: String(body.mpesaCode ?? "") || undefined,
        method: body.paymentMethod as PaymentMethod | undefined,
      });
    }
    else if (action === "out") await markOutForDelivery(id, String(body.riderName ?? "") || undefined);
    else if (action === "delivered") await markDelivered(id);
    else if (action === "delivery-failed") {
      await markDeliveryFailed(id, String(body.reason ?? "") || undefined);
    }
    else if (action === "processing") await markOrderStatus(id, OrderStatus.PROCESSING);
    else if (action === "complete") await markOrderStatus(id, OrderStatus.COMPLETED);
    else if (action === "update-enquiry") {
      await updateEnquiry(id, {
        items: Array.isArray(body.items) ? body.items : [],
        notes: body.notes === undefined ? undefined : String(body.notes),
        paymentMethod: body.paymentMethod as PaymentMethod | undefined,
        zone: body.zone as DeliveryZone | undefined,
        address: body.address === undefined ? undefined : String(body.address),
        deliveryFeeKes:
          body.deliveryFeeKes === undefined || body.deliveryFeeKes === ""
            ? undefined
            : Math.max(0, Number(body.deliveryFeeKes) || 0),
      });
    } else return NextResponse.json({ error: "Unknown action." }, { status: 400 });

    // Confirm/cancel change stock; keep home/shop labels in sync.
    if (action === "confirm" || action === "cancel") {
      revalidateStoreCatalog();
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof DomainError ? error.message : "Could not update the order.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
