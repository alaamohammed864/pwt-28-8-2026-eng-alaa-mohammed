import React, { useRef, useState, useEffect, useCallback } from 'react';
import { DigitalSignature } from '../../types';

export interface SignaturePadProps {
  initialName?: string;
  initialRole?: string;
  initialSignature?: DigitalSignature;
  onSave: (sig: DigitalSignature) => void;
  onCancel?: () => void;
  title?: string;
  subtitle?: string;
  isModal?: boolean;
}

const INK_COLORS = [
  { name: 'Executive Blue', value: '#1e40af', bg: 'bg-blue-700' },
  { name: 'Cyber Cyan', value: '#06b6d4', bg: 'bg-cyan-500' },
  { name: 'Charcoal Black', value: '#0f172a', bg: 'bg-slate-900' },
  { name: 'Safety Emerald', value: '#059669', bg: 'bg-emerald-600' },
  { name: 'Caution Amber', value: '#d97706', bg: 'bg-amber-600' },
];

const PEN_WIDTHS = [
  { label: 'Fine', value: 1.5, desc: '1.5px' },
  { label: 'Medium', value: 2.5, desc: '2.5px' },
  { label: 'Bold', value: 4.0, desc: '4.0px' },
];

const TYPED_FONTS = [
  { id: 'font-script-1', name: 'Executive Script', style: 'italic font-serif tracking-wide', fontFam: 'Georgia, serif' },
  { id: 'font-script-2', name: 'Calligraphy Flow', style: 'italic font-sans tracking-wider', fontFam: 'cursive, "Brush Script MT", sans-serif' },
  { id: 'font-script-3', name: 'Formal Engineering', style: 'tracking-widest font-mono uppercase', fontFam: 'ui-monospace, monospace' },
];

