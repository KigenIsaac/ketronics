"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ClientCartButton() {
  return (
    <Link href="/cart">
      <Button variant="ghost" className="flex items-center">
        <ShoppingCart />
      </Button>
    </Link>
  );
}