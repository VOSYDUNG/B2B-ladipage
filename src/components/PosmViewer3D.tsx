import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RotateCw, Sparkles, Check, Info } from 'lucide-react';
import { AnalyticsEvent } from '../types';

interface PosmViewer3DProps {
  onTriggerAnalytics: (eventName: string, params: Record<string, any>) => void;
  lang: 'lo' | 'vi' | 'en';
}

const DICTIONARY = {
  lo: {
    shelfTitle: "ຊັ້ນວາງສະແດງຮ່ວມ NNC",
    shelfSubtitle: "ບັນຈຸ 10 ຫຼອດ ແກ້ເມົາຄ້າງ & ກ່ອງ VG-5",
    interactiveTip: "ຄລິກໃສ່ຕຳແໜ່ງຕ່າງໆເພື່ອທົດສອບການຈັດວາງ",
    vg5Title: "ຊ່ອງວາງ VG-5",
    kmkTitle: "ຮູສຽບ ແກ້ເມົາຄ້າງ",
    posmBenefit: "ເພີ່ມຍອດຂາຍ 45% ດ້ວຍການຈັດວາງທີ່ໂດດເດັ່ນ",
    backView: "ດ້ານຫຼັງ",
    frontView: "ດ້ານໜ້າ",
    viewAngle: "ໝູນມຸມເບິ່ງ Kệ",
  },
  vi: {
    shelfTitle: "Kệ Trưng Bày Đồng Bộ NNC",
    shelfSubtitle: "Chứa 10 ống sủi Ker Mao Khang & Hộp VG-5",
    interactiveTip: "Click vào các vị trí trên kệ để thử nghiệm sắp xếp",
    vg5Title: "Ngăn hộp VG-5",
    kmkTitle: "Hàng ống sủi Ker Mao Khang",
    posmBenefit: "Tăng 45% doanh số nhờ điểm trưng bày nổi bật",
    backView: "Mặt sau",
    frontView: "Mặt trước",
    viewAngle: "Xoay góc nhìn Kệ",
  },
  en: {
    shelfTitle: "NNC Joint Display Stand",
    shelfSubtitle: "Holds 10 Ker Mao Khang tubes & VG-5 boxes",
    interactiveTip: "Click shelf zones to interact and test layouts",
    vg5Title: "VG-5 Compartment",
    kmkTitle: "Ker Mao Khang Slots",
    posmBenefit: "Boosts sales by 45% with premium visibility",
    backView: "Back View",
    frontView: "Front View",
    viewAngle: "Rotate Shelf View",
  }
};

