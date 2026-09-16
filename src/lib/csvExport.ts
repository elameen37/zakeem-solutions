/**
 * Zakeem Solutions — Lightweight Client-Side CSV Export Utility
 * Phase 26E: CRM Commercial Intelligence & Reporting Export
 *
 * Formats report datasets into standard RFC 4180 CSV without external dependencies.
 * Only exports administrative summaries and non-sensitive aggregated CRM fields.
 */

import { CRMCommercialReport } from "@/types/crm";

function escapeCSVField(field: unknown): string {
  if (field === null || field === undefined) {
    return "";
  }
  const str = String(field);
  // If the field contains comma, quote, or newline, escape quotes and wrap in quotes
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function buildCSVRow(row: unknown[]): string {
  return row.map(escapeCSVField).join(",");
}

/**
 * Compiles a structured CRM commercial report into a unified CSV document.
 */
export function generateCRMReportCSV(report: CRMCommercialReport): string {
  const lines: string[] = [];

  // Header metadata
  lines.push(buildCSVRow(["ZAKEEM SOLUTIONS — CRM COMMERCIAL INTELLIGENCE REPORT"]));
  lines.push(buildCSVRow(["Report Date Range", report.dateRange.rangeLabel]));
  lines.push(buildCSVRow(["Timestamp Basis", report.dateRange.timestampBasis]));
  lines.push(buildCSVRow(["Generated At", new Date().toISOString()]));
  lines.push("");

  // 1. Executive Summary
  lines.push(buildCSVRow(["--- SECTION 1: EXECUTIVE CRM SUMMARY ---"]));
  lines.push(buildCSVRow(["Metric", "Count"]));
  lines.push(buildCSVRow(["Total Inbound Leads", report.summary.totalLeads]));
  lines.push(buildCSVRow(["New Leads", report.summary.newLeads]));
  lines.push(buildCSVRow(["Contacted Leads", report.summary.contactedLeads]));
  lines.push(buildCSVRow(["Qualified Leads", report.summary.qualifiedLeads]));
  lines.push(buildCSVRow(["Converted Leads", report.summary.convertedLeads]));
  lines.push(buildCSVRow(["Disqualified Leads", report.summary.disqualifiedLeads]));
  lines.push(buildCSVRow(["Open Deals (In Pipeline)", report.summary.openOpportunities]));
  lines.push(buildCSVRow(["Won Deals (Closed Won)", report.summary.wonOpportunities]));
  lines.push(buildCSVRow(["Lost Deals (Closed Lost)", report.summary.lostOpportunities]));
  lines.push(buildCSVRow(["Total Managed Accounts", report.summary.totalOrganizations]));
  lines.push(buildCSVRow(["Total Stakeholder Contacts", report.summary.totalContacts]));
  lines.push(buildCSVRow(["Scheduled Product Walkthroughs", report.summary.scheduledWalkthroughs]));
  lines.push("");

  // 2. Lead Funnel
  lines.push(buildCSVRow(["--- SECTION 2: LEAD CONVERSION FUNNEL ---"]));
  lines.push(buildCSVRow(["Funnel Stage", "Lead Count", "Stage Description"]));
  lines.push(buildCSVRow(["New", report.leadFunnel.new, "Initial Inbound Capture"]));
  lines.push(buildCSVRow(["Contacted", report.leadFunnel.contacted, "Sales Touchpoint Established"]));
  lines.push(buildCSVRow(["Qualified", report.leadFunnel.qualified, "Discovery / Fit Validated"]));
  lines.push(buildCSVRow(["Converted", report.leadFunnel.converted, "Promoted to Commercial Opportunity"]));
  lines.push(buildCSVRow(["Disqualified", report.leadFunnel.disqualified, "Unviable / Rejected with Reason"]));
  lines.push(buildCSVRow(["Conversion Rate", report.leadFunnel.conversionRatePercent !== null ? `${report.leadFunnel.conversionRatePercent}%` : "N/A", "Converted / Total Leads"]));
  lines.push(buildCSVRow(["Qualification Rate", report.leadFunnel.qualificationRatePercent !== null ? `${report.leadFunnel.qualificationRatePercent}%` : "N/A", "(Qualified + Converted) / Total Leads"]));
  lines.push("");

  // 3. Pipeline Valuation
  lines.push(buildCSVRow(["--- SECTION 3: OPPORTUNITY PIPELINE & COMMERCIAL VALUE ---"]));
  lines.push(buildCSVRow(["Stage", "Deals Count", "Deals With Value", "Deals Pending Qualification", "Populated Deal Value (NGN)"]));
  for (const [stage, data] of Object.entries(report.pipeline.stages)) {
    lines.push(
      buildCSVRow([
        stage.toUpperCase(),
        data.count,
        data.knownValueCount,
        data.unallocatedValueCount,
        data.populatedValueNgn !== null ? data.populatedValueNgn : "Pending qualification",
      ])
    );
  }
  lines.push(buildCSVRow(["Total Pipeline Known Value (NGN)", report.pipeline.totalPopulatedValueNgn ?? "Pending qualification"]));
  lines.push(buildCSVRow(["Open Pipeline Known Value (NGN)", report.pipeline.openPopulatedValueNgn ?? "Pending qualification"]));
  lines.push(buildCSVRow(["Closed Won Value (NGN)", report.pipeline.wonPopulatedValueNgn ?? "Pending qualification"]));
  lines.push("");

  // 4. Product Demand Matrix
  lines.push(buildCSVRow(["--- SECTION 4: PRODUCT DEMAND ANALYSIS ---"]));
  lines.push(buildCSVRow(["Product Name", "Category", "Lead Interest Count", "Opportunity Deals Count", "Converted Deals"]));
  for (const prod of report.productDemand) {
    lines.push(
      buildCSVRow([
        prod.productName,
        prod.category,
        prod.leadCount,
        prod.opportunityCount,
        prod.convertedCount,
      ])
    );
  }
  lines.push("");

  // 5. Scheduling & Walkthrough Operations
  lines.push(buildCSVRow(["--- SECTION 5: DEMO & WALKTHROUGH SCHEDULING ---"]));
  lines.push(buildCSVRow(["Status", "Walkthrough Count"]));
  lines.push(buildCSVRow(["Total Bookings", report.scheduling.totalBookings]));
  lines.push(buildCSVRow(["Pending", report.scheduling.pending]));
  lines.push(buildCSVRow(["Confirmed", report.scheduling.confirmed]));
  lines.push(buildCSVRow(["Completed", report.scheduling.completed]));
  lines.push(buildCSVRow(["Cancelled", report.scheduling.cancelled]));
  lines.push(buildCSVRow(["No Show", report.scheduling.noShow]));
  lines.push("");

  // 6. Account & Contact Intelligence
  lines.push(buildCSVRow(["--- SECTION 6: ACCOUNT & CONTACT INTELLIGENCE ---"]));
  lines.push(buildCSVRow(["Account Lifecycle Status", "Account Count"]));
  for (const [status, count] of Object.entries(report.accountContact.organizationsByStatus)) {
    lines.push(buildCSVRow([status.toUpperCase(), count]));
  }
  lines.push(buildCSVRow(["Total Stakeholder Contacts", report.accountContact.contactsTotal]));
  lines.push(buildCSVRow(["Contacts Linked to Account", report.accountContact.contactsWithOrg]));
  lines.push(buildCSVRow(["Independent Contacts", report.accountContact.contactsIndependent]));
  lines.push(buildCSVRow(["Primary Decision Makers", report.accountContact.primaryDecisionMakers]));
  lines.push(buildCSVRow(["Secondary Stakeholders", report.accountContact.secondaryStakeholders]));
  lines.push("");

  // 7. Inbound Attribution
  if (report.attribution.length > 0) {
    lines.push(buildCSVRow(["--- SECTION 7: INBOUND LEAD ATTRIBUTION ---"]));
    lines.push(buildCSVRow(["Source", "Medium", "Campaign", "Lead Count"]));
    for (const att of report.attribution) {
      lines.push(buildCSVRow([att.source, att.medium, att.campaign, att.leadCount]));
    }
    lines.push("");
  }

  return lines.join("\r\n");
}

/**
 * Triggers a browser download of the generated CSV file.
 */
export function downloadCSV(csvContent: string, fileName: string): void {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
