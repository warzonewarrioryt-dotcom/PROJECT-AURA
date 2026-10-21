import React from "react";
import { Sparkles, Activity, ShieldAlert, Compass } from "lucide-react";

function cleanPillText(text) {
  if (!text) return "";
  return String(text)
    .replace(/\*{1,3}([^*]+)\*{1,3}/g, "$1")
    .replace(/\*/g, "")
    .replace(/^#{1,6}\s*/, "")
    .replace(/^[-+•►✦✧]\s*/, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^["'`:]+|["'`:]+$/g, "")
    .trim();
}

export default function AuraBriefingCard({ data }) {
  if (!data) return null;

  const metricIcons = [
    <Activity key="1" className="w-3.5 h-3.5 text-amber-400" />,
    <ShieldAlert key="2" className="w-3.5 h-3.5 text-cyan-400" />,
    <Compass key="3" className="w-3.5 h-3.5 text-emerald-400" />
  ];

  return (
    <div className="flex flex-col gap-5 p-6 max-w-5xl mx-auto text-slate-200">
      
      {/* 1. Hero Snapshot Card */}
      <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-zinc-950/70 p-6 backdrop-blur-xl shadow-2xl">
        <div className="absolute top-0 right-0 h-32 w-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-center gap-2 text-amber-400 text-xs font-mono font-semibold tracking-widest uppercase mb-3">
          <Sparkles className="w-4 h-4 animate-spin" style={{ animationDuration: '6s' }} />
          Aura Technical Assessment // {cleanPillText(data.category || "General")}
        </div>

        <h1 className="text-2xl font-bold text-white tracking-tight">
          {cleanPillText(data.title)}
        </h1>
        
        <p className="text-sm text-slate-300 mt-2 leading-relaxed max-w-3xl">
          {cleanPillText(data.summary)}
        </p>

        {data.tags && (
          <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-zinc-800/80">
            {data.tags.map((tag, index) => (
              <span key={index} className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-zinc-800 border border-zinc-700 text-slate-300">
                {cleanPillText(tag)}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 2. Bento Stat Badges */}
      {data.metrics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.metrics.map((metric, index) => (
            <div key={index} className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/90 hover:border-zinc-700 transition">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>{metric.label}</span>
                {metricIcons[index % metricIcons.length]}
              </div>
              <div className="text-xl font-bold text-slate-100 font-mono">{metric.value}</div>
              <p className="text-[11px] text-zinc-400 mt-1">{metric.subtext}</p>
            </div>
          ))}
        </div>
      )}

      {/* 3. Deep-Dive Split Panels */}
      {data.sections && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.sections.map((section, sIndex) => (
            <div key={sIndex} className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800">
              <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2 mb-3">
                <span className={`h-1.5 w-1.5 rounded-full ${sIndex % 2 === 0 ? 'bg-amber-400' : 'bg-cyan-400'}`}></span>
                {section.title}
              </h3>
              <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
                {section.items && section.items.map((item, iIndex) => (
                  <div key={iIndex}>
                    <span className="font-semibold text-white">{item.name}: </span>
                    {item.desc}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. Interactive Quick Actions */}
      {data.actions && (
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <span className="text-xs text-zinc-500 font-mono">Follow-up vectors:</span>
          {data.actions.map((action, aIndex) => {
            const cleanAct = cleanPillText(action);
            return (
              <button key={aIndex} className="text-xs px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-slate-300 border border-zinc-800 hover:border-zinc-700 transition" onClick={() => {
                if (typeof window !== "undefined" && window.dispatchAuraAction) {
                  window.dispatchAuraAction(cleanAct);
                }
              }}>
                {cleanAct} →
              </button>
            );
          })}
        </div>
      )}

    </div>
  );
}
