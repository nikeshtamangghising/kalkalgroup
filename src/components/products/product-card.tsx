import { memo, useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { Card, CardContent } from "@/components/ui/card";
import { createViewTracker } from "@/lib/activity-tracker";
import { getSessionId } from "@/lib/activity-utils";
import { formatCurrency, DEFAULT_CURRENCY } from "@/lib/currency";
import { ProductWithCategory } from "@/types";
interface ProductCardProps {
  product: ProductWithCategory;
  trackViews?: boolean;
  compact?: boolean;
}

function ProductCard({
  product,
  trackViews = true,
  compact = false,
}: ProductCardProps) {
  const { data: session } = useSession();
  const cardRef = useRef<HTMLDivElement>(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const router = useRouter();



  // Set up view tracking
  useEffect(() => {
    if (!trackViews || !cardRef.current) return () => {};

    // Generate a session ID for guest users if no user is logged in
    // Use getSessionId() utility which handles session storage properly
    const sessionId = !session?.user?.id
      ? getSessionId()
      : undefined;

    const observer = createViewTracker(session?.user?.id, sessionId);
    if (observer) {
      cardRef.current.setAttribute("data-product-id", product.id);
      observer.observe(cardRef.current);

      return () => {
        observer.disconnect();
      };
    }
    
    return () => {};
  }, [product.id, session?.user?.id, trackViews]);



  // Navigation helper
  const navigateToProduct = () => {
    const href = `/products/${product.slug || product.id}`;
    router.push(href);
  };

  // Simple click handler for navigation
  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigateToProduct();
  };

  // Keyboard support: Enter -> navigate
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      navigateToProduct();
    }
  };

  return (
    <Card
      ref={cardRef}
      className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border border-gray-100 hover:border-blue-200 overflow-hidden bg-white relative select-none rounded-2xl shadow-sm hover:shadow-blue-100/50 cursor-pointer"
      role="link"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onClick={handleCardClick}
      suppressHydrationWarning
    >
      <div className="relative" suppressHydrationWarning>
        <div className="aspect-square w-full overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 cursor-pointer relative rounded-t-2xl" suppressHydrationWarning>
          {!isImageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-300 animate-pulse" suppressHydrationWarning>
              <div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"
                style={{ animationDelay: "0.5s", animationDuration: "2s" }}
                suppressHydrationWarning
              />
            </div>
          )}
          <Image
            src={product.thumbnailUrl || "/placeholder-product.svg"}
            alt={product.name}
            width={400}
            height={400}
            className={`h-full w-full object-cover object-center group-hover:scale-105 transition-all duration-700 ease-out ${
              isImageLoaded ? "opacity-100" : "opacity-0"
            }`}
            loading="lazy"
            onLoad={() => setIsImageLoaded(true)}
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
            draggable={false}
            suppressHydrationWarning
          />



          {/* Stock Status Badge */}
          {/* inventory field doesn't exist in schema */}
        </div>
      </div>
      <CardContent className={compact ? "p-2" : "p-5"} suppressHydrationWarning>
        {/* Category Badge */}
        {!compact && (
          <div className="mb-3" suppressHydrationWarning>
            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 hover:from-blue-100 hover:to-indigo-100 transition-all duration-300 border border-blue-100">
              {product.category.name}
            </span>
          </div>
        )}

        {/* Product Title */}
        <h3
          className={
            compact
              ? "text-sm font-semibold text-gray-900 line-clamp-2 cursor-pointer hover:text-blue-600 transition-colors mb-1 leading-tight"
              : "text-base font-bold text-gray-900 line-clamp-2 cursor-pointer hover:text-blue-600 transition-colors mb-3 leading-tight"
          }
          suppressHydrationWarning
        >
          {product.name}
        </h3>

        {/* Price */}
        <div
          className={
            compact
              ? "flex items-center flex-wrap gap-1 mb-2"
              : "flex items-center flex-wrap gap-3 mb-4"
          }
          suppressHydrationWarning
        >
          <span
              className={
                compact
                  ? "text-sm sm:text-base font-bold text-slate-800"
                  : "text-base sm:text-lg font-bold text-slate-800"
              }
              suppressHydrationWarning
            >
              {formatCurrency(
                Number(product.basePrice),
                product.currency || DEFAULT_CURRENCY
              )}
            </span>
        </div>
      </CardContent>
    </Card>
  );
}

// Memoize to avoid unnecessary re-renders when product data hasn't changed
function areEqual(
  prev: Readonly<ProductCardProps>,
  next: Readonly<ProductCardProps>
) {
  const a = prev.product;
  const b = next.product;
  if (a.id !== b.id) return false;
  if (Number(a.basePrice) !== Number(b.basePrice)) return false;
  if ((a.currency || DEFAULT_CURRENCY) !== (b.currency || DEFAULT_CURRENCY))
    return false;
  if ((a.category?.name || "") !== (b.category?.name || "")) return false;
  if ((a.thumbnailUrl || "") !== (b.thumbnailUrl || "")) return false;
  // For the rest (handlers, flags), assume stable usage; compare simple flags

  if ((prev.trackViews || true) !== (next.trackViews || true)) return false;
  if ((prev.compact || false) !== (next.compact || false)) return false;
  return true;
}

export default memo(ProductCard, areEqual);
