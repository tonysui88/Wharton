"use client";

import * as React from "react";
import { motion, type Variants } from "framer-motion";
import { MapPin, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface PropertyCardProps extends React.HTMLAttributes<HTMLDivElement> {
  imageUrl: string;
  name: string;
  location: string;
  price: number;
  rating: number;
  reviews: number;
  imageAlt?: string;
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeInOut" as const },
  },
};

const textVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" as const },
  },
};

const PropertyCard = React.forwardRef<HTMLDivElement, PropertyCardProps>(
  (
    {
      className,
      imageUrl,
      name,
      location,
      price,
      rating,
      reviews,
      imageAlt = "Property Image",
      ...props
    },
    ref
  ) => {
    return (
      <motion.div
        ref={ref}
        className={cn(
          "group w-full flex flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm transition-all duration-300 ease-in-out hover:shadow-lg",
          className
        )}
        style={{ height: 320 }}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover={{ scale: 1.02, y: -4 }}
        {...(props as React.ComponentProps<typeof motion.div>)}
      >
        {/* Image — fixed height */}
        <div className="overflow-hidden flex-shrink-0" style={{ height: 180 }}>
          <img
            src={imageUrl}
            alt={imageAlt}
            className="h-full w-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
          />
        </div>

        {/* Content — fills remaining space */}
        <div className="flex flex-col justify-between flex-1 p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <motion.h3
              variants={textVariants}
              initial="hidden"
              animate="visible"
              className="text-sm font-semibold tracking-tight leading-snug line-clamp-2 flex-1"
            >
              {name}
            </motion.h3>
            <motion.p
              variants={textVariants}
              initial="hidden"
              animate="visible"
              className="text-sm font-bold text-primary whitespace-nowrap flex-shrink-0 ml-2"
            >
              ${price}
              <span className="text-xs font-normal text-muted-foreground"> /night</span>
            </motion.p>
          </div>

          <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
            <motion.div
              variants={textVariants}
              initial="hidden"
              animate="visible"
              className="flex items-center gap-1 min-w-0"
            >
              <MapPin className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{location}</span>
            </motion.div>
            <motion.div
              variants={textVariants}
              initial="hidden"
              animate="visible"
              className="flex items-center gap-1 flex-shrink-0"
            >
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-500" />
              <span className="font-semibold text-foreground">{rating.toFixed(1)}</span>
              <span>({reviews.toLocaleString()})</span>
            </motion.div>
          </div>
        </div>
      </motion.div>
    );
  }
);

PropertyCard.displayName = "PropertyCard";

export { PropertyCard };
export type { PropertyCardProps };