export default function PosmViewer3D({ onTriggerAnalytics, lang }: PosmViewer3DProps) {
  const t = DICTIONARY[lang];
  const [rotation, setRotation] = useState<number>(0);
  const [selectedTube, setSelectedTube] = useState<number | null>(null);
  const [selectedVg5, setSelectedVg5] = useState<boolean>(false);
  const [viewType, setViewType] = useState<'front' | 'isometric'>('isometric');

  // Represent 10 tubes of Ker Mao Khang
  const [tubes, setTubes] = useState<boolean[]>(new Array(10).fill(true));

  const handleTubeClick = (index: number) => {
    const newTubes = [...tubes];
    newTubes[index] = !newTubes[index];
    setTubes(newTubes);
    setSelectedTube(index);
    onTriggerAnalytics('click_posm_3d', {
      element: `kmk_tube_${index + 1}`,
      action: newTubes[index] ? 'placed' : 'taken',
      remaining_tubes: newTubes.filter(Boolean).length
    });
  };

  const handleVg5Click = () => {
    setSelectedVg5(!selectedVg5);
    onTriggerAnalytics('click_posm_3d', {
      element: 'vg5_compartment',
      action: !selectedVg5 ? 'highlight' : 'unhighlight'
    });
  };

  const rotateShelf = () => {
    setRotation(prev => (prev + 45) % 360);
    onTriggerAnalytics('click_posm_3d', {
      element: 'shelf_rotation',
      angle: (rotation + 45) % 360
    });
  };

  const toggleViewType = () => {
    const nextView = viewType === 'front' ? 'isometric' : 'front';
    setViewType(nextView);
    onTriggerAnalytics('click_posm_3d', {
      element: 'view_toggle',
      view_type: nextView
    });
  };

  return (
    <div id="posm-3d-section" className="bg-[#14181F] rounded-3xl p-6 border border-slate-700/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(34,211,238,0.08)]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-bento-cyan border border-slate-700/50 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-bento-cyan" />
            POSM Model: AST-POSM-003
          </span>
          <h3 className="text-xl font-bold font-display text-white">{t.shelfTitle}</h3>
          <p className="text-slate-400 text-sm mt-0.5">{t.shelfSubtitle}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="toggle-view-btn"
            onClick={toggleViewType}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            <RotateCw className="w-3.5 h-3.5" />
            {viewType === 'front' ? '3D View' : '2D View'}
          </button>
          <button
            id="rotate-shelf-btn"
            onClick={rotateShelf}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-bento-cyan text-slate-950 hover:bg-cyan-400 transition font-bold"
          >
            <RotateCw className="w-3.5 h-3.5 animate-spin-slow" />
            {t.viewAngle}
          </button>
        </div>
      </div>

      {/* Main Kệ Trực Quan */}
      <div className="relative w-full aspect-[4/3] max-h-[350px] bg-slate-950/60 rounded-2xl border border-slate-800 flex items-center justify-center overflow-hidden">
        
        {/* NNC Logo Banner inside 3D canvas */}
        <div className="absolute top-4 left-4 flex items-center gap-2 bg-[#14181F]/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm z-10 border border-slate-700/50">
          <div className="w-6 h-6 rounded-full bg-brand-yellow flex items-center justify-center p-0.5">
            {/* Small NNC logo rendering */}
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <polygon points="50,10 90,90 10,90" fill="#FAD201" />
              <polygon points="50,30 65,70 35,70" fill="#0C8A43" />
              <text x="50" y="85" fontSize="20" fontWeight="bold" fill="#0C8A43" textAnchor="middle">NNC</text>
            </svg>
          </div>
          <span className="text-[10px] font-bold text-white tracking-wider uppercase font-display">NNC PHARMA</span>
        </div>

        {/* 3D Render Canvas */}
        <motion.div
          animate={{
            rotateY: viewType === 'isometric' ? 15 + (rotation * 0.1) : 0,
            rotateX: viewType === 'isometric' ? 10 : 0,
            scale: 1,
          }}
          transition={{ type: 'spring', damping: 20 }}
          style={{ perspective: 1000 }}
          className="relative w-72 h-80 flex flex-col items-center justify-end"
        >
          {/* Top Board of POSM (Header) */}
          <div className="w-64 h-12 bg-brand-yellow rounded-t-xl border-b-4 border-brand-green flex flex-col items-center justify-center shadow-md relative">
            <div className="absolute inset-x-0 top-0.5 h-1 bg-white/40 rounded-full mx-2" />
            <span className="text-[10px] text-brand-green font-extrabold uppercase font-display tracking-widest">NNC EXCLUSIVE</span>
            <span className="text-xs text-brand-green font-bold tracking-tight">ແກ້ເມົາຄ້າງ & VG-5</span>
          </div>

          {/* Upper Shelf: Ker Mao Khang Tubes with holes */}
          <div className="w-64 h-24 bg-gradient-to-b from-brand-green-light to-white border-x-4 border-brand-green flex flex-col justify-between p-2 relative shadow-inner">
            <div className="text-[8px] font-bold text-brand-green/80 flex justify-between uppercase">
              <span>{t.kmkTitle}</span>
              <span>10 slots</span>
            </div>

            {/* Grid of holes/tubes */}
            <div className="grid grid-cols-5 gap-2 my-1">
              {tubes.map((exists, idx) => (
                <div key={idx} className="relative flex flex-col items-center">
                  {/* Tube hole back */}
                  <div className="w-8 h-8 rounded-full bg-slate-300/60 border border-slate-400/30 flex items-center justify-center shadow-inner">
                    <span className="text-[7px] text-slate-400 font-mono">{idx + 1}</span>
                  </div>

                  {/* Effervescent Tube itself */}
                  {exists && (
                    <motion.div
                      id={`tube-item-${idx}`}
                      onClick={() => handleTubeClick(idx)}
                      whileHover={{ y: -6, scale: 1.05 }}
                      initial={{ y: 0 }}
                      className="absolute -top-3 w-7 h-11 bg-white border-2 border-brand-green rounded-md shadow-md flex flex-col items-center justify-between overflow-hidden cursor-pointer"
                    >
                      {/* Tube Cap */}
                      <div className="w-full h-2.5 bg-brand-yellow flex items-center justify-center border-b border-brand-green">
                        <div className="w-4 h-0.5 bg-white/80 rounded" />
                      </div>
                      
                      {/* Tube Label */}
                      <div className="flex-1 w-full flex flex-col items-center justify-center p-0.5 bg-brand-green-light">
                        <span className="text-[5px] text-brand-green font-extrabold leading-none">ແກ້ເມົາ</span>
                        <span className="text-[4px] text-brand-green leading-none font-bold">10s</span>
                      </div>
                    </motion.div>
                  )}

                  {!exists && (
                    <button
                      id={`place-tube-btn-${idx}`}
                      onClick={() => handleTubeClick(idx)}
                      className="absolute -top-2 w-7 h-10 border border-dashed border-brand-green/40 rounded flex items-center justify-center hover:bg-brand-green-light/50 transition cursor-pointer"
                    >
                      <span className="text-[9px] text-brand-green font-bold">+</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Divider Shelf middle lip */}
          <div className="w-64 h-3 bg-brand-yellow border-t-2 border-b-4 border-brand-green shadow-md relative z-10">
            <div className="absolute inset-x-0 top-0.5 h-0.5 bg-white/40" />
          </div>

          {/* Lower Shelf: VG-5 Box Compartment */}
          <div
            id="vg5-compartment"
            onClick={handleVg5Click}
            className={`w-64 h-28 bg-gradient-to-b from-slate-50 to-white border-x-4 border-b-4 border-brand-green flex flex-col justify-between p-3 relative cursor-pointer transition-colors ${
              selectedVg5 ? 'bg-brand-yellow-light/40 border-brand-yellow' : 'hover:bg-slate-100/50'
            }`}
          >
            <div className="text-[8px] font-bold text-slate-500 uppercase flex justify-between">
              <span>{t.vg5Title}</span>
              <span className="text-brand-green font-mono">AST-COMP-002</span>
            </div>

            {/* Render VG-5 boxes */}
            <div className="flex justify-center gap-3 items-end flex-1 mt-1">
              {/* Box 1 (Front/Angled) */}
              <motion.div
                animate={{ scale: selectedVg5 ? 1.05 : 1, y: selectedVg5 ? -4 : 0 }}
                className="w-16 h-14 bg-brand-green text-white rounded p-1.5 shadow-md flex flex-col justify-between border border-brand-yellow relative overflow-hidden"
              >
                {/* Yellow design ribbon on box */}
                <div className="absolute -right-3 -top-3 w-8 h-8 bg-brand-yellow rotate-45 border-b border-brand-green" />
                <span className="text-[7px] text-brand-yellow font-extrabold tracking-wider leading-none">VG-5</span>
                
                <div className="flex flex-col">
                  <span className="text-[5px] text-white/90 leading-none">40 Tabs</span>
                  <div className="w-full h-0.5 bg-brand-yellow mt-0.5" />
                </div>
              </motion.div>

              {/* Box 2 (Back) */}
              <motion.div
                animate={{ scale: selectedVg5 ? 1.05 : 1, x: selectedVg5 ? 4 : 0 }}
                className="w-12 h-14 bg-white text-slate-700 rounded p-1 shadow-sm flex flex-col justify-between border border-slate-200 relative overflow-hidden"
              >
                <div className="w-full h-1 bg-brand-green rounded-full" />
                <span className="text-[6px] text-brand-green font-bold text-center leading-none">VG-5 Herbal</span>
                <span className="text-[4px] text-slate-400 leading-none text-right">Danapha</span>
              </motion.div>
            </div>

            {/* Display Stand Base shadow element */}
            <div className="absolute -bottom-1 inset-x-2 h-1 bg-slate-300 blur-[1px] opacity-70" />
          </div>

          {/* POSM Legs / Rubber feet */}
          <div className="w-60 flex justify-between px-6">
            <div className="w-4 h-1.5 bg-slate-800 rounded-b" />
            <div className="w-4 h-1.5 bg-slate-800 rounded-b" />
          </div>
        </motion.div>

        {/* Dynamic highlights and tags overlay */}
        <AnimatePresence>
          {selectedTube !== null && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute bottom-4 right-4 bg-slate-900/90 text-white text-[10px] py-1 px-2.5 rounded-lg shadow-md flex items-center gap-1 z-10"
            >
              <Info className="w-3 h-3 text-brand-yellow" />
              <span>
                {tubes[selectedTube] ? 'Placed tube' : 'Took tube'} {selectedTube + 1}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-4 p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex items-start gap-2.5">
        <Check className="w-4 h-4 text-bento-cyan shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-bold text-bento-cyan uppercase font-display tracking-wider">
            {t.posmBenefit}
          </h4>
          <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
            {t.interactiveTip}
          </p>
        </div>
      </div>
    </div>
  );
}
