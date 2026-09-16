import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Users,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  X,
  Mail,
  Phone,
  Calendar,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Send,
  UserCheck,
  Building2,
  Briefcase,
  Award,
  FileText,
  UserPlus,
} from "lucide-react";
import { SEO } from "@/components/seo/SEO";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { AdminNav } from "@/components/admin/AdminNav";
import { CRMActivityStream } from "@/components/admin/CRMActivityStream";
import { cn } from "@/lib/utils";
import {
  CRMContact,
  CRMContactDetail,
  CRMOrganization,
} from "@/types/crm";
import {
  getAdminContacts,
  getContactDetails,
  getAdminOrganizations,
  addCRMNote,
} from "@/lib/crmService";
import { isSupabaseConfigured } from "@/lib/supabase";

export default function AdminContactsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlContactId = searchParams.get("contactId");
  const urlOrgId = searchParams.get("orgId");

  const [contacts, setContacts] = useState<CRMContact[]>([]);
  const [organizations, setOrganizations] = useState<CRMOrganization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [orgFilter, setOrgFilter] = useState<string>(urlOrgId || "all");
  const [primaryFilter, setPrimaryFilter] = useState<"all" | "primary" | "secondary">("all");

  // Drawer / Selection
  const [selectedContactId, setSelectedContactId] = useState<string | null>(urlContactId);
  const [detailContact, setDetailContact] = useState<CRMContactDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  // Note creation
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [submittingNote, setSubmittingNote] = useState(false);
  const [noteSuccess, setNoteSuccess] = useState(false);
  const [activityRefreshTrigger, setActivityRefreshTrigger] = useState(0);

  // Synchronize URL param with selectedContactId
  useEffect(() => {
    if (urlContactId && urlContactId !== selectedContactId) {
      setSelectedContactId(urlContactId);
    }
  }, [urlContactId, selectedContactId]);

  // Load organizations for filter dropdown
  useEffect(() => {
    getAdminOrganizations().then((res) => {
      if (res.success) {
        setOrganizations(res.organizations);
      }
    });
  }, []);

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAdminContacts({
        organizationId: orgFilter === "all" ? undefined : orgFilter,
        search: searchQuery || undefined,
      });

      if (res.success) {
        let list = res.contacts;
        if (primaryFilter === "primary") {
          list = list.filter((c) => c.isPrimary);
        } else if (primaryFilter === "secondary") {
          list = list.filter((c) => !c.isPrimary);
        }
        setContacts(list);
      } else {
        setError(res.error || "Failed to load contacts.");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load contacts.");
    } finally {
      setLoading(false);
    }
  }, [orgFilter, searchQuery, primaryFilter]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  // Fetch details for drawer
  const fetchDetails = useCallback(async (cId: string) => {
    setLoadingDetail(true);
    setDetailError(null);
    try {
      const res = await getContactDetails(cId);
      if (res.success && res.contact) {
        setDetailContact(res.contact);
      } else {
        setDetailError(res.error || "Failed to load contact details.");
      }
    } catch (err: any) {
      setDetailError(err?.message || "Failed to load contact details.");
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  useEffect(() => {
    if (selectedContactId) {
      fetchDetails(selectedContactId);
    } else {
      setDetailContact(null);
    }
  }, [selectedContactId, fetchDetails]);

  const handleSelectContact = (cId: string) => {
    setSelectedContactId(cId);
    const newParams = new URLSearchParams(searchParams);
    newParams.set("contactId", cId);
    setSearchParams(newParams);
  };

  const handleCloseDrawer = () => {
    setSelectedContactId(null);
    setDetailContact(null);
    const newParams = new URLSearchParams(searchParams);
    newParams.delete("contactId");
    setSearchParams(newParams);
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContactId || !noteTitle.trim() || !noteContent.trim()) return;

    setSubmittingNote(true);
    try {
      const res = await addCRMNote({
        contactId: selectedContactId,
        title: noteTitle.trim(),
        notes: noteContent.trim(),
      });

      if (res.success) {
        setNoteTitle("");
        setNoteContent("");
        setNoteSuccess(true);
        setActivityRefreshTrigger((prev) => prev + 1);
        setTimeout(() => setNoteSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingNote(false);
    }
  };

  // KPI Calculations
  const kpis = useMemo(() => {
    const total = contacts.length;
    const primary = contacts.filter((c) => c.isPrimary).length;
    const orgIds = new Set(contacts.map((c) => c.organizationId).filter(Boolean));
    const linkedAccounts = orgIds.size;
    const activeProfiles = contacts.filter((c) => c.profileId).length;
    return { total, primary, linkedAccounts, activeProfiles };
  }, [contacts]);

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-brand-500/20">
      <SEO
        title="Contacts & Decision Makers | Zakeem Solutions Admin"
        description="Comprehensive directory of enterprise contacts, executive decision makers, and account stakeholders."
        canonical="/admin/crm/contacts"
      />

      <AdminNav activeDesk="contacts" />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Strip */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
                  Contacts & Decision Makers
                  {!isSupabaseConfigured() && (
                    <Badge variant="outline" className="text-amber-400 border-amber-500/30 bg-amber-500/10 text-xs">
                      Local Mode
                    </Badge>
                  )}
                </h1>
                <p className="text-sm text-slate-400">
                  Manage individual stakeholders, identify key decision makers, and monitor client communications.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchContacts}
              disabled={loading}
              className="border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-300"
            >
              <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
              Refresh
            </Button>
          </div>
        </div>

        {/* KPI Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-6">
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-4 backdrop-blur-sm shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Contacts</span>
              <Users className="w-4 h-4 text-slate-500" />
            </div>
            <p className="text-2xl font-bold text-white mt-2">{kpis.total}</p>
            <p className="text-xs text-slate-500 mt-1">Directory stakeholders</p>
          </div>

          <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-4 backdrop-blur-sm shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-brand-400">Primary Contacts</span>
              <Award className="w-4 h-4 text-brand-400" />
            </div>
            <p className="text-2xl font-bold text-brand-300 mt-2">{kpis.primary}</p>
            <p className="text-xs text-slate-500 mt-1">Designated decision makers</p>
          </div>

          <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-4 backdrop-blur-sm shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-sky-400">Linked Accounts</span>
              <Building2 className="w-4 h-4 text-sky-400" />
            </div>
            <p className="text-2xl font-bold text-sky-300 mt-2">{kpis.linkedAccounts}</p>
            <p className="text-xs text-slate-500 mt-1">Organizations represented</p>
          </div>

          <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-4 backdrop-blur-sm shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Auth Profiles</span>
              <UserCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-emerald-300 mt-2">{kpis.activeProfiles}</p>
            <p className="text-xs text-slate-500 mt-1">Portal user credentials</p>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 backdrop-blur-sm space-y-3 mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by contact name, email, job title, company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-700/80 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-500/50 transition-colors"
              />
            </div>

            {/* Organization Dropdown Filter */}
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-400 hidden md:block" />
              <select
                value={orgFilter}
                onChange={(e) => setOrgFilter(e.target.value)}
                className="bg-slate-950/80 border border-slate-700/80 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500/50 max-w-[200px]"
              >
                <option value="all">All Organizations</option>
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Decision Maker Filter */}
            <select
              value={primaryFilter}
              onChange={(e) => setPrimaryFilter(e.target.value as any)}
              className="bg-slate-950/80 border border-slate-700/80 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500/50"
            >
              <option value="all">All Stakeholders</option>
              <option value="primary">Primary Decision Makers Only</option>
              <option value="secondary">Secondary Stakeholders Only</option>
            </select>

            {(searchQuery || orgFilter !== "all" || primaryFilter !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setOrgFilter("all");
                  setPrimaryFilter("all");
                }}
                className="text-slate-400 hover:text-white"
              >
                Reset
              </Button>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            <span>
              Showing {contacts.length} {contacts.length === 1 ? "contact" : "contacts"}
            </span>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-400" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Contacts Directory Table */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-12 text-center text-slate-400">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-3 text-brand-400" />
              <p className="text-sm">Loading contacts directory...</p>
            </div>
          ) : contacts.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <Users className="w-10 h-10 mx-auto mb-3 text-slate-600" />
              <p className="text-base font-medium text-slate-300">No contacts found</p>
              <p className="text-sm text-slate-500 mt-1">
                {searchQuery || orgFilter !== "all" || primaryFilter !== "all"
                  ? "Try adjusting your search query or organization filter."
                  : "Contacts will automatically appear here as inbound leads and opportunities are registered."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                    <th className="py-3.5 px-4">Contact</th>
                    <th className="py-3.5 px-4">Organization</th>
                    <th className="py-3.5 px-4">Role / Title</th>
                    <th className="py-3.5 px-4">Decision Role</th>
                    <th className="py-3.5 px-4">Created Date</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {contacts.map((contact) => {
                    const isSelected = selectedContactId === contact.id;

                    return (
                      <tr
                        key={contact.id}
                        onClick={() => handleSelectContact(contact.id)}
                        className={cn(
                          "hover:bg-slate-800/40 cursor-pointer transition-colors group",
                          isSelected && "bg-brand-500/5 border-l-2 border-brand-500"
                        )}
                      >
                        {/* Contact Name & Email */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700/60 flex items-center justify-center text-brand-400 font-bold text-xs uppercase">
                              {contact.fullName ? contact.fullName.slice(0, 2) : "CT"}
                            </div>
                            <div>
                              <p className="font-medium text-white group-hover:text-brand-300 transition-colors">
                                {contact.fullName}
                              </p>
                              <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                                <Mail className="w-3 h-3 text-slate-500" />
                                {contact.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Organization */}
                        <td className="py-3.5 px-4">
                          {contact.organization ? (
                            <Link
                              to={`/admin/crm/organizations?orgId=${contact.organization.id}`}
                              onClick={(e) => e.stopPropagation()}
                              className="text-brand-400 hover:underline flex items-center gap-1 font-medium"
                            >
                              <Building2 className="w-3.5 h-3.5 text-slate-400" />
                              {contact.organization.name}
                            </Link>
                          ) : (
                            <span className="text-slate-500 italic">Independent / Unassigned</span>
                          )}
                        </td>

                        {/* Role / Job Title */}
                        <td className="py-3.5 px-4 text-slate-300">
                          {contact.jobTitle || <span className="text-slate-500 italic">Not recorded</span>}
                        </td>

                        {/* Decision Role / Badge */}
                        <td className="py-3.5 px-4">
                          {contact.isPrimary ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border border-brand-500/30 bg-brand-500/10 text-brand-300">
                              Primary Decision Maker
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-normal border border-slate-700 bg-slate-800/40 text-slate-400">
                              Secondary Stakeholder
                            </span>
                          )}
                        </td>

                        {/* Created Date */}
                        <td className="py-3.5 px-4 text-xs text-slate-400">
                          {contact.createdAt ? new Date(contact.createdAt).toLocaleDateString() : "—"}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectContact(contact.id);
                            }}
                            className="text-slate-400 hover:text-white hover:bg-slate-800"
                          >
                            View Profile
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Contact Detail Drawer */}
      {selectedContactId && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-slate-900 border-l border-slate-800 h-full overflow-y-auto p-6 space-y-6 shadow-2xl">
            {/* Drawer Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-800">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 font-bold text-lg uppercase flex-shrink-0">
                  {detailContact?.fullName ? detailContact.fullName.slice(0, 2) : "CT"}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    {detailContact?.fullName || "Contact Profile"}
                    {detailContact?.isPrimary && (
                      <Badge variant="outline" className="text-xs border-brand-500/30 bg-brand-500/10 text-brand-300">
                        Primary Decision Maker
                      </Badge>
                    )}
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    {detailContact?.jobTitle || "Stakeholder"}
                  </p>
                </div>
              </div>

              <button
                onClick={handleCloseDrawer}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingDetail ? (
              <div className="py-16 text-center text-slate-400">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-3 text-brand-400" />
                <p className="text-sm">Loading contact details...</p>
              </div>
            ) : detailError ? (
              <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
                <p className="text-sm">{detailError}</p>
              </div>
            ) : detailContact ? (
              <div className="space-y-6">
                {/* Communication & Attributes Box */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <Users className="w-4 h-4 text-brand-400" />
                    Contact & Channel Details
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-500 block">Email Address</span>
                      <a
                        href={`mailto:${detailContact.email}`}
                        className="text-brand-400 hover:underline font-medium flex items-center gap-1 mt-0.5"
                      >
                        <Mail className="w-3 h-3 text-slate-400" />
                        {detailContact.email}
                      </a>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Phone Number</span>
                      {detailContact.phone ? (
                        <a
                          href={`tel:${detailContact.phone}`}
                          className="text-brand-400 hover:underline font-medium flex items-center gap-1 mt-0.5"
                        >
                          <Phone className="w-3 h-3 text-slate-400" />
                          {detailContact.phone}
                        </a>
                      ) : (
                        <span className="text-slate-400 italic">No phone recorded</span>
                      )}
                    </div>
                    <div>
                      <span className="text-slate-500 block">Auth Profile Link</span>
                      <span className="text-slate-200 font-mono text-[10px]">
                        {detailContact.profileId || "No client portal account linked"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Created On</span>
                      <span className="text-slate-200">{new Date(detailContact.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* Linked Organization Card */}
                {detailContact.organization && (
                  <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-brand-400" />
                        Associated Organization
                      </span>
                      <h4 className="text-base font-bold text-white mt-1">{detailContact.organization.name}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Industry: {detailContact.organization.industry || "General Commercial"} • Status:{" "}
                        <span className="capitalize">{detailContact.organization.status}</span>
                      </p>
                    </div>

                    <Link
                      to={`/admin/crm/organizations?orgId=${detailContact.organization.id}`}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-brand-400 hover:text-white transition-colors flex items-center gap-1 text-xs"
                    >
                      View Account
                      <ExternalLink className="w-3.5 h-3.5 ml-1" />
                    </Link>
                  </div>
                )}

                {/* Linked Opportunities */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-brand-400" />
                      Associated Deals & Pipeline ({detailContact.opportunities.length})
                    </h3>
                  </div>

                  {detailContact.opportunities.length === 0 ? (
                    <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-4 text-center text-xs text-slate-500">
                      No commercial opportunities currently linked to this contact.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {detailContact.opportunities.map((opp) => (
                        <div
                          key={opp.id}
                          className="bg-slate-950/60 border border-slate-800/90 rounded-xl p-3.5 flex items-center justify-between hover:border-slate-700 transition-colors"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-white">{opp.title}</p>
                              <Badge variant="outline" className="text-[10px] py-0 capitalize">
                                {opp.stage.replace("_", " ")}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                              <span>Product: {opp.primaryProduct || "Multi-Suite"}</span>
                              <span>
                                Value: {opp.dealValueNgn ? `₦${opp.dealValueNgn.toLocaleString()}` : "Pending qualification"}
                              </span>
                            </div>
                          </div>

                          <Link
                            to={`/admin/crm/pipeline?oppId=${opp.id}`}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                            title="Open in Pipeline Desk"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Linked Leads */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-brand-400" />
                      Inbound Leads ({detailContact.leads.length})
                    </h3>
                  </div>

                  {detailContact.leads.length === 0 ? (
                    <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-4 text-center text-xs text-slate-500">
                      No inbound leads recorded for this contact.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {detailContact.leads.map((l) => (
                        <div
                          key={l.id}
                          className="bg-slate-950/60 border border-slate-800/90 rounded-xl p-3.5 flex items-center justify-between hover:border-slate-700 transition-colors"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono font-bold text-brand-400">{l.referenceId}</span>
                              <Badge variant="outline" className="text-[10px] py-0 capitalize">
                                {l.status}
                              </Badge>
                            </div>
                            <p className="text-xs text-slate-400 mt-1">
                              Interest: {l.productInterest || "General Platform"} • {new Date(l.createdAt).toLocaleDateString()}
                            </p>
                          </div>

                          <Link
                            to={`/admin/crm/leads?leadId=${l.id}`}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                            title="Open Lead"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Add Quick Note Form */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-brand-400" />
                    Log Stakeholder Communication / Note
                  </h3>
                  <form onSubmit={handleAddNote} className="space-y-2.5">
                    <input
                      type="text"
                      placeholder="Call / meeting summary..."
                      value={noteTitle}
                      onChange={(e) => setNoteTitle(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-500/50"
                      required
                    />
                    <textarea
                      placeholder="Notes regarding client requirements, objections, or relationship history..."
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      rows={3}
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-500/50 resize-none"
                      required
                    />
                    <div className="flex items-center justify-between">
                      {noteSuccess && (
                        <span className="text-xs text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Note saved to contact timeline
                        </span>
                      )}
                      <Button
                        type="submit"
                        size="sm"
                        disabled={submittingNote || !noteTitle.trim() || !noteContent.trim()}
                        className="ml-auto bg-brand-600 hover:bg-brand-500 text-white text-xs"
                      >
                        <Send className="w-3 h-3 mr-1.5" />
                        {submittingNote ? "Saving..." : "Log Note"}
                      </Button>
                    </div>
                  </form>
                </div>

                {/* Activity Stream */}
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-brand-400" />
                    Contact Activity Timeline
                  </h3>
                  <CRMActivityStream
                    contactId={detailContact.id}
                    refreshTrigger={activityRefreshTrigger}
                  />
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

export { AdminContactsPage };
