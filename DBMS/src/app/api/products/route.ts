import { NextResponse } from "next/server";
import { getLoanProducts, getLoanProductById } from "@/lib/db";
import { calculateEMI, generateAmortizationSchedule } from "@/lib/utils";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const idParam = searchParams.get("id");
    const previewAmount = searchParams.get("previewAmount");

    if (idParam) {
      const product = await getLoanProductById(parseInt(idParam, 10));
      if (!product) {
        return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
      }

      let amortizationPreview = null;
      let calculatedEmi = null;

      if (previewAmount) {
        const principal = parseFloat(previewAmount);
        calculatedEmi = calculateEMI(principal, product.interest_rate, product.tenure_months);
        amortizationPreview = generateAmortizationSchedule(
          principal,
          product.interest_rate,
          product.tenure_months
        );
      }

      return NextResponse.json({
        success: true,
        data: {
          ...product,
          calculatedEmi,
          amortizationPreview,
        },
      });
    }

    const products = await getLoanProducts();
    return NextResponse.json({ success: true, data: products });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch products";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