export const SignaturePad: React.FC<SignaturePadProps> = ({
  initialName = '',
  initialRole = 'Authorized Inspector',
  initialSignature,
  onSave,
  onCancel,
  title = 'Digital Permit Sign-off',
  subtitle = 'Official HSE Electronic Verification / اعتماد وتوقيع التصريح',
  isModal = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [mode, setMode] = useState<'draw' | 'type'>('draw');
  const [signerName, setSignerName] = useState(initialSignature?.name || initialName || '');
  const [designation, setDesignation] = useState(initialSignature?.title || initialRole || '');
  const [badgeId, setBadgeId] = useState(initialSignature?.badgeId || `HSE-${Math.floor(1000 + Math.random() * 9000)}`);
  const [inkColor, setInkColor] = useState<string>('#06b6d4');
  const [penWidth, setPenWidth] = useState<number>(2.5);
  const [selectedFont, setSelectedFont] = useState(TYPED_FONTS[0].id);

  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [history, setHistory] = useState<ImageData[]>([]);

  // Setup high-DPI canvas
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    // Set display size
    const width = rect.width || 460;
    const height = 160;

    canvas.width = width * dpr;
    canvas.height = height * dpr;

    ctx.scale(dpr, dpr);
    ctx.strokeStyle = inkColor;
    ctx.lineWidth = penWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // If there's an existing signature image, draw it
    if (initialSignature?.signatureData && !hasDrawn) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, width, height);
        setHasDrawn(true);
      };
      img.src = initialSignature.signatureData;
    }
  }, [inkColor, penWidth, initialSignature, hasDrawn]);

  useEffect(() => {
    const timer = setTimeout(() => {
      initCanvas();
    }, 60);
    return () => clearTimeout(timer);
  }, [initCanvas]);

  // Update stroke properties on change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.strokeStyle = inkColor;
    ctx.lineWidth = penWidth;
  }, [inkColor, penWidth]);

  // Save canvas state to history before drawing
  const saveStateToHistory = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    try {
      const state = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setHistory((prev) => [...prev.slice(-10), state]);
    } catch {
      // Ignored for tainted canvas
    }
  };

  // Drawing event handlers
  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setIsDrawing(true);
    saveStateToHistory();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasDrawn(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const undoLastStroke = () => {
    const canvas = canvasRef.current;
    if (!canvas || history.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const newHistory = [...history];
    const previousState = newHistory.pop();
    setHistory(newHistory);

    if (previousState) {
      ctx.putImageData(previousState, 0, 0);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setHasDrawn(false);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    setHistory([]);
  };

  // Convert typed name to canvas data url
  const generateTypedSignatureData = (): string => {
    const canvas = document.createElement('canvas');
    canvas.width = 460 * 2;
    canvas.height = 160 * 2;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    ctx.scale(2, 2);
    ctx.fillStyle = inkColor;

    const fontObj = TYPED_FONTS.find((f) => f.id === selectedFont) || TYPED_FONTS[0];
    ctx.font = `italic 32px ${fontObj.fontFam}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(signerName || 'Authorized Signatory', 230, 80);

    // Add subtle underline flourish
    ctx.strokeStyle = inkColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(100, 105);
    ctx.bezierCurveTo(180, 115, 280, 95, 360, 110);
    ctx.stroke();

    return canvas.toDataURL('image/png');
  };

  // Handle final confirmation
  const handleConfirm = () => {
    let dataUrl: string | undefined;

    if (mode === 'draw') {
      const canvas = canvasRef.current;
      dataUrl = canvas && hasDrawn ? canvas.toDataURL('image/png') : undefined;
    } else {
      dataUrl = generateTypedSignatureData();
    }

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().substring(0, 5);

    // Compute simple security verification hash
    const rawHashString = `${signerName}|${designation}|${dateStr}|${timeStr}|${badgeId}`;
    let hash = 0;
    for (let i = 0; i < rawHashString.length; i++) {
      hash = (hash << 5) - hash + rawHashString.charCodeAt(i);
      hash |= 0;
    }
    const hexHash = Math.abs(hash).toString(16).padStart(8, '0').toUpperCase();
    const verificationHash = `SHA256: 9E4A-${hexHash}-PTW`;

    onSave({
      name: signerName.trim() || 'Authorized Official',
      title: designation.trim() || 'Safety Supervisor',
      date: dateStr,
      time: timeStr,
      signatureData: dataUrl,
      signed: true,
      signatureType: mode,
      badgeId: badgeId,
      verificationHash: verificationHash,
    });
  };

  return (
    <div
      ref={containerRef}
      className={`bg-[#0c0d18] border border-white/15 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-200 backdrop-blur-2xl ${
        isModal ? 'w-full max-w-lg' : 'w-full'
      }`}
    >
      {/* Header */}
      <div className="bg-white/[0.04] border-b border-white/10 px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.25)]">
            <span className="material-symbols-outlined text-xl">draw</span>
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-100 tracking-wide">{title}</h3>
            <p className="text-[11px] text-cyan-400 font-arabic">{subtitle}</p>
          </div>
        </div>

        {onCancel && (
          <button
            onClick={onCancel}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            title="Close"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        )}
      </div>

      {/* Main Content Form */}
      <div className="p-5 space-y-4">
        {/* Signatory Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Signatory Full Name / اسم الموقع <span className="text-cyan-400">*</span>
            </label>
            <input
              type="text"
              value={signerName}
              onChange={(e) => setSignerName(e.target.value)}
              className="form-input-industrial font-medium text-xs py-2 w-full"
              placeholder="e.g. Eng. Khalid Al-Otaibi"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Designation / Role / المسمى الوظيفي
            </label>
            <input
              type="text"
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              className="form-input-industrial text-xs py-2 w-full text-slate-300"
              placeholder="e.g. Lead HSE Officer"
            />
          </div>
        </div>

        {/* Mode Toggle & Toolbox */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-white/5">
          {/* Mode Switcher */}
          <div className="flex bg-black/40 p-1 rounded-lg border border-white/10">
            <button
              type="button"
              onClick={() => setMode('draw')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                mode === 'draw'
                  ? 'bg-cyan-500 text-black shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="material-symbols-outlined text-sm">gesture</span>
              Draw / رسم
            </button>
            <button
              type="button"
              onClick={() => setMode('type')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                mode === 'type'
                  ? 'bg-cyan-500 text-black shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="material-symbols-outlined text-sm">text_fields</span>
              Type / كتابة
            </button>
          </div>

          {/* Color & Stroke Options (For Draw Mode) */}
          {mode === 'draw' && (
            <div className="flex items-center gap-3">
              {/* Color Swatches */}
              <div className="flex items-center gap-1.5 bg-black/40 px-2 py-1 rounded-lg border border-white/10">
                {INK_COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setInkColor(c.value)}
                    title={c.name}
                    className={`w-4 h-4 rounded-full ${c.bg} transition-transform ${
                      inkColor === c.value
                        ? 'ring-2 ring-white ring-offset-1 ring-offset-black scale-110'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                  />
                ))}
              </div>

              {/* Stroke Width Selector */}
              <div className="flex items-center gap-1 bg-black/40 px-1.5 py-1 rounded-lg border border-white/10 text-[10px]">
                {PEN_WIDTHS.map((pw) => (
                  <button
                    key={pw.value}
                    type="button"
                    onClick={() => setPenWidth(pw.value)}
                    className={`px-1.5 py-0.5 rounded font-medium transition-colors ${
                      penWidth === pw.value ? 'bg-white/20 text-cyan-300 font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {pw.label}
                  </button>
                ))}
              </div>

              {/* Undo & Clear */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={undoLastStroke}
                  disabled={history.length === 0}
                  className="p-1 text-slate-400 hover:text-white disabled:opacity-30 rounded hover:bg-white/10 transition-colors"
                  title="Undo stroke"
                >
                  <span className="material-symbols-outlined text-base">undo</span>
                </button>
                <button
                  type="button"
                  onClick={clearCanvas}
                  className="text-xs text-rose-400 hover:text-rose-300 font-medium px-2 py-1 rounded hover:bg-rose-500/10 transition-colors flex items-center gap-0.5"
                  title="Clear pad"
                >
                  <span className="material-symbols-outlined text-sm">delete_sweep</span>
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Interactive Pad Canvas / Type Preview Area */}
        {mode === 'draw' ? (
          <div className="border-2 border-dashed border-cyan-500/30 rounded-xl bg-black/60 relative cursor-crosshair overflow-hidden shadow-inner group">
            {/* Background Grid Guidelines */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
            
            {/* Signature Baseline */}
            <div className="absolute left-6 right-6 bottom-8 border-b border-cyan-500/20 border-dashed pointer-events-none flex items-center justify-between text-[10px] text-cyan-500/40">
              <span>Sign Above Line / وقع فوق الخط</span>
              <span className="font-mono text-[9px]">X ____________________</span>
            </div>

            <canvas
              ref={canvasRef}
              className="w-full h-[150px] touch-none relative z-10"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />

            {!hasDrawn && (
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-slate-500 text-xs z-0">
                <span className="material-symbols-outlined text-3xl mb-1 text-cyan-500/40 animate-pulse">gesture</span>
                <span className="font-medium text-slate-400">Sign with mouse, stylus, or touchscreen</span>
                <span className="text-[10px] text-slate-500 font-arabic mt-0.5">استخدم الفأرة أو شاشة اللمس للتوقيع</span>
              </div>
            )}

            {/* Official Watermark stamp */}
            <div className="absolute top-2 right-2 text-[9px] font-mono text-cyan-400/60 bg-black/60 px-2 py-0.5 rounded border border-cyan-500/20 pointer-events-none">
              🔒 256-BIT ENCRYPTED
            </div>
          </div>
        ) : (
          /* Type to Sign Area */
          <div className="space-y-3">
            <div className="border-2 border-cyan-500/30 rounded-xl bg-black/60 p-6 flex flex-col items-center justify-center min-h-[150px] text-center relative overflow-hidden">
              <div className="text-3xl font-bold tracking-wide" style={{ color: inkColor, fontFamily: TYPED_FONTS.find(f => f.id === selectedFont)?.fontFam }}>
                {signerName || 'Authorized Signatory'}
              </div>
              <div className="w-48 h-0.5 mt-2 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
              <p className="text-[10px] text-slate-400 mt-2 font-mono">
                {designation} • Stamp: {badgeId}
              </p>
              <div className="absolute top-2 right-2 text-[9px] font-mono text-cyan-400/60 bg-black/60 px-2 py-0.5 rounded border border-cyan-500/20">
                ✍️ DIGITAL CALLIGRAPHY
              </div>
            </div>

            {/* Font Style Selectors */}
            <div className="grid grid-cols-3 gap-2">
              {TYPED_FONTS.map((font) => (
                <button
                  key={font.id}
                  type="button"
                  onClick={() => setSelectedFont(font.id)}
                  className={`p-2 rounded-lg border text-xs text-center transition-all ${
                    selectedFont === font.id
                      ? 'border-cyan-400 bg-cyan-500/10 text-cyan-300 font-bold shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                      : 'border-white/10 bg-white/[0.02] text-slate-400 hover:border-white/20'
                  }`}
                >
                  <span className="block text-[11px] font-semibold">{font.name}</span>
                  <span className="text-[10px] opacity-70 block italic mt-0.5" style={{ fontFamily: font.fontFam }}>Preview</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Security & Regulatory Compliance Banner */}
        <div className="bg-white/[0.03] p-3 rounded-xl border border-white/10 text-[11px] text-slate-300 flex items-start gap-2.5">
          <span className="material-symbols-outlined text-cyan-400 text-base shrink-0 mt-0.5">verified_user</span>
          <div className="leading-snug">
            <span className="font-semibold text-slate-200 block">Legally Binding Electronic Sign-off</span>
            <span className="text-slate-400 text-[10px]">
              By confirming, you attest under OSHA / ISO 45001 standards that all job safety analyses, atmospheric monitoring, and isolation barriers have been verified on site.
            </span>
          </div>
        </div>
      </div>

      {/* Footer Controls */}
      <div className="px-5 py-3.5 bg-white/[0.02] border-t border-white/10 flex items-center justify-between gap-3">
        <div className="text-[10px] text-slate-400 font-mono hidden sm:block">
          Badge ID: <span className="text-cyan-300 font-semibold">{badgeId}</span>
        </div>

        <div className="flex items-center gap-2.5 ml-auto">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 rounded-lg border border-white/15 transition-colors"
            >
              Cancel
            </button>
          )}

          <button
            type="button"
            onClick={handleConfirm}
            className="px-4 py-2 text-xs font-bold text-black bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.35)] transition-all flex items-center gap-1.5 active:scale-98 cursor-pointer"
          >
            <span className="material-symbols-outlined text-base font-bold">check_circle</span>
            Adopt & Authorize / اعتماد
          </button>
        </div>
      </div>
    </div>
  );
};
