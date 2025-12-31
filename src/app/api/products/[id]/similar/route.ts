import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { products } from '@/lib/db/schema';
import { eq, inArray, and } from 'drizzle-orm';
import RecommendationEngine from '@/lib/recommendation-engine';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '12');

    // Verify product exists
    const productResult = await db.select({
      id: products.id,
      status: products.status,
      name: products.name
    })
    .from(products)
    .where(eq(products.id, id))
    .limit(1)
    .then(results => results[0] || null);

    if (!productResult) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    if (productResult.status !== 'PUBLISHED') {
      return NextResponse.json(
        { error: 'Product is not available' },
        { status: 400 }
      );
    }

    // Get similar products
    const similarRecommendations = await RecommendationEngine.getSimilarProducts(id, limit);

    // Fetch full product details
    const productIds = similarRecommendations.map(r => r.productId);
    const similarProducts = await db.select()
      .from(products)
      .where(and(
        inArray(products.id, productIds),
        eq(products.status, 'PUBLISHED')
      ));

    // Combine recommendations with product data
    const productMap = Object.fromEntries(similarProducts.map((p: typeof products.$inferSelect) => [p.id, p]));
    
    const result = similarRecommendations
      .map((rec: { productId: string; [key: string]: any }) => ({
        ...rec,
        product: productMap[rec.productId],
      }))
      .filter((rec: { product?: any }) => rec.product);

    return NextResponse.json({
      productId: id,
      productName: productResult.name,
      category: '',
      similar: result,
      count: result.length,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch similar products' },
      { status: 500 }
    );
  }
}