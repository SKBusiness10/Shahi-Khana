import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { MENU_ITEMS } from "./src/data";
import { MenuItem } from "./src/types";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON body parser
  app.use(express.json());

  // Backend API route for secure server-side billing calculation
  app.post("/api/calculate-bill", (req: express.Request, res: express.Response) => {
    try {
      const { cart, orderMethod, menuItems: clientMenuItems } = req.body;

      if (!cart || typeof cart !== 'object') {
        return res.status(400).json({ success: false, error: "Invalid cart data provided" });
      }

      // Live menu items array from client (including recent Admin modifications),
      // falling back gracefully to base system MENU_ITEMS on backend.
      const itemsToUse: MenuItem[] = Array.isArray(clientMenuItems) && clientMenuItems.length > 0
        ? clientMenuItems
        : MENU_ITEMS;

      const billingItems: Array<{
        id: string;
        name: string;
        portion: 'half' | 'full';
        quantity: number;
        pricePerUnit: number;
        total: number;
      }> = [];

      let subtotal = 0;

      Object.entries(cart).forEach(([key, val]) => {
        const qty = Number(val);
        if (isNaN(qty) || qty <= 0) return;

        const parts = key.split('-');
        const portion = parts[parts.length - 1] as 'half' | 'full';
        const itemId = parts.slice(0, parts.length - 1).join('-');

        const matchedItem = itemsToUse.find(m => m.id === itemId);
        if (!matchedItem) return;

        const pricePerUnit = portion === 'half' && matchedItem.priceHalf ? matchedItem.priceHalf : matchedItem.priceFull;
        const itemTotal = pricePerUnit * qty;

        subtotal += itemTotal;
        billingItems.push({
          id: matchedItem.id,
          name: matchedItem.name,
          portion,
          quantity: qty,
          pricePerUnit,
          total: itemTotal
        });
      });

      const packagingFee = subtotal > 0 ? 30 : 0;
      const deliveryFee = (orderMethod === 'delivery' && subtotal > 0) ? 100 : 0;
      const grandTotal = subtotal + packagingFee + deliveryFee;

      return res.json({
        success: true,
        billingItems,
        subtotal,
        packagingFee,
        deliveryFee,
        grandTotal
      });
    } catch (error: any) {
      console.error("[Backend Calculation Error]:", error);
      return res.status(500).json({ success: false, error: error.message || "Server calculation error" });
    }
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", service: "Shahi Khana Billing Engine" });
  });

  // Vite middleware for development or Static Asset serving for production builds
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Backend Server] runs seamlessly at http://0.0.0.0:${PORT}`);
  });
}

startServer();
