import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Boxes,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Building2,
  FileText,
  DollarSign,
  TrendingUp,
  Warehouse,
  Receipt,
  AlertTriangle,
  Users,
  Truck,
  BarChart3,
  Search,
  Sparkles,
  ChevronRight,
  Layers,
  ShoppingBag,
  Clock,
  Check,
  Smartphone,
  ExternalLink,
  MapPin,
  RefreshCw,
  Send,
  HelpCircle,
} from "lucide-react";
import { SEO } from "@/components/seo/SEO";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { CTASection } from "@/components/ui/CTASection";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { trackProductView } from "@/lib/analytics";
import { cn } from "@/lib/utils";

// Synthetic Mockup Data (Marketing Only — No Production PII)
const MOCK_CATALOG = [
  {
    sku: "ZK-CHAIR-001",
    name: "Premium Ergonomic Office Chair",
    category: "Furniture & Fittings",
    stock: 48,
    costPrice: "₦65,000",
    sellingPrice: "₦95,000",
    reorderLevel: 10,
    status: "In Stock",
    statusVariant: "in-stock",
    location: "Main Warehouse (Ikeja)",
  },
  {
    sku: "ZK-DESK-204",
    name: "Executive Oak Manager Desk (1.8m)",
    category: "Furniture & Fittings",
    stock: 8,
    costPrice: "₦180,000",
    sellingPrice: "₦260,000",
    reorderLevel: 12,
    status: "Low Stock Alert",
    statusVariant: "low-stock",
    location: "Showroom (Lekki)",
  },
  {
    sku: "ZK-CAB-102",
    name: "Heavy-Duty Steel 4-Drawer Cabinet",
    category: "Storage & Archive",
    stock: 31,
    costPrice: "₦42,000",
    sellingPrice: "₦68,000",
    reorderLevel: 8,
    status: "In Stock",
    statusVariant: "in-stock",
    location: "Main Warehouse (Ikeja)",
  },
  {
    sku: "ZK-MON-401",
    name: '27" 4K IPS Ultra-Sharp Commercial Monitor',
    category: "Workstations & IT",
    stock: 15,
    costPrice: "₦145,000",
    sellingPrice: "₦210,000",
    reorderLevel: 5,
    status: "In Stock",
    statusVariant: "in-stock",
    location: "Depot (Abuja CBD)",
  },
  {
    sku: "ZK-PRN-880",
    name: "Thermal High-Speed POS Receipt Printer",
    category: "Point of Sale",
    stock: 6,
    costPrice: "₦58,000",
    sellingPrice: "₦85,000",
    reorderLevel: 10,
    status: "Low Stock Alert",
    statusVariant: "low-stock",
    location: "Showroom (Lekki)",
  },
];

const MOCK_LOCATIONS = [
  {
    id: "loc-ikeja",
    name: "Central Logistics Warehouse",
    city: "Ikeja Industrial Estate, Lagos",
    itemsCount: "1,420 Items",
    valuation: "₦48,500,000",
    status: "Operational",
    type: "Primary Hub",
  },
  {
    id: "loc-lekki",
    name: "Commercial Retail Showroom",
    city: "Lekki Phase 1, Lagos",
    itemsCount: "380 Items",
    valuation: "₦16,200,000",
    status: "Operational",
    type: "Retail Outlet",
  },
  {
    id: "loc-abuja",
    name: "Regional Northern Depot",
    city: "Central Business District, Abuja",
    itemsCount: "640 Items",
    valuation: "₦28,100,000",
    status: "Operational",
    type: "Regional Depot",
  },
];

export const ZakeemInventoryInvoicePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"catalog" | "invoice" | "locations" | "receivables">("catalog");
  const [activeCapabilityIndex, setActiveCapabilityIndex] = useState(0);

  useEffect(() => {
    trackProductView({
      id: "zakeem-inventory-invoice",
      name: "Zakeem Inventory and Invoice",
      slug: "inventory-invoice",
      category: "Enterprise ERP",
      status: "Available",
    });
  }, []);

  const capabilities = [
    {
      id: "catalog",
      title: "Product & Item Catalog",
      shortDesc: "SKUs, variants, categories, and dual pricing",
      icon: Boxes,
      badge: "Foundation",
      description:
        "Designed to standardize your company's goods catalog with structured SKU codes, barcode scanning support, category taxonomy, unit variations (units, cartons, pallets, metres), cost vs. selling prices, and configurable reorder thresholds.",
      deliverables: [
        "Unique SKU code generation & barcode/QR label mapping",
        "Categorized hierarchy with custom product attribute tags",
        "Dual pricing matrix: landed cost price vs. wholesale & retail price",
        "Configurable min/max stock thresholds with low-stock reorder alerts",
      ],
    },
    {
      id: "control",
      title: "Real-Time Inventory Control",
      shortDesc: "Stock movements, adjustments, and transaction history",
      icon: RefreshCw,
      badge: "Operational",
      description:
        "Designed to track item movements with audit-ready transaction history. Models stock receipts from vendors, dispatches from sales, damaged inventory write-offs, and storekeeper adjustments with supervisor authorization workflows.",
      deliverables: [
        "Supports perpetual inventory tracking and stock balance calculation",
        "Audit-ready transaction logs: records item movements, timestamps, and user attribution",
        "Stock adjustment workflows for damages, returns, and scrap",
        "Configurable low-stock threshold alerts and replenishment notices",
      ],
    },
    {
      id: "locations",
      title: "Multi-Location & Warehousing",
      shortDesc: "Manage warehouses, store counters, and regional depots",
      icon: Warehouse,
      badge: "Multi-Branch",
      description:
        "Built to model operations across multiple physical stores, central warehouses, and regional sales branches from a centralized view. Supports inter-branch transfer workflows with digital dispatch notes and receiving acknowledgments.",
      deliverables: [
        "Multi-location architecture for Ikeja, Lekki, Abuja, and regional branches",
        "Inter-store transfer workflows with dispatch tracking",
        "Location-specific reorder points and safety buffers",
        "Branch-level stock balance reporting and variance reconciliation",
      ],
    },
    {
      id: "invoicing",
      title: "Professional Enterprise Invoicing",
      shortDesc: "Professional invoices with configurable tax fields",
      icon: Receipt,
      badge: "Commercial",
      description:
        "Designed to create and customize professional commercial invoices in Nigerian Naira (NGN) or foreign currencies. Features sequential numbering schemas, customer assignment, line items, discounts, and configurable tax and VAT fields.",
      deliverables: [
        "Sequential numbering schema: INV-2026-00001 with audit-ready sequence",
        "Tax-ready invoice workflows with configurable 7.5% VAT and line-item discounts",
        "Professional PDF invoice formatting with corporate branding",
        "Designed for client delivery via email and shareable payment link layouts",
      ],
    },
    {
      id: "receivables",
      title: "Payments & Receivables Ledger",
      shortDesc: "Track paid, partial, unpaid, and overdue invoices",
      icon: DollarSign,
      badge: "Cash Flow",
      description:
        "Structured to monitor customer account balances. Track payment allocations, record partial installments, generate digital payment receipt formats, and review aged receivables reports (0-30, 31-60, 60+ days overdue).",
      deliverables: [
        "Structured invoice status tracking: Paid, Partially Paid, Unpaid, and Overdue",
        "Supports bank transfer, POS, and digital payment method tracking",
        "Aged debtors ledger with receivables tracking and follow-up workflows",
        "Customer account statement layouts with export options",
      ],
    },
    {
      id: "customers",
      title: "Customer Directory & CRM",
      shortDesc: "Customer purchase history, credit terms, and balances",
      icon: Users,
      badge: "Relationships",
      description:
        "Designed to maintain clean customer records. Track corporate buyer profiles, billing addresses, sales representative assignments, credit limits, agreed payment terms (NET 7, 14, 30), and historical purchase volume.",
      deliverables: [
        "Corporate customer profiles with tax/TIN fields and key contacts",
        "Configurable credit limits with order alerts when limits are exceeded",
        "Historical transaction ledger and statement of account layouts",
        "Customer purchasing frequency and revenue ranking insights",
      ],
    },
    {
      id: "suppliers",
      title: "Suppliers & Procurement",
      shortDesc: "Vendor records, purchase orders, and replenishment workflows",
      icon: Truck,
      badge: "Procurement",
      description:
        "Organize your vendor network. Supports official Purchase Order (PO) workflows, Goods Received Notes (GRN) on warehouse arrival, supplier invoice matching concepts, and accounts payable tracking.",
      deliverables: [
        "Supplier directory with contact details, bank accounts, and lead-time tracking",
        "Purchase Order (PO) creation with planned supervisor sign-offs",
        "Goods Received Notes (GRN) with barcode scanning on intake",
        "Supplier payment scheduling to track vendor commitments",
      ],
    },
    {
      id: "reporting",
      title: "Valuation & Sales Intelligence",
      shortDesc: "Stock valuation, sales velocity, and gross margins",
      icon: BarChart3,
      badge: "Executive",
      description:
        "Built to empower business owners and finance directors with operational insights. Model inventory valuation using FIFO or Weighted Average costing, analyze product sales velocity, and review gross margins.",
      deliverables: [
        "Valuation modeling using FIFO and Weighted Average methods",
        "Fast-moving vs. slow-moving stock identification and aging reports",
        "Gross profit margin calculations per product SKU and sales category",
        "Sales reports and configurable tax field summaries",
      ],
    },
  ];

  const workflowSteps = [
    {
      step: "01",
      title: "PRODUCTS",
      description: "Define catalog items, SKUs, landed costs, retail pricing, and reorder levels.",
      icon: Boxes,
    },
    {
      step: "02",
      title: "STOCK",
      description: "Receive stock into central warehouses, balance branch stores, and set alerts.",
      icon: Warehouse,
    },
    {
      step: "03",
      title: "SALES",
      description: "Process client sales orders, verify stock availability, and reserve units.",
      icon: ShoppingBag,
    },
    {
      step: "04",
      title: "INVOICE",
      description: "Generate professional invoices with configurable tax fields, discounts, and custom terms.",
      icon: Receipt,
    },
    {
      step: "05",
      title: "PAYMENT",
      description: "Record bank settlements, manage installments, and track overdue receivables.",
      icon: DollarSign,
    },
    {
      step: "06",
      title: "REPORTING",
      description: "Model stock valuation, review sales velocity, track top items, and monitor receivables.",
      icon: BarChart3,
    },
  ];

  const useCases = [
    { title: "Retail & Supermarkets", desc: "Fast item lookup, barcode scanning, POS receipt printing, and daily counter stock reconciliation." },
    { title: "Wholesale & Cash-and-Carry", desc: "Bulk quantity pricing tiers, carton-to-unit conversions, and high-volume dispatch notes." },
    { title: "Distribution & FMCG", desc: "Route dispatching, depot-to-van inventory transfers, and rapid B2B merchant invoicing." },
    { title: "Pharmacy & Healthcare", desc: "Batch tracking, expiry monitoring, medication category management, and supplier records." },
    { title: "Electronics & IT Hardware", desc: "Serial number tracking, warranty period records, high-value asset safeguards, and VAT invoicing." },
    { title: "Fashion & Apparel Chains", desc: "Style, color, and size matrix management across multiple retail mall branches." },
    { title: "Building Materials & Hardware", desc: "Bulk weight/meter units, contractor credit accounts, dispatch delivery notes, and site replenishment." },
    { title: "Hospitality & Food Service", desc: "Storekeeper food and beverage stores tracking, supplier purchase orders, and consumption audits." },
    { title: "Professional Services", desc: "Consulting and technical agency invoicing, retainer billing, payment schedules, and receivables." },
    { title: "Multi-Branch Conglomerates", desc: "Consolidated multi-location stock control across Lagos, Abuja, Port Harcourt, and regional hubs." },
  ];

  const valuePillars = [
    {
      headline: "Know your stock.",
      explanation:
        "Designed to help identify stockroom discrepancies and shrinkage with structured balance tracking and supervisor adjustment workflows.",
      icon: Boxes,
    },
    {
      headline: "Invoice faster.",
      explanation:
        "Draft and format professional commercial invoices with configurable 7.5% VAT calculation and corporate branding.",
      icon: Receipt,
    },
    {
      headline: "Collect sooner.",
      explanation:
        "Gain clear visibility into overdue receivables with debtor aging categories, follow-up workflows, and digital receipt layouts.",
      icon: DollarSign,
    },
    {
      headline: "Buy smarter.",
      explanation:
        "Reduce stockouts of fast-moving goods and minimize dead stock through configurable reorder thresholds.",
      icon: ShoppingBag,
    },
    {
      headline: "Operate with confidence.",
      explanation:
        "Designed for multi-user and multi-branch operations, connecting store counters, warehouses, and offices under structured workflows.",
      icon: ShieldCheck,
    },
  ];

  const activeCapability = capabilities[activeCapabilityIndex];

  return (
    <>
      <SEO
        title="Zakeem Inventory and Invoice | Inventory, Stock & Invoicing Software"
        description="Zakeem Inventory and Invoice helps businesses manage products, stock, customers, invoices, payments and reporting from one modern platform."
        canonical="https://www.zakeemsolutions.com/products/inventory-invoice"
        breadcrumbs={[
          { name: "Products", path: "/products" },
          { name: "Zakeem Inventory and Invoice", path: "/products/inventory-invoice" },
        ]}
        schema={{
          "@type": "SoftwareApplication",
          name: "Zakeem Inventory and Invoice",
          applicationCategory: "BusinessApplication",
          operatingSystem: "Cloud / Web / Mobile PWA",
          softwareVersion: "1.0 Enterprise",
          description:
            "Zakeem Inventory and Invoice helps businesses manage products, stock, customers, invoices, payments and reporting from one modern platform.",
          offers: {
            "@type": "Offer",
            priceCurrency: "NGN",
            availability: "https://schema.org/InStock",
            price: "0",
            priceValidUntil: "2027-12-31",
            description: "Custom enterprise pricing tailored to catalog scale, branch nodes, and user seats.",
          },
        }}
      />

      {/* Hero Section */}
      <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 overflow-hidden border-b border-slate-200 dark:border-white/10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[720px] h-[360px] bg-[#e57804]/12 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute -top-24 right-1/4 w-[400px] h-[300px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="container mx-auto px-4 md:px-6 max-w-7xl relative z-10">
          <div className="max-w-3xl">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2.5 mb-6">
              <Badge variant="neon" className="inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Commercial Platform</span>
              </Badge>
              <Badge variant="neutral">Release 1.0 Enterprise</Badge>
              <Badge variant="neutral" className="border-amber-500/30 text-amber-700 dark:text-amber-300 bg-amber-500/10">
                Designed for Modern Nigerian Businesses
              </Badge>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-950 dark:text-white tracking-tight leading-tight mb-6">
              Inventory and invoicing, built for the way{" "}
              <span className="bg-gradient-to-r from-slate-950 via-amber-700 to-[#e57804] dark:from-white dark:via-amber-200 dark:to-[#e57804] bg-clip-text text-transparent">
                your business works.
              </span>
            </h1>

            {/* Supporting Message */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-200 font-normal leading-relaxed mb-8">
              Zakeem Inventory and Invoice is designed to give commercial teams clear operational visibility: track
              inventory levels across locations, monitor sales velocity, streamline invoice generation, track
              receivables, and support data-driven purchasing decisions.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3.5 mb-10">
              <Button
                variant="primary"
                size="lg"
                href="/request-demo?product=inventory-invoice"
                data-analytics-id="inventory-hero-demo-cta"
                className="min-h-[48px] px-6 text-sm md:text-base font-semibold shadow-lg shadow-[#e57804]/20"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Request a Demo
              </Button>
              <Button
                variant="secondary"
                size="lg"
                href="/contact?product=inventory-invoice"
                data-analytics-id="inventory-hero-contact-cta"
                className="min-h-[48px] px-6 text-sm md:text-base font-medium bg-slate-100 hover:bg-slate-200 text-slate-900 border-slate-300 dark:bg-white/10 dark:hover:bg-white/15 dark:text-white dark:border-white/15"
              >
                Talk to Engineering
              </Button>
            </div>

            {/* Core Capability Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-slate-200 dark:border-white/10">
              <div>
                <div className="text-base sm:text-lg font-bold font-mono text-slate-950 dark:text-white">Perpetual</div>
                <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">Stock Tracking Architecture</div>
              </div>
              <div>
                <div className="text-base sm:text-lg font-bold font-mono text-[#e57804]">Streamlined</div>
                <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">Professional Invoicing</div>
              </div>
              <div>
                <div className="text-base sm:text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">Configurable</div>
                <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">Tax &amp; VAT Fields</div>
              </div>
              <div>
                <div className="text-base sm:text-lg font-bold font-mono text-sky-600 dark:text-sky-400">Multi-Node</div>
                <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">Multi-Branch Readiness</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Mockup Visualization Showcase */}
      <section className="py-14 md:py-20 bg-[#040e1d] border-b border-white/10 relative">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <Badge variant="neutral" className="mb-3 text-amber-300 border-amber-500/20 bg-amber-500/10">
              Interactive Product Preview
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">
              A Unified Operational Workspace
            </h2>
            <p className="text-sm sm:text-base text-slate-300 mt-3 leading-relaxed">
              Experience interface workflows for inventory management paired with streamlined invoicing.
              <span className="text-xs text-slate-400 block mt-1">
                * Illustrative workspace showcase using sample data. Demonstrates interface layouts and workflow models prior to backend integration.
              </span>
            </p>
          </div>

          {/* Visualization Card Container */}
          <div className="rounded-2xl border border-white/15 bg-[#06152b] shadow-2xl overflow-hidden">
            {/* Mockup Toolbar Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-[#0a1e38] border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/70" />
                <div className="w-3 h-3 rounded-full bg-amber-500/70" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/70" />
                <span className="text-xs font-mono text-slate-400 ml-2 hidden sm:inline">
                  Zakeem Inventory &amp; Invoice — Command Center
                </span>
              </div>

              {/* Tab Selector Buttons */}
              <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                <button
                  type="button"
                  onClick={() => setActiveTab("catalog")}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 min-h-[36px]",
                    activeTab === "catalog"
                      ? "bg-[#e57804] text-white shadow"
                      : "text-slate-300 hover:text-white hover:bg-white/5"
                  )}
                >
                  <Boxes className="w-3.5 h-3.5 inline mr-1.5" />
                  Stock Catalog
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("invoice")}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 min-h-[36px]",
                    activeTab === "invoice"
                      ? "bg-[#e57804] text-white shadow"
                      : "text-slate-300 hover:text-white hover:bg-white/5"
                  )}
                >
                  <Receipt className="w-3.5 h-3.5 inline mr-1.5" />
                  Invoice Preview
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("locations")}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 min-h-[36px]",
                    activeTab === "locations"
                      ? "bg-[#e57804] text-white shadow"
                      : "text-slate-300 hover:text-white hover:bg-white/5"
                  )}
                >
                  <Warehouse className="w-3.5 h-3.5 inline mr-1.5" />
                  Locations
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("receivables")}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 min-h-[36px]",
                    activeTab === "receivables"
                      ? "bg-[#e57804] text-white shadow"
                      : "text-slate-300 hover:text-white hover:bg-white/5"
                  )}
                >
                  <DollarSign className="w-3.5 h-3.5 inline mr-1.5" />
                  Receivables
                </button>
              </div>
            </div>

            {/* TAB CONTENT: Catalog */}
            {activeTab === "catalog" && (
              <div className="p-4 sm:p-6 space-y-4">
                {/* Low Stock Banner Notification */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>
                      <strong>Reorder Alert:</strong> 2 items have fallen below minimum safety thresholds. Replenishment
                      recommended.
                    </span>
                  </div>
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-200 shrink-0">
                    Low-Stock Replenishment Workflow
                  </span>
                </div>

                {/* Table Container */}
                <div className="overflow-x-auto rounded-xl border border-white/10">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-[#0a1e38] text-slate-300 border-b border-white/10 font-mono text-[11px] uppercase">
                      <tr>
                        <th className="py-3 px-4">SKU</th>
                        <th className="py-3 px-4">Item Name</th>
                        <th className="py-3 px-4 hidden md:table-cell">Category</th>
                        <th className="py-3 px-4 text-center">Stock</th>
                        <th className="py-3 px-4 hidden lg:table-cell text-right">Cost (NGN)</th>
                        <th className="py-3 px-4 text-right">Selling (NGN)</th>
                        <th className="py-3 px-4 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-slate-200">
                      {MOCK_CATALOG.map((item, idx) => (
                        <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-3 px-4 font-mono font-medium text-[#e57804]">{item.sku}</td>
                          <td className="py-3 px-4">
                            <div className="font-medium text-white">{item.name}</div>
                            <div className="text-[11px] text-slate-400 md:hidden">{item.category}</div>
                          </td>
                          <td className="py-3 px-4 text-slate-300 hidden md:table-cell">{item.category}</td>
                          <td className="py-3 px-4 text-center font-mono font-bold text-white">{item.stock}</td>
                          <td className="py-3 px-4 text-right font-mono text-slate-400 hidden lg:table-cell">
                            {item.costPrice}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-semibold text-emerald-400">
                            {item.sellingPrice}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {item.statusVariant === "low-stock" ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                                Low ({item.stock}/{item.reorderLevel})
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                In Stock
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-2">
                  <span>Sample data: Showing 5 illustrative SKU records (Demo Mode)</span>
                  <span className="text-[#e57804] font-medium">Illustrative multi-location catalog view</span>
                </div>
              </div>
            )}

            {/* TAB CONTENT: Invoice Preview */}
            {activeTab === "invoice" && (
              <div className="p-4 sm:p-6 max-w-3xl mx-auto">
                <div className="rounded-xl border border-white/10 bg-[#081a33] p-5 sm:p-7 shadow-lg space-y-6">
                  {/* Invoice Header */}
                  <div className="flex flex-wrap items-start justify-between gap-4 pb-5 border-b border-white/10">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Boxes className="w-5 h-5 text-[#e57804]" />
                        <span className="font-bold text-base text-white tracking-tight">Zakeem Inventory &amp; Invoice</span>
                      </div>
                      <p className="text-xs text-slate-400">Commercial Invoicing Engine • Lagos, Nigeria</p>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-mono text-slate-400">INVOICE NUMBER</div>
                      <div className="text-base font-bold font-mono text-[#e57804]">INV-2026-00124</div>
                      <span className="inline-block px-2 py-0.5 mt-1 text-[11px] rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Partial Settlement
                      </span>
                    </div>
                  </div>

                  {/* Billed To & Dates */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <div className="text-slate-400 uppercase font-mono text-[11px] mb-1">Billed To</div>
                      <div className="text-white font-semibold text-sm">Example Business Ltd.</div>
                      <div className="text-slate-300">14 Adeola Odeku Street, Victoria Island</div>
                      <div className="text-slate-400">Lagos State, Nigeria • TIN: 10482910-0001</div>
                    </div>
                    <div className="sm:text-right space-y-1">
                      <div>
                        <span className="text-slate-400">Issue Date: </span>
                        <span className="text-white font-mono">05 Oct 2026</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Due Date: </span>
                        <span className="text-white font-mono">19 Oct 2026 (NET 14)</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Currency: </span>
                        <span className="text-emerald-400 font-mono font-semibold">NGN (₦)</span>
                      </div>
                    </div>
                  </div>

                  {/* Line Items */}
                  <div className="overflow-x-auto rounded-lg border border-white/5">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#051124] text-slate-300 font-mono text-[11px] uppercase">
                        <tr>
                          <th className="py-2.5 px-3">Item Description</th>
                          <th className="py-2.5 px-3 text-center">Qty</th>
                          <th className="py-2.5 px-3 text-right">Unit Price</th>
                          <th className="py-2.5 px-3 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-slate-200">
                        <tr>
                          <td className="py-2.5 px-3">
                            <span className="font-medium text-white block">Premium Ergonomic Office Chair</span>
                            <span className="text-[10px] font-mono text-slate-400">SKU: ZK-CHAIR-001</span>
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono">4</td>
                          <td className="py-2.5 px-3 text-right font-mono">₦95,000</td>
                          <td className="py-2.5 px-3 text-right font-mono font-semibold text-white">₦380,000</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-3">
                            <span className="font-medium text-white block">Heavy-Duty Steel 4-Drawer Cabinet</span>
                            <span className="text-[10px] font-mono text-slate-400">SKU: ZK-CAB-102</span>
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono">2</td>
                          <td className="py-2.5 px-3 text-right font-mono">₦68,000</td>
                          <td className="py-2.5 px-3 text-right font-mono font-semibold text-white">₦136,000</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Invoice Summary Calculation */}
                  <div className="pt-3 border-t border-white/10 flex justify-end">
                    <div className="w-full sm:w-64 space-y-2 text-xs">
                      <div className="flex justify-between text-slate-300">
                        <span>Subtotal:</span>
                        <span className="font-mono">₦516,000</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>VAT (7.5%):</span>
                        <span className="font-mono text-amber-300">₦38,700</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>Discount:</span>
                        <span className="font-mono">₦0.00</span>
                      </div>
                      <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-white/10">
                        <span>Total Due:</span>
                        <span className="font-mono text-[#e57804]">₦554,700</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] space-y-1">
                        <div className="flex justify-between text-emerald-300">
                          <span>Amount Paid:</span>
                          <span className="font-mono">₦300,000</span>
                        </div>
                        <div className="flex justify-between text-rose-300 font-semibold">
                          <span>Balance Remaining:</span>
                          <span className="font-mono">₦254,700</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: Locations */}
            {activeTab === "locations" && (
              <div className="p-4 sm:p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {MOCK_LOCATIONS.map((loc) => (
                    <div
                      key={loc.id}
                      className="p-4 rounded-xl bg-[#081a33] border border-white/10 space-y-3 hover:border-[#e57804]/40 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-white/10 text-slate-300">
                          {loc.type}
                        </span>
                        <span className="text-[11px] font-medium text-emerald-400 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          {loc.status}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-white">{loc.name}</h4>
                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-[#e57804] shrink-0" />
                          {loc.city}
                        </p>
                      </div>
                      <div className="pt-3 border-t border-white/5 grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-slate-400 block text-[10px]">Active Stock</span>
                          <span className="text-white font-mono font-semibold">{loc.itemsCount}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Valuation</span>
                          <span className="text-emerald-400 font-mono font-semibold">{loc.valuation}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 rounded-xl bg-[#081c38] border border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-slate-300">
                    <RefreshCw className="w-4 h-4 text-[#e57804] shrink-0" />
                    <span>
                      <strong>Inter-Branch Transfers:</strong> Designed to model digital dispatch and receipt notes
                      between regional branch nodes.
                    </span>
                  </div>
                  <Badge variant="neutral" className="text-xs">
                    Sample Valuation: ₦92,800,000
                  </Badge>
                </div>
              </div>
            )}

            {/* TAB CONTENT: Receivables */}
            {activeTab === "receivables" && (
              <div className="p-4 sm:p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-[#081a33] border border-white/10">
                    <span className="text-xs text-slate-400 block">Total Outstanding Receivables</span>
                    <span className="text-xl sm:text-2xl font-bold font-mono text-[#e57804] mt-1 block">
                      ₦3,420,000
                    </span>
                    <span className="text-[11px] text-slate-400 mt-1 block">Across 8 corporate client accounts</span>
                  </div>
                  <div className="p-4 rounded-xl bg-[#081a33] border border-white/10">
                    <span className="text-xs text-slate-400 block">Current (0–30 Days)</span>
                    <span className="text-xl sm:text-2xl font-bold font-mono text-emerald-400 mt-1 block">
                      ₦2,850,000
                    </span>
                    <span className="text-[11px] text-emerald-300/80 mt-1 block">83.3% of total portfolio</span>
                  </div>
                  <div className="p-4 rounded-xl bg-[#081a33] border border-white/10">
                    <span className="text-xs text-slate-400 block">Overdue (&gt; 30 Days)</span>
                    <span className="text-xl sm:text-2xl font-bold font-mono text-rose-400 mt-1 block">
                      ₦570,000
                    </span>
                    <span className="text-[11px] text-rose-300/80 mt-1 block">Follow-up workflows configured</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#081c38] border border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span className="font-semibold text-white">Receivables Aging Health</span>
                    <span className="font-mono text-[#e57804]">Healthy Liquidity</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden flex">
                    <div className="h-full bg-emerald-500" style={{ width: "83.3%" }} title="Current (83.3%)" />
                    <div className="h-full bg-rose-500" style={{ width: "16.7%" }} title="Overdue (16.7%)" />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400 pt-1">
                    <span>🟢 ₦2.85M within agreed terms</span>
                    <span>🔴 ₦570k escalated for follow-up</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 8 Core Capabilities Section */}
      <section className="py-16 md:py-24 border-b border-slate-200 dark:border-white/10">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <SectionHeader
            badge="Architecture &amp; Features"
            title="8 Core Capabilities Built for Enterprise Growth"
            description="From single-store counters to distributed retail and warehouse chains, explore how each module streamlines your commercial workflow."
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mt-12">
            {/* Capability Selector List */}
            <div className="lg:col-span-5 space-y-2">
              {capabilities.map((cap, idx) => {
                const Icon = cap.icon;
                const isSelected = activeCapabilityIndex === idx;
                return (
                  <button
                    key={cap.id}
                    type="button"
                    onClick={() => setActiveCapabilityIndex(idx)}
                    className={cn(
                      "w-full text-left p-3.5 sm:p-4 rounded-xl border transition-all flex items-center justify-between gap-3 min-h-[52px]",
                      isSelected
                        ? "bg-[#0a2347] border-[#e57804] text-white shadow-lg shadow-[#e57804]/10"
                        : "bg-[#06152b]/60 border-white/10 text-slate-300 hover:bg-[#06152b] hover:border-white/20"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                          isSelected ? "bg-[#e57804] text-white" : "bg-white/5 text-[#e57804]"
                        )}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-white">{cap.title}</div>
                        <div className="text-xs text-slate-400 truncate max-w-[220px] sm:max-w-xs">
                          {cap.shortDesc}
                        </div>
                      </div>
                    </div>
                    <ChevronRight
                      className={cn(
                        "w-4 h-4 shrink-0 transition-transform",
                        isSelected ? "text-[#e57804] translate-x-1" : "text-slate-500"
                      )}
                    />
                  </button>
                );
              })}
            </div>

            {/* Selected Capability Details Card */}
            <div className="lg:col-span-7 rounded-2xl border border-white/15 bg-[#06152b] p-6 sm:p-8 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <Badge variant="neon">{activeCapability.badge}</Badge>
                <span className="text-xs font-mono text-slate-400">
                  Capability 0{activeCapabilityIndex + 1} of 08
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4 tracking-tight">
                {activeCapability.title}
              </h3>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-6">
                {activeCapability.description}
              </p>

              <div className="space-y-3 pt-6 border-t border-white/10 mb-8">
                <span className="text-xs font-mono uppercase text-[#e57804] tracking-wider block mb-2">
                  Key Technical Deliverables
                </span>
                {activeCapability.deliverables.map((del, dIdx) => (
                  <div key={dIdx} className="flex items-start gap-3 text-xs sm:text-sm text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-[#e57804] shrink-0 mt-0.5" />
                    <span>{del}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-white/10">
                <Button
                  variant="primary"
                  size="md"
                  href="/request-demo?product=inventory-invoice"
                  data-analytics-id={`capability-${activeCapability.id}-demo`}
                  className="min-h-[44px]"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Request Technical Walkthrough
                </Button>
                <Button
                  variant="secondary"
                  size="md"
                  href="/contact?product=inventory-invoice"
                  className="min-h-[44px] bg-white/10 hover:bg-white/15 text-white border-white/15"
                >
                  Consult an Engineer
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Lifecycle Workflow Section */}
      <section className="py-16 md:py-24 bg-[#030c18] border-b border-white/10">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <SectionHeader
            badge="Operational Lifecycle"
            title="The Closed-Loop Commercial Workflow"
            description="From initial SKU creation to stock movement, invoice issuance, and ledger reporting, every stage is tightly audited."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {workflowSteps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={idx}
                  className="relative p-6 rounded-2xl border border-white/10 bg-[#06152b] hover:border-[#e57804]/50 transition-all group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold font-mono text-[#e57804]">{step.step}</span>
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[#e57804] group-hover:bg-[#e57804] group-hover:text-white transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <h4 className="text-base font-bold text-white mb-2">{step.title}</h4>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{step.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Nigeria-First Commercial Readiness Section */}
      <section className="py-16 md:py-24 border-b border-slate-200 dark:border-white/10 relative overflow-hidden">
        <div className="absolute -bottom-20 -left-20 w-[450px] h-[350px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="container mx-auto px-4 md:px-6 max-w-7xl relative z-10">
          <div className="max-w-3xl mb-12">
            <Badge variant="neutral" className="mb-3 text-emerald-700 dark:text-emerald-300 border-emerald-500/20 bg-emerald-500/10">
              Commercial Localization
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-950 dark:text-white tracking-tight">
              Designed for Modern Nigerian Businesses.
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mt-4 leading-relaxed">
              Standard generic inventory software fails when exposed to Nigerian trade realities: erratic connectivity,
              commercial tax calculations, multi-branch store-to-warehouse transfers across Lagos, Abuja, Port Harcourt,
              and cash-to-bank settlements. Zakeem Inventory and Invoice is architected specifically for local market
              resilience.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-2xl bg-[#06152b] border border-white/10 space-y-2">
              <span className="text-xs font-mono text-[#e57804] uppercase block">NGN Currency First</span>
              <h4 className="text-base font-semibold text-white">Naira-Native Ledger</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Primary accounting in Nigerian Naira (NGN) with multi-currency options for importers transacting in USD
                or GBP.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#06152b] border border-white/10 space-y-2">
              <span className="text-xs font-mono text-emerald-400 uppercase block">Configurable VAT</span>
              <h4 className="text-base font-semibold text-white">Configurable Tax Fields</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Tax-ready invoice workflows with configurable 7.5% VAT and withholding tax (WHT) deduction fields for
                commercial documentation.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#06152b] border border-white/10 space-y-2">
              <span className="text-xs font-mono text-sky-400 uppercase block">Multi-Branch Trade</span>
              <h4 className="text-base font-semibold text-white">Nationwide Node Balances</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Connect main warehouses in Ikeja with retail stores in Lekki, Abuja, Kano, or Onitsha without duplicate
                spreadsheets.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#06152b] border border-white/10 space-y-2">
              <span className="text-xs font-mono text-amber-300 uppercase block">Network Resilient</span>
              <h4 className="text-base font-semibold text-white">Intermittent Connectivity Design</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Designed for resilient workflows when connectivity is interrupted, supporting reliable operations across
                sales counters.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 10 Industry Use Cases */}
      <section className="py-16 md:py-24 bg-[#030c18] border-b border-white/10">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <SectionHeader
            badge="Target Sectors"
            title="Engineered for Diverse Commercial Operations"
            description="Explore how Zakeem Inventory and Invoice adapts across wholesale, retail, services, and industrial sectors."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-12">
            {useCases.map((uc, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-white/10 bg-[#06152b] hover:border-[#e57804]/50 transition-colors"
              >
                <div className="text-xs font-bold text-white mb-1.5 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#e57804]" />
                  {uc.title}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{uc.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5 Business Value Pillars */}
      <section className="py-16 md:py-24 border-b border-slate-200 dark:border-white/10">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <SectionHeader
            badge="Business Outcomes"
            title="Five Pillars of Operational Velocity"
            description="Clear commercial outcomes that transform your bottom line."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mt-12">
            {valuePillars.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-2xl border border-white/10 bg-[#06152b] space-y-3 flex flex-col justify-between"
                >
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-[#e57804]/10 border border-[#e57804]/20 flex items-center justify-center text-[#e57804] mb-4">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h4 className="text-lg font-bold text-white mb-2">{pillar.headline}</h4>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{pillar.explanation}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Product Architecture & Ecosystem Positioning */}
      <section className="py-16 md:py-24 bg-[#030c18] border-b border-white/10">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="max-w-3xl mb-12">
            <Badge variant="neon" className="mb-3">
              Ecosystem Positioning
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              The Operational Layer Connecting Your Enterprise
            </h2>
            <p className="text-sm sm:text-base text-slate-300 mt-4 leading-relaxed">
              Zakeem Inventory and Invoice serves as the operational connective tissue across your organization,
              unifying customer relationships, catalog definitions, multi-location stock, invoices, settlement, and
              reporting.
            </p>
          </div>

          <div className="p-6 sm:p-8 rounded-2xl border border-white/15 bg-[#06152b] shadow-xl">
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 text-center">
              {[
                "Customers",
                "Products",
                "Inventory",
                "Sales",
                "Invoices",
                "Payments",
                "Suppliers",
                "Reports",
              ].map((node, nIdx) => (
                <div key={nIdx} className="p-3.5 rounded-xl bg-[#081c38] border border-white/10">
                  <div className="w-2 h-2 rounded-full bg-[#e57804] mx-auto mb-2" />
                  <span className="text-xs font-semibold text-white block">{node}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#e57804] shrink-0 mt-0.5" />
                <span>
                  <strong>Zakeem Realty ERP Synergy:</strong> Designed to coordinate building material requisitions and site stores
                  with general developer accounting.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#e57804] shrink-0 mt-0.5" />
                <span>
                  <strong>Zakeem Vault Synergy:</strong> Designed to connect customer sales invoices with corporate
                  treasury workflows.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#e57804] shrink-0 mt-0.5" />
                <span>
                  <strong>Zakeem Flow Synergy:</strong> Designed to feed purchase order requirements into strategic vendor
                  procurement workflows.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Conceptual AI Roadmap Section */}
      <section className="py-16 md:py-24 border-b border-slate-200 dark:border-white/10 relative">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="p-6 sm:p-10 rounded-2xl border border-purple-500/20 bg-gradient-to-b from-[#0a1428] to-[#06152b] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-2xl relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="neutral" className="text-purple-300 border-purple-500/30 bg-purple-500/10">
                  <Sparkles className="w-3.5 h-3.5 inline mr-1 text-purple-400" />
                  Roadmap / Upcoming Capability
                </Badge>
                <span className="text-xs text-slate-400 font-mono">Future Release</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                AI-Assisted Inventory Insights
              </h3>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
                Our engineering labs are designing autonomous intelligence models to sit atop your inventory data.
                Future capabilities will forecast seasonal stock demand, flag anomalous shrinkage in transit, and
                intelligently score debtor credit risk before orders are approved.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs mb-6">
                <div className="p-3 rounded-lg bg-black/40 border border-white/5 text-slate-300">
                  <span className="text-purple-300 font-semibold block mb-0.5">Demand Forecasting</span>
                  Predictive restocking based on past seasonal velocity.
                </div>
                <div className="p-3 rounded-lg bg-black/40 border border-white/5 text-slate-300">
                  <span className="text-purple-300 font-semibold block mb-0.5">Anomaly Detection</span>
                  Proactive alerts on suspicious inventory variance and shrinkage.
                </div>
                <div className="p-3 rounded-lg bg-black/40 border border-white/5 text-slate-300">
                  <span className="text-purple-300 font-semibold block mb-0.5">Credit Risk Scoring</span>
                  Evaluation of client debtor history prior to credit extension.
                </div>
              </div>

              <p className="text-[11px] text-slate-400 italic">
                * Note: Demonstrates conceptual future capabilities. No live AI execution or external model inference is
                performed in this release.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing / Licensing Section */}
      <section className="py-16 md:py-24 bg-[#030c18] border-b border-white/10" id="pricing">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <SectionHeader
            badge="Commercial Licensing"
            title="Talk to us for pricing"
            description="Transparent enterprise licensing scaled to your catalog size, store branch nodes, and user seats."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            {/* Model 1: Cloud-Managed */}
            <div className="p-6 sm:p-8 rounded-2xl border border-white/10 bg-[#06152b] flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono text-emerald-400 uppercase block mb-1">Turnkey SaaS</span>
                <h4 className="text-xl font-bold text-white mb-2">Cloud-Managed Edition</h4>
                <p className="text-xs text-slate-300 mb-6">
                  Ideal for fast-growing SMEs, retailers, and single-to-multi branch stores wanting zero infrastructure
                  overhead.
                </p>
                <div className="space-y-2.5 text-xs text-slate-300 mb-8">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#e57804]" /> Unlimited product SKUs &amp; catalog
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#e57804]" /> Tax-ready professional invoice workflows
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#e57804]" /> Multi-device access (Web &amp; PWA)
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#e57804]" /> Automated daily backups &amp; SSL
                  </div>
                </div>
              </div>
              <Button
                variant="secondary"
                size="md"
                href="/request-demo?product=inventory-invoice&deployment=cloud"
                className="w-full min-h-[44px] bg-white/10 hover:bg-white/15 text-white border-white/15"
              >
                Request Cloud Quote
              </Button>
            </div>

            {/* Model 2: Dedicated Private VPC */}
            <div className="p-6 sm:p-8 rounded-2xl border border-[#e57804]/50 bg-[#0a2347] shadow-xl shadow-[#e57804]/10 flex flex-col justify-between relative">
              <div className="absolute -top-3 right-6">
                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#e57804] text-white">
                  Most Popular
                </span>
              </div>
              <div>
                <span className="text-xs font-mono text-amber-300 uppercase block mb-1">Sovereign Data</span>
                <h4 className="text-xl font-bold text-white mb-2">Dedicated Private VPC</h4>
                <p className="text-xs text-slate-200 mb-6">
                  For mid-market enterprises, FMCG distributors, and pharmacy chains demanding isolated databases and
                  enterprise SLAs.
                </p>
                <div className="space-y-2.5 text-xs text-slate-200 mb-8">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#e57804]" /> All Cloud-Managed capabilities
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#e57804]" /> Dedicated isolated database cluster
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#e57804]" /> Multi-branch node syncing &amp; depots
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#e57804]" /> Custom ERP &amp; banking webhooks
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#e57804]" /> Enterprise SLA options with dedicated engineering support
                  </div>
                </div>
              </div>
              <Button
                variant="primary"
                size="md"
                href="/request-demo?product=inventory-invoice&deployment=private-vpc"
                className="w-full min-h-[44px] shadow-lg shadow-[#e57804]/20"
              >
                Request Enterprise Quote
              </Button>
            </div>

            {/* Model 3: Multi-Store Appliance */}
            <div className="p-6 sm:p-8 rounded-2xl border border-white/10 bg-[#06152b] flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono text-sky-400 uppercase block mb-1">High Security</span>
                <h4 className="text-xl font-bold text-white mb-2">On-Premise Appliance</h4>
                <p className="text-xs text-slate-300 mb-6">
                  Custom deployment for high-security multi-store conglomerates operating private enterprise local
                  networks.
                </p>
                <div className="space-y-2.5 text-xs text-slate-300 mb-8">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#e57804]" /> On-premise server appliance deployment
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#e57804]" /> Air-gapped LAN counter resilience
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#e57804]" /> Biometric supervisor override controls
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#e57804]" /> Direct on-site engineer provisioning
                  </div>
                </div>
              </div>
              <Button
                variant="secondary"
                size="md"
                href="/request-demo?product=inventory-invoice&deployment=on-premise"
                className="w-full min-h-[44px] bg-white/10 hover:bg-white/15 text-white border-white/15"
              >
                Request Appliance Consultation
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise Call To Action Section */}
      <section className="relative py-16 md:py-24 overflow-hidden pb-28 md:pb-24">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="rounded-3xl border border-white/15 bg-gradient-to-b from-[#0a2347] to-[#040e1d] p-8 sm:p-12 md:p-16 text-center relative overflow-hidden shadow-2xl">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#e57804]/15 rounded-full blur-[140px] pointer-events-none" />

            <div className="max-w-2xl mx-auto relative z-10">
              <Badge variant="neon" className="mb-4">
                Operational Command
              </Badge>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4">
                Ready to take complete control of your stock and invoices?
              </h2>
              <p className="text-sm sm:text-base text-slate-200 mb-8 leading-relaxed">
                Schedule a confidential, interactive demonstration with our enterprise systems engineers. See firsthand
                how Zakeem Inventory and Invoice adapts to your business model.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-4">
                <Button
                  variant="primary"
                  size="lg"
                  href="/request-demo?product=inventory-invoice"
                  data-analytics-id="inventory-footer-demo-cta"
                  className="min-h-[48px] px-8 text-sm md:text-base font-semibold shadow-xl shadow-[#e57804]/25"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Schedule Private Demo
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  href="/contact?product=inventory-invoice"
                  data-analytics-id="inventory-footer-contact-cta"
                  className="min-h-[48px] px-8 text-sm md:text-base font-medium bg-white/10 hover:bg-white/15 text-white border-white/15"
                >
                  Contact Commercial Sales
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
