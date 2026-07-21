import React, { useState } from 'react';
import { Play, ChevronDown, ChevronRight, FileText, Database, ShieldAlert, CheckCircle, Server, Key } from 'lucide-react';
import { AppLanguage } from '../types';

interface SwaggerApiDocsProps {
  lang: AppLanguage;
}

interface ApiFieldSchema {
  type: string;
  required: boolean;
  description: string;
  enum?: string[];
}

interface ApiEndpoint {
  id: string;
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  path: string;
  description: string;
  authRequired: boolean;
  implemented: boolean;
  pathParams?: Record<string, ApiFieldSchema>;
  queryParams?: Record<string, ApiFieldSchema>;
  headerParams?: Record<string, ApiFieldSchema>;
  requestBody?: Record<string, ApiFieldSchema>;
  tryOutFields?: Array<{ name: string; placeholder: string }>;
}

export default function SwaggerApiDocs({ lang }: SwaggerApiDocsProps) {
  const [expandedEndpoint, setExpandedEndpoint] = useState<string | null>(null);
  const [tryOutParams, setTryOutParams] = useState<Record<string, string>>({});
  const [apiResponse, setApiResponse] = useState<Record<string, any> | null>(null);
  const [isCalling, setIsCalling] = useState(false);

  const toggleEndpoint = (id: string) => {
    setExpandedEndpoint(expandedEndpoint === id ? null : id);
    setApiResponse(null);
    setTryOutParams({});
  };

  const simulateApiCall = (endpoint: string, method: string) => {
    setIsCalling(true);
    setApiResponse(null);

    setTimeout(() => {
      setIsCalling(false);
      if (endpoint === '/api/leads' && method === 'POST') {
        const pharmacyName = tryOutParams['identity.pharmacy_name'] || 'Demo Lao Pharmacy';
        const contactName = tryOutParams['identity.contact_name'] || 'Pharmacist Somphone';
        const phone = tryOutParams['identity.phone'] || '020 55421938';
        const province = tryOutParams.province || 'vientiane';
        const landingId = tryOutParams['attribution.landing_id'] || 'vg5-kmk';
        const campaignId = tryOutParams['attribution.campaign_id'] || 'VG5_KMK_LAO_2026';
        const selectedPackage = tryOutParams['selection.package_id'] || 'advanced';

        setApiResponse({
          status: 'success',
          message: 'Lead accepted by ingestion API and written to Firestore with audit/read-model records',
          data: {
            lead_id: `lead-${Math.floor(100000 + Math.random() * 900000)}`,
            landing_id: landingId,
            campaign_id: campaignId,
            identity_preview: {
              pharmacy_name: pharmacyName,
              contact_name: contactName,
              phone_present: Boolean(phone),
              province: province
            },
            selection: {
              package_id: selectedPackage
            },
            side_effects: [
              'leads/{leadId}',
              'lead_activities/{activityId}',
              'stats_daily_landing_v1/{date_landingId}',
              'ai_lead_features_v1/{leadId}'
            ],
            created_at: new Date().toISOString(),
            status: 'NEW'
          }
        });
      } else {
        setApiResponse({
          status: 'success',
          timestamp: new Date().toISOString(),
          simulated_message: `Successful simulated ${method} response for ${endpoint}`
        });
      }
    }, 900);
  };

  const endpoints: ApiEndpoint[] = [
    {
      id: 'get-landing-config',
      method: 'GET',
      path: '/api/landing-config',
      description: 'Implemented. Return a cacheable, non-PII runtime metadata projection for one landing slug. Public callers cannot list the registry or read Firestore directly.',
      authRequired: false,
      implemented: true,
      queryParams: {
        slug: { type: 'string', required: true, description: 'Exact landing document slug, for example vg5-kmk.' }
      }
    },
    {
      id: 'post-lead',
      method: 'POST',
      path: '/api/leads',
      description: 'Implemented. Resolves a server-owned form contract, verifies the active landing/version binding, records truthful contact-basis facts, enforces transactional idempotency, and writes audit, stats, and redacted AI feature records.',
      authRequired: false,
      implemented: true,
      headerParams: {
        'Idempotency-Key': { type: 'string', required: true, description: 'Opaque 16-200 character key. Reuse is accepted only for the same normalized payload.' }
      },
      requestBody: {
        lead: { type: 'object', required: true, description: 'Canonical nested lead payload with form, attribution, identity, selection, crm, and compliance maps. The server owns field rules and schema_hash.' },
        'lead.form.form_id': { type: 'string', required: true, description: 'Stable source-approved form identifier, for example white-lotus-sample-request.' },
        'lead.form.version_number': { type: 'number', required: true, description: 'Positive source-approved form revision number.' }
      },
      tryOutFields: [
        { name: 'Idempotency-Key', placeholder: 'lead-v1-opaque-request-key' },
        { name: 'attribution.landing_id', placeholder: 'vg5-kmk' },
        { name: 'attribution.campaign_id', placeholder: 'VG5_KMK_LAO_2026' },
        { name: 'identity.pharmacy_name', placeholder: 'Phasouk Pharmacy Vientiane' },
        { name: 'identity.contact_name', placeholder: 'Dr. Somphone' },
        { name: 'identity.phone', placeholder: '020 55421938' },
        { name: 'province', placeholder: 'vientiane' },
        { name: 'selection.package_id', placeholder: 'advanced' }
      ]
    },
    {
      id: 'get-leads',
      method: 'GET',
      path: '/api/admin/leads',
      description: 'Implemented. Return at most 500 normalized leads. Managers receive the bounded CRM window; Sales Rep is server-filtered to crm.owner_id matching the verified token email.',
      authRequired: true,
      implemented: true,
      headerParams: {
        'X-Firebase-AppCheck': { type: 'string', required: true, description: 'Firebase App Check token.' }
      },
      queryParams: {
        limit: { type: 'number', required: false, description: 'Bounded result limit from 1 to 500.' },
        view: { type: 'string', required: false, description: 'Use feature with lead_id to fetch one redacted AI feature document.' },
        lead_id: { type: 'string', required: false, description: 'Required when view=feature.' }
      }
    },
    {
      id: 'patch-lead',
      method: 'PATCH',
      path: '/api/admin/leads',
      description: 'Implemented. Update whitelisted CRM lifecycle fields and write immutable activity plus AI feature status in one transaction. Sales Rep cannot reassign owner.',
      authRequired: true,
      implemented: true,
      headerParams: {
        'Idempotency-Key': { type: 'string', required: true, description: 'Opaque 16-200 character key bound to actor, lead, and normalized CRM patch.' },
        'X-Firebase-AppCheck': { type: 'string', required: true, description: 'Firebase App Check token.' }
      },
      requestBody: {
        lead_id: { type: 'string', required: true, description: 'Target lead document ID.' },
        crm: { type: 'object', required: true, description: 'Allowed fields: status, owner_id, next_action_at, lead_score, lost_reason, converted_order_value, notes.' }
      }
    },
    {
      id: 'delete-lead',
      method: 'DELETE',
      path: '/api/admin/leads',
      description: 'Implemented. Super Admin-only deletion with immutable audit and read-model compensation for API-created leads.',
      authRequired: true,
      implemented: true,
      headerParams: {
        'Idempotency-Key': { type: 'string', required: true, description: 'Opaque 16-200 character key bound to actor and lead deletion.' },
        'X-Firebase-AppCheck': { type: 'string', required: true, description: 'Firebase App Check token.' }
      },
      queryParams: {
        lead_id: { type: 'string', required: true, description: 'Document ID to delete.' }
      }
    },
    {
      id: 'get-admin-landings',
      method: 'GET',
      path: '/api/admin/landings',
      description: 'Implemented. Return the authorized landing workspace: registry, one landing version history, immutable form contracts with PII/compliance metadata and runtime_ready hash verification, claims, source-manifest assets, and server-derived permissions.',
      authRequired: true,
      implemented: true,
      headerParams: {
        'X-Firebase-AppCheck': { type: 'string', required: true, description: 'Firebase App Check token.' }
      },
      queryParams: {
        landing_id: { type: 'string', required: false, description: 'When present, include up to 100 versions for this landing.' }
      }
    },
    {
      id: 'post-admin-landings',
      method: 'POST',
      path: '/api/admin/landings',
      description: 'Implemented. Execute an audited, payload-idempotent landing command. Marketing manages drafts and publish; Regulatory approves claims and versions.',
      authRequired: true,
      implemented: true,
      headerParams: {
        'Idempotency-Key': { type: 'string', required: true, description: 'Opaque 16-200 character retry key.' },
        'X-Firebase-AppCheck': { type: 'string', required: true, description: 'Firebase App Check token.' }
      },
      requestBody: {
        action: { type: 'string', required: true, description: 'initialize, create_version, transition_version, duplicate_landing, bind_form_contract, or review_claim.' },
        landing_id: { type: 'string', required: false, description: 'Required for landing and version commands.' },
        version_number: { type: 'number', required: false, description: 'Required for transition_version and bind_form_contract.' },
        target_status: { type: 'string', required: false, description: 'State-machine target for transition_version.' },
        flow_key: { type: 'string', required: false, description: 'Required for bind_form_contract.' },
        contract_id: { type: 'string', required: false, description: 'Source-approved contract revision required for bind_form_contract.' },
        claim_id: { type: 'string', required: false, description: 'Required for review_claim.' }
      }
    },
    {
      id: 'get-admin-assets',
      method: 'GET',
      path: '/api/admin/assets',
      description: 'Implemented. Return at most 100 bounded replacement-job projections. Signed upload URLs, bucket paths, and raw object content are never returned by list operations.',
      authRequired: true,
      implemented: true,
      headerParams: {
        'X-Firebase-AppCheck': { type: 'string', required: true, description: 'Firebase App Check token.' }
      },
      queryParams: {
        landing_id: { type: 'string', required: false, description: 'Optional exact landing filter.' }
      }
    },
    {
      id: 'post-admin-assets',
      method: 'POST',
      path: '/api/admin/assets',
      description: 'Implemented. Create a 15-minute signed upload session, finalize byte-level SHA-256 verification, or review a verified candidate. Approval never binds the candidate to public runtime.',
      authRequired: true,
      implemented: true,
      headerParams: {
        'Idempotency-Key': { type: 'string', required: true, description: 'Opaque 16-200 character retry key bound to actor and normalized command.' },
        'X-Firebase-AppCheck': { type: 'string', required: true, description: 'Firebase App Check token.' }
      },
      requestBody: {
        action: { type: 'string', required: true, description: 'create_upload_session, finalize_upload, or review_asset_replacement.' },
        asset_id: { type: 'string', required: false, description: 'Existing source-locked manifest asset ID for create_upload_session.' },
        filename: { type: 'string', required: false, description: 'Base filename only, maximum 160 characters.' },
        content_type: { type: 'string', required: false, description: 'image/jpeg, image/png, image/webp, or application/pdf.' },
        size_bytes: { type: 'number', required: false, description: 'Declared size from 1 byte through 25 MiB.' },
        sha256: { type: 'string', required: false, description: 'Declared lowercase SHA-256 digest; the server recomputes it from uploaded bytes.' },
        job_id: { type: 'string', required: false, description: 'Required for finalize and review actions.' },
        decision: { type: 'string', required: false, description: 'approved or rejected for review_asset_replacement.' },
        note: { type: 'string', required: false, description: 'Bounded review note; required for Super Admin emergency self-review.' }
      }
    },
    {
      id: 'get-admin-integrations',
      method: 'GET',
      path: '/api/admin/integrations',
      description: 'Implemented. Return the fixed Data Hub safe projection, bounded delivery queue, daily delivery read model, health counts, cursor, and server-derived permissions. Payloads, URL, secret, headers, and response bodies are excluded.',
      authRequired: true,
      implemented: true,
      headerParams: {
        'X-Firebase-AppCheck': { type: 'string', required: true, description: 'Firebase App Check token.' }
      },
      queryParams: {
        status: { type: 'string', required: false, description: 'held, pending, leased, retry_wait, delivered, or dead_letter.' },
        landing_id: { type: 'string', required: false, description: 'Optional exact landing filter.' },
        campaign_id: { type: 'string', required: false, description: 'Optional exact campaign filter.' },
        event_type: { type: 'string', required: false, description: 'lead.created, lead.crm_updated, or lead.deleted.' },
        cursor: { type: 'string', required: false, description: 'Opaque cursor returned by the previous page.' },
        view: { type: 'string', required: false, description: 'Use attempts with delivery_id for bounded receipts.' },
        delivery_id: { type: 'string', required: false, description: 'Required when view=attempts.' }
      }
    },
    {
      id: 'post-admin-integrations',
      method: 'POST',
      path: '/api/admin/integrations',
      description: 'Implemented. Super Admin-only release of held delivery or audited retry of dead-letter. New lead deliveries are held by default and global delivery mode defaults off.',
      authRequired: true,
      implemented: true,
      headerParams: {
        'Idempotency-Key': { type: 'string', required: true, description: 'Opaque 16-200 character key bound to actor and normalized command.' },
        'X-Firebase-AppCheck': { type: 'string', required: true, description: 'Firebase App Check token.' }
      },
      requestBody: {
        action: { type: 'string', required: true, description: 'release_delivery or retry_delivery.' },
        delivery_id: { type: 'string', required: true, description: 'Target delivery ID.' },
        note: { type: 'string', required: true, description: 'Required audit note, maximum 500 characters.' }
      }
    },
    {
      id: 'post-ai-job',
      method: 'POST',
      path: '/api/ai/jobs/lead-analysis',
      description: 'Implemented. Queue an idempotent analysis job over redacted lead features and daily aggregates. PII access is always denied and scope must name a landing or campaign.',
      authRequired: true,
      implemented: true,
      headerParams: {
        'Idempotency-Key': { type: 'string', required: true, description: 'Opaque 16-200 character retry key.' },
        'X-Firebase-AppCheck': { type: 'string', required: true, description: 'Firebase App Check token.' }
      },
      requestBody: {
        purpose: { type: 'string', required: true, description: 'One fixed code: follow_up_prioritization, campaign_performance, segment_analysis, or data_quality_review.' },
        landing_id: { type: 'string', required: false, description: 'Required when campaign_id is absent.' },
        campaign_id: { type: 'string', required: false, description: 'Required when landing_id is absent.' },
        date_from: { type: 'string', required: false, description: 'Inclusive YYYY-MM-DD lower bound. Supply with date_to; defaults to the last 30 complete days.' },
        date_to: { type: 'string', required: false, description: 'Inclusive YYYY-MM-DD upper bound. Maximum span is 90 days.' },
        lead_type: { type: 'string', required: false, description: 'Optional ORDER, SAMPLE_REQUEST or PARTICIPANT filter.' },
        max_records: { type: 'number', required: false, description: 'Maximum redacted feature records, capped at 500.' },
        include_pii: { type: 'boolean', required: false, description: 'Must be false; true is rejected.' }
      }
    },
    {
      id: 'get-ai-job',
      method: 'GET',
      path: '/api/ai/jobs/lead-analysis',
      description: 'Implemented. Return the requester/Super Admin-safe job projection and integrity-checked deterministic lead_analysis_v1 result.',
      authRequired: true,
      implemented: true,
      headerParams: {
        'X-Firebase-AppCheck': { type: 'string', required: true, description: 'Firebase App Check token.' }
      },
      queryParams: {
        job_id: { type: 'string', required: true, description: 'Opaque AI analysis job ID.' }
      }
    }
  ];

  return (
    <div className="bg-slate-900 text-slate-100 border border-slate-800 rounded-[32px] p-6 lg:p-10 shadow-2xl relative overflow-hidden font-mono text-xs">
      {/* Decortive code elements */}
      <div className="absolute top-0 right-0 p-8 opacity-5 select-none pointer-events-none text-right">
        <Server className="w-48 h-48 text-brand-green" />
      </div>

      <div className="space-y-4 mb-8">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 bg-brand-green/20 text-brand-green border border-brand-green/30 rounded-lg text-[10px] font-black uppercase tracking-wider">
            OpenAPI 3.0.0
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] text-slate-400 font-bold">API CONTRACT</span>
        </div>
        
        <h2 className="text-xl sm:text-2xl font-black text-white font-sans tracking-tight leading-none">
          NNC Pharma Campaign API Portal
        </h2>
        <p className="text-slate-400 font-sans max-w-2xl leading-relaxed text-xs">
          Current and planned contracts for lead ingestion, CRM operations, analytics read models, and AI-safe integration. Only endpoints marked Implemented are deployed.
        </p>
      </div>

      <div className="space-y-4">
        {endpoints.map((ep) => {
          const isExpanded = expandedEndpoint === ep.id;
          const methodColors: Record<string, string> = {
            POST: 'bg-emerald-600 border-emerald-500 text-white',
            GET: 'bg-blue-600 border-blue-500 text-white',
            PATCH: 'bg-amber-600 border-amber-500 text-white',
            DELETE: 'bg-rose-600 border-rose-500 text-white',
          };

          const methodBgLight: Record<string, string> = {
            POST: 'bg-emerald-950/40 border-emerald-900/50',
            GET: 'bg-blue-950/40 border-blue-900/50',
            PATCH: 'bg-amber-950/40 border-amber-900/50',
            DELETE: 'bg-rose-950/40 border-rose-900/50',
          };

          return (
            <div 
              key={ep.id} 
              className={`border rounded-2xl overflow-hidden transition-all ${
                isExpanded ? methodBgLight[ep.method] : 'border-slate-800/80 hover:border-slate-700 bg-slate-950/30'
              }`}
            >
              {/* Endpoint Header Bar */}
              <button
                onClick={() => toggleEndpoint(ep.id)}
                className="w-full text-left p-4 flex items-center justify-between gap-4 cursor-pointer"
              >
                <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
                  <span className={`px-3 py-1 font-black text-[10px] rounded-md ${methodColors[ep.method]} tracking-wider`}>
                    {ep.method}
                  </span>
                  <span className="font-extrabold text-white text-xs">{ep.path}</span>
                  <span className="text-slate-400 text-[11px] font-sans truncate max-w-xs md:max-w-md hidden sm:inline">
                    - {ep.description.slice(0, 75)}...
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[9px] font-black uppercase ${ep.implemented ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {ep.implemented ? 'Implemented' : 'Planned'}
                  </span>
                  {ep.authRequired && (
                    <Key className="w-3.5 h-3.5 text-brand-yellow" title="Requires Bearer Token authentication" />
                  )}
                  {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                </div>
              </button>

              {/* Endpoint Details Area */}
              {isExpanded && (
                <div className="p-4 border-t border-slate-800 bg-slate-950/80 space-y-6">
                  <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 font-sans">
                      Description
                    </h4>
                    <p className="text-slate-300 font-sans leading-relaxed text-xs">
                      {ep.description}
                    </p>
                  </div>

                  {/* Path / Query Parameters */}
                  {(ep.pathParams || ep.queryParams || ep.headerParams) && (
                    <div className="space-y-3">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-sans">
                        Parameters
                      </h4>
                      <div className="border border-slate-800/60 rounded-xl overflow-hidden">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-900 border-b border-slate-800 text-[10px] font-black text-slate-400">
                              <th className="p-2">Name</th>
                              <th className="p-2">Type</th>
                              <th className="p-2">In</th>
                              <th className="p-2">Description</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60 text-[11px]">
                            {ep.pathParams && Object.entries(ep.pathParams).map(([name, schema]: any) => (
                              <tr key={name}>
                                <td className="p-2 text-rose-400 font-bold">{name} *</td>
                                <td className="p-2 text-slate-400">{schema.type}</td>
                                <td className="p-2 text-slate-500">path</td>
                                <td className="p-2 text-slate-300 font-sans">{schema.description}</td>
                              </tr>
                            ))}
                            {ep.queryParams && Object.entries(ep.queryParams).map(([name, schema]: any) => (
                              <tr key={name}>
                                <td className="p-2 text-amber-400">{name} {schema.required && '*'}</td>
                                <td className="p-2 text-slate-400">{schema.type}</td>
                                <td className="p-2 text-slate-500">query</td>
                                <td className="p-2 text-slate-300 font-sans">{schema.description}</td>
                              </tr>
                            ))}
                            {ep.headerParams && Object.entries(ep.headerParams).map(([name, schema]: any) => (
                              <tr key={name}>
                                <td className="p-2 text-cyan-400 font-bold">{name} {schema.required && '*'}</td>
                                <td className="p-2 text-slate-400">{schema.type}</td>
                                <td className="p-2 text-slate-500">header</td>
                                <td className="p-2 text-slate-300 font-sans">{schema.description}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Request Body Details */}
                  {ep.requestBody && (
                    <div className="space-y-3">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-sans">
                        Request Body (application/json)
                      </h4>
                      <div className="border border-slate-800/60 rounded-xl overflow-hidden">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-900 border-b border-slate-800 text-[10px] font-black text-slate-400">
                              <th className="p-2">Field</th>
                              <th className="p-2">Type</th>
                              <th className="p-2">Required</th>
                              <th className="p-2">Description</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60 text-[11px]">
                            {Object.entries(ep.requestBody).map(([name, schema]: any) => (
                              <tr key={name}>
                                <td className="p-2 text-emerald-400 font-bold">{name}</td>
                                <td className="p-2 text-slate-400">
                                  {schema.type} {schema.enum && `[${schema.enum.join('|')}]`}
                                </td>
                                <td className="p-2 text-slate-400">{schema.required ? 'true' : 'false'}</td>
                                <td className="p-2 text-slate-300 font-sans">{schema.description}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Try it out Interactive Form */}
                  {ep.tryOutFields && (
                    <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-[10px] font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                          <Play className="w-3.5 h-3.5 text-brand-green" />
                          Interactive Mock Console
                        </h4>
                        <span className="text-[9px] text-slate-500">Test client requests</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {ep.tryOutFields.map((field) => (
                          <div key={field.name} className="space-y-1">
                            <label className="text-[9px] text-slate-400 uppercase tracking-wider font-bold block">
                              {field.name}
                            </label>
                            <input
                              type="text"
                              value={tryOutParams[field.name] || ''}
                              onChange={(e) => setTryOutParams({ ...tryOutParams, [field.name]: e.target.value })}
                              placeholder={field.placeholder}
                              className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 outline-none focus:border-brand-green text-[11px]"
                            />
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={() => simulateApiCall(ep.path, ep.method)}
                        disabled={isCalling}
                        className="px-4 py-2 bg-brand-green hover:bg-brand-green-hover text-white text-[11px] font-black rounded-lg transition shadow flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-75"
                      >
                        {isCalling ? (
                          <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : (
                          <Play className="w-3 h-3" />
                        )}
                        <span>EXECUTE SIMULATED CALL</span>
                      </button>
                    </div>
                  )}

                  {/* Response Console */}
                  {apiResponse && (
                    <div className="space-y-2 animate-fade-in">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-900 rounded font-black text-[9px]">
                          200 OK
                        </span>
                        <span className="text-[10px] text-slate-500">Response body</span>
                      </div>
                      <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-emerald-400 overflow-x-auto text-[10px]">
                        {JSON.stringify(apiResponse, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
